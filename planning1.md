 
## Week 1 – Projectplan

  

### Maandag 4 nov

  

- **10:15–11:00 (0:45) – Projectplan – Repo & mappenstructuur**  

    Bestaande Laravel/Inertia‑repo analyseren en structuur kort beschrijven in het Projectplan (verwijzen naar `README.md`).

  

- **11:00–12:00 (1:00) – Projectplan – Templates afronden**  

    Templates voor Projectplan, FO, TO en Testplan finetunen (hoofdstukken + vaste kopjes).

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Projectplan – Stakeholders & context**  

    Stakeholders (student, docent, admin, opleiding) en onderwijscontext beschrijven in het Projectplan.

  

- **14:00–15:00 (1:00) – Projectplan – Scope & doelstellingen**  

    Scope (MUST/SHOULD/NICE) en eerste SMART‑doelstellingen formuleren, afgestemd op huidige functionaliteit.

  

- **15:00–15:45 (0:45) – Projectplan – Randvoorwaarden**  

    Technische en functionele randvoorwaarden vastleggen (Laravel, MySQL, Inertia, rollen, agenda, reserveringen).

  

- **15:45–16:30 (0:45) – Projectplan – Marktonderzoek**  

    2–3 bestaande systemen kort vergelijken en belangrijkste learnings noteren.

  

### Dinsdag 5 nov

  

- **09:00–10:00 (1:00) – Projectplan – Probleem- & pijnpuntenanalyse**  

    Minstens 5 concrete pijnpunten (voor studenten/docenten/admin) beschrijven in de huidige situatie.

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – Projectplan – SWOT**  

    SWOT van het projectidee opstellen en koppelen aan de gekozen oplossing.

  

- **11:30–12:00 (0:30) – Projectplan – Succescriteria**  

    Meetbare succescriteria formuleren (bijv. foutloos reserveren, gebruikerstevredenheid).

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Projectplan – Deliverables**  

    Lijst maken van alle deliverables (code, FO, TO, Testplan, handleidingen, presentatie, etc.).

  

- **14:00–15:00 (1:00) – Projectplan – Risicoanalyse**  

    Ongeveer 10 risico’s benoemen (planning, techniek, scope creep) met impact en kans.

  

- **15:00–15:45 (0:45) – Projectplan – Mitigaties**  

    Voor de belangrijkste risico’s concrete mitigaties uitschrijven.

  

- **15:45–16:30 (0:45) – Projectplan – Projectplan finaliseren**  

    Document nalopen, consistent maken en in de repo committen.

  

### Donderdag 7 nov

  

- **09:00–10:00 (1:00) – Projectplan – Detailplanning (dit document)**  

    Weekindeling (1–9) aanscherpen en afstemmen op de huidige repo.

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – Projectplan – Review Projectplan**  

    Laatste check op volledigheid, leesbaarheid en koppeling met use‑cases.

  

- **11:30–12:00 (0:30) – Projectplan – Versiebeheer**  

    Versienummering/branch‑structuur voor documentatie bepalen (bijv. tags per fase).

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:30 (1:30) – Projectplan – Koppeling FO/TO plannen**  

    Vastleggen welke onderwerpen zeker in FO en TO terugkomen.

  

- **14:30–15:00 (0:30) – PAUZE**

  

- **15:00–16:00 (1:00) – Projectplan – Samenvatting fase 1**  

    Korte samenvatting schrijven van de projectplanningsfase.

  

- **16:00–16:30 (0:30) – Projectplan – Commit & documentatie‑update**  

    Laatste wijzigingen committen en `README.md`/overzicht bijwerken.

  

---

  

## Week 2 – Functioneel Ontwerp (FO)

  

### Maandag 11 nov

  

- **10:15–11:00 (0:45) – FO – FO‑structuur & template**  

    Structuur van `functioneel ontwerp - studielog.md` nalopen en waar nodig uitbreiden.

  

- **11:00–12:00 (1:00) – FO – Systeembeschrijving**  

    Beschrijven wat Studielog doet, voor wie en waarom (gekoppeld aan bestaande features).

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – FO – As‑is & To‑be**  

    Workflowdiagrammen maken/actualiseren van huidige vs gewenste proces (reserveren, samenvattingen, planning).

  

- **14:00–14:45 (0:45) – FO – UC1: Account aanmaken (student)**  

    Gedetailleerde flow voor studentenregistratie (zoals in huidige auth/logica).

  

