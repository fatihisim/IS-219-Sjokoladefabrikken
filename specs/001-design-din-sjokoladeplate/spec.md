# Feature 001: Design din egen sjokoladeplate

Steg 2 (Spec). Beskriver hva og hvorfor, ikke teknologi.

## Mål
En privatkunde skal kunne sette sammen en personlig sjokoladeplate digitalt, få hjelp til å velge smaker, se resultatet før bestilling og vite hva platen inneholder.

## Avgrensning (MVP)
Én gjennomgående flyt i fem steg, tilsvarende kundereisen fra oppgave 4: Oppdage → Utforske smaker → Designe → Bestille → Motta og dele.

## Brukerhistorier
- Som gavekjøper vil jeg få forslag til smakskombinasjoner, slik at jeg tør å velge noe uten å ha smakt det.
- Som gavekjøper vil jeg kunne velge alt selv, slik at platen blir min egen.
- Som gavekjøper vil jeg oppgi hva mottakeren ikke tåler, slik at jeg bare ser trygge valg.
- Som gavekjøper vil jeg se platen og innpakningen før jeg bestiller, slik at jeg vet hva jeg får.
- Som gavekjøper vil jeg skrive en hilsen på innpakningen, slik at gaven blir personlig.
- Som gavekjøper vil jeg velge mellom å få platen sendt, hente den eller lage den i verkstedet.
- Som gavekjøper vil jeg betale uten å lage konto.
- Som bruker med lesevansker vil jeg kunne få oppsummeringen lest opp.

## Hovedflyt
1. Kunden åpner forsiden, ser hva tjenesten er og hvor lang tid det tar, og starter.
2. Kunden oppgir eventuelle allergener som skal unngås.
3. Kunden velger sjokolade og så mange toppinger kunden vil, enten selv eller fra Smaksprofessorens forslag.
4. Kunden velger form og motiv og skriver navn og hilsen til innpakningen.
5. Kunden ser oppsummering med allergener og pris, velger levering og bekrefter.
6. Kunden får en bekreftelse og kan lagre eller kopiere designet.

## Alternative flyter
- Kunden starter fra et eksempel i galleriet og endrer det.
- Kunden går tilbake og endrer valg. Tidligere valg beholdes.
- Kunden lukker siden og fortsetter senere fra lagret utkast i samme nettleser.

## Funksjonelle krav
- FK1 Løsningen skal vise forhåndsvisning av platen som oppdateres ved hvert valg.
- FK2 Løsningen skal vise forhåndsvisning av innpakningen med navn, hilsen, innhold og allergener.
- FK3 Kunden skal kunne oppgi en unngå-liste. Ingredienser som inneholder noe på listen, skal ikke kunne velges, og kunden skal se hvorfor.
- FK4 Hver ingrediens skal vise egne allergener der den velges.
- FK5 Smaksprofessoren skal stille inntil tre spørsmål og gi høyst tre forslag, hvert med en forklaring.
- FK6 Smaksprofessoren skal kommentere kundens egne valg når den har en regel for kombinasjonen, og si fra når den ikke har det.
- FK7 Kunden skal kunne velge fritt antall toppinger, og kunne fjerne en topping igjen både i listen og under platen.
- FK8 Oppsummeringen skal vise alle valg, samlet allergenliste, «kan inneholde spor av» og pris før bestilling.
- FK9 Kunden skal velge mellom å få platen sendt, hente den i verkstedet eller booke verkstedet og lage den selv.
- FK10 Kunden skal bekrefte at en personlig tilpasset plate ikke har angrerett, før bestilling.
- FK11 Kunden skal kunne bestille uten å lage konto.
- FK12 Kunden skal kunne lagre designet og kopiere en oppsummering.
- FK13 Oppsummeringen skal kunne leses opp der nettleseren støtter det.
- FK14 Når kunden legger til en topping, skal den helles fra en pose og lande på platen med animasjon. Bitene skal ligge jevnt fordelt, og biter som allerede ligger på platen skal ikke flytte seg. Bytte av sjokolade, form og motiv skal også gi en synlig bevegelse.
- FK15 Platen skal være det største elementet på siden mens kunden velger smaker og design, og den skal være synlig hele tiden (også på mobil).
- FK16 Tegningen av hver topping skal ligne den ekte toppingen, og samme tegning skal brukes på knappen og på platen.

