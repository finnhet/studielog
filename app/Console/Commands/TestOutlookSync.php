<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\MicrosoftGraphService;
use Illuminate\Console\Command;

class TestOutlookSync extends Command
{
    protected $signature = 'outlook:test {user_id}';
    protected $description = 'Test Outlook calendar sync for a user';

    public function handle(MicrosoftGraphService $graphService)
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User {$userId} not found");
            return 1;
        }

        $this->info("Testing Outlook sync for: {$user->name} ({$user->email})");
        $this->info("Role: {$user->role}");
        
        if (!$user->microsoft_access_token) {
            $this->error("❌ No Microsoft access token found");
            $this->info("Please click 'Koppel Outlook' in the dashboard first");
            return 1;
        }
        $this->info("✓ Microsoft access token: SET");

        if (!$user->microsoft_refresh_token) {
            $this->error("❌ No Microsoft refresh token found");
            return 1;
        }
        $this->info("✓ Microsoft refresh token: SET");

        if (!$user->microsoft_token_expires) {
            $this->error("❌ No token expiry found");
            return 1;
        }
        
        if ($user->microsoft_token_expires < now()) {
            $this->warn("⚠ Token expired at: {$user->microsoft_token_expires}");
            $this->info("Attempting to refresh...");
            
            try {
                $refreshToken = decrypt($user->microsoft_refresh_token);
            } catch (\Exception $e) {
                $refreshToken = $user->microsoft_refresh_token;
            }
            
            $tokenResponse = $graphService->refreshAccessToken($refreshToken);
            
            if (isset($tokenResponse['access_token'])) {
                $user->microsoft_access_token = encrypt($tokenResponse['access_token']);
                if (isset($tokenResponse['refresh_token'])) {
                    $user->microsoft_refresh_token = encrypt($tokenResponse['refresh_token']);
                }
                $user->microsoft_token_expires = now()->addSeconds($tokenResponse['expires_in'] ?? 3600);
                $user->save();
                $this->info("✓ Token refreshed successfully");
            } else {
                $this->error("❌ Failed to refresh token");
                $this->error(json_encode($tokenResponse, JSON_PRETTY_PRINT));
                return 1;
            }
        } else {
            $this->info("✓ Token expires at: {$user->microsoft_token_expires}");
        }

        $this->info("\nCreating test calendar event...");
        
        try {
            $graphService->setAccessToken(decrypt($user->microsoft_access_token));
            
            $event = $graphService->createCalendarEvent([
                'subject' => 'Test Event from StudieLog',
                'body' => 'This is a test event to verify Outlook calendar sync',
                'start_time' => now()->addHour()->toIso8601String(),
                'end_time' => now()->addHours(2)->toIso8601String(),
                'location' => 'Test Location',
            ]);
            
            $this->info("✓ Successfully created calendar event!");
            $this->info("Event ID: {$event['id']}");
            $this->info("Subject: {$event['subject']}");
            $this->info("\nCheck your Outlook calendar - the event should appear in about 1 hour from now.");
            
            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Failed to create calendar event");
            $this->error("Error: " . $e->getMessage());
            $this->error("\nFull trace:");
            $this->error($e->getTraceAsString());
            return 1;
        }
    }
}