- **14:45–15:30 (0:45) – FO – UC2: Accountbeheer (docent/admin)**  

    Beschrijven hoe admin/docent‑accounts in de praktijk worden aangemaakt/beheerd.

  

- **15:30–16:30 (1:00) – FO – UC3: Inloggen & autorisatie**  

    Flow voor login, logout en rolgebaseerde toegang, aansluitend bij policies in de code.

  

### Dinsdag 12 nov

  

- **09:00–09:45 (0:45) – FO – UC4: Vestiging beheren**  

    Flow voor CRUD op vestigingen (`Location`), zoals geïmplementeerd.

  

- **09:45–10:30 (0:45) – FO – UC5: Klas beheren**  

    Flow voor CRUD op klassen (`ClassModel`) + koppeling aan vestiging/docent.

  

- **10:30–10:45 (0:15) – PAUZE**

  

- **10:45–11:45 (1:00) – FO – UC6: Tijdblok inplannen**  

    Flow voor aanmaken/bewerken/verwijderen van tijdblokken (`Timeblock`).

  

- **11:45–12:15 (0:30) – FO – Use‑case diagram**  

    Use‑case‑diagram (Mermaid) actualiseren zodat het klopt met de huidige rollen/schermen.

  

- **12:15–13:15 (1:00) – PAUZE**

  

### Dinsdag 13 nov

  

- **13:15–14:30 (1:15) – FO – UC7: Tijdblok reserveren (student)**  

    Kernflow met beschikbaarheidscheck, foutscenario’s en bevestigingen.

  

- **14:30–15:30 (1:00) – FO – UC8: Samenvatting maken**  

    Flow voor uploaden/schrijven van samenvatting door student, gekoppeld aan reservering/tijdblok.

  

- **15:30–16:30 (1:00) – FO – UC9: Samenvatting reviewen**  

    Flow voor docent: overzichten, goedkeuren/afkeuren en feedback geven.

  

### Donderdag 14 nov

  

- **09:00–10:00 (1:00) – FO – UC10: Docent toewijzen**  

    Proces van het koppelen van docenten aan klassen beschrijven.

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:15 (1:00) – FO – UC11: Rapportages**  

    Functionele beschrijving van filters en rapportage‑output (implementatie deels aanwezig, waar nodig conceptueel).

  

- **11:15–12:00 (0:45) – FO – UC12: Notificaties**  

    Overzicht van automatische notificaties (incl. Microsoft/Outlook‑integratie op hoofdlijnen).

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – FO – Use‑case refinement**  

    Pre/post‑condities en alternatieve flows bij alle use‑cases aanscherpen.

  

- **14:00–15:00 (1:00) – FO – Wireframes**  

    Low‑fidelity wireframes voor login, dashboards, agenda en beheerpagina’s voorbereiden of actualiseren.

  

- **15:00–16:30 (1:30) – Quality Gate – FO review & vaststelling**  

    Interne review, laatste aanpassingen en FO officieel als “vastgesteld” markeren en committen.

  

---

  

## Week 3 – Technisch Ontwerp (TO)

  

### Maandag 18 nov

  

- **10:15–11:00 (0:45) – TO – TO‑template & structuur**  

    Structuur van `Technisch ontwerp - studielog.md` controleren en waar nodig uitbreiden.

  

- **11:00–12:00 (1:00) – TO – Architectuur Laravel + Inertia**  

    MVC‑structuur, Inertia‑bridge en frontend‑laag beschrijven, passend bij de huidige code.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – TO – Dataflow & sequence**  

    Sequence‑diagrammen (login, reserveren, samenvatting) actualiseren zodat ze 1‑op‑1 matchen met de implementatie.

  

- **14:00–15:00 (1:00) – TO – Technologie‑stack**  

    Motiveren van de gekozen stack (Laravel, React, MySQL, Microsoft‑integratie).

  

- **15:00–15:45 (0:45) – TO – Security‑overwegingen**  

    Auth, policies, CSRF/XSS, password hashing en autorisatieniveaus beschrijven.

  

- **15:45–16:30 (0:45) – TO – Deployment & CI/CD (ontwerp)**  

    Ontwerp van dev/staging/production + CI/CD‑pipeline (ontwerp, niet per se volledig geïmplementeerd).

  

### Dinsdag 19 nov

  