## Ikke-funksjonelle krav
- IK1 Fungerer på mobil (ca. 400 px bredde) og PC.
- IK2 Alle kontroller kan brukes med tastatur, har synlig fokus og tekstlige navn.
- IK3 Hele flyten skal kunne fullføres på under 15 minutter.
- IK4 Ingen data forlater nettleseren. Opplastet bilde lagres ikke.
- IK5 Eksempeldata er merket som eksempeldata.
- FK17 Kunden skal kunne oppgi om platen er til et barn. Da skal siden få ekstra pynt (vimpler, ballonger, sterkere farger og stjerner når topping legges på).
- FK18 Platen kommer i en eske med vindu. Kunden skal kunne se både platen og esken, og bytte mellom dem med ett trykk. Når en anledning fjernes, skal platen vises igjen.
- IK6 Utseendet skal være lekent og samtidig kjennes igjen fra nettsiden til Marsipanfabrikken (krem, sjokoladebrun, vinrød og gull; skriftene Berkshire Swash og Source Sans 3). Bedriftens logo brukes ikke i prototypen. Animasjoner skrus av for brukere som har bedt om redusert bevegelse.

## Forretningsregler
- FR1 Allergener for en plate = unionen av allergenene til basen og alle valgte toppinger.
- FR2 «Kan inneholde spor av» = unionen av sporene, minus det som allerede står under «inneholder».
- FR3 En ingrediens er tillatt når ingen av dens allergener står på unngå-listen. Spor gir advarsel, ikke sperre.
- FR4 Et forslag er tillatt bare når basen og alle toppingene i forslaget er tillatt.
- FR5 Pris = plate + antall toppinger × toppingpris + eventuelt motiv + eventuelt eget bilde + eventuell frakt.

## Edge cases
- Unngå-listen fjerner alle sjokoladetyper: løsningen sier fra og viser til verkstedet, i stedet for å tilby et utrygt valg.
- Unngå-listen fjerner alle forslag: Smaksprofessoren sier at den ikke har trygge forslag.
- Kunden legger til en allergen etter å ha valgt ingredienser: valg som ikke lenger er tillatt, fjernes, og kunden får beskjed.
- Kunden prøver å velge en fjerde topping: valget avvises med forklaring.
- Kunden laster opp noe som ikke er et bilde, eller et for stort bilde: avvises med forklaring.

## Akseptansekriterier
- AK1 Gitt at «nøtter» står på unngå-listen, kan ingen ingrediens med nøtter velges, og ingen forslag inneholder nøtter.
- AK2 Smaksprofessoren gir aldri mer enn tre forslag, og hvert forslag har en forklaring.
- AK3 Gitt en plate med melkesjokolade, lakris og hasselnøtter, viser oppsummeringen melk, soya, gluten og nøtter.
- AK4 Kunden kan velge flere enn tre toppinger. Hver topping kommer med i pris og allergenliste.
- AK5 Bestilling kan ikke bekreftes før påkrevde felt er fylt ut og angrerett-punktet er krysset av.
- AK6 Forhåndsvisningen endres når base, topping, form eller motiv endres.
- AK7 Når ingen sjokoladetype er tillatt, vises en forklaring og ingen base kan velges.
- AK8 Flyten kan gjennomføres med bare tastatur.

## Utenfor scope
- Ekte betaling, ordresystem, lager og e-post.
- Ekte KI. Smaksprofessoren i prototypen bruker faste regler.
- Administrasjonsgrensesnitt for ansatte.
- Fotorealistisk 3D-visning.
- Brukerkonto og innlogging.

## Avklaringer
| Dato | Spørsmål | Beslutning |
|---|---|---|
| 12.11.2026 | Sendes platen, eller hentes den? | Begge deler skal være valg i prototypen (Fatih, etter møte med oppdragsgiver). |
| 12.11.2026 | Finnes ekte produkt- og prisdata? | Nei. Bruk eksempeldata og merk dem. |
| 12.11.2026 | Tilbakemelding på første versjon | Siden var for formell. Topping skal legges på med animasjon, platen skal være større og hovedsaken på siden, og tegningene skal ligne toppingen. Togmotivet var bare et eksempel og er fjernet. Gir FK14–FK16 og IK6 (Fatih). |
| 12.11.2026 | Skal antall toppinger begrenses? | Nei. Kunden velger fritt. Endrer FK7 og AK4 (Fatih). |
| 13.11.2026 | Tilbakemelding på andre versjon | Utseendet skal passe med bedriftens nettside, men fortsatt være morsomt. Toppingene lå ujevnt, tegningene skal være mer realistiske, og toppingen skal helles fra en pose. Barnevalget skal gi mer pynt. Innpakningen var uklar og er tegnet om til en eske med vindu. Feil rettet: platen kom ikke tilbake når anledningen ble fjernet. Gir FK17, FK18 og endret FK14 og IK6 (Fatih). |
| 12.11.2026 | Skal Smaksprofessoren bruke KI? | Nei i prototypen. Regelbasert, slik at forslagene kan testes og forklares. |

## Åpne spørsmål til oppdragsgiver
- Hvilke smaker, toppinger og priser skal inn?
- Hvilke former og motiver kan faktisk produseres med 3D-printede former?
- Følger formen med til kunden, slik verdiforslaget antyder?
- Hvor lang er produksjons- og leveringstiden?
