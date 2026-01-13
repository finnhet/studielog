# Technisch Ontwerp - StudieLog

## Inhoudsopgave
1. [Samenvatting](#samenvatting)
2. [Op te leveren producten](#op-te-leveren-producten)
3. [Definition of Done](#definition-of-done)
4. [Interfaces](#interfaces)
5. [Docentenpaneel](#docentenpaneel)
6. [Ontwikkelomgeving](#ontwikkelomgeving)
7. [Schema's](#schemas)
8. [Activity diagrammen](#activity-diagrammen)
9. [Sequence diagrammen](#sequence-diagrammen)
10. [Database-ontwerp](#database-ontwerp)
11. [Ontwikkeltools](#ontwikkeltools)
12. [Beveiliging](#beveiliging)
13. [Beheer](#beheer)

---

## Samenvatting
StudieLog is een webapplicatie ontwikkeld met Laravel en Inertia React voor het beheren van studiegesprekken tussen studenten en docenten. Het systeem biedt functionaliteiten voor het plannen van afspraken, schrijven van samenvattingen en beheer van klassen en vestigingen.

## Op te leveren producten

### Documentatie
- Projectplan
- Functioneel ontwerp
- Technisch ontwerp
- Testplan

### Softwareproducten
- Laravel project
- MySQL database

## Definition of Done
- Code is getest
- Functionaliteit voldoet aan acceptatiecriteria
- Documentatie is bijgewerkt
- Geen bekende kritieke bugs

## Interfaces

### Login
**Technische specificatie:**
- Laravel Breeze authenticatie
- JWT token management
- Role-based redirect na login
- Remember me functionaliteit

### Account aanmaken
**Technische specificatie:**
- E-mail verificatie flow
- Automatische role assignment
- Account activering required

## Docentenpaneel

### Dashboard overzicht
**Technische specificatie:**
- Real-time overzicht tijdblokken
- Samenvattingen status dashboard
- Klassen en studenten overzicht
- Responsive grid layout

### Tijdblokken beheren
**Technische specificatie:**
- Conflict detection bij aanmaken
- Automatische Outlook integratie

### Samenvattingen beoordelen
**Technische specificatie:**
- Status tracking (pending/approved/rejected)
- Notificatie systeem bij wijzigingen

### Vestigingen en klassen beheren
**Technische specificatie:**
- CRUD operations voor vestigingen
- Student management per klas
- Docent uitnodigingssysteem

## Ontwikkelomgeving
- **Lokale ontwikkeling:** Laravel
- **Database:** MySQL 8.0
- **PHP:** 8.2+
- **Node.js:** 18+
- **Versiebeheer:** Git

## Schema's

### Applicatie Architectuur
```mermaid
graph TB
    A[Gebruiker] --> B[Web Browser]
    B --> C[Nginx Web Server]
    C --> D[Laravel Applicatie]
    D --> E[MySQL Database]
    D --> F[React Components]
    F --> B
    D --> G[File Storage]
    D --> H[Email Service]
```

## Activity diagrammen

### Inloggen
```mermaid
flowchart TD
    A[Start] --> B[Toon login formulier]
    B --> C[Voer email en wachtwoord in]
    C --> D{Validatie}
    D -->|Succes| E[Redirect naar dashboard]
    D -->|Fout| F[Toon foutmelding]
    F --> B
    E --> G[Einde]
```

### Account aanmaken voor student
```mermaid
flowchart TD
    A[Start] --> B[Docent selecteert klas]
    B --> C[Klik op Student registreren]
    C --> D[Voer student email in]
    D --> E{Email validatie}
    E -->|Geldig| F[Verstuur uitnodiging]
    E -->|Ongeldig| G[Toon foutmelding]
    F --> H[Student toegevoegd als pending]
    H --> I[Einde]
    G --> D
```

### Vestiging aanmaken
```mermaid
flowchart TD
    A[Start] --> B[Navigeer naar vestigingsbeheer]
    B --> C[Klik op Vestiging aanmaken]
    C --> D[Voer naam en adres in]
    D --> E{Validatie}
    E -->|Succes| F[Sla vestiging op]
    E -->|Fout| G[Toon foutmelding]
    F --> H[Toon succesmelding]
    H --> I[Einde]
    G --> D
```

### Klas aanmaken
```mermaid
flowchart TD
    A[Start] --> B[Navigeer naar klasbeheer]
    B --> C[Klik op Klas aanmaken]
    C --> D[Voer naam en selecteer vestiging]
    D --> E{Validatie}
    E -->|Succes| F[Sla klas op]
    E -->|Fout| G[Toon foutmelding]
    F --> H[Toon succesmelding]
    H --> I[Einde]
    G --> D
```

### Tijdblok aanmaken
```mermaid
flowchart TD
    A[Start] --> B[Navigeer naar tijdblokbeheer]
    B --> C[Klik op Tijdblok aanmaken]
    C --> D[Voer datum, tijd en locatie in]
    D --> E{Validatie}
    E -->|Succes| F{Controleer overlap}
    E -->|Fout| G[Toon foutmelding]
    F -->|Geen overlap| H[Sla tijdblok op]
    F -->|Overlap| I[Toon overlap waarschuwing]
    H --> J[Toon succesmelding]
    J --> K[Einde]
    I --> D
    G --> D
```

### Tijdblokken reserveren
```mermaid
flowchart TD
    A[Start] --> B[Toon beschikbare tijdblokken]
    B --> C[Student selecteert tijdblok]
    C --> D{Controleer beschikbaarheid}
    D -->|Beschikbaar| E[Bevestig reservering]
    D -->|Niet beschikbaar| F[Toon foutmelding]
    E --> G[Update tijdblok status]
    G --> H[Stuur bevestigingsmail]
    H --> I[Toon succesmelding]
    I --> J[Einde]
    F --> B
```

### Verslag aanmaken
```mermaid
flowchart TD
    A[Start] --> B[Navigeer naar Mijn afspraken]
    B --> C[Selecteer afgeronde afspraak]
    C --> D[Klik op Verslag aanmaken]
    D --> E[Vul samenvatting in]
    E --> F{Validatie}
    F -->|Succes| G[Sla verslag op]
    F -->|Fout| H[Toon foutmelding]
    G --> I[Stuur notificatie naar docent]
    I --> J[Toon succesmelding]
    J --> K[Einde]
    H --> E
```

### Verslagen goed- of afkeuren
```mermaid
flowchart TD
    A[Start] --> B[Navigeer naar Verslagen]
    B --> C[Selecteer verslag]
    C --> D[Kies goedkeuren of afkeuren]
    D --> E[Voeg optionele feedback toe]
    E --> F[Bevestig actie]
    F --> G[Update verslag status]
    G --> H[Stuur notificatie naar student]
    H --> I[Toon succesmelding]
    I --> J[Einde]
```

### Andere docenten uitnodigen
```mermaid
flowchart TD
    A[Start] --> B[Navigeer naar Vestiging/Klas beheren]
    B --> C[Klik op Uitnodigen docent]
    C --> D[Voer docent email in]
    D --> E{Validatie}
    E -->|Geldig| F[Verstuur uitnodiging]
    E -->|Ongeldig| G[Toon foutmelding]
    F --> H[Toon succesmelding]
    H --> I[Einde]
    G --> D
```

## Sequence diagrammen

### Inloggen Sequence
```mermaid
sequenceDiagram
    participant U as Gebruiker
    participant F as Frontend
    participant A as AuthController
    participant DB as Database
    
    U->>F: Vult login form in
    F->>A: POST /login
    A->>DB: Valideer credentials
    DB->>A: User data
    alt Valid credentials
        A->>F: Inertia response dashboard
        F->>U: Toon dashboard
    else Invalid credentials
        A->>F: Error response
        F->>U: Toon foutmelding
    end
```

### Tijdblok Reserveren Sequence
```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant R as ReservationController
    participant T as Timeblock
    participant DB as Database
    participant M as MailService
    
    S->>F: Klik op reserveren
    F->>R: POST /reserveren
    R->>T: Controleer beschikbaarheid
    T->>DB: Query tijdblok status
    DB->>T: Tijdblok data
    alt Beschikbaar
        R->>DB: Update tijdblok status
        R->>M: Verstuur bevestigingsmail
        R->>F: Success response
        F->>S: Toon succesmelding
    else Niet beschikbaar
        R->>F: Error response
        F->>S: Toon foutmelding
    end
```

### Verslag Aanmaken Sequence
```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant SC as SummaryController
    participant DB as Database
    participant N as NotificationService
    
    S->>F: Vult verslag form in
    F->>SC: POST /verslag
    SC->>DB: Sla verslag op
    DB->>SC: Bevestiging
    SC->>N: Verstuur notificatie naar docent
    SC->>F: Success response
    F->>S: Toon succesmelding
```

### Verslag Goedkeuren Sequence
```mermaid
sequenceDiagram
    participant D as Docent
    participant F as Frontend
    participant SC as SummaryController
    participant DB as Database
    participant N as NotificationService
    
    D->>F: Klik op goedkeuren
    F->>SC: PATCH /verslag/{id}/goedkeuren
    SC->>DB: Update verslag status
    DB->>SC: Bevestiging
    SC->>N: Verstuur notificatie naar student
    SC->>F: Success response
    F->>D: Toon succesmelding
```

### Tijdblok Aanmaken Sequence
```mermaid
sequenceDiagram
    participant D as Docent
    participant F as Frontend
    participant TC as TimeblockController
    participant DB as Database
    participant O as OutlookService
    
    D->>F: Vult tijdblok form in
    F->>TC: POST /tijdblokken
    TC->>DB: Controleer overlap
    DB->>TC: Overlap resultaat
    alt Geen overlap
        TC->>DB: Sla tijdblok op
        TC->>O: Sync met Outlook
        TC->>F: Success response
        F->>D: Toon succesmelding
    else Overlap gedetecteerd
        TC->>F: Error response
        F->>D: Toon overlap waarschuwing
    end
```

## Database-ontwerp

### ERD Diagram
```mermaid
erDiagram
    users {
        bigint id PK
        varchar(255) name
        varchar(255) email
        varchar(255) password
        enum role
        timestamp created_at
        timestamp updated_at
		timestamp email_verified_at
		text	two_factor_secret
		text	two_factor_recovery_codes
		text	remember_token
		text	microsoft_access_token
		text	microsoft_refresh_token
		timestamp microsoft_token_expires
    }
    
    locations {
        bigint id PK
        varchar(255) name
        varchar(255) address
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    classes {
        bigint id PK
        varchar(255) name
        bigint location_id FK
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    timeblocks {
        bigint id PK
        bigint teacher_id FK
        bigint class_id FK
        datetime start_time
        datetime end_time
        string location
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    reservations {
        bigint id PK
        bigint timeblock_id FK
        bigint student_id FK
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    summaries {
        bigint id PK
        bigint timeblock_id FK
        bigint student_id FK
        text content
        enum status
        text feedback
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ timeblocks : "docent maakt"
    users ||--o{ summaries : "student schrijft"
    users ||--o{ reservations : "student reserveert"
    locations ||--o{ classes : "bevat"
    classes ||--o{ timeblocks : "heeft"
    timeblocks ||--o{ reservations : "heeft"
    timeblocks ||--o{ summaries : "heeft"
```

## Ontwikkeltools
- **IDE:** VS Code
- **Database Management:** DBeaver
- **API Testing:** Postman
- **Version Control:** Git + GitHub
- **Package Management:** Composer + NPM

## Beveiliging

### Autorisatie
**Technische implementatie:**
- Laravel Gates en Policies
- Role-based access control
- Middleware voor route protection
- Permission checks op controller niveau

### Gebruikers en rollen
**Rollen structuur:**
- **Student:** Kan tijdblokken reserveren, samenvattingen schrijven
- **Docent:** Kan tijdblokken aanmaken, samenvattingen beoordelen, klassen beheren

### Tijdblokken en reserveringen
**Beveiligingsmaatregelen:**
- Validatie van beschikbaarheid bij reservering
- Preventie van double-booking
- Autorisation checks bij wijzigingen

### Samenvattingen en privacy
**Privacy maatregelen:**
- Alleen betrokken student en docent hebben toegang
- Encryptie van gevoelige data

## Beheer

### Back-up
**Back-up strategie:**
- Dagelijkse database back-ups
- Wekelijkse full system back-ups

### Content
**Content management:**
- Database migrations voor schema wijzigingen
- Seeders voor test data
- Factories voor development