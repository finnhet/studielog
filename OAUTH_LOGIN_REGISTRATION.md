# Microsoft OAuth Login/Registration

## Overview
Users can now sign in and register using their Microsoft account via OAuth2 authentication. This provides a seamless single sign-on experience.

## Features

### 1. OAuth Login
- "Continue with Microsoft" button on login page
- Automatic account linking if email already exists
- Secure token-based authentication
- Automatic email verification for OAuth users

### 2. OAuth Registration
- "Continue with Microsoft" button on registration page
- Automatic account creation on first login
- Profile data (name, email, avatar) synced from Microsoft
- New users are assigned 'student' role by default

### 3. Account Linking
- If a user with the same email exists, OAuth is linked to existing account
- Users can use both password and OAuth to login
- Microsoft ID stored separately for identification

## Database Changes

### Users Table
New columns added:
- `microsoft_id` (string, unique, nullable) - Microsoft OAuth user ID
- `avatar` (string, nullable) - Profile picture URL from Microsoft
- `password` (nullable) - Allows OAuth-only accounts

## Configuration

### Environment Variables
Already configured in `.env`:
```env
MICROSOFT_CLIENT_ID=2d135e6b-51f5-488e-a9e0-453fbdc28001
MICROSOFT_CLIENT_SECRET=0ddab4f0-5180-48a3-bc5c-2ae30d800337
MICROSOFT_TENANT_ID=common
MICROSOFT_OAUTH_REDIRECT=http://localhost:8001/auth/microsoft/callback
```

### Azure App Configuration
The OAuth callback URL for login/registration:
- Redirect URI: `http://localhost:8001/auth/microsoft/callback`

Required permissions:
- User.Read
- openid
- profile
- email

## Routes

### OAuth Routes
- `GET /auth/microsoft/redirect` - Initiates Microsoft OAuth flow
- `GET /auth/microsoft/callback` - Handles OAuth callback and user creation/login

## Implementation Details

### OAuth Controller
Located at `app/Http/Controllers/Auth/MicrosoftOAuthController.php`

**Methods:**
- `redirect()` - Redirects to Microsoft login with scopes
- `callback()` - Processes OAuth response, creates/updates user, logs them in

### OAuth Flow
1. User clicks "Continue with Microsoft"
2. Redirected to Microsoft login page
3. User authorizes the application
4. Microsoft redirects back with auth code
5. Controller exchanges code for user data
6. Check if user exists by Microsoft ID or email
7. Create new user or link OAuth to existing account
8. Store Microsoft ID and avatar
9. Log user in and redirect to dashboard

### User Creation
New OAuth users are created with:
- Name from Microsoft profile
- Email from Microsoft profile
- Microsoft ID for linking
- Avatar URL from Microsoft
- Role: 'student' (default)
- Password: null (OAuth-only)
- Email verified: true (trusted OAuth)

### Account Linking
If user exists:
1. Check by `microsoft_id` first
2. Fall back to email match
3. Update existing user with Microsoft ID and avatar
4. Log user in

## UI Changes

### Login Page (`resources/js/pages/auth/login.tsx`)
- Added divider with "Or continue with"
- Microsoft button with branded icon
- Maintains existing password login

### Register Page (`resources/js/pages/auth/register.tsx`)
- Added divider with "Or continue with"
- Microsoft button with branded icon
- Maintains existing registration form

### Microsoft Button
- Outline variant for subtle appearance
- Microsoft logo (4-color square)
- Full width for consistency
- Redirects to OAuth flow on click

## Security

### Password Field
- Made nullable to support OAuth-only accounts
- Existing password users unaffected
- OAuth users can't use password login (no password set)

### Token Security
- OAuth tokens handled by Laravel Socialite
- User data validated before storage
- No sensitive tokens stored in database
- Session-based authentication after OAuth

### Email Verification
- OAuth users automatically verified
- Email from Microsoft is trusted
- No verification email sent

## User Experience

### First Time OAuth User
1. Click "Continue with Microsoft"
2. Authorize on Microsoft page
3. Automatically registered and logged in
4. Redirected to dashboard
5. Can immediately use the application

### Returning OAuth User
1. Click "Continue with Microsoft"
2. Authorize on Microsoft page
3. Automatically logged in
4. Redirected to dashboard

### Existing User with Same Email
1. Click "Continue with Microsoft"
2. Authorize on Microsoft page
3. Microsoft ID linked to existing account
4. Can now use both login methods
5. Logged in and redirected to dashboard

## Error Handling

### OAuth Failures
If OAuth fails:
- User redirected back to login page
- Error message displayed: "Unable to login with Microsoft. Please try again."
- User can try again or use password login

### Common Issues
- **Invalid credentials**: Check Azure app configuration
- **Redirect mismatch**: Verify callback URL in Azure matches route
- **Scope errors**: Ensure required permissions granted in Azure
- **Token expiry**: Handled automatically by Socialite

## Testing

### Manual Testing
1. Start dev server: `php artisan serve --port=8001`
2. Visit login page: http://localhost:8001/login
3. Click "Continue with Microsoft"
4. Login with Microsoft account
5. Verify redirect to dashboard
6. Check database for new user with `microsoft_id`

### Automated Testing
All 68 existing tests pass:
```bash
php artisan test
```

No tests broken by OAuth implementation.

## Dependencies

### Laravel Socialite
- Package: `laravel/socialite ^5.23`
- Provides OAuth abstraction
- Supports multiple providers
- Handles token exchange

### Additional Packages
- `firebase/php-jwt` - JWT token handling
- `league/oauth1-client` - OAuth1 support
- `phpseclib/phpseclib` - Cryptography

## Production Considerations

### Azure App Configuration
1. Create production Azure App Registration
2. Add production redirect URI
3. Update environment variables
4. Test OAuth flow in production
5. Monitor for auth errors

### Environment Variables
Update `.env` for production:
```env
MICROSOFT_CLIENT_ID=your_production_client_id
MICROSOFT_CLIENT_SECRET=your_production_client_secret
MICROSOFT_OAUTH_REDIRECT=https://yourdomain.com/auth/microsoft/callback
```

### HTTPS Required
- Microsoft OAuth requires HTTPS in production
- Use valid SSL certificate
- Ensure redirect URI uses https://

## Troubleshooting

### "Redirect URI mismatch"
- Check Azure app redirect URIs
- Ensure exact match (including http/https)
- Clear browser cache

### "Invalid client secret"
- Verify client secret in Azure
- Check .env configuration
- Regenerate secret if needed

### "User not authenticated after OAuth"
- Check session configuration
- Verify database user creation
- Check Laravel logs for errors

### "Avatar not loading"
- Microsoft avatar URLs expire
- Consider downloading and storing locally
- Implement avatar refresh logic

## Future Enhancements

Potential improvements:
1. Google OAuth support
2. GitHub OAuth support
3. Profile picture upload override
4. OAuth account unlinking
5. Show linked accounts in settings
6. Avatar caching/download
7. Role selection during OAuth registration
8. Admin approval for OAuth users

## Support

For OAuth-related issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify Azure app configuration
3. Test with Microsoft account
4. Check network requests in browser DevTools
