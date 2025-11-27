<?php

namespace App\Http\Controllers;

use App\Models\ClassModel;
use App\Models\Location;
use App\Models\User;
use App\Notifications\ClassInvitation;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    use AuthorizesRequests;

    public function searchStudents(Request $request)
    {
        $query = $request->input('query');
        
        $students = User::where('role', 'student')
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get(['id', 'name', 'email']);
            
        return response()->json($students);
    }

    public function index()
    {
        $this->authorize('viewAny', ClassModel::class);

        $classes = ClassModel::with('location', 'creator', 'users')->get()->map(function ($class) {
            return [
                'id' => $class->id,
                'name' => $class->name,
                'location_id' => $class->location_id,
                'created_by' => $class->created_by,
                'location' => [
                    'id' => $class->location->id,
                    'name' => $class->location->name,
                ],
                'creator' => [
                    'name' => $class->creator->name,
                ],
                'students' => $class->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'status' => $user->pivot->status,
                    ];
                }),
            ];
        });

        $locations = Location::all()->map(function ($location) {
            return [
                'id' => $location->id,
                'name' => $location->name,
            ];
        });

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', ClassModel::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
        ]);

        $class = ClassModel::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('classes.index');
    }

    public function update(Request $request, ClassModel $class)
    {
        $this->authorize('update', $class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
        ]);

        $class->update($validated);

        return redirect()->route('classes.index');
    }

    public function destroy(ClassModel $class)
    {
        $this->authorize('delete', $class);

        $class->delete();

        return redirect()->route('classes.index');
    }

    public function addStudent(Request $request, ClassModel $class)
    {
        $this->authorize('manageStudents', $class);

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'email' => 'required_without:user_id|nullable|email',
        ]);

        if ($request->filled('user_id')) {
            $user = User::find($validated['user_id']);
        } else {
            $user = User::where('email', $validated['email'])->first();
            if (!$user) {
                // Create a new student user if they don't exist
                $user = User::create([
                    'name' => explode('@', $validated['email'])[0],
                    'email' => $validated['email'],
                    'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(16)),
                    'role' => 'student',
                ]);
            }
        }

        if (!$user->isStudent()) {
            return back()->withErrors(['email' => 'User is not a student']);
        }

        if ($class->users()->where('user_id', $user->id)->exists()) {
             $existing = $class->users()->where('user_id', $user->id)->first();
             if ($existing->pivot->status === 'pending') {
                 return back()->withErrors(['email' => 'Student already invited']);
             }
            return back()->withErrors(['email' => 'Student is already in this class']);
        }

        $class->users()->attach($user->id, ['status' => 'pending']);
        
        try {
            $user->notify(new ClassInvitation($class));
        } catch (\Exception $e) {
            // Log error but don't fail the request if email fails
            \Illuminate\Support\Facades\Log::error('Failed to send class invitation email: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Invitation sent to student');
    }

    public function acceptInvitation(ClassModel $class)
    {
        $user = auth()->user();
        $invitation = $class->users()->where('user_id', $user->id)->wherePivot('status', 'pending')->first();
        
        if ($invitation) {
            $class->users()->updateExistingPivot($user->id, ['status' => 'accepted']);
            return redirect()->back()->with('success', 'Invitation accepted');
        }
        
        return redirect()->back()->with('error', 'No pending invitation found');
    }

    public function rejectInvitation(ClassModel $class)
    {
        $user = auth()->user();
        $class->users()->detach($user->id);
        return redirect()->back()->with('success', 'Invitation rejected');
    }

    public function removeStudent(Request $request, ClassModel $class)
    {
        $this->authorize('manageStudents', $class);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $class->users()->detach($validated['user_id']);

        return redirect()->back();
    }
}
