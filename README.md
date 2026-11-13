# SjokoDesigneren

Prototype av en virtuell sjokoladefabrikk: kunden designer en personlig sjokoladeplate, får hjelp av en «smaksprofessor», ser platen og innpakningen før bestilling og får tydelig allergeninformasjon.

Studentprosjekt i IS-219 Digitalisering og tjenestedesign, Universitetet i Agder, høsten 2026. Gruppe 16. Oppdragsgiver: Sjokoladefabrikken i Kristiansand.

**Dette er en prototype.** Ingen bestilling eller betaling gjennomføres. Sjokolader, toppinger, allergener og priser er eksempeldata og ikke bedriftens faktiske sortiment.

## Slik er prototypen laget

Prototypen er utviklet med KI-støtte (Claude) etter prosessen Context → Spec → Plan → Build → Verify fra emnets veikart for prototyping-fasen.

| Steg | Fil |
|---|---|
| 1. Context | [`docs/context.md`](docs/context.md) |
| 2. Spec | [`specs/001-design-din-sjokoladeplate/spec.md`](specs/001-design-din-sjokoladeplate/spec.md) |
| 3. Plan | [`specs/001-design-din-sjokoladeplate/plan.md`](specs/001-design-din-sjokoladeplate/plan.md) |
| 4. Build | [`src/`](src/) og [`tests/`](tests/) |
| 5. Verify | [`specs/001-design-din-sjokoladeplate/verification.md`](specs/001-design-din-sjokoladeplate/verification.md) |

Prosjektregler for KI-verktøyet står i [`CLAUDE.md`](CLAUDE.md).

## Kjør prototypen

Åpne `src/index.html` i en nettleser. Det trengs ingen installasjon.

Vil du kjøre den fra en lokal server:

```
cd src
python3 -m http.server 8000
```

Åpne deretter http://localhost:8000.

## Kjør testene

```
node --test
```

Testene dekker forretningsreglene i `src/js/regler.js` (allergener, sperring, forslag, pris og validering).

## Legg prototypen på nett med GitHub Pages

1. Gå til **Settings → Pages** i repoet.
2. Velg **Deploy from a branch**, grenen `main` og mappen `/ (root)`.
3. Etter et par minutter ligger prototypen på `https://<brukernavn>.github.io/<reponavn>/`.

## Struktur

```
CLAUDE.md                    Regler for KI-verktøyet
docs/context.md              Virksomhet, brukere, innsikt, begreper, risiko
specs/001-…/spec.md          Krav og akseptansekriterier
specs/001-…/plan.md          Teknisk plan og oppgaver
specs/001-…/verification.md  Testresultater, svakheter, brukertest
src/index.html               Sideskall
src/css/style.css            Utseende
src/js/data.js               Eksempeldata
src/js/regler.js             Forretningsregler (testbare)
src/js/plate.js              Tegner plate og innpakning
src/js/app.js                Grensesnitt
tests/regler.test.js         Automatiske tester
tests/flyt_nettleser.py      Flyttest i nettleser (krever Playwright)
```
