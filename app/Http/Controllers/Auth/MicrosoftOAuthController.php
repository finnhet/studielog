<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ClassModel;
use App\Models\Location;
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

                $pendingClassId = session('pending_class_id');
                $pendingClassEmail = session('pending_class_email');
                if ($pendingClassId && $pendingClassEmail === $user->email) {
                    session()->forget(['pending_class_id', 'pending_class_email']);
                    $class = ClassModel::find($pendingClassId);
                    if ($class) {
                        $existingPivot = $class->users()->where('user_id', $user->id)->first();
                        if ($existingPivot && $existingPivot->pivot->status === 'pending') {
                            $class->users()->updateExistingPivot($user->id, ['status' => 'accepted']);
                            \Log::info('Class invitation auto-accepted', ['user_id' => $user->id, 'class_id' => $pendingClassId]);
                        }
                    }
                }
            } else {
                $role = session('register_role');
                
                if ($role === 'teacher') {
                    \Log::info('Creating new teacher user from invite');
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

                    $pendingLocationId = session('pending_location_id');
                    if ($pendingLocationId) {
                        session()->forget('pending_location_id');
                        $location = Location::find($pendingLocationId);
                        if ($location && !$location->teachers()->where('user_id', $user->id)->exists()) {
                            $location->teachers()->attach($user->id);
                            \Log::info('Teacher added to location', ['user_id' => $user->id, 'location_id' => $pendingLocationId]);
                        }
                    }
                } else {
                    $pendingClassId = session('pending_class_id');
                    $pendingClassEmail = session('pending_class_email');
                    
                    if ($pendingClassId && $pendingClassEmail === $microsoftUser->email) {
                        \Log::info('Creating new student user from class invite');
                        session()->forget(['pending_class_id', 'pending_class_email']);

                        $user = User::create([
                            'name' => $microsoftUser->name,
                            'email' => $microsoftUser->email,
                            'microsoft_id' => $microsoftUser->id,
                            'avatar' => $microsoftUser->avatar,
                            'microsoft_access_token' => encrypt($microsoftUser->token),
                            'microsoft_refresh_token' => $microsoftUser->refreshToken ? encrypt($microsoftUser->refreshToken) : null,
                            'microsoft_token_expires' => now()->addSeconds($microsoftUser->expiresIn ?? 3600),
                            'role' => 'student',
                            'password' => null,
                            'email_verified_at' => now(),
                        ]);
                        \Log::info('Student user created successfully', ['user_id' => $user->id]);

                        $class = ClassModel::find($pendingClassId);
                        if ($class) {
                            $existingPivot = $class->users()->where('user_id', $user->id)->first();
                            if ($existingPivot && $existingPivot->pivot->status === 'pending') {
                                $class->users()->updateExistingPivot($user->id, ['status' => 'accepted']);
                                \Log::info('Class invitation auto-accepted for new student', ['user_id' => $user->id, 'class_id' => $pendingClassId]);
                            }
                        }
                    } else {
                        \Log::warning('Login attempt denied: No account and no invite', ['email' => $microsoftUser->email]);
                        return redirect()->route('login')->withErrors(['error' => 'Geen account gevonden. Vraag je docent om een uitnodiging.']);
                    }
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
