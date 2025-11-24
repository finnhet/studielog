# StudieLog

Een Laravel 11 + Inertia.js + React applicatie voor het beheren van studiegesprekken tussen docenten en studenten.

## Functionaliteit

### Rollen
- **Docent**: Kan klassen, locaties en tijdblokken aanmaken en beheren
- **Student**: Kan tijdblokken reserveren en samenvattingen maken

### Features
- Authenticatie met Laravel Fortify (inclusief 2FA)
- **Microsoft OAuth login/registratie** (Sign in with Microsoft)
- Klas management met student toewijzing
- Locatie management
- Tijdblok management met overlap detectie
- Reserveringssysteem voor studenten
- Samenvattingen met goedkeuringsflow
- Agenda/kalender weergave (week overzicht)
- Microsoft Outlook integratie voor kalender sync
- Responsive design met unique gradient styling

## Tech Stack

### Backend
- Laravel 11
- SQLite database
- Laravel Fortify (authenticatie)
- Laravel Policies (autorisatie)
- Pest (testing framework)

### Frontend
- React 18 met TypeScript
- Inertia.js (SPA adapter)
- Tailwind CSS
- Radix UI componenten
- Vite (build tool)

### Integraties
- Microsoft OAuth (login/registratie met Microsoft account)
- Microsoft Graph API (Outlook kalender en mail)
- Laravel Socialite (OAuth providers)

## Installatie

### Vereisten
- PHP 8.2+
- Composer
- Node.js 18+
- npm

### Setup

1. Clone repository
```bash
git clone <repository-url>
cd studieLog
```

2. Install PHP dependencies
```bash
composer install
```

3. Install Node dependencies
```bash
npm install
```

4. Kopieer environment file
```bash
cp .env.example .env
```

5. Genereer applicatie key
```bash
php artisan key:generate
```

6. Database setup
```bash
php artisan migrate
php artisan db:seed
```

7. Build frontend
```bash
npm run build
```

### Development Server

Terminal 1 - Backend:
```bash
php artisan serve --port=8001
```

Terminal 2 - Frontend hot reload:
```bash
npm run dev
```

Bezoek: http://localhost:8001

## Test Accounts

Na het seeden zijn er 2 accounts beschikbaar:

**Docent:**
- Email: teacher@example.com
- Password: password

**Student:**
- Email: student@example.com
- Password: password

## Testing

Run alle tests:
```bash
php artisan test
```

Run specifieke test suite:
```bash
php artisan test --filter=TimeblockTest
```

**Test coverage: 68 tests, 185 assertions**

## Microsoft Outlook Integratie

Zie [MICROSOFT_OUTLOOK_INTEGRATION.md](MICROSOFT_OUTLOOK_INTEGRATION.md) voor complete documentatie.

### Quick Setup
1. Maak Azure App Registration aan
2. Configureer redirect URI: `http://localhost:8001/microsoft/callback`
3. Voeg permissions toe: User.Read, Calendars.ReadWrite, Mail.ReadWrite, Mail.Send
4. Voeg credentials toe aan `.env`:
```env
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:8001/microsoft/callback
```

## Project Structuur

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── ClassController.php          # Klas management
│   │   ├── LocationController.php       # Locatie management
│   │   ├── TimeblockController.php      # Tijdblok management + Outlook sync
│   │   ├── ReservationController.php    # Reserveringen
│   │   ├── SummaryController.php        # Samenvattingen
│   │   └── MicrosoftAuthController.php  # Microsoft OAuth
│   ├── Middleware/
│   └── Requests/
├── Models/
│   ├── User.php                         # User model met role helpers
│   ├── ClassModel.php                   # Klas model
│   ├── Location.php                     # Locatie model
│   ├── Timeblock.php                    # Tijdblok model
│   ├── Reservation.php                  # Reservering model
│   └── Summary.php                      # Samenvatting model
├── Policies/                            # Autorisatie policies
└── Services/
    └── MicrosoftGraphService.php        # Microsoft Graph API service

resources/
├── js/
│   ├── components/                      # UI componenten
│   │   ├── ui/                         # Radix UI wrappers
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Select.tsx
│   ├── layouts/
│   │   ├── app-layout.tsx              # Main app wrapper
│   │   ├── authenticated-layout.tsx     # Nav + header voor ingelogde users
│   │   └── auth-layout.tsx             # Auth pages layout
│   ├── pages/
│   │   ├── Agenda/
│   │   │   └── Index.tsx               # Week kalender overzicht
│   │   ├── Classes/
│   │   │   └── Index.tsx               # Klas management
│   │   ├── Locations/
│   │   │   └── Index.tsx               # Locatie management
│   │   ├── Reservations/
│   │   │   └── Index.tsx               # Reservering management
│   │   ├── Summaries/
│   │   │   └── Index.tsx               # Samenvatting management
│   │   ├── Timeblocks/
│   │   │   └── Index.tsx               # Tijdblok management
│   │   ├── dashboard/
│   │   │   ├── teacher.tsx             # Docent dashboard met stats
│   │   │   └── student.tsx             # Student dashboard met stats
│   │   ├── settings/                    # Account instellingen
│   │   └── welcome.tsx                 # Landing page
│   └── app.tsx                         # Inertia app entry point
└── views/
    └── app.blade.php                    # HTML template

