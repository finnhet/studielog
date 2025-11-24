<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Timeblock;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    use AuthorizesRequests;

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

        return redirect()->route('reservations.index');
    }

    public function destroy(Reservation $reservation)
    {
        $this->authorize('delete', $reservation);

        $reservation->timeblock->update(['status' => 'available']);
        $reservation->delete();

        return redirect()->route('reservations.index');
    }
}
