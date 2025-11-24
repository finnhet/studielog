<?php

namespace App\Http\Controllers;

use App\Models\Timeblock;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgendaController extends Controller
{
    public function index(Request $request)
    {
        $weekStart = $request->input('week');
        
        if ($weekStart) {
            $startDate = Carbon::parse($weekStart);
        } else {
            $startDate = Carbon::now()->startOfWeek();
        }
        
        $endDate = (clone $startDate)->endOfWeek();
        
        $query = Timeblock::with(['teacher', 'class', 'reservation.student'])
            ->whereBetween('start_time', [$startDate, $endDate])
            ->orderBy('start_time');

        if ($request->user()->isStudent()) {
            $classIds = $request->user()->classes->pluck('id');
            $query->whereIn('class_id', $classIds);
        } elseif ($request->user()->isTeacher()) {
            $query->where('teacher_id', $request->user()->id);
        }

        $timeblocks = $query->get()->map(function ($timeblock) {
            return [
                'id' => $timeblock->id,
                'start_time' => $timeblock->start_time,
                'end_time' => $timeblock->end_time,
                'location' => $timeblock->location,
                'status' => $timeblock->status,
                'teacher' => [
                    'name' => $timeblock->teacher->name,
                ],
                'class' => [
                    'name' => $timeblock->class->name,
                ],
                'reservation' => $timeblock->reservation ? [
                    'student' => [
                        'name' => $timeblock->reservation->student->name,
                    ],
                ] : null,
            ];
        });

        return Inertia::render('Agenda/Index', [
            'timeblocks' => $timeblocks,
            'weekStart' => $startDate->toISOString(),
        ]);
    }
}
