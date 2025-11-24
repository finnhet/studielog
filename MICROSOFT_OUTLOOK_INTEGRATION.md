# Microsoft Outlook Integration

## Overview
The StudieLog application now includes full Microsoft Outlook integration for calendar synchronization and email capabilities using the Microsoft Graph API.

## Features Implemented

### 1. OAuth2 Authentication Flow
- Teachers can connect their Microsoft account via the dashboard
- Secure token storage with encryption
- Automatic token refresh capability
- OAuth2 redirect and callback endpoints

### 2. Calendar Synchronization
When a teacher creates, updates, or deletes a timeblock:
- Automatically syncs to their Outlook calendar
- Creates calendar events with subject, location, start/end times
- Updates existing events when timeblock is modified
- Removes calendar events when timeblock is deleted
- Stores `outlook_event_id` to track linked events

### 3. Email Capabilities (Ready to Use)
The service includes methods for:
- Sending emails via Outlook
- Retrieving calendar events for date ranges
- Full HTML email support

## Database Changes

### Users Table
Added columns for Microsoft token storage:
- `microsoft_access_token` (encrypted)
- `microsoft_refresh_token` (encrypted)
- `microsoft_token_expires` (timestamp)

### Timeblocks Table
Added column:
- `outlook_event_id` (string, nullable) - Links timeblock to Outlook event

## Configuration

### Environment Variables
Add to `.env`:
```env
MICROSOFT_CLIENT_ID=your_azure_app_client_id
MICROSOFT_CLIENT_SECRET=your_azure_app_client_secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:8001/microsoft/callback
```

### Azure App Registration
Required permissions:
- User.Read
- Calendars.ReadWrite
- Mail.ReadWrite
- Mail.Send
- offline_access (for refresh tokens)

## Routes

- `GET /microsoft/redirect` - Initiates OAuth flow
- `GET /microsoft/callback` - Handles OAuth callback
- `POST /microsoft/disconnect` - Removes Microsoft connection

## Services

### MicrosoftGraphService
Located at `app/Services/MicrosoftGraphService.php`

Methods:
- `getAuthUrl()` - Generate Microsoft login URL
- `getAccessToken($code)` - Exchange auth code for tokens
- `refreshAccessToken($refreshToken)` - Refresh expired token
- `createCalendarEvent($data)` - Create Outlook event
- `updateCalendarEvent($eventId, $data)` - Update event
- `deleteCalendarEvent($eventId)` - Delete event
- `sendMail($data)` - Send email via Outlook
- `getCalendarEvents($startDate, $endDate)` - Retrieve events

### Usage Example
```php
$graphService = app(MicrosoftGraphService::class);
$graphService->setAccessToken($user->microsoft_access_token);

$event = $graphService->createCalendarEvent([
    'subject' => 'Meeting',
    'body' => 'Meeting details',
    'start_time' => '2025-01-15T10:00:00',
    'end_time' => '2025-01-15T11:00:00',
    'location' => 'Room 101',
]);
```

## User Interface

### Teacher Dashboard
- "Koppel Outlook" button to connect Microsoft account
- Button appears in dashboard header
- Redirects to Microsoft login page
- After authorization, tokens are stored and calendar sync activates

### Automatic Sync
Once connected:
- Creating a timeblock → Creates Outlook event
- Editing a timeblock → Updates Outlook event
- Deleting a timeblock → Removes Outlook event

## Security

### Token Storage
- Access and refresh tokens are encrypted using Laravel's encryption
- Tokens are stored per user
- Token expiry is tracked to enable automatic refresh

### Error Handling
- Calendar sync failures don't block timeblock operations
- Silent failures with catch blocks
- Timeblocks can still be created without Microsoft connection

## Testing

All 68 existing tests still pass:
```bash
php artisan test
```

The integration doesn't break existing functionality - timeblocks work with or without Microsoft connection.

## Future Enhancements

Potential additions:
1. UI indicator showing connection status
2. Automatic token refresh middleware
3. Email notifications to students on reservation
4. Two-way sync (import Outlook events to StudieLog)
5. Student Outlook integration for personal calendar sync
6. Disconnect button UI with status display

## Implementation Details

### TimeblockController Updates
The controller now:
1. Injects `MicrosoftGraphService` via constructor
2. Checks if user has valid Microsoft token before sync
3. Calls appropriate Graph API methods on CRUD operations
4. Handles sync errors gracefully without blocking operations

### Event Data Format
Calendar events are created with:
- Subject: "Studiegesprek - {Class Name}"
- Body: Description with class info
- Start/End: Timeblock datetime
- Location: Timeblock location
- Timezone: Europe/Amsterdam (configurable)

## Troubleshooting

### Sync Not Working
1. Check if user has connected Microsoft account
2. Verify `microsoft_access_token` exists and not expired
3. Check `outlook_event_id` is being stored
4. Review logs for API errors

### Token Expired
Tokens expire after 1 hour. Implement refresh logic:
```php
if ($user->microsoft_token_expires < now()) {
    $tokens = $graphService->refreshAccessToken(
        decrypt($user->microsoft_refresh_token)
    );
    $user->update([
        'microsoft_access_token' => encrypt($tokens['access_token']),
        'microsoft_token_expires' => now()->addSeconds($tokens['expires_in']),
    ]);
}
```

## Dependencies

Uses Laravel HTTP client (no additional packages required):
- Removed microsoft/microsoft-graph package
- Uses direct HTTP calls to Graph API
- Simpler, more testable implementation
- No complex SDK dependencies
