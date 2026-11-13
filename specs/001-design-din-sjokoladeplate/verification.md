# Verifikasjon – Feature 001

Steg 5 (Verify). Del A er utført 12.11.2026 av KI-verktøyet (Claude) som bygde prototypen. Del B og C skal fylles ut av gruppen.

## A. Teknisk verifikasjon

### Automatiske tester av reglene
`node --test` → 14 av 14 tester består.

| Akseptansekriterium | Test | Resultat |
|---|---|---|
| AK1 Unngå-listen sperrer ingredienser og forslag | Alle 17 kombinasjoner av ingen, én, to og alle fem allergener × 5 svarsett | Består |
| AK2 Høyst tre forslag, alle med forklaring | Samme kombinasjoner | Består |
| AK3 Riktig samlet allergenliste | Melkesjokolade + lakris + hasselnøtter | Består |
| AK4 Fritt antall toppinger | Fjerde topping godtas. Alle 14 toppinger gir riktig pris og allergenliste | Består |
| AK5 Påkrevde felt og angrerett | Tomt skjema, fullt skjema, manglende dato, feil postnummer | Består |
| AK7 Ingen tillatt sjokolade | Soya på unngå-listen | Består |

### Flyt i nettleser
`tests/flyt_nettleser.py`, Chromium. Hele flyten kjørt på PC (1280 px, lyst tema), mobil (390 px, mørkt tema) og med bare tastatur. 43 av 43 kontroller består (kjørt på nytt 13.11.2026 etter tredje versjon).

| Kriterium | Resultat |
|---|---|
| AK5 Bestilling stoppes uten påkrevde felt og uten avkrysset angrerett | Består |
| AK6 Forhåndsvisningen endres ved forslag, form og motiv | Består |
| AK7 Forklaring vises og «Videre» er deaktivert når ingen sjokolade er tillatt | Består |
| AK8 Flyten fullføres med bare tastatur | Består |
| FK2 Innpakningen viser hilsen og navn | Består |
| FK7 En topping kan fjernes ved å trykke på brikken under platen | Består |
| FK14 Ny topping helles fra posen med animasjon, og navnet vises i en boble | Består |
| FK17 Barnemodus skrur på ekstra pynt | Består |
| FK18 Platen vises igjen når anledningen fjernes, og det lille bildet bytter mellom plate og eske | Består |
| FK15 Platen er stor og alltid synlig (627 px bred på PC, 358 px på mobil, under 60 % av skjermhøyden) | Består |
| FK8 Allergener og unngå-liste vises i oppsummeringen | Består |
| IK1 Ingen vannrett rulling på 390 px | Består |
| Ingen feil i konsollen | Består |

### Feil som ble funnet og rettet underveis
1. Klassenavnet `ferdig` ble brukt både i stegviseren og på bekreftelsessiden, slik at stilene kolliderte. Bekreftelsessiden heter nå `kvittering`.
2. Forhåndsvisningen ble vist på forsiden på mobil fordi en stilregel overstyrte `hidden`. Rettet med en egen regel for `[hidden]`.
3. Skjemafelt i loddrette grupper fikk 180 px tom høyde på grunn av en `flex`-regel. Regelen gjelder nå bare felt som står ved siden av hverandre.
4. En melding ble hengende igjen ved bytte av steg. Den fjernes nå ved navigasjon.
5. Testkommandoen `node --test tests/` virket ikke i Node 22. Riktig kommando er `node --test`.

### Ikke verifisert
- Skjermleser (NVDA, VoiceOver). Bare tastatur og semantikk er sjekket.
- Safari og Firefox, og ekte telefoner.
- Opplesning («Les opp»). Avhenger av nettleserens talesyntese og norsk stemme.
- At skrifttypene fra Google Fonts lastes. Testmiljøet hadde ikke nettilgang, så reserveskrift ble brukt.
- Om utseendet oppleves som «samme sted» som bedriftens nettside. Farger og skrifter er hentet derfra, men oppdragsgiver har ikke sett resultatet.
- Om animasjonene og utseendet faktisk appellerer til barn (FK17). Må testes med barn og foreldre.
- Hvordan animasjonene flyter på eldre telefoner.
- IK3 (under 15 minutter). Må måles med ekte brukere. Bekreftelsessiden viser tiden som ble brukt.

### Kjente svakheter
- Alle produktdata, allergener og priser er eksempeldata.
- Smaksprofessoren har 12 faste forslag og 12 parregler. Den lærer ikke og kjenner ikke bedriftens sortiment.
- Esken med vindu er et forslag fra prototypen. Hvordan bedriften faktisk pakker platene, er ikke avklart.
- Forhåndsvisningen er en tegning, ikke et bilde av det ferdige produktet. Ekte produktbilder fra bedriften ville vært mer realistisk. Om den oppleves som «realistisk nok», må testes.
- Leveringstid, pris for verkstedbesøk og hvilke former som kan produseres er ikke avklart.
- Lagret utkast ligger bare i én nettleser.
- Antall toppinger er ikke begrenset. Om verkstedet kan lage en plate med svært mange toppinger, og hva det bør koste, er ikke avklart.

### Krever menneskelig eller faglig vurdering
- Allergenmerkingen må kontrolleres mot regelverket og bedriftens faktiske råvarer før noe publiseres.
- Teksten om angrerett bør kontrolleres juridisk.
- Smaksforslagene bør vurderes av en fagperson i verkstedet.

## B. Brukertest (fylles ut av gruppen)

Oppgaven krever test med minst to brukere eller kunder.

Forslag til testoppgave: «Du skal gi en personlig sjokoladeplate til en du kjenner som ikke tåler nøtter. Design platen og bestill den.»

| | Testperson 1 | Testperson 2 |
|---|---|---|
| Dato og sted | | |
| Bakgrunn (alder, vant til netthandel?) | | |
| Enhet (mobil/PC) | | |
| Fullførte uten hjelp? | | |
| Tid brukt (står på bekreftelsessiden) | | |
| Brukte Smaksprofessoren? | | |
| Kunne si hva platen inneholder før bestilling? | | |
| Stemte forhåndsvisningen med forventningen? | | |
| Hvor stoppet eller nølte personen? | | |
| Hva sa personen var bra? | | |
| Forslag til forbedringer | | |

## C. Gruppens vurdering av KI-bidraget (fylles ut av gruppen)

- Hvilke forslag fra KI-verktøyet ble godtatt uten endring?
- Hvilke ble endret eller forkastet, og hvorfor?
- Hva i koden forsto vi ikke, og hva gjorde vi med det?
