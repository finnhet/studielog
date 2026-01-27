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

    public function __construct(private MicrosoftGraphService $graphService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Timeblock::class);

        Timeblock::where('end_time', '<', now())->delete();

        $user = $request->user();
        $query = Timeblock::with(['teacher:id,name,email', 'class:id,name', 'reservation.student:id,name,email']);

        if ($user->isStudent()) {
            $query->whereHas('class.students', fn($q) => $q->where('user_id', $user->id));
        } elseif ($user->isTeacher()) {
            $query->where('teacher_id', $user->id);
        }

        $timeblocks = $query->orderBy('start_time')->get();

        $classes = $user->isTeacher()
            ? \App\Models\ClassModel::where('created_by', $user->id)
                ->orWhereHas('teachers', fn($q) => $q->where('user_id', $user->id))
                ->select('id', 'name')
                ->get()
            : [];

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
        $duration = $validated['duration'];
        $user = $request->user();

        if ($this->hasTimeblockOverlap($user->id, $startTime, $endTime)) {
            return back()->withErrors(['start_time' => 'Time slot overlaps with existing timeblock']);
        }

        $createdTimeblocks = $this->createTimeblocks($validated, $user->id, $startTime, $endTime, $duration);

        if (empty($createdTimeblocks)) {
            return back()->withErrors(['duration' => 'Duration too long for the selected time range']);
        }

        $outlookSyncedCount = $this->syncTimeblocksToOutlook($user, $createdTimeblocks);

        return $this->redirectWithSyncMessage(count($createdTimeblocks), $outlookSyncedCount); 
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

        if ($this->updateOutlookEvent($request->user(), $timeblock, $validated)) {
            return redirect()->route('timeblocks.index')->with('success', 'Tijdblok bijgewerkt en gesynchroniseerd met Outlook.');
        }

        return redirect()->route('timeblocks.index')->with('success', 'Tijdblok bijgewerkt.');
    }

    public function destroy(Timeblock $timeblock)
    {
        $this->authorize('delete', $timeblock);

        if ($this->deleteOutlookEvent(auth()->user(), $timeblock)) {
            return redirect()->route('timeblocks.index')->with('success', 'Tijdblok verwijderd en uit Outlook agenda gehaald.');
        }

        $timeblock->delete();
        return redirect()->route('timeblocks.index')->with('success', 'Tijdblok verwijderd.');
    }

    private function hasTimeblockOverlap($teacherId, $startTime, $endTime): bool
    {
        return Timeblock::where('teacher_id', $teacherId)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(fn($q) => $q->where('start_time', '<=', $startTime)->where('end_time', '>=', $endTime));
            })
            ->exists();
    }

    private function createTimeblocks(array $validated, $teacherId, $startTime, $endTime, int $duration): array
    {
        $timeblocks = [];
        $currentStart = $startTime->copy();

        while ($currentStart->lt($endTime)) {
            $currentEnd = $currentStart->copy()->addMinutes($duration);

            if ($currentEnd->gt($endTime)) {
                break;
            }

            $timeblocks[] = Timeblock::create([
                'class_id' => $validated['class_id'],
                'start_time' => $currentStart,
                'end_time' => $currentEnd,
                'location' => $validated['location'],
                'teacher_id' => $teacherId,
                'status' => 'available',
            ]);

            $currentStart = $currentEnd->copy();
        }

        return $timeblocks;
    }

    private function refreshMicrosoftToken($user): bool
    {
        if ($this->hasValidToken($user)) {
            return true;
        }

        if (!$user->microsoft_refresh_token) {
            return false;
        }

        try {
            $refreshToken = decrypt($user->microsoft_refresh_token);
            $tokenResponse = $this->graphService->refreshAccessToken($refreshToken);

            if (!isset($tokenResponse['access_token'])) {
                \Log::error('Failed to refresh token: ' . json_encode($tokenResponse));
                return false;
            }

            $user->update([
                'microsoft_access_token' => encrypt($tokenResponse['access_token']),
                'microsoft_refresh_token' => isset($tokenResponse['refresh_token']) 
                    ? encrypt($tokenResponse['refresh_token']) 
                    : $user->microsoft_refresh_token,
                'microsoft_token_expires' => now()->addSeconds($tokenResponse['expires_in'] ?? 3600),
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Token refresh failed: ' . $e->getMessage());
            return false;
        }
    }

    private function hasValidToken($user): bool
    {
        return $user->microsoft_access_token 
            && $user->microsoft_token_expires 
            && $user->microsoft_token_expires > now();
    }

    private function syncTimeblocksToOutlook($user, array $timeblocks): int
    {
        if (!$this->refreshMicrosoftToken($user)) {
            return 0;
        }

        $this->graphService->setAccessToken(decrypt($user->microsoft_access_token));
        
        // Eager load class data for all timeblocks
        $timeblockIds = array_column($timeblocks, 'id');
        $timeblocks = Timeblock::with('class:id,name')
            ->whereIn('id', $timeblockIds)
            ->get()
            ->keyBy('id');
        
        $syncedCount = 0;

        foreach ($timeblocks as $timeblock) {
            try {
                $event = $this->graphService->createCalendarEvent([
                    'subject' => 'Studiegesprek - ' . $timeblock->class->name,
                    'body' => 'Studiegesprek tijdblok voor klas ' . $timeblock->class->name,
                    'start_time' => $timeblock->start_time->toIso8601String(),
                    'end_time' => $timeblock->end_time->toIso8601String(),
                    'location' => $timeblock->location,
                ]);

                if (isset($event['id'])) {
                    $timeblock->update(['outlook_event_id' => $event['id']]);
                    $syncedCount++;
                }
            } catch (\Exception $e) {
                \Log::error("Failed to create Outlook event for timeblock {$timeblock->id}: " . $e->getMessage());
            }
        }

        return $syncedCount;
    }

    private function updateOutlookEvent($user, $timeblock, array $validated): bool
    {
        if (!$timeblock->outlook_event_id || !$this->refreshMicrosoftToken($user)) {
            return false;
        }

        try {
            $this->graphService->setAccessToken(decrypt($user->microsoft_access_token));

            $updateData = [];
            foreach (['start_time', 'end_time'] as $key) {
                if (isset($validated[$key])) {
                    $updateData[$key] = \Carbon\Carbon::parse($validated[$key])->toIso8601String();
                }
            }
            $updateData = array_merge($validated, $updateData);

            $this->graphService->updateCalendarEvent($timeblock->outlook_event_id, $updateData);
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to update Outlook event: ' . $e->getMessage());
            return false;
        }
    }

    private function deleteOutlookEvent($user, $timeblock): bool
    {
        if (!$timeblock->outlook_event_id || !$this->refreshMicrosoftToken($user)) {
            $timeblock->delete();
            return false;
        }

        try {
            $this->graphService->setAccessToken(decrypt($user->microsoft_access_token));
            $this->graphService->deleteCalendarEvent($timeblock->outlook_event_id);
            $timeblock->delete();
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to delete Outlook event: ' . $e->getMessage());
            $timeblock->delete();
            return false;
        }
    }

    private function redirectWithSyncMessage(int $totalCount, int $syncedCount)
    {
        if ($syncedCount === $totalCount) {
            return redirect()->route('timeblocks.index')
                ->with('success', "{$totalCount} tijdblokken aangemaakt en gesynchroniseerd met je Outlook agenda.");
        }

        if ($syncedCount > 0) {
            return redirect()->route('timeblocks.index')
                ->with('warning', "{$totalCount} tijdblokken aangemaakt, maar slechts {$syncedCount} gesynchroniseerd met Outlook.");
        }

        return redirect()->route('timeblocks.index')
            ->with('info', "{$totalCount} tijdblokken aangemaakt. Koppel je Outlook account voor automatische synchronisatie.");
    }
}