database/
├── migrations/                          # Database schema
├── seeders/
│   └── DatabaseSeeder.php              # Test data seeder
└── factories/
    └── UserFactory.php                 # User factory voor testing

tests/
├── Feature/                            # Feature tests
│   ├── Auth/                          # Authentication tests
│   ├── ClassTest.php
│   ├── LocationTest.php
│   ├── TimeblockTest.php
│   ├── ReservationTest.php
│   └── SummaryTest.php
└── Unit/                              # Unit tests

routes/
├── web.php                            # Web routes
└── settings.php                       # Settings routes
```

## Database Schema

### Users
- id, name, email, password
- role (teacher/student)
- microsoft_access_token, microsoft_refresh_token, microsoft_token_expires
- two_factor_* (2FA fields)

### Classes
- id, name, description
- created_by (teacher_id)
- students (many-to-many via class_user pivot)

### Locations
- id, name, description
- created_by (teacher_id)

### Timeblocks
- id, class_id, teacher_id
- start_time, end_time, location
- status (available/reserved/completed/cancelled)
- outlook_event_id (Microsoft calendar link)

### Reservations
- id, timeblock_id, student_id
- reserved_at

### Summaries
- id, timeblock_id, student_id
- content
- status (pending/approved/rejected)
- reviewed_by, reviewed_at

## API Endpoints

### Authentication
- GET/POST `/register` - Registratie
- GET/POST `/login` - Login
- POST `/logout` - Logout
- POST `/forgot-password` - Wachtwoord reset aanvragen
- POST `/reset-password` - Wachtwoord reset

### Klassen
- GET/POST `/classes` - Index/Create (teacher)
- POST `/classes/{class}/students` - Add student (teacher)
- DELETE `/classes/{class}/students/{user}` - Remove student (teacher)

### Locaties
- GET/POST `/locations` - Index/Create (teacher)
- PUT `/locations/{location}` - Update (teacher)
- DELETE `/locations/{location}` - Delete (teacher)

### Tijdblokken
- GET/POST `/timeblocks` - Index/Create (teacher)
- PUT `/timeblocks/{timeblock}` - Update (teacher)
- DELETE `/timeblocks/{timeblock}` - Delete (teacher)

### Reserveringen
- GET/POST `/reservations` - Index/Create (student)
- DELETE `/reservations/{reservation}` - Cancel (student)

### Samenvattingen
- GET/POST `/summaries` - Index/Create (student)
- PUT `/summaries/{summary}` - Update (student)
- POST `/summaries/{summary}/approve` - Approve (teacher)
- POST `/summaries/{summary}/reject` - Reject (teacher)

### Agenda
- GET `/agenda` - Week kalender view

### Microsoft
- GET `/microsoft/redirect` - Start OAuth flow
- GET `/microsoft/callback` - OAuth callback
- POST `/microsoft/disconnect` - Disconnect account

## Styling

### Theme
Custom gradient design:
- Navbar: Indigo → Purple → Pink gradient
- Cards: Glassmorphism effect met subtle shadows
- Buttons: Gradient hover states
- Badges: Status-based coloring

### Colors
- Primary: Indigo shades
- Secondary: Purple shades
- Accent: Pink shades
- Status colors: Green (success), Red (danger), Yellow (warning), Blue (info)

## Development

### Code Quality
- TypeScript strict mode
- ESLint configuratie
- Prettier formatting
- Pest testing framework

### Best Practices
- Policy-based authorization
- Form validation via Request classes
- Type-safe frontend met TypeScript interfaces
- Resource formatting in controllers
- RESTful API design

### Git Workflow
```bash
# Feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

## Deployment

### Production Checklist
1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Configure proper `APP_URL`
4. Set database credentials
5. Run migrations: `php artisan migrate --force`
6. Build assets: `npm run build`
7. Optimize: `php artisan optimize`
8. Cache config: `php artisan config:cache`
9. Cache routes: `php artisan route:cache`

### Security
- CSRF protection enabled
- XSS protection via React
- SQL injection protection via Eloquent
- Rate limiting on auth routes
- Encrypted sensitive data (Microsoft tokens)
- Two-factor authentication support

## Troubleshooting

### Database Issues
```bash
php artisan migrate:fresh --seed
```

### Asset Issues
```bash
npm run build
php artisan optimize:clear
```

### Permission Issues
```bash
chmod -R 775 storage bootstrap/cache
```

### Cache Issues
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Contributing

1. Fork repository
2. Create feature branch
3. Write tests
4. Ensure tests pass: `php artisan test`
5. Submit pull request

## License

This project is proprietary software.

## Support

Voor vragen of problemen, neem contact op met het development team.
