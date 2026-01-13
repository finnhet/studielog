**Naam:** Finn Hettinga
**Datum:** 11/11/2025
## Inhoud
1. [Aanleiding](#aanleiding)  
2. [Doel](#doel)  
3. [Resultaat](#resultaat)  
4. [Afbakening](#afbakening)  
5. [Risico’s](#risico’s)  
6. [Randvoorwaarden](#randvoorwaarden)  
7. [Fasering en planning](#fasering-en-planning)  
8. [Akkoord](#akkoord)  

---

## Aanleiding
Momenteel is het vaak lastig en onduidelijk voor studenten om afspraken met docenten te maken. Daarnaast is er geen gestructureerd overzicht van wat er tijdens deze afspraken besproken wordt.  

Om dit probleem op te lossen, wil ik een tool ontwikkelen waarin docenten hun beschikbaarheid in tijdblokken kunnen aangeven en studenten deze blokken eenvoudig kunnen reserveren. Na elke afspraak schrijft de student een korte samenvatting, die door de docent wordt goedgekeurd.  

Op deze manier worden zowel het maken van afspraken als het vastleggen van de besproken onderwerpen duidelijk en overzichtelijk, en ontstaat er een betrouwbaar logboek van alle afspraken.

---

## Doel
Het doel van StudieLog is om het proces van afspraken maken tussen studenten en docenten overzichtelijk te maken, en tegelijkertijd een betrouwbaar logboek bij te houden.  

De applicatie heeft de volgende doelstellingen:  

- Studenten kunnen snel en eenvoudig afspraken plannen met docenten, zonder verwarring of dubbele reserveringen.  
- Docenten kunnen hun beschikbaarheid duidelijk beheren en koppelen aan klassen.  
- Na elke afspraak wordt een korte samenvatting gemaakt door de student en goedgekeurd door de docent, zodat er altijd een overzicht bestaat van wat is besproken.  
- Zowel studenten als docenten hebben inzicht in toekomstige en historische afspraken, inclusief goedgekeurde verslagen.  

---

## Resultaat
Om deze doelen te realiseren, wordt StudieLog ontwikkeld als een digitale webapplicatie met de volgende functionaliteiten:  

- **Afsprakenplanner:** Docenten kunnen hun beschikbaarheid in tijdblokken instellen per klas. Studenten kunnen deze blokken reserveren en, indien nodig, alternatieve tijden voorstellen.  
- **Verslag:** Na iedere afspraak schrijft de student een korte samenvatting van de besproken onderwerpen, die door de docent wordt beoordeeld.  
- **Digitaal logboek:** Goedkeuring van de samenvatting resulteert in een logboek van alle afspraken, inclusief datum, tijd en inhoud.  
- **Agenda-integratie:** Automatische koppeling met Microsoft Outlook zodat afspraken altijd synchroon staan met de persoonlijke agenda van studenten en docenten.  
- **Mobiele toegang:** De applicatie is volledig responsive en biedt toegang vanaf verschillende devices.  

---

## Afbakening

Het systeem richt zich op een overzichtelijke omgeving waarin docenten en studenten efficient kunnen samenwerken. Er zijn twee soorten accounts: docentenaccounts en studentenaccounts. Docenten kunnen vestigingen beheren en binnen die vestigingen klassen aanmaken. Studenten kunnen door docenten aan klassen toegevoegd worden, zodat ze toegang hebben tot de juiste informatie en afspraken.  

Docenten kunnen tijdblokken aanmaken voor hun klassen. Studenten kunnen deze blokken zien en reserveren. Na iedere afspraak schrijft de student een korte samenvatting, die wordt opgeslagen in een logboek zodat alle afspraken overzichtelijk en traceerbaar blijven.  

Daarnaast is er een geintegreerde mailfunctie waarmee afspraken automatisch ook in de agenda worden gezet.  

Wat binnen de scope valt:  
- Volledige webapplicatie die mobiel compatibel is.  
- Basisfunctionaliteit zonder AI werkt altijd; studenten kunnen afspraken plannen, tijdblokken zien en samenvattingen maken.  
- AI integratie voor speech to text samenvattingen kan alleen toegevoegd worden als er voldoende AI-tokens beschikbaar zijn. Zonder deze tokens blijft de functionaliteit beperkt tot handmatige samenvattingen.  

Wat buiten de scope valt: 
- Extra functionaliteiten die afhankelijk zijn van externe systemen die niet gegarandeerd beschikbaar zijn (bijvoorbeeld AI modellen en outlook).  

![[moscow ]]

---

## Risico’s

| Risico                               | Impact                                                                                                                          | Mogelijke fix                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Problemen bij integratie met Outlook | Studenten en docenten kunnen afspraken niet automatisch in hun agenda zien, wat kan leiden tot dubbele afspraken of verwarring. | Tijdig testen van de integratie met Microsoft Graph API. fallback optie via export van iCal-bestanden.                              |
| AI niet beschikbaar door outage      | Automatische samenvattingen kunnen niet worden gegenereerd, waardoor studenten alles handmatig moeten noteren.                  | Handmatige samenvatting altijd mogelijk maken; caching van recente AI-resultaten of gebruik van alternatieve AI-service als backup. |
| Verlies van data                     | Afspraken en logboeken kunnen verloren gaan.                                                                                    | Regelmatige back-ups, gebruik van database.                                                                                         |
| Onvoldoende AI-tokens                | Automatische AI-functies kunnen niet altijd gebruikt worden.                                                                    | Tokenbeheer en waarschuwing bij laag aantal tokens. handmatige input altijd mogelijk.                                               |
| Beveiligingslekken                   | Persoonlijke informatie van studenten en docenten kan gelekt worden.                                                            | Sterke authenticatie (OAuth2), SSL, role-based access control, regelmatige security audits.                                         |


---

## Randvoorwaarden

- Wekelijkse gesprekken met de Product Owner voor voortgang, feedback en prioriteiten.  
- VPS met Ubuntu (laatste stabiele versie) voor hosting van de applicatie.  
- Testgebruikers (docenten en studenten) beschikbaar voor validatie van functionaliteiten.  
- Backup-mogelijkheden van database.  
- Toegang tot benodigde API-sleutels (bijv. AI, Outlook).  

---

## Fasering en planning

### Fasering
| Sprints   | Taken                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| sprint 1  | Projectplan                                                                                                      |
| sprint 2  | Functioneel ontwerp                                                                                              |
| sprint 3  | Technisch ontwerp en testplan                                                                                    |
| sprint 4  | Login / Registreren en Klassen aanmaken                                                                          |
| sprint 5  | Tijdblokken aanmaken en reserveren en outlook API                                                                |
| sprint 6  | Visuele weergave tijdblokken en login registreren                                                                |
| sprint 7  | Centraal beheerpunt voor docenten, Tijdblokken, klassen en samenvattingen                                        |
| sprint 8  | Student kan samenvatting schrijven, docent kan alles beoordelen en Logboek                                       |
| sprint 9  | Eindgebruikers testen volledige systeem, Feedback verzamelen en Bugs identificeren en oplossen en AcceptatieTest |
| sprint 10 | Acceptatie Rapport af, Progamma werkt volledig en Presentatie is af.                                             |

### Planning
![[planning]]
---

## Akkoord
Door dit document te ondertekenen gaat u akkoord met de inhoud va      n dit document en geeft u aan dat de applicatie in grote lijnen naar wens is.  

**Development Team:**  

**Klant:**  

Goedkeuring via Microsoft Teams
