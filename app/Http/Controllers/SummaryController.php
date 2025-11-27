<?php

namespace App\Http\Controllers;

use App\Models\Summary;
use App\Models\Timeblock;
use App\Models\ClassModel;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SummaryController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Summary::class);

        $query = Summary::with('timeblock.teacher', 'timeblock.class', 'student');

        if ($request->user()->isStudent()) {
            $query->where('student_id', $request->user()->id);
        } elseif ($request->user()->isTeacher()) {
            $query->whereHas('timeblock', function ($q) use ($request) {
                $q->where('teacher_id', $request->user()->id);
            });
        }

        if ($request->filled('teacher_id')) {
            $query->whereHas('timeblock', function ($q) use ($request) {
                $q->where('teacher_id', $request->teacher_id);
            });
        }

        if ($request->filled('class_id')) {
            $query->whereHas('timeblock', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        $summaries = $query->get()->map(function ($summary) {
            return [
                'id' => $summary->id,
                'content' => $summary->content,
                'status' => $summary->status,
                'feedback' => $summary->feedback,
                'timeblock' => [
                    'id' => $summary->timeblock->id,
                    'start_time' => $summary->timeblock->start_time,
                    'end_time' => $summary->timeblock->end_time,
                    'teacher' => [
                        'name' => $summary->timeblock->teacher->name,
                    ],
                    'class' => [
                        'name' => $summary->timeblock->class->name,
                    ],
                ],
                'student' => [
                    'name' => $summary->student->name,
                ],
            ];
        });

        return Inertia::render('Summaries/Index', [
            'summaries' => $summaries,
            'classes' => $request->user()->classes()->get(['classes.id', 'classes.name']),
            'filters' => $request->only(['teacher_id', 'class_id']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Summary::class);

        $validated = $request->validate([
            'timeblock_id' => 'required|exists:timeblocks,id',
            'content' => 'required|string',
        ]);

        $timeblock = Timeblock::findOrFail($validated['timeblock_id']);

        if ($timeblock->status !== 'completed' && $timeblock->status !== 'reserved') {
            return back()->withErrors(['timeblock_id' => 'Cannot create summary for this timeblock']);
        }

        $existingSummary = Summary::where('timeblock_id', $timeblock->id)
            ->where('student_id', $request->user()->id)
            ->exists();

        if ($existingSummary) {
            return back()->withErrors(['timeblock_id' => 'Summary already exists']);
        }

        $summary = Summary::create([
            ...$validated,
            'student_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return redirect()->route('summaries.index');
    }

    public function update(Request $request, Summary $summary)
    {
        $this->authorize('update', $summary);

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $summary->update($validated);

        return redirect()->route('summaries.index');
    }

    public function destroy(Summary $summary)
    {
        $this->authorize('delete', $summary);

        $summary->delete();

        return redirect()->route('summaries.index');
    }

    public function approve(Request $request, Summary $summary)
    {
        $this->authorize('approve', $summary);

        $validated = $request->validate([
            'feedback' => 'nullable|string',
        ]);

        $summary->update([
            'status' => 'approved',
            'feedback' => $validated['feedback'] ?? null,
        ]);

        return redirect()->route('summaries.index');
    }

    public function reject(Request $request, Summary $summary)
    {
        $this->authorize('reject', $summary);

        $validated = $request->validate([
            'feedback' => 'required|string',
        ]);

        $summary->update([
            'status' => 'rejected',
            'feedback' => $validated['feedback'],
        ]);

        return redirect()->route('summaries.index');
    }
}
