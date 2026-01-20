<?php

namespace App\Http\Controllers;

use App\Models\Timeblock;
use App\Services\MicrosoftGraphService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeblockController extends Controller
{
    use AuthorizesRequests;

    protected $graphService;

    public function __construct(MicrosoftGraphService $graphService)
    {
        $this->graphService = $graphService;
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Timeblock::class);

        // Delete expired timeblocks
        Timeblock::where('end_time', '<', now())->delete();

        $query = Timeblock::with('teacher', 'class', 'reservation.student');

        if ($request->user()->isStudent()) {
            $classIds = $request->user()->classes->pluck('id');
            $query->whereIn('class_id', $classIds);
        } elseif ($request->user()->isTeacher()) {
            $query->where('teacher_id', $request->user()->id);
        }

        $timeblocks = $query->orderBy('start_time')->get()->map(function ($timeblock) {
            return [
                'id' => $timeblock->id,
                'start_time' => $timeblock->start_time,
                'end_time' => $timeblock->end_time,
                'location' => $timeblock->location,
                'status' => $timeblock->status,
                'teacher' => [
                    'id' => $timeblock->teacher->id,
                    'name' => $timeblock->teacher->name,
                ],
                'class' => [
                    'id' => $timeblock->class->id,
                    'name' => $timeblock->class->name,
                ],
                'reservation' => $timeblock->reservation ? [
                    'student' => [
                        'name' => $timeblock->reservation->student->name,
                    ],
                ] : null,
            ];
        });

        $classes = [];
        if ($request->user()->isTeacher()) {
            $classes = \App\Models\ClassModel::where('created_by', $request->user()->id)
                ->get()
                ->map(function ($class) {
                    return [
                        'id' => $class->id,
                        'name' => $class->name,
                    ];
                });
        }

        return Inertia::render('Timeblocks/Index', [
            'timeblocks' => $timeblocks,
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Timeblock::class);

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'location' => 'required|string|max:255',
            'duration' => 'required|integer|min:5|max:120',
        ]);

        $startTime = \Carbon\Carbon::parse($validated['start_time']);
        $endTime = \Carbon\Carbon::parse($validated['end_time']);
        $duration = (int) $validated['duration'];

        $overlap = Timeblock::where('teacher_id', $request->user()->id)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<=', $startTime)
                          ->where('end_time', '>=', $endTime);
                    });
            })
            ->exists();

        if ($overlap) {
            return back()->withErrors(['start_time' => 'Time slot overlaps with existing timeblock']);
        }

        $createdTimeblocks = [];
        $currentStart = $startTime->copy();

        while ($currentStart->lt($endTime)) {
            $currentEnd = $currentStart->copy()->addMinutes($duration);
            
            if ($currentEnd->gt($endTime)) {
                break;
            }

            $timeblock = Timeblock::create([
                'class_id' => $validated['class_id'],
                'start_time' => $currentStart,
                'end_time' => $currentEnd,
                'location' => $validated['location'],
                'teacher_id' => $request->user()->id,
                'status' => 'available',
            ]);

            $createdTimeblocks[] = $timeblock;
            $currentStart = $currentEnd->copy();
        }

        if (empty($createdTimeblocks)) {
            return back()->withErrors(['duration' => 'Duration too long for the selected time range']);
        }

        $user = $request->user();
        $outlookSyncedCount = 0;
        $outlookError = null;

        try {
            if (!($user->microsoft_access_token && $user->microsoft_token_expires && $user->microsoft_token_expires > now())) {
                if ($user->microsoft_refresh_token) {
                    \Log::info('Attempting to refresh Microsoft token for user ' . $user->id);
                    $refreshToken = $user->microsoft_refresh_token;
                    
                    try {
                        $refreshToken = decrypt($refreshToken);
                    } catch (\Exception $e) {
                        
                    }
                    $tokenResponse = $this->graphService->refreshAccessToken($refreshToken);
                    if (isset($tokenResponse['access_token'])) {
                        $user->microsoft_access_token = encrypt($tokenResponse['access_token']);
                        if (isset($tokenResponse['refresh_token'])) {
                            $user->microsoft_refresh_token = encrypt($tokenResponse['refresh_token']);
                        }
                        $expiresIn = $tokenResponse['expires_in'] ?? 3600;
                        $user->microsoft_token_expires = now()->addSeconds($expiresIn);
                        $user->save();
                        \Log::info('Successfully refreshed Microsoft token for user ' . $user->id);
                    } else {
                        \Log::error('Failed to refresh token: ' . json_encode($tokenResponse));
                    }
                }
            }

            if ($user->microsoft_access_token && $user->microsoft_token_expires && $user->microsoft_token_expires > now()) {
                $this->graphService->setAccessToken(decrypt($user->microsoft_access_token));

                foreach ($createdTimeblocks as $timeblock) {
                    \Log::info('Creating Outlook calendar event for timeblock ' . $timeblock->id);

                    $event = $this->graphService->createCalendarEvent([
                        'subject' => 'Studiegesprek - ' . $timeblock->class->name,
                        'body' => 'Studiegesprek tijdblok voor klas ' . $timeblock->class->name,
                        'start_time' => \Carbon\Carbon::parse($timeblock->start_time)->toIso8601String(),
                        'end_time' => \Carbon\Carbon::parse($timeblock->end_time)->toIso8601String(),
                        'location' => $timeblock->location,
                    ]);

                    if (isset($event['id'])) {
                        $timeblock->update(['outlook_event_id' => $event['id']]);
                        $outlookSyncedCount++;
                        \Log::info('Successfully created Outlook event: ' . $event['id']);
                    }
                }
            } else {
                \Log::warning('No valid Microsoft access token for user ' . $user->id);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to create Outlook calendar event: ' . $e->getMessage());
            $outlookError = $e->getMessage();
        }

        $count = count($createdTimeblocks);
        if ($outlookSyncedCount === $count) {
            return redirect()->route('timeblocks.index')->with('success', "{$count} tijdblokken aangemaakt en gesynchroniseerd met je Outlook agenda.");
        } elseif ($outlookSyncedCount > 0) {
            return redirect()->route('timeblocks.index')->with('warning', "{$count} tijdblokken aangemaakt, maar slechts {$outlookSyncedCount} gesynchroniseerd met Outlook.");
        } elseif ($outlookError) {
            return redirect()->route('timeblocks.index')->with('warning', "{$count} tijdblokken aangemaakt, maar synchronisatie met Outlook is mislukt. Koppel je Outlook opnieuw.");
        } else {
            return redirect()->route('timeblocks.index')->with('info', "{$count} tijdblokken aangemaakt. Koppel je Outlook account voor automatische synchronisatie.");
        }
    }

    public function update(Request $request, Timeblock $timeblock)
    {
        $this->authorize('update', $timeblock);

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'location' => 'required|string|max:255',
            'status' => 'sometimes|in:available,reserved,completed,cancelled',
        ]);

        $timeblock->update($validated);

        $user = $request->user();
        try {
            if (!($user->microsoft_access_token && $user->microsoft_token_expires && $user->microsoft_token_expires > now())) {
                if ($user->microsoft_refresh_token) {
                    $refreshToken = $user->microsoft_refresh_token;
                    try {
                        $refreshToken = decrypt($refreshToken);
                    } catch (\Exception $e) {}

                    $tokenResponse = $this->graphService->refreshAccessToken($refreshToken);
                    if (isset($tokenResponse['access_token'])) {
                        $user->microsoft_access_token = encrypt($tokenResponse['access_token']);
                        if (isset($tokenResponse['refresh_token'])) {
                            $user->microsoft_refresh_token = encrypt($tokenResponse['refresh_token']);
                        }
                        $expiresIn = $tokenResponse['expires_in'] ?? 3600;
                        $user->microsoft_token_expires = now()->addSeconds($expiresIn);
                        $user->save();
                    }
                }
            }

            if ($timeblock->outlook_event_id && $user->microsoft_access_token && $user->microsoft_token_expires && $user->microsoft_token_expires > now()) {
                $this->graphService->setAccessToken(decrypt($user->microsoft_access_token));

                $updateData = $validated;
                if (isset($updateData['start_time'])) {
                    $updateData['start_time'] = \Carbon\Carbon::parse($updateData['start_time'])->toIso8601String();
                }
                if (isset($updateData['end_time'])) {
                    $updateData['end_time'] = \Carbon\Carbon::parse($updateData['end_time'])->toIso8601String();
                }
                
                $this->graphService->updateCalendarEvent($timeblock->outlook_event_id, $updateData);
                return redirect()->route('timeblocks.index')->with('success', 'Tijdblok bijgewerkt en gesynchroniseerd met Outlook.');
            }
        } catch (\Exception $e) {
            \Log::error('Failed to update Outlook calendar event: ' . $e->getMessage());
        }

        return redirect()->route('timeblocks.index')->with('success', 'Tijdblok bijgewerkt.');
    }

    public function destroy(Timeblock $timeblock)
    {
        $this->authorize('delete', $timeblock);

        $user = auth()->user();
        try {
            if (!($user->microsoft_access_token && $user->microsoft_token_expires && $user->microsoft_token_expires > now())) {
                if ($user->microsoft_refresh_token) {
                    $tokenResponse = $this->graphService->refreshAccessToken($user->microsoft_refresh_token);
                    if (isset($tokenResponse['access_token'])) {
                        $user->microsoft_access_token = encrypt($tokenResponse['access_token']);
                        if (isset($tokenResponse['refresh_token'])) {
                            $user->microsoft_refresh_token = $tokenResponse['refresh_token'];
                        }
                        $expiresIn = $tokenResponse['expires_in'] ?? 3600;
                        $user->microsoft_token_expires = now()->addSeconds($expiresIn);
                        $user->save();
                    }
                }
            }

            if ($timeblock->outlook_event_id && $user->microsoft_access_token && $user->microsoft_token_expires && $user->microsoft_token_expires > now()) {
                $this->graphService->setAccessToken(decrypt($user->microsoft_access_token));
                $this->graphService->deleteCalendarEvent($timeblock->outlook_event_id);
                $timeblock->delete();
                return redirect()->route('timeblocks.index')->with('success', 'Tijdblok verwijderd en uit Outlook agenda gehaald.');
            }
        } catch (\Exception $e) {
            \Log::error('Failed to delete Outlook calendar event: ' . $e->getMessage());
        }

        $timeblock->delete();

        return redirect()->route('timeblocks.index')->with('success', 'Tijdblok verwijderd.');
    }
}
