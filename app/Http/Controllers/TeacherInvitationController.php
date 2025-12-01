<?php

namespace App\Http\Controllers;

use App\Services\MicrosoftGraphService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class TeacherInvitationController extends Controller
{
    public function create()
    {
        return Inertia::render('Teachers/Invite');
    }

    public function store(Request $request, MicrosoftGraphService $graphService)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = $request->user();

        if (!$user->microsoft_access_token) {
            return back()->withErrors(['email' => 'You must be connected to Microsoft to send invitations.']);
        }

        // Check if token is expired and refresh if necessary
        if ($user->microsoft_token_expires && $user->microsoft_token_expires->isPast()) {
            if ($user->microsoft_refresh_token) {
                try {
                    $newTokens = $graphService->refreshAccessToken(decrypt($user->microsoft_refresh_token));
                    
                    if (isset($newTokens['access_token'])) {
                        $user->update([
                            'microsoft_access_token' => encrypt($newTokens['access_token']),
                            'microsoft_refresh_token' => isset($newTokens['refresh_token']) ? encrypt($newTokens['refresh_token']) : $user->microsoft_refresh_token,
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

        try {
            $token = decrypt($user->microsoft_access_token);
            $graphService->setAccessToken($token);

            $inviteUrl = URL::signedRoute('register.teacher.start', ['email' => $request->email]);

            $graphService->sendMail([
                'subject' => 'Uitnodiging voor StudieLog Docent Account',
                'body' => "
                    <h1>Welkom bij StudieLog</h1>
                    <p>Je bent uitgenodigd om een docent account aan te maken bij StudieLog.</p>
                    <p>Klik op de onderstaande link om je te registreren met je Microsoft account:</p>
                    <p><a href=\"{$inviteUrl}\">Registreer als Docent</a></p>
                    <p>Deze link is geldig voor dit email adres.</p>
                ",
                'to' => [$request->email],
            ]);

            return back()->with('success', 'Uitnodiging verstuurd!');
        } catch (\Exception $e) {
            return back()->withErrors(['email' => 'Kon uitnodiging niet versturen: ' . $e->getMessage()]);
        }
    }

    public function startRegistration(Request $request)
    {
        if (!$request->hasValidSignature()) {
            abort(403, 'Invalid or expired invitation link.');
        }

        session(['register_role' => 'teacher']);
        
        return redirect()->route('auth.microsoft.redirect');
    }
}