- **09:00–10:00 (1:00) – TO – ERD (Mermaid)**  

    ERD controleren/actualiseren (Users, Locations, Classes, Timeblocks, Reservations, Summaries).

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – TO – Attributen & relaties**  

    Attributen, datatypes en relaties afstemmen op migrations en models in de code.

  

- **11:30–12:00 (0:30) – TO – Normalisatie**  

    Controleren of het database‑ontwerp in lijn is met 3NF en de implementatie.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – TO – Migratie‑specificatie**  

    Per tabel de kolommen, indexes en foreign keys beschrijven (gekoppeld aan bestaande migrations).

  

- **14:00–15:00 (1:00) – TO – Seeding‑strategie**  

    Toelichten hoe factories en seeders worden/kunnen worden gebruikt voor dev/test‑data.

  

- **15:00–15:45 (0:45) – TO – Query‑optimalisatie**  

    Overwegingen voor eager loading, scopes en indexes noteren.

  

- **15:45–16:30 (0:45) – TO – ERD‑finalisatie**  

    Definitieve ERD‑versie vastleggen in het document.

  

### Donderdag 21 nov

  

- **09:00–10:00 (1:00) – TO – REST API (beheer)**  

    Routes voor auth & beheer (users, locations, classes) beschrijven (HTTP‑methodes, responses).

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – TO – REST API (agenda & samenvatting)**  

    Routes voor timeblocks, reservations, summaries en rapportages uitschrijven.

  

- **11:30–12:00 (0:30) – TO – Validatie & form requests**  

    Regels voor datavalidatie per endpoint in kaart brengen (gekoppeld aan bestaande form requests).

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – TO – Middleware & policies**  

    Ontwerp + overzicht van middleware en policies (auth, role‑check, logging) i.s.m. bestaande policy‑klassen.

  

- **14:00–15:00 (1:00) – TO – TO‑document finaliseren**  

    TO nalopen, consistentie met code controleren en document als “vastgesteld” markeren.

  

---

  

## Week 4 – Testplan & Basis Setup

  

### Maandag 25 nov

  

- **10:15–11:00 (0:45) – Testplan – Template & structuur**  

    Testplan opstellen (testsoorten, doelen, scope) afgestemd op de huidige Pest/PHPUnit‑setup.

  

- **11:00–12:00 (1:00) – Testplan – Teststrategie**  

    Uitleg over unit/feature/E2E (Dusk als optie/ontwerp) en welke flows minimaal gedekt moeten zijn.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Testplan – Testomgeving & tooling**  

    Bestaande tooling (Pest/PHPUnit, factories, seeders) documenteren en eerste `php artisan test`‑run uitvoeren.

  

- **14:00–15:00 (1:00) – Testplan – Testscenario’s Auth**  

    Minimaal 10 testcases definiëren voor login/registratie/rollen (sommige al aanwezig, anderen plannen).

  

- **15:00–15:45 (0:45) – Testplan – Testdata‑management**  

    Strategie voor het gebruik van factories/seeders voor testdata opschrijven.

  

- **15:45–16:30 (0:45) – Testplan – Testrapportage**  

    Template voor testrapportage (bugs, metrics) aanmaken.

  

### Dinsdag 26 nov

  

- **09:00–10:00 (1:00) – Backend/Setup – CI/CD‑ontwerpbestand**  

    CI‑config als ontwerp schrijven (bijv. concept `.github/workflows/ci.yml`, ook als nog niet actief).

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – Backend/Setup – Laravel/Inertia check & documentatie**  

    Controleren dat de huidige Laravel+Inertia‑setup klopt met het ontwerp en dit kort documenteren in TO/README.

  

- **11:30–12:00 (0:30) – Backend/Setup – DB‑config & seed uitleg**  

    Uitleggen hoe `.env`, migrations en seeders in dit project werken (geen nieuwe setup nodig, alleen beschrijven).

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Backend/Setup – Linting & formatting**  

    ESLint/TS‑config en PHP‑codestijl beschrijven; waar nodig kleine afspraken vastleggen.

  

- **14:00–15:00 (1:00) – Backend/Setup – Git‑workflow**  

    Git‑branchingstrategie (main/develop/feature‑branches) beschrijven.

  

- **15:00–15:45 (0:45) – Backend/Setup – Dev‑tools beschrijven**  

    Gebruikte dev‑tools (bijv. Laravel Tinker, debugbar) kort beschrijven.

  

