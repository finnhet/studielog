<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class MicrosoftOAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('microsoft')
            ->scopes(['User.Read', 'openid', 'profile', 'email', 'Calendars.ReadWrite', 'Mail.ReadWrite', 'Mail.Send', 'offline_access'])
            ->redirect();
    }

    public function callback()
    {
        try {
            $microsoftUser = Socialite::driver('microsoft')->user();
            
            \Log::info('Microsoft OAuth callback received', [
                'microsoft_id' => $microsoftUser->id,
                'email' => $microsoftUser->email,
                'name' => $microsoftUser->name,
                'has_token' => !empty($microsoftUser->token),
                'has_refresh_token' => !empty($microsoftUser->refreshToken),
                'expires_in' => $microsoftUser->expiresIn ?? 'not set',
                'token_length' => strlen($microsoftUser->token ?? ''),
            ]);
            
            $user = User::where('microsoft_id', $microsoftUser->id)
                ->orWhere('email', $microsoftUser->email)
                ->first();

            if ($user) {
                \Log::info('Updating existing user', ['user_id' => $user->id]);
                $user->update([
                    'microsoft_id' => $microsoftUser->id,
                    'avatar' => $microsoftUser->avatar,
                    'microsoft_access_token' => encrypt($microsoftUser->token),
                    'microsoft_refresh_token' => $microsoftUser->refreshToken ? encrypt($microsoftUser->refreshToken) : null,
                    'microsoft_token_expires' => now()->addSeconds($microsoftUser->expiresIn ?? 3600),
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);
                \Log::info('User updated successfully', ['user_id' => $user->id]);
            } else {
                // Check if this is a teacher registration via invite
                $role = session('register_role');
                
                if ($role === 'teacher') {
                    \Log::info('Creating new teacher user from invite');
                    // Clear the session variable after use
                    session()->forget('register_role');

                    $user = User::create([
                        'name' => $microsoftUser->name,
                        'email' => $microsoftUser->email,
                        'microsoft_id' => $microsoftUser->id,
                        'avatar' => $microsoftUser->avatar,
                        'microsoft_access_token' => encrypt($microsoftUser->token),
                        'microsoft_refresh_token' => $microsoftUser->refreshToken ? encrypt($microsoftUser->refreshToken) : null,
                        'microsoft_token_expires' => now()->addSeconds($microsoftUser->expiresIn ?? 3600),
                        'role' => $role,
                        'password' => null,
                        'email_verified_at' => now(),
                    ]);
                    \Log::info('User created successfully', ['user_id' => $user->id, 'role' => $role]);
                } else {
                    // No existing user and no invite -> Deny access
                    \Log::warning('Login attempt denied: No account and no invite', ['email' => $microsoftUser->email]);
                    return redirect()->route('login')->withErrors(['error' => 'Geen account gevonden. Vraag je docent om een uitnodiging.']);
                }
            }

            Auth::guard('web')->login($user, true);
            
            request()->session()->regenerate();
            request()->session()->save();

            return redirect('/dashboard');
        } catch (\Exception $e) {
            \Log::error('Microsoft OAuth Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return redirect()->route('login')->withErrors(['error' => 'Unable to login with Microsoft. Please try again.']);
        }
    }
}
