# StudieLog

Een Laravel 11 + Inertia.js + React applicatie voor het beheren van studiegesprekken tussen docenten en studenten.

## Functionaliteit

### Rollen
- **Docent**: Kan klassen, locaties en tijdblokken aanmaken en beheren
- **Student**: Kan tijdblokken reserveren en samenvattingen maken

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
