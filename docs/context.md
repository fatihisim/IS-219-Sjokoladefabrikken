# Kontekst – SjokoDesigneren

Gruppe 16, IS-219 Digitalisering og tjenestedesign, UiA, høsten 2026.
Dette dokumentet er steg 1 (Context) i prosessen Context → Spec → Plan → Build → Verify.
Alt innhold bygger på gruppens tidligere leveranser (oppgave 2–4). Der noe er en antakelse, står det.

## 1. Virksomheten

Sjokoladefabrikken er et sjokoladeverksted i Posebyen i Kristiansand, startet av samme person som står bak Marsipanfabrikken. Verkstedet har over 40 sjokoladevarianter. Kundene lager sin egen sjokoladeplate i verkstedet, blant annet i barnebursdager, med vennegjenger og på arrangementer for arbeidsplasser. I dag skjer alt fysisk: kunden må møte opp og velge smaker på stedet.

## 2. Oppdraget

«Virtuell sjokoladefabrikk: konfigurator-opplevelse, smaksprofessor, personalisering.» (Gruppeprosjektlisten, prosjekt E.) Design, idéutvikling og idéutvelgelse veier tyngst.

## 3. Brukerne

Hovedmålgruppe: privatkunder som vil gi en personlig sjokolade som gave til en spesiell anledning.

| Persona | Situasjon | Mål | Frustrasjoner |
|---|---|---|---|
| Maja, 34, Kristiansand, to barn | Skal gi sønnen en personlig sjokolade til bursdagen | Gave som føles personlig, se resultatet før hun bestiller, bli ferdig raskt | For mange smaker, usikker på om resultatet blir som vist, vanskelig å finne allergener, vil ikke lage konto |
| Truls, 77, Drammen | Vil finne konas favorittsmaker til julegaven | Enkelt å bruke, trygg på at han bestiller riktig, klare det på egen hånd | Finner ikke smakene, nettsider med lav brukervennlighet |

Gavemottakeren bruker produktet, men er aldri i kontakt med tjenesten.

## 4. Innsikt fra undersøkelsen

Fem semistrukturerte intervjuer, 5.–7. oktober 2026, gjennomført sammen med gruppe 11.

- Alle fem ville se en realistisk forhåndsvisning før de bestilte.
- Fire av fem tok opp allergener selv. Feil allergeninformasjon ble pekt på som den mest alvorlige feilen.
- Mange smaker gjør valget vanskelig. Noen vil ha ferdige forslag, andre vil bygge fra bunnen. Løsningen må støtte begge.
- Designet bør ikke ta lang tid. Respondentene nevnte 10–20 minutter som øvre grense. Gruppen har satt 10–15 minutter som mål.
- Fire av fem ville lagre designet. Flere ville betale med Vipps og slippe å lage konto.
- To av fem handler ikke mat på nett i dag. Tillit må bygges.
- Tre av fem ville lagret bilder minst mulig. Opplastede bilder bør slettes når platen er laget.
- Én respondent etterlyste opplesning for dem som sliter med å lese.

Forbehold: konseptet ble presentert for respondentene som en nettbestilling som sendes i posten. Det kan ha påvirket svarene.

## 5. Prioriterte ideer (oppgave 4)

Fra lotusblomst og prioritering etter ønskelig, levedyktig, gjennomførbart og bærekraftig:

1. Digital guidet konfigurator
2. Smaksprofessor
3. Realistisk forhåndsvisning før bestilling
4. Allergen- og matinfo
5. Filtre og kategorier
6. Universell bestilling

## 6. Sentrale begreper

| Begrep | Betydning |
|---|---|
| Plate | Sjokoladeplaten kunden designer |
| Base | Sjokoladetypen platen lages av |
| Topping | Det som strøs på platen. Kunden velger fritt antall |
| Motiv | Relieff på platen, støpt med 3D-printet form |
| Form | Omrisset av platen |
| Innpakning | Papiret rundt platen, med hilsen og innholdsliste |
| Smaksprofessor | Veileder som foreslår smakskombinasjoner og forklarer hvorfor |
| Unngå-liste | Allergener kunden har sagt at mottakeren ikke tåler |

## 7. Datakilder

Gruppen har ikke fått produktliste, allergenopplysninger eller priser fra bedriften. Prototypen bruker derfor **eksempeldata**, tydelig merket i løsningen. Ingen tall eller ingredienser i prototypen skal leses som bedriftens faktiske sortiment.

## 8. Risiko og begrensninger

- **Allergener er sikkerhetskritiske.** Regelverket krever tydelig merking. Prototypen viser prinsippet, men dataene er eksempler.
- **Angrerett.** Varer laget etter kundens spesifikasjon har normalt ikke angrerett. Kunden må få vite dette før kjøp.
- **Personvern.** Opplastede bilder og kontaktopplysninger er personopplysninger. Prinsipp: be om minst mulig, slett bilder etter produksjon.
- **Universell utforming.** Løsningen må kunne brukes med tastatur og skjermleser og på mobil.
- **Produksjon.** Hva som faktisk lar seg produsere med 3D-printede former er ikke avklart i detalj.

## 9. Suksessmål for prototypen

- En testbruker fullfører design og bestilling på under 15 minutter uten hjelp.
- Testbrukeren kan si hvilke allergener platen inneholder før bestilling.
- Testbrukeren opplever at forhåndsvisningen viser det hun valgte.

## 10. Sporbarhet

Kundeinnsikt (oppgave 3) → verdiforslag og prioritering (oppgave 4) → kundereise og tjenesteplan (oppgave 4) → denne konteksten → `specs/001-design-din-sjokoladeplate/spec.md` → kode og tester.
