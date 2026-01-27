<?php

namespace App\Http\Controllers;

use App\Models\ClassModel;
use App\Models\Location;
use App\Models\User;
use App\Notifications\ClassInvitation;
use App\Services\MicrosoftGraphService;
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

    public function searchTeachers(Request $request)
    {
        $query = $request->input('query');
        
        $teachers = User::where('role', 'teacher')
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get(['id', 'name', 'email']);
            
        return response()->json($teachers);
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', ClassModel::class);

        $user = $request->user();
        
        $teacherLocationIds = $user->locations()->pluck('locations.id');

        $classesQuery = ClassModel::with('location', 'creator', 'users', 'teachers');
        
        if ($user->isTeacher()) {
            $classesQuery->whereIn('location_id', $teacherLocationIds);
        }

        $classes = $classesQuery->get()->map(function ($class) {
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
                'students' => $class->users->filter(fn($user) => $user->role === 'student')->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'status' => $user->pivot->status,
                    ];
                })->values(),
                'teachers' => $class->teachers->map(function ($teacher) {
                    return [
                        'id' => $teacher->id,
                        'name' => $teacher->name,
                        'email' => $teacher->email,
                    ];
                }),
            ];
        });


        $locations = $user->isTeacher() 
            ? $user->locations()->get()->map(function ($location) {
                return [
                    'id' => $location->id,
                    'name' => $location->name,
                ];
            })
            : Location::all()->map(function ($location) {
                return [
                    'id' => $location->id,
                    'name' => $location->name,
                ];
            });

        $allTeachers = User::where('role', 'teacher')->get(['id', 'name', 'email']);

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'locations' => $locations,
            'allTeachers' => $allTeachers,
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

        $class->teachers()->attach($request->user()->id);

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

    public function addStudent(Request $request, ClassModel $class, MicrosoftGraphService $graphService)
    {
        $this->authorize('manageStudents', $class);

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'email' => 'required_without:user_id|nullable|email',
        ]);

        $currentUser = $request->user();
        
        if (!$currentUser->microsoft_access_token) {
            return back()->withErrors(['email' => 'Je moet verbonden zijn met Microsoft om uitnodigingen te versturen.']);
        }

        if ($currentUser->microsoft_token_expires && $currentUser->microsoft_token_expires->isPast()) {
            if ($currentUser->microsoft_refresh_token) {
                try {
                    $newTokens = $graphService->refreshAccessToken(decrypt($currentUser->microsoft_refresh_token));
                    if (isset($newTokens['access_token'])) {
                        $currentUser->update([
                            'microsoft_access_token' => encrypt($newTokens['access_token']),
                            'microsoft_refresh_token' => isset($newTokens['refresh_token']) ? encrypt($newTokens['refresh_token']) : $currentUser->microsoft_refresh_token,
                            'microsoft_token_expires' => now()->addSeconds($newTokens['expires_in']),
                        ]);
                    } else {
                        return back()->withErrors(['email' => 'Microsoft sessie verlopen. Log opnieuw in.']);
                    }
                } catch (\Exception $e) {
                    return back()->withErrors(['email' => 'Microsoft sessie verlopen. Log opnieuw in.']);
                }
            } else {
                return back()->withErrors(['email' => 'Microsoft sessie verlopen. Log opnieuw in.']);
            }
        }

        $isNewUser = false;
        
        if ($request->filled('user_id')) {
            $user = User::find($validated['user_id']);
        } else {
            $user = User::where('email', $validated['email'])->first();
            if (!$user) {
                $user = User::create([
                    'name' => explode('@', $validated['email'])[0],
                    'email' => $validated['email'],
                    'password' => null,
                    'role' => 'student',
                ]);
                $isNewUser = true;
            }
        }

        if (!$user->isStudent()) {
            return back()->withErrors(['email' => 'Gebruiker is geen student']);
        }

        if ($class->users()->where('user_id', $user->id)->exists()) {
             $existing = $class->users()->where('user_id', $user->id)->first();
             if ($existing->pivot->status === 'pending') {
                 return back()->withErrors(['email' => 'Student is al uitgenodigd']);
             }
            return back()->withErrors(['email' => 'Student zit al in deze klas']);
        }

        if ($isNewUser) {
            $class->users()->attach($user->id, ['status' => 'pending']);
            
            try {
                $token = decrypt($currentUser->microsoft_access_token);
                $graphService->setAccessToken($token);

                $inviteUrl = \Illuminate\Support\Facades\URL::signedRoute('classes.invite.accept', [
                    'class' => $class->id,
                    'email' => $user->email,
                ]);

                $graphService->sendMail([
                    'subject' => "Uitnodiging voor klas: {$class->name}",
                    'body' => "
                        <h1>Je bent uitgenodigd voor de klas {$class->name}</h1>
                        <p>Beste {$user->name},</p>
                        <p>Je bent door {$currentUser->name} uitgenodigd om deel te nemen aan de klas <strong>{$class->name}</strong> in StudieLog.</p>
                        <p>Klik op de onderstaande link om in te loggen met je Microsoft account en automatisch toe te treden tot de klas:</p>
                        <p><a href=\"{$inviteUrl}\">Inloggen en deelnemen aan {$class->name}</a></p>
                    ",
                    'to' => [$user->email],
                ]);

                return back()->with('success', 'Uitnodiging verstuurd naar nieuwe student');
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send class invitation email: ' . $e->getMessage());
                return back()->with('success', 'Student toegevoegd, maar email kon niet worden verzonden: ' . $e->getMessage());
            }
        } else {
            $class->users()->attach($user->id, ['status' => 'accepted']);
            
            try {
                $token = decrypt($currentUser->microsoft_access_token);
                $graphService->setAccessToken($token);

                $loginUrl = route('auth.microsoft.redirect');

                $graphService->sendMail([
                    'subject' => "Je bent toegevoegd aan klas: {$class->name}",
                    'body' => "
                        <h1>Je bent toegevoegd aan de klas {$class->name}</h1>
                        <p>Beste {$user->name},</p>
                        <p>Je bent door {$currentUser->name} toegevoegd aan de klas <strong>{$class->name}</strong> in StudieLog.</p>
                        <p>Je kunt nu direct deelnemen aan tijdblokken van deze klas.</p>
                        <p><a href=\"{$loginUrl}\">Ga naar StudieLog</a></p>
                    ",
                    'to' => [$user->email],
                ]);

                return back()->with('success', 'Student toegevoegd aan klas');
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send class notification email: ' . $e->getMessage());
                return back()->with('success', 'Student toegevoegd, maar email kon niet worden verzonden');
            }
        }
    }

    public function startInviteAccept(Request $request, ClassModel $class)
    {
        if (!$request->hasValidSignature()) {
            abort(403, 'Invalid or expired invitation link.');
        }

        session([
            'pending_class_id' => $class->id,
            'pending_class_email' => $request->email,
        ]);

        return redirect()->route('auth.microsoft.redirect');
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

    public function addTeacher(Request $request, ClassModel $class)
    {
        $this->authorize('manageStudents', $class);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::find($validated['user_id']);

        if (!$user->isTeacher()) {
            return back()->withErrors(['user_id' => 'Gebruiker is geen docent']);
        }

        if ($class->teachers()->where('user_id', $user->id)->exists()) {
            return back()->withErrors(['user_id' => 'Docent is al gekoppeld aan deze klas']);
        }

        $class->teachers()->attach($user->id);

        return back()->with('success', 'Docent toegevoegd aan klas');
    }

    public function removeTeacher(Request $request, ClassModel $class)
    {
        $this->authorize('manageStudents', $class);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $class->teachers()->detach($validated['user_id']);

        return back()->with('success', 'Docent verwijderd van klas');
    }
}
