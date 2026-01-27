<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\User;
use App\Services\MicrosoftGraphService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class LocationController extends Controller
{
    use AuthorizesRequests;

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

    public function index()
    {
        $this->authorize('viewAny', Location::class);

        $locations = Location::with('creator', 'classes', 'teachers')->get()->map(function ($location) {
            return [
                'id' => $location->id,
                'name' => $location->name,
                'address' => $location->address,
                'created_by' => $location->created_by,
                'creator' => [
                    'name' => $location->creator->name,
                ],
                'classes_count' => $location->classes->count(),
                'teachers' => $location->teachers->map(function ($teacher) {
                    return [
                        'id' => $teacher->id,
                        'name' => $teacher->name,
                        'email' => $teacher->email,
                    ];
                }),
            ];
        });

        return Inertia::render('Locations/Index', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Location::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);

        $location = Location::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        $location->teachers()->attach($request->user()->id);

        return redirect()->route('locations.index');
    }

    public function update(Request $request, Location $location)
    {
        $this->authorize('update', $location);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);

        $location->update($validated);

        return redirect()->route('locations.index');
    }

    public function destroy(Location $location)
    {
        $this->authorize('delete', $location);

        $location->delete();

        return redirect()->route('locations.index');
    }

    public function addTeacher(Request $request, Location $location, MicrosoftGraphService $graphService)
    {
        $this->authorize('update', $location);

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

        if ($request->filled('user_id')) {
            $user = User::find($validated['user_id']);
            
            if (!$user->isTeacher()) {
                return back()->withErrors(['email' => 'Gebruiker is geen docent']);
            }

            if ($location->teachers()->where('user_id', $user->id)->exists()) {
                return back()->withErrors(['email' => 'Docent is al gekoppeld aan deze vestiging']);
            }

            $location->teachers()->attach($user->id);

            try {
                $token = decrypt($currentUser->microsoft_access_token);
                $graphService->setAccessToken($token);

                $loginUrl = route('auth.microsoft.redirect');

                $graphService->sendMail([
                    'subject' => "Je bent toegevoegd aan vestiging: {$location->name}",
                    'body' => "
                        <h1>Je bent toegevoegd aan de vestiging {$location->name}</h1>
                        <p>Beste {$user->name},</p>
                        <p>Je bent door {$currentUser->name} toegevoegd aan de vestiging <strong>{$location->name}</strong> in StudieLog.</p>
                        <p>Adres: {$location->address}</p>
                        <p>Klik op de onderstaande link om in te loggen met je Microsoft account:</p>
                        <p><a href=\"{$loginUrl}\">Inloggen bij StudieLog</a></p>
                    ",
                    'to' => [$user->email],
                ]);

                return back()->with('success', 'Docent toegevoegd en notificatie verstuurd');
            } catch (\Exception $e) {
                Log::error('Failed to send location notification email: ' . $e->getMessage());
                return back()->with('success', 'Docent toegevoegd, maar email kon niet worden verzonden');
            }
        } else {
            $user = User::where('email', $validated['email'])->first();
            
            if ($user) {
                if (!$user->isTeacher()) {
                    return back()->withErrors(['email' => 'Gebruiker is geen docent']);
                }

                if ($location->teachers()->where('user_id', $user->id)->exists()) {
                    return back()->withErrors(['email' => 'Docent is al gekoppeld aan deze vestiging']);
                }

                $location->teachers()->attach($user->id);

                try {
                    $token = decrypt($currentUser->microsoft_access_token);
                    $graphService->setAccessToken($token);

                    $loginUrl = route('auth.microsoft.redirect');

                    $graphService->sendMail([
                        'subject' => "Je bent toegevoegd aan vestiging: {$location->name}",
                        'body' => "
                            <h1>Je bent toegevoegd aan de vestiging {$location->name}</h1>
                            <p>Beste {$user->name},</p>
                            <p>Je bent door {$currentUser->name} toegevoegd aan de vestiging <strong>{$location->name}</strong> in StudieLog.</p>
                            <p>Adres: {$location->address}</p>
                            <p>Klik op de onderstaande link om in te loggen met je Microsoft account:</p>
                            <p><a href=\"{$loginUrl}\">Inloggen bij StudieLog</a></p>
                        ",
                        'to' => [$user->email],
                    ]);

                    return back()->with('success', 'Docent toegevoegd en notificatie verstuurd');
                } catch (\Exception $e) {
                    Log::error('Failed to send location notification email: ' . $e->getMessage());
                    return back()->with('success', 'Docent toegevoegd, maar email kon niet worden verzonden');
                }
            } else {
                try {
                    $token = decrypt($currentUser->microsoft_access_token);
                    $graphService->setAccessToken($token);

                    $inviteUrl = URL::signedRoute('register.teacher.start', [
                        'email' => $validated['email'],
                        'location_id' => $location->id,
                    ]);

                    $graphService->sendMail([
                        'subject' => "Uitnodiging voor StudieLog - Vestiging: {$location->name}",
                        'body' => "
                            <h1>Welkom bij StudieLog</h1>
                            <p>Je bent uitgenodigd door {$currentUser->name} om een docent account aan te maken bij StudieLog.</p>
                            <p>Na registratie word je automatisch toegevoegd aan de vestiging <strong>{$location->name}</strong>.</p>
                            <p>Adres: {$location->address}</p>
                            <p>Klik op de onderstaande link om je te registreren met je Microsoft account:</p>
                            <p><a href=\"{$inviteUrl}\">Registreer als Docent</a></p>
                            <p>Deze link is geldig voor dit email adres.</p>
                        ",
                        'to' => [$validated['email']],
                    ]);

                    return back()->with('success', 'Uitnodiging verstuurd naar nieuwe docent');
                } catch (\Exception $e) {
                    Log::error('Failed to send teacher invitation email: ' . $e->getMessage());
                    return back()->withErrors(['email' => 'Kon uitnodiging niet versturen: ' . $e->getMessage()]);
                }
            }
        }
    }

    public function removeTeacher(Request $request, Location $location)
    {
        $this->authorize('update', $location);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $location->teachers()->detach($validated['user_id']);

        return back()->with('success', 'Docent verwijderd van vestiging');
    }
}
