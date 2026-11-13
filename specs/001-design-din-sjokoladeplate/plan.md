# Plan – Feature 001

Steg 3 (Plan). Skrevet før koden.

## Teknologivalg
Ren HTML, CSS og JavaScript uten rammeverk og uten byggesteg. Begrunnelse: prototypen skal kunne åpnes direkte i en nettleser, legges på GitHub Pages og leses av studenter uten oppsett.

## Komponenter
| Fil | Ansvar |
|---|---|
| `src/js/data.js` | Eksempeldata: sjokoladetyper, toppinger, allergener, forslag, priser |
| `src/js/regler.js` | Forretningsreglene FR1–FR5 som rene funksjoner uten DOM. Kan testes i Node |
| `src/js/plate.js` | Tegner platen og innpakningen som SVG ut fra et design |
| `src/js/app.js` | Tilstand, navigasjon mellom stegene, skjemaer og hendelser |
| `src/css/style.css` | Utseende, lyst og mørkt tema, mobil og PC |
| `src/index.html` | Sideskall |
| `tests/regler.test.js` | Tester for akseptansekriteriene som kan sjekkes uten nettleser |

## Dataflyt
Brukervalg → tilstand i `app.js` → `regler.js` beregner tillatte valg, allergener, forslag og pris → `plate.js` tegner forhåndsvisning → `app.js` oppdaterer siden. Utkast lagres i nettleserens `localStorage`. Ingenting sendes ut.

## Oppgaver
1. T1 Datamodell og eksempeldata.
2. T2 Regler: tillatt, allergener, forslag, kommentar, pris, validering.
3. T3 Tester for T2 (AK1–AK4, AK7).
4. T4 Forhåndsvisning av plate og innpakning.
5. T5 Steg 1 Oppdage og steg 2 Smaker med unngå-liste, filtre og Smaksprofessor.
6. T6 Steg 3 Design og steg 4 Bestilling med validering.
7. T7 Steg 5 Bekreftelse, lagring, kopiering, opplesning.
8. T8 Tilgjengelighet, mobil, mørkt tema.

## Teststrategi
- Reglene testes automatisk med `node --test`.
- Flyten testes i nettleser på PC- og mobilbredde (AK5, AK6, AK8).
- Brukertest med minst to brukere gjøres av gruppen og dokumenteres i `verification.md`.
