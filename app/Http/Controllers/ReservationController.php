<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Timeblock;
use App\Services\MicrosoftGraphService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    use AuthorizesRequests;

    protected $graphService;

    public function __construct(MicrosoftGraphService $graphService)
    {
        $this->graphService = $graphService;
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Reservation::class);

        $query = Reservation::with('timeblock.teacher', 'timeblock.class', 'student');

        if ($request->user()->isStudent()) {
            $query->where('student_id', $request->user()->id);
        } elseif ($request->user()->isTeacher()) {
            $query->whereHas('timeblock', function ($q) use ($request) {
                $q->where('teacher_id', $request->user()->id);
            });
        }

        $reservations = $query->get()->map(function ($reservation) {
            return [
                'id' => $reservation->id,
                'status' => $reservation->status,
                'timeblock' => [
                    'id' => $reservation->timeblock->id,
                    'start_time' => $reservation->timeblock->start_time,
                    'end_time' => $reservation->timeblock->end_time,
                    'location' => $reservation->timeblock->location,
                    'status' => $reservation->timeblock->status,
                    'teacher' => [
                        'name' => $reservation->timeblock->teacher->name,
                    ],
                    'class' => [
                        'name' => $reservation->timeblock->class->name,
                    ],
                ],
            ];
        });

        return Inertia::render('Reservations/Index', [
            'reservations' => $reservations,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Reservation::class);

        $validated = $request->validate([
            'timeblock_id' => 'required|exists:timeblocks,id',
        ]);

        $timeblock = Timeblock::findOrFail($validated['timeblock_id']);

        $this->authorize('reserve', $timeblock);

        $existingReservation = Reservation::where('timeblock_id', $timeblock->id)->exists();

        if ($existingReservation || $timeblock->status !== 'available') {
            return back()->withErrors(['timeblock_id' => 'Timeblock is not available']);
        }

        $reservation = Reservation::create([
            'timeblock_id' => $timeblock->id,
            'student_id' => $request->user()->id,
            'status' => 'confirmed',
        ]);

        $timeblock->update(['status' => 'reserved']);

        $this->updateOutlookEvent($timeblock, $request->user());
        $this->createStudentOutlookEvent($timeblock, $request->user());

        return redirect()->route('reservations.index');
    }

    public function destroy(Reservation $reservation)
    {
        $this->authorize('delete', $reservation);

        $timeblock = $reservation->timeblock;
        $timeblock->update(['status' => 'available']);
        $reservation->delete();

        $this->updateOutlookEvent($timeblock, null);

        return redirect()->route('reservations.index');
    }

    protected function updateOutlookEvent(Timeblock $timeblock, $student)
    {
        $teacher = $timeblock->teacher;
        
        if (!$timeblock->outlook_event_id) {
            \Log::warning('Cannot update Outlook event: No event ID for timeblock ' . $timeblock->id);
            return;
        }

        try {
            if (!($teacher->microsoft_access_token && $teacher->microsoft_token_expires && $teacher->microsoft_token_expires > now())) {
                if ($teacher->microsoft_refresh_token) {
                    $refreshToken = $teacher->microsoft_refresh_token;
                    try {
                        $refreshToken = decrypt($refreshToken);
                    } catch (\Exception $e) {}
                    
                    $tokenResponse = $this->graphService->refreshAccessToken($refreshToken);
                    if (isset($tokenResponse['access_token'])) {
                        $teacher->microsoft_access_token = encrypt($tokenResponse['access_token']);
                        if (isset($tokenResponse['refresh_token'])) {
                            $teacher->microsoft_refresh_token = encrypt($tokenResponse['refresh_token']);
                        }
                        $expiresIn = $tokenResponse['expires_in'] ?? 3600;
                        $teacher->microsoft_token_expires = now()->addSeconds($expiresIn);
                        $teacher->save();
                    }
                }
            }

            if ($teacher->microsoft_access_token && $teacher->microsoft_token_expires && $teacher->microsoft_token_expires > now()) {
                $this->graphService->setAccessToken(decrypt($teacher->microsoft_access_token));

                $body = 'Studiegesprek tijdblok voor klas ' . $timeblock->class->name;

                if ($student) {
                    $subject = 'Gereserveerd - ' . $student->name;
                    $body .= "\n\nGereserveerd door: " . $student->name . ' (' . $student->email . ')';
                } else {
                    $subject = 'Studiegesprek - ' . $timeblock->class->name;
                }

                $this->graphService->updateCalendarEvent($timeblock->outlook_event_id, [
                    'subject' => $subject,
                    'body' => [
                        'contentType' => 'text',
                        'content' => $body
                    ]
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to update Outlook event on reservation: ' . $e->getMessage());
        }
    }

    protected function createStudentOutlookEvent(Timeblock $timeblock, $student)
    {
        try {
            // Check if token needs refresh
            if (!($student->microsoft_access_token && $student->microsoft_token_expires && $student->microsoft_token_expires > now())) {
                if ($student->microsoft_refresh_token) {
                    $refreshToken = $student->microsoft_refresh_token;
                    try {
                        $refreshToken = decrypt($refreshToken);
                    } catch (\Exception $e) {}
                    
                    $tokenResponse = $this->graphService->refreshAccessToken($refreshToken);
                    if (isset($tokenResponse['access_token'])) {
                        $student->microsoft_access_token = encrypt($tokenResponse['access_token']);
                        if (isset($tokenResponse['refresh_token'])) {
                            $student->microsoft_refresh_token = encrypt($tokenResponse['refresh_token']);
                        }
                        $expiresIn = $tokenResponse['expires_in'] ?? 3600;
                        $student->microsoft_token_expires = now()->addSeconds($expiresIn);
                        $student->save();
                    }
                }
            }

            // Create event if we have a valid token
            if ($student->microsoft_access_token && $student->microsoft_token_expires && $student->microsoft_token_expires > now()) {
                $this->graphService->setAccessToken(decrypt($student->microsoft_access_token));

                $this->graphService->createCalendarEvent([
                    'subject' => 'Studiegesprek - ' . $timeblock->teacher->name,
                    'body' => 'Studiegesprek met ' . $timeblock->teacher->name . ' voor klas ' . $timeblock->class->name,
                    'start_time' => $timeblock->start_time,
                    'end_time' => $timeblock->end_time,
                    'location' => $timeblock->location,
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to create Outlook event for student: ' . $e->getMessage());
        }
    }
}