- **15:45–16:30 (0:45) – Backend/Setup – Eerste rooktest end‑to‑end**  

    Applicatie lokaal draaien, belangrijkste flows doorlopen en bevindingen noteren.

  

---

  

## Week 5 – Backend Verdieping

  

### Maandag 2 dec

  

- **10:15–11:00 (0:45) – Backend – Location (Vestiging) controle**  

    `Location`‑logica en ‑validatie nalopen en koppelen aan FO/TO.

  

- **11:00–12:00 (1:00) – Backend – Class (Klas) controle**  

    `ClassModel` en bijbehorende controller/routes controleren en documenteren.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Backend – Tijdbloklogica**  

    `Timeblock`‑logica (overlap, capaciteit, status) analyseren en waar nodig verbeteren.

  

- **14:00–15:00 (1:00) – Backend – Reserveringslogica**  

    `Reservation`‑flow (beschikbaarheid, annuleren) nalopen en beschrijven.

  

- **15:00–15:45 (0:45) – Backend – Rapportage‑endpoints**  

    Basis endpoints/data voor rapportages identificeren en beschrijven (implementatie mag deels conceptueel zijn).

  

- **15:45–16:30 (0:45) – Backend – Rollen & policies**  

    Controleren of policies voor Location/Class/Timeblock/Reservation/Summary correct zijn toegepast.

  

### Dinsdag 3 dec

  

- **09:00–10:00 (1:00) – Backend – Validatie‑review**  

    Controleren dat alle belangrijke acties via form requests of controller‑validatie beveiligd zijn.

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – Backend – Tests: beheer**  

    Bestaande tests voor beheer (Location/Class) nalopen en waar nodig uitbreiden.

  

- **11:30–12:00 (0:30) – Backend – Tests: tijdblok & reservering**  

    Kritieke scenario’s voor tijdblokken en reserveringen toevoegen/actualiseren in feature‑tests.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Backend – Summaries backend**  

    `Summary`‑model en controller controleren (maken, bijwerken, koppelen aan reservering).

  

- **14:00–15:00 (1:00) – Backend – Reviewlogica samenvattingen**  

    Statussen en feedback‑flow voor review nalopen.

  

- **15:00–15:45 (0:45) – Backend – Agenda scopes**  

    Modelscopes voor filtering van tijdblokken/reserveringen per week/docent nalopen of toevoegen.

  

- **15:45–16:30 (0:45) – Backend – Performance & security‑check**  

    N+1‑checks en basis security‑checks (authorisation, validation) uitvoeren.

  

### Donderdag 5 dec

  

- **09:00–10:00 (1:00) – Backend – Notificaties & events**  

    Events/listeners (bijv. voor notificaties) nalopen en beschrijven.

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – Backend – Extra unit/feature‑tests**  

    Extra tests schrijven voor kritieke flows waar nog gaten zitten.

  

- **11:30–12:00 (0:30) – Backend – Factories & seeders**  

    Controleren of factories/seeders de backend‑flows goed ondersteunen (demo‑data).

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Backend – Backend documenteren**  

    “Backend design decisions”‑sectie schrijven in TO/README.

  

- **14:00–16:30 (2:30) – Backend – Backend afronden & review**  

    Laatste backend‑review, bekende issues noteren en backend als “stabiel” markeren.

  

---

  

## Week 6 – Frontend

  

### Maandag 9 dec

  

- **10:15–11:00 (0:45) – Frontend – Main layout & navigatie**  

    Bestaande layout/navigatie nalopen; controle op rol‑specifieke links en responsiviteit.

  

- **11:00–12:00 (1:00) – Frontend – Auth‑pagina’s**  

    Login/registratieschermen nalopen, UI beschrijven en kleine verbeteringen plannen.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Frontend – Dashboards**  

    Student‑ en docentdashboard (`student.tsx`, `teacher.tsx`) evalueren op duidelijkheid en consistentie.

  

- **14:00–15:00 (1:00) – Frontend – Agendaweergave**  

    Agenda/timeblock‑view nalopen; UX en states (vrij/gereserveerd) verduidelijken.

  

- **15:00–16:30 (1:30) – Frontend – Reserveringsflow UI**  

    Modals/flows voor reserveren/annuleren nalopen en afstemmen met FO/TO.

  

### Dinsdag 10 dec

  

