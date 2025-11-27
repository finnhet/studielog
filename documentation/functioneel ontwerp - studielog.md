## Voorwoord
Dit document bevat het functioneel ontwerp van de applicatie **StudieLog**.  
Het ontwerp beschrijft de gewenste functionaliteiten, informatiestromen, gebruikersrollen en use-cases.  
StudieLog is ontwikkeld om studenten en docenten te ondersteunen bij het plannen, uitvoeren en documenteren van studiegesprekken.

---

## Inhoudsopgave
1. [Voorwoord](#voorwoord)  
2. [Samenvatting](#samenvatting)  
3. [Analyse huidige situatie](#analyse-huidige-situatie)  
4. [Analyse gewenste situatie](#analyse-gewenste-situatie)  
5. [Requirements](#requirements)  
6. [Informatieverwerking](#informatieverwerking)  
7. [Use-cases](#use-cases)  
8. [Applicaties](#applicaties)  
9. [Consequenties](#consequenties)  
10. [Kosten](#kosten)  
11. [Planning](#planning)

---

## Samenvatting
**StudieLog** is een webapplicatie waarmee studenten afspraken kunnen inplannen met hun docent, verslagen kunnen toevoegen na gesprekken en docenten deze verslagen kunnen goedkeuren.  
De applicatie biedt een overzichtelijke ervaring met planning en logboek. StudieLog vervangt het plannen met Word met een efficiënt systeem.

---

## Analyse huidige situatie

### Informatieverwerking
Momenteel worden gesprekken handmatig gepland via mondelinge afspraken, waardoor afspraken soms onduidelijk zijn.  
Omdat gesprekken vaak niet worden vastgelegd, is het bovendien niet duidelijk wat er precies is besproken.  

De communicatie tussen studenten en docenten verloopt nu niet via één overzichtelijk programma.  
Verslagen worden slecht of helemaal niet bijgehouden, waardoor docenten soms niet weten wat er is besproken.  
Dit kan leiden tot misverstanden en heeft een negatieve invloed op de voortgang van het project.

### Applicaties
Op dit moment wordt alleen **Microsoft Teams** gebruikt voor het plannen van afspraken.  
Dit werkt echter niet soepel, omdat niet duidelijk is wanneer docenten beschikbaar zijn en het lastig is om een geschikt moment te plannen.

---

## Analyse gewenste situatie
De gewenste situatie is een **centraal, webgebaseerd programma** waarin alle stappen van planning tot verslaglegging plaatsvinden.  
Studenten en docenten werken in één systeem, waardoor informatie altijd toegankelijk en overzichtelijk is.

---

## Requirements

![[moscow]]

---

## Informatieverwerking

### Use-case-diagram


---

## Use-cases

### Account aanmaken voor student
**Actor:** Docent  
**Preconditie:** Er bestaat nog geen account voor student  

**Scenario:**
1. Klik op een klas  
2. Klik op “Student registreren”  
3. Voer e-mailadres van student in  
4. Klik op “Registreer student”  
5. Student wordt toegevoegd aan lijst met “pending”  

**Uitzonderingen:**
- Ongeldig e-mailadres  
- E-mailadres al in gebruik  

**Niet functionele eisen:**
- Validatie lokaal en op server  
- Gegevens veilig opgeslagen (versleuteld)  
- Werkt op alle moderne browsers  
- Foutmeldingen verschijnen direct  

**Postconditie:** Student is uitgenodigd en gekoppeld aan klas  

---

### Account aanmaken
**Actor:** Student / Docent  
**Preconditie:** Gebruiker heeft uitnodiging per mail ontvangen  

**Scenario:**
1. Klik op “Registreer” in de mail  
2. Word doorgestuurd naar registreerpagina  
3. Vul naam en wachtwoord in  
4. Klik op “Account registreren”  
5. Word doorgestuurd naar dashboard  

**Uitzonderingen:**
- Wachtwoorden komen niet overeen  

**Niet functionele eisen:**
- Validatie lokaal en op server  
- Gegevens veilig opgeslagen  
- Foutmeldingen direct zichtbaar  

**Postconditie:** Gebruiker geregistreerd en ingelogd  

---

### Inloggen
**Actor:** Student / Docent  
**Preconditie:** Account bestaat  

**Scenario:**
1. Open webapp  
2. Voer e-mailadres en wachtwoord in  
3. Klik op “Inloggen”  
4. Word doorgestuurd naar dashboard  

**Uitzonderingen:**
- Verkeerd e-mailadres of wachtwoord  
- Account bestaat niet  

**Niet functionele eisen:**
- Validatie op serverniveau  
- Inloggen binnen 10 seconden  

**Postconditie:** Gebruiker is ingelogd  

---

### Vestiging aanmaken
**Actor:** Docent  
**Preconditie:** Docent is ingelogd  

**Scenario:**
1. Navigeer naar vestigingsbeheer  
2. Klik op “Vestiging aanmaken”  
3. Voer naam en adres in  
4. Klik op “Opslaan”  
5. Vestiging verschijnt in overzicht  

**Uitzonderingen:**
- Naam of adres ontbreekt  

**Niet functionele eisen:**
- Opslaan binnen 10 seconden  

**Postconditie:** Vestiging is aangemaakt  

---

### Klas aanmaken
**Actor:** Docent  
**Preconditie:** Docent is ingelogd  

**Scenario:**
1. Navigeer naar klasbeheer  
2. Klik op “Klas aanmaken”  
3. Voer naam en vestiging in  
4. Klik op “Opslaan”  
5. Klas verschijnt in overzicht  

**Uitzonderingen:**
- Naam ontbreekt  

**Niet functionele eisen:**
- Opslaan binnen 5 seconden  

**Postconditie:** Klas is aangemaakt  

---

### Tijdblok aanmaken
**Actor:** Docent
**Preconditie:** Docent is ingelogd  

**Scenario:**
1. Navigeer naar tijdblokbeheer
2. Klik op “Tijdblok aanmaken”
3. Voer datum, tijd en locatie in
4. Klik op “Opslaan”
5. Tijdblok verschijnt in overzicht

**Uitzonderingen:**
- Ongeldige datum/tijd
- Tijdblok overlapt met bestaande

**Niet functionele eisen:**
- Validatie lokaal en op server  
- Proces duurt maximaal 1 minuut  
- Wachtwoorden veilig opgeslagen (gehasht/versleuteld)  
- Directe feedback bij fouten  

**Postconditie:** Nieuw wachtwoord ingesteld  

---

### Tijdblokken reserveren
**Actor:** Student  
**Preconditie:** Student is ingelogd, docent heeft tijdblok aangemaakt  

**Scenario:**  
1. Navigeer naar “Beschikbare tijdblokken”  
2. Selecteer gewenste tijdblok  
3. Klik op “Reserveren”  
4. Bevestiging verschijnt en tijdblok wordt gekoppeld aan student  

**Uitzonderingen:**  
- Tijdblok al gereserveerd door een andere student  
- Tijdblok bestaat niet meer  

**Niet functionele eisen:**  
- Notificatie van succesvolle reservering  

**Postconditie:** Tijdblok is gereserveerd en zichtbaar in dashboard  

---

### Verslag aanmaken
**Actor:** Student  
**Preconditie:** Student heeft een gereserveerd tijdblok afgerond  

**Scenario:**  
1. Navigeer naar “Mijn afspraken”  
2. Selecteer afgeronde afspraak  
3. Klik op “Verslag aanmaken”  
4. Vul samenvatting in  
5. Klik op “Opslaan”  

**Uitzonderingen:**  
- Verslag leeg laten  
- Opslaan mislukt door netwerkproblemen  

**Niet functionele eisen:**  
- Mobiele en desktop compatibel  

**Postconditie:** Verslag is opgeslagen en zichtbaar voor docent   

---

### Verslagen goed- of afkeuren
**Actor:** Docent  
**Preconditie:** Student heeft verslag ingediend  

**Scenario:**  
1. Navigeer naar “Verslagen” in dashboard  
2. Selecteer verslag  
3. Klik op “Goedkeuren” of “Afkeuren”  
4. Optioneel: voeg feedback toe  
5. Bevestig actie  

**Uitzonderingen:**  
- Verslag niet gevonden  
- Netwerkfout bij opslaan  

**Niet functionele eisen:**  
- Actie verwerken binnen 5 seconden  
- Feedback direct zichtbaar voor student  

**Postconditie:** Verslag is goed- of afgekeurd en student ontvangt notificatie

---

### Andere docenten uitnodigen
**Actor:** Docent  
**Preconditie:** Docent is ingelogd  

**Scenario:**  
1. Navigeer naar “Vestiging / klas beheren”  
2. Klik op “Uitnodigen docent”  
3. Vul e-mailadres van docent in  
4. Klik op “Uitnodigen”  
5. Docent ontvangt uitnodiging via e-mail  

**Uitzonderingen:**  
- Docent is al gekoppeld  
- Ongeldig e-mailadres  

**Niet functionele eisen:**  
- Compatibel met alle apparaten  

**Postconditie:** Uitnodiging is verstuurd en docent kan lid worden van klas of vestiging  

---

## Applicaties

### Gebruikersapplicatie
- Accountbeheer  
- Tijdblokken reserveren en beheren  
- Verslag aanmaken en bekijken  
- Overzicht van afspraken en logboek  

### Beheerapplicatie
- Vestigingen en klassen beheren  
- Docenten en studenten koppelen  
- Uitnodigingen versturen  
- Overzicht van verslagen en goedkeuringen  

### Backend / API
- Authenticatie en autorisatie  
- Opslag en ophalen van tijdblokken, verslagen, gebruikers en klassen  
- Integratie met Microsoft Outlook  
- Eventuele AI-integratie voor speech-to-text samenvattingen  

---

## Consequenties

### Organisatorisch
- Docenten moeten leren werken met het nieuwe systeem  
- Studenten moeten hun afspraken en verslagen digitaal bijhouden  

### Technisch
- Systeem moet schaalbaar zijn voor meerdere vestigingen en klassen  
- Backend moet veilig en betrouwbaar zijn  
- Mobiele en desktopcompatibiliteit vereist grondige testing 

---

## Kosten
Omdat dit een schoolproject is, zijn er geen directe kosten voor uren of standaard hosting; de applicatie wordt lokaal gehost.  

Er kunnen echter extra kosten ontstaan wanneer de AI integratie wordt gebruikt voor speech-to-text samenvattingen. Deze functionaliteit is optioneel en afhankelijk van de beschikbaarheid van AI-tokens. Afhankelijk van het gebruik (aantal gesprekken en lengte van samenvattingen) kunnen er kosten verbonden zijn aan het verbruiken van deze tokens.  


---

## Planning
De planning is opgenomen in het projectplan.
