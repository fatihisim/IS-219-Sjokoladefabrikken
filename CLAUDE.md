# SjokoDesigneren

Studentprototype for IS-219 (UiA), gruppe 16. Oppdragsgiver: Sjokoladefabrikken, Kristiansand.

## Mål
Hjelpe en privatkunde med å designe og bestille en personlig sjokoladeplate på under 15 minutter, med smaksveiledning, realistisk forhåndsvisning og tydelig allergeninformasjon.

## Arbeidsflyt
1. Les `docs/context.md`.
2. Les den aktuelle spesifikasjonen under `specs/`.
3. Lag eller oppdater `plan.md` før kode endres.
4. Spør når et krav er uklart. Ikke bygg funksjoner som ligger utenfor spesifikasjonen.
5. Gjennomfør én oppgave om gangen.
6. Kjør `node --test` og sammenlign med akseptansekriteriene.
7. Oppdater spesifikasjonen når godkjent atferd endres.

## Regler som ikke kan fravikes
- Ikke finn på produktdata, priser eller allergenopplysninger og presenter dem som ekte. Eksempeldata skal være merket som eksempeldata i grensesnittet.
- Allergeninformasjon utledes deterministisk fra data, i `src/js/regler.js`. Aldri fra fritekst.
- En ingrediens som inneholder noe på kundens unngå-liste, skal ikke kunne velges og skal ikke foreslås.
- Smaksprofessoren skal forklare hvorfor et forslag passer. «Jeg har ingen regel for dette» er et gyldig svar.
- Prototypen gjennomfører ingen betaling og sender ingen data ut av nettleseren.
- Kundevendt tekst skrives på norsk bokmål.
- Alle kontroller skal kunne brukes med tastatur og ha synlig fokus.

## Kilder
- Kontekst: `docs/context.md`
- Spesifikasjon: `specs/001-design-din-sjokoladeplate/spec.md`
- Plan: `specs/001-design-din-sjokoladeplate/plan.md`
- Verifikasjon: `specs/001-design-din-sjokoladeplate/verification.md`