- **09:00–10:00 (1:00) – Frontend – Admin UI: Vestiging & Klas**  

    CRUD‑schermen voor Location/Class controleren en waar nodig verbeteren/documenteren.

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – Frontend – Tijdblok inplannen UI**  

    UI voor beheer/inplannen van tijdblokken nalopen en koppelen aan backend‑validatielogica.

  

- **11:30–12:00 (0:30) – Frontend – Samenvatting maken UI**  

    UI voor samenvattingen (student) nalopen en functionaliteit beschrijven.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Frontend – Review UI (docent)**  

    Overzicht/review‑UI voor docenten controleren (statussen, feedbackvelden).

  

- **14:00–15:00 (1:00) – Frontend – Rapportage UI**  

    Beschrijven/verbeteren van filters en weergave voor rapportages (indien aanwezig, anders als ontwerp).

  

- **15:00–16:30 (1:30) – Frontend – Responsiviteit & polish**  

    Mobile‑responsiviteit testen en kleine visuele polish doorvoeren.

  

### Donderdag 12 dec

  

- **09:00–10:00 (1:00) – Frontend – Component‑tests (ontwerp/implementatie)**  

    Bepalen welke React‑componenten tests nodig hebben; evt. eerste tests schrijven of ontwerp beschrijven.

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – Frontend – Integratietests (ontwerp)**  

    Frontend‑integratietests (Inertia‑requests) ontwerpen, ook als tooling nog beperkt is.

  

- **11:30–12:00 (0:30) – Frontend – Notificatieweergave**  

    UI voor notificaties nalopen (bijv. flashes/toasts) en koppeling met backend beschrijven.

  

- **12:00–16:30 (4:30) – Buffer – Buffer & code cleanup**  

    Tijd voor onvoorziene frontend‑issues, kleine refactors en linter‑fixes.

  

---

  

## Week 7 – Testing & Polish

  

### Maandag 16 dec

  

- **10:15–12:00 (1:45) – Testing & Polish – Kritieke flow‑tests (feature)**  

    Feature‑tests uitbreiden voor auth, reserveren, samenvattingen en beheerflows.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Testing & Polish – Responsiviteit & cross‑browser**  

    Applicatie testen op verschillende schermgroottes/browsers (voor zover haalbaar).

  

- **14:00–15:00 (1:00) – Testing & Polish – Security quick‑scan**  

    Controle op CSRF, XSS‑gevoelige velden, redirects en autorisatie per route.

  

- **15:00–16:30 (1:30) – Quality Gate – Pre‑UAT testrapport**  

    Testrapport opstellen met resultaten, bekende bugs en coverage‑indruk.

  

### Dinsdag 17 dec

  

- **09:00–10:00 (1:00) – Testing & Polish – Bug triage**  

    Issues verzamelen, categoriseren (critical/high/medium/low) en prioriteren.

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–12:00 (1:45) – Testing & Polish – Critical bugs fixen**  

    Blokkerende/ernstige bugs oplossen en tests opnieuw draaien.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–16:30 (3:30) – Testing & Polish – High/medium bugs + regressie**  

    Overige belangrijke bugs oplossen en regressietests uitvoeren.

  

### Donderdag 19 dec

  

- **09:00–10:00 (1:00) – Testing & Polish – Staging/demo‑omgeving**  

    Lokaal/staging‑setup beschrijven en waar mogelijk nabootsen (geen echte productie vereist).

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – Testing & Polish – Testscript & checklist PO**  

    Gedetailleerde teststappen voor de PO opstellen voor alle MUST‑have functionaliteiten.

  

- **11:30–16:30 (5:00) – Buffer – Buffer & documentatie**  

    Tijd voor restpunten in tests/documentatie en voorbereiding op PO‑sessies.

  

---

  

## Week 8 – PO Test & Acceptatie

  

### Maandag 6 jan

  

- **10:15–12:00 (1:45) – PO Test – Testsessie 1: basis & rollen**  

    Met PO (of gesimuleerd) flows voor registratie, login/logout en roltoegang doorlopen.

  

- **12:00–13:00 (1:00) – PO Test – Pauze & critical fixes**  

    Kritieke bugs uit sessie 1 direct oplossen.

  

- **13:00–14:30 (1:30) – PO Test – Testsessie 2: beheer & planning**  

    Vestiging/klasbeheer en tijdblokken inplannen samen testen.

  

- **14:30–15:00 (0:30) – PO Test – Bugfix & voorbereiding**  

    Korte fixes en voorbereiding op sessie 3.

  

