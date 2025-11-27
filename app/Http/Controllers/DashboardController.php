<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Summary;
use App\Models\Timeblock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'teacher') {
            return $this->teacherDashboard($user);
        }

        return $this->studentDashboard($user);
    }

    private function teacherDashboard($user)
    {
        $upcomingTimeblocks = Timeblock::where('teacher_id', $user->id)
            ->where('start_time', '>=', now())
            ->with(['class', 'reservations.student'])
            ->orderBy('start_time')
            ->limit(5)
            ->get()
            ->map(function ($timeblock) {
                return [
                    'id' => $timeblock->id,
                    'start_time' => $timeblock->start_time,
                    'end_time' => $timeblock->end_time,
                    'location' => $timeblock->location,
                    'status' => $timeblock->status,
                    'class' => [
                        'name' => $timeblock->class->name,
                    ],
                    'reservation' => $timeblock->reservations->first() ? [
                        'student' => [
                            'name' => $timeblock->reservations->first()->student->name,
                        ],
                    ] : null,
                ];
            });

        $pendingSummaries = Summary::whereHas('timeblock', function ($query) use ($user) {
                $query->where('teacher_id', $user->id);
            })
            ->where('status', 'pending')
            ->with(['student', 'timeblock.class'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($summary) {
                return [
                    'id' => $summary->id,
                    'status' => $summary->status,
                    'student' => [
                        'name' => $summary->student->name,
                    ],
                    'timeblock' => [
                        'start_time' => $summary->timeblock->start_time,
                        'class' => [
                            'name' => $summary->timeblock->class->name,
                        ],
                    ],
                ];
            });

        $stats = [
            'totalTimeblocks' => Timeblock::where('teacher_id', $user->id)->count(),
            'totalReservations' => Reservation::whereHas('timeblock', function ($query) use ($user) {
                $query->where('teacher_id', $user->id);
            })->count(),
            'pendingSummaries' => Summary::whereHas('timeblock', function ($query) use ($user) {
                $query->where('teacher_id', $user->id);
            })->where('status', 'pending')->count(),
        ];

        return Inertia::render('dashboard/teacher', [
            'upcomingTimeblocks' => $upcomingTimeblocks,
            'pendingSummaries' => $pendingSummaries,
            'stats' => $stats,
        ]);
    }

    private function studentDashboard($user)
    {
        $classIds = $user->classes->pluck('id');

        $availableTimeblocks = Timeblock::whereIn('class_id', $classIds)
            ->where('start_time', '>=', now())
            ->where('status', 'available')
            ->with(['teacher', 'class'])
            ->orderBy('start_time')
            ->limit(10)
            ->get()
            ->map(function ($timeblock) {
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
                ];
            });

        $upcomingReservations = Reservation::where('student_id', $user->id)
            ->whereHas('timeblock', function ($query) {
                $query->where('start_time', '>=', now());
            })
            ->with(['timeblock.teacher', 'timeblock.class'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'timeblock' => [
                        'id' => $reservation->timeblock->id,
                        'start_time' => $reservation->timeblock->start_time,
                        'end_time' => $reservation->timeblock->end_time,
                        'location' => $reservation->timeblock->location,
                        'teacher' => [
                            'name' => $reservation->timeblock->teacher->name,
                        ],
                        'class' => [
                            'name' => $reservation->timeblock->class->name,
                        ],
                    ],
                ];
            });

        $recentSummaries = Summary::where('student_id', $user->id)
            ->with(['timeblock.teacher', 'timeblock.class'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($summary) {
                return [
                    'id' => $summary->id,
                    'status' => $summary->status,
                    'content' => $summary->content,
                    'feedback' => $summary->feedback,
                    'timeblock' => [
                        'start_time' => $summary->timeblock->start_time,
                        'teacher' => [
                            'name' => $summary->timeblock->teacher->name,
                        ],
                        'class' => [
                            'name' => $summary->timeblock->class->name,
                        ],
                    ],
                ];
            });

        $missingSummaries = Reservation::where('student_id', $user->id)
            ->whereHas('timeblock', function ($query) {
                $query->where('start_time', '<', now());
            })
            ->whereDoesntHave('timeblock.summaries', function ($query) use ($user) {
                $query->where('student_id', $user->id);
            })
            ->with(['timeblock.teacher', 'timeblock.class'])
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'timeblock' => [
                        'id' => $reservation->timeblock->id,
                        'start_time' => $reservation->timeblock->start_time,
                        'teacher' => [
                            'name' => $reservation->timeblock->teacher->name,
                        ],
                        'class' => [
                            'name' => $reservation->timeblock->class->name,
                        ],
                    ],
                ];
            });

        $pendingInvitations = $user->classes()
            ->wherePivot('status', 'pending')
            ->with('creator')
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'creator' => [
                        'name' => $class->creator->name,
                    ],
                ];
            });

        return Inertia::render('dashboard/student', [
            'availableTimeblocks' => $availableTimeblocks,
            'upcomingReservations' => $upcomingReservations,
            'recentSummaries' => $recentSummaries,
            'missingSummaries' => $missingSummaries,
            'pendingInvitations' => $pendingInvitations,
        ]);
    }
}