- **15:00–16:30 (1:30) – PO Test – Testsessie 3: agenda & reservering**  

    Agenda bekijken, reserveren, annuleren en samenvattingen globaal doornemen.

  

### Dinsdag 7 jan

  

- **09:00–10:30 (1:30) – PO Test – Critical/high bugfixing**  

    Resterende blokkerende/belangrijke bugs verhelpen.

  

- **10:30–10:45 (0:15) – PAUZE**

  

- **10:45–12:15 (1:30) – PO Test – Testsessie 4: docent & samenvatting**  

    Overzichten voor docenten, samenvatting schrijven en reviewflow uitproberen.

  

- **12:15–13:00 (0:45) – PAUZE**

  

- **13:00–14:30 (1:30) – PO Test – Testsessie 5: E2E workflow**  

    Volledige end‑to‑end flow: plannen, reserveren, samenvatting maken, reviewen.

  

- **14:30–15:30 (1:00) – PO Test – Acceptatiecriteria verificatie**  

    Alle MUST‑have eisen met PO nalopen en vastleggen wat wel/niet gehaald is.

  

- **15:30–16:30 (1:00) – Quality Gate – Final prep & code acceptance**  

    Geaccepteerde versie markeren (tag in Git) en restpunten kort beschrijven.

  

### Donderdag 9 jan

  

- **09:00–16:30 (7:30) – Buffer – Grote buffer/documentatie**  

    Ruime tijd voor restwerk, documentatie en voorbereiding op deployment/presentatie.

  

---

  

## Week 9 – Deployment & Oplevering

  

### Maandag 13 jan

  

- **10:15–12:00 (1:45) – Deployment – CI/CD‑ontwerp productiepipeline**  

    Uitschrijven hoe een ideale productiepipeline eruitziet (build, test, migratie, deploy) – ontwerp, niet per se live.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–14:00 (1:00) – Deployment – Productieconfig & DB‑migratie**  

    Beschrijven hoe een productieomgeving geconfigureerd zou worden (SSL, DB, env) en hoe migraties/seeders draaien.

  

- **14:00–15:00 (1:00) – Deployment – Go‑live scenario (beschrijving)**  

    Scenario uitwerken voor eerste live deploy via CI/CD of handmatig – als beschrijving.

  

- **15:00–16:30 (1:30) – Deployment – Monitoring & backup‑ontwerp**  

    Ontwerp voor logging, monitoring en backupprocedure vastleggen.

  

### Dinsdag 14 jan

  

- **09:00–10:00 (1:00) – Oplevering – Presentatiestructuur & slides**  

    Presentatiestructuur opzetten, belangrijkste resultaten, demo‑scenario’s en learnings verzamelen.

  

- **10:00–10:15 (0:15) – PAUZE**

  

- **10:15–11:30 (1:15) – Oplevering – Demo‑script & data**  

    Demo‑script schrijven met testdata en concrete stappen voor de presentatie.

  

- **11:30–12:00 (0:30) – Oplevering – Q&A‑voorbereiding**  

    Verwachte vragen en antwoorden voorbereiden.

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–15:00 (2:00) – Oplevering – Oefenen live demo**  

    Demo oefenen, timing checken, eventueel opnemen.

  

- **15:00–16:30 (1:30) – Oplevering – Handleidingen & delivery‑package**  

    Korte handleidingen (student/docent) en installatiedocumentatie afronden, alle deliverables bundelen.

  

### Donderdag 16 jan

  

- **09:00–10:30 (1:30) – Oplevering – Projectevaluatie & lessons learned**  

    Evaluatieverslag schrijven: wat ging goed, wat kan beter, technische en procesmatige learnings.

  

- **10:30–11:00 (0:30) – Buffer – Buffer**  

    Tijd voor laatste kleine fixes aan documenten of slides.

  

- **11:00–12:00 (1:00) – Oplevering – Finale code review**  

    Laatste code review en opschoning (unused code, comments).

  

- **12:00–13:00 (1:00) – PAUZE**

  

- **13:00–15:00 (2:00) – Oplevering – Laatste check & presentatie‑prep**  

    Laatste integrale test, fine‑tunen van presentatie en demo‑flow.

  

- **15:00–16:30 (1:30) – Oplevering – Finale commit & tag**  

    Finale commit doen en versie taggen (bijv. `v1.0.0`), project administratief afronden.