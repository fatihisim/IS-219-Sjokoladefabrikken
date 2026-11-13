/* SjokoDesigneren – EKSEMPELDATA.
   Ingenting her er bedriftens faktiske sortiment, allergenopplysninger eller priser.
   Byttes ut med ekte data fra oppdragsgiver før løsningen kan brukes. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.SjokoData = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    MAKS_HILSEN: 40,
    MAKS_NAVN: 20,

    ALLERGENER: [
      { id: 'melk', navn: 'melk' },
      { id: 'notter', navn: 'nøtter' },
      { id: 'peanotter', navn: 'peanøtter' },
      { id: 'gluten', navn: 'gluten' },
      { id: 'soya', navn: 'soya' }
    ],

    BASER: [
      { id: 'melk', navn: 'Melkesjokolade', kort: 'melkesjokolade', beskrivelse: 'Søt og kremet', allergener: ['melk', 'soya'], spor: ['notter'], farge: '#7B4A2D', lys: '#96603D', mork: '#5C3620' },
      { id: 'mork', navn: 'Mørk sjokolade 70 %', kort: 'mørk sjokolade', beskrivelse: 'Kraftig og mindre søt', allergener: ['soya'], spor: ['melk', 'notter'], farge: '#3B2118', lys: '#553126', mork: '#27140E' },
      { id: 'hvit', navn: 'Hvit sjokolade', kort: 'hvit sjokolade', beskrivelse: 'Mild og veldig søt', allergener: ['melk', 'soya'], spor: ['notter'], farge: '#EBDDBE', lys: '#F6ECD6', mork: '#CDBB95' }
    ],

    KATEGORIER: [
      { id: 'baer', navn: 'Bær og frukt' },
      { id: 'notter', navn: 'Nøtter' },
      { id: 'salt', navn: 'Lakris og salt' },
      { id: 'sott', navn: 'Søtt og sprøtt' },
      { id: 'krydder', navn: 'Krydder og kaffe' }
    ],

    TOPPINGS: [
      { id: 'bringebaer', navn: 'Frysetørket bringebær', kort: 'bringebær', kategori: 'baer', allergener: [], spor: [], farge: '#C2264B', figur: 'klynge' },
      { id: 'jordbaer', navn: 'Frysetørket jordbær', kort: 'jordbær', kategori: 'baer', allergener: [], spor: [], farge: '#E0484A', figur: 'bit' },
      { id: 'appelsin', navn: 'Appelsinskall', kort: 'appelsinskall', kategori: 'baer', allergener: [], spor: [], farge: '#F08A1C', figur: 'strimmel' },
      { id: 'kokos', navn: 'Kokosflak', kort: 'kokos', kategori: 'baer', allergener: [], spor: [], farge: '#FBF7EC', figur: 'strimmel' },
      { id: 'hasselnott', navn: 'Ristede hasselnøtter', kort: 'hasselnøtter', kategori: 'notter', allergener: ['notter'], spor: [], farge: '#B98450', figur: 'rund' },
      { id: 'mandel', navn: 'Saltede mandler', kort: 'mandler', kategori: 'notter', allergener: ['notter'], spor: [], farge: '#D6A871', figur: 'oval' },
      { id: 'peanott', navn: 'Peanøtter', kort: 'peanøtter', kategori: 'notter', allergener: ['peanotter'], spor: ['notter'], farge: '#E3C28C', figur: 'oval' },
      { id: 'lakris', navn: 'Lakrisbiter', kort: 'lakris', kategori: 'salt', allergener: ['gluten'], spor: [], farge: '#17120F', figur: 'bit' },
      { id: 'havsalt', navn: 'Havsaltflak', kort: 'havsalt', kategori: 'salt', allergener: [], spor: [], farge: '#FFFFFF', figur: 'flak' },
      { id: 'karamell', navn: 'Karamellbiter', kort: 'karamell', kategori: 'sott', allergener: ['melk'], spor: [], farge: '#D08A2E', figur: 'bit' },
      { id: 'kjeks', navn: 'Kjeksbiter', kort: 'kjeks', kategori: 'sott', allergener: ['gluten', 'melk'], spor: [], farge: '#E2BE85', figur: 'bit' },
      { id: 'kakaonibs', navn: 'Kakaonibs', kort: 'kakaonibs', kategori: 'krydder', allergener: [], spor: [], farge: '#4A2A1B', figur: 'flak' },
      { id: 'chili', navn: 'Chiliflak', kort: 'chili', kategori: 'krydder', allergener: [], spor: [], farge: '#B3261E', figur: 'flak' },
      { id: 'kaffe', navn: 'Knuste kaffebønner', kort: 'kaffe', kategori: 'krydder', allergener: [], spor: [], farge: '#2E1B12', figur: 'flak' }
    ],

    FORMER: [
      { id: 'plate', navn: 'Klassisk plate' },
      { id: 'hjerte', navn: 'Hjerte' },
      { id: 'rund', navn: 'Rund' }
    ],

    MOTIVER: [
      { id: 'ingen', navn: 'Uten motiv' },
      { id: 'hjerte', navn: 'Hjerte' },
      { id: 'stjerne', navn: 'Stjerne' },
      { id: 'blomst', navn: 'Blomst' }
    ],

    INNPAKNING: [
      { id: 'baer', navn: 'Bringebær', farge: '#A61E4D', tekst: '#FFFFFF' },
      { id: 'gran', navn: 'Gran', farge: '#1F5A46', tekst: '#FFFFFF' },
      { id: 'hav', navn: 'Hav', farge: '#1D4E79', tekst: '#FFFFFF' },
      { id: 'sol', navn: 'Sol', farge: '#F2B632', tekst: '#2B1A12' }
    ],

    ANLEDNINGER: [
      { id: 'bursdag', navn: 'Bursdag', hilsen: 'Gratulerer med dagen!' },
      { id: 'jul', navn: 'Jul', hilsen: 'God jul!' },
      { id: 'konfirmasjon', navn: 'Konfirmasjon', hilsen: 'Gratulerer med konfirmasjonen!' },
      { id: 'bryllup', navn: 'Bryllup', hilsen: 'Til lykke med dagen!' },
      { id: 'takk', navn: 'Takk', hilsen: 'Tusen takk!' }
    ],

    /* Smaksprofessorens faste forslag. smak: sott | syrlig | salt. mot: trygt | nytt. */
    FORSLAG: [
      { id: 'f1', navn: 'Bærhagen', base: 'melk', toppings: ['bringebaer', 'jordbaer'], smak: 'syrlig', til: ['barn', 'voksen'], mot: 'trygt', hvorfor: 'Syrlige bær frisker opp den søte melkesjokoladen.' },
      { id: 'f2', navn: 'Lakris og bringebær', base: 'melk', toppings: ['lakris', 'bringebaer'], smak: 'syrlig', til: ['voksen'], mot: 'nytt', hvorfor: 'Salt lakris og syrlig bringebær er en kombinasjon mange kjenner fra godterihylla.' },
      { id: 'f3', navn: 'Nøttekaramell', base: 'melk', toppings: ['hasselnott', 'karamell'], smak: 'sott', til: ['barn', 'voksen'], mot: 'trygt', hvorfor: 'Ristede nøtter gir tygg og litt bitterhet mot søt karamell.' },
      { id: 'f4', navn: 'Salt karamell', base: 'mork', toppings: ['karamell', 'havsalt'], smak: 'salt', til: ['voksen'], mot: 'trygt', hvorfor: 'Litt salt løfter karamellen og demper bitterheten i mørk sjokolade.' },
      { id: 'f5', navn: 'Mørk appelsin', base: 'mork', toppings: ['appelsin', 'kakaonibs'], smak: 'syrlig', til: ['voksen'], mot: 'trygt', hvorfor: 'Appelsin og mørk sjokolade er en klassiker. Kakaonibs gir knas.' },
      { id: 'f6', navn: 'Chili og kaffe', base: 'mork', toppings: ['chili', 'kaffe'], smak: 'salt', til: ['voksen'], mot: 'nytt', hvorfor: 'Varme fra chili og brente toner fra kaffe passer til en kraftig sjokolade.' },
      { id: 'f7', navn: 'Hvit sommer', base: 'hvit', toppings: ['jordbaer', 'kokos'], smak: 'sott', til: ['barn', 'voksen'], mot: 'trygt', hvorfor: 'Jordbær gir farge og syre til den milde hvite sjokoladen.' },
      { id: 'f8', navn: 'Kjeks og karamell', base: 'melk', toppings: ['kjeks', 'karamell'], smak: 'sott', til: ['barn'], mot: 'trygt', hvorfor: 'Sprø kjeks og myk karamell. En trygg favoritt for barn.' },
      { id: 'f9', navn: 'Salte mandler', base: 'mork', toppings: ['mandel', 'havsalt'], smak: 'salt', til: ['voksen'], mot: 'trygt', hvorfor: 'Salte mandler gir en tydelig kontrast til mørk sjokolade.' },
      { id: 'f10', navn: 'Hvit lakris', base: 'hvit', toppings: ['lakris', 'bringebaer'], smak: 'salt', til: ['voksen'], mot: 'nytt', hvorfor: 'Søt hvit sjokolade tåler mye salt lakris. Bringebær holder det friskt.' },
      { id: 'f11', navn: 'Peanøtt og salt', base: 'melk', toppings: ['peanott', 'havsalt'], smak: 'salt', til: ['barn', 'voksen'], mot: 'trygt', hvorfor: 'Salte peanøtter og melkesjokolade smaker som en kjent sjokoladebar.' },
      { id: 'f12', navn: 'Mørk bringebær', base: 'mork', toppings: ['bringebaer', 'kakaonibs'], smak: 'syrlig', til: ['voksen'], mot: 'trygt', hvorfor: 'Bringebær gir friskhet, kakaonibs gir knas og mer sjokoladesmak.' }
    ],

    /* Kombinasjoner Smaksprofessoren har en regel for. Hvert par er to id-er (base eller topping). */
    PAR: [
      { par: ['bringebaer', 'lakris'], tekst: 'Bringebær og lakris: syrlig mot salt. En kombinasjon mange liker.' },
      { par: ['karamell', 'havsalt'], tekst: 'Karamell og havsalt: saltet løfter det søte.' },
      { par: ['mork', 'appelsin'], tekst: 'Mørk sjokolade og appelsin er en klassiker.' },
      { par: ['mork', 'chili'], tekst: 'Mørk sjokolade og chili gir varme. Best for voksne.' },
      { par: ['mork', 'kaffe'], tekst: 'Kaffe forsterker smaken av mørk sjokolade.' },
      { par: ['hvit', 'jordbaer'], tekst: 'Hvit sjokolade og jordbær: mildt, søtt og fint å se på.' },
      { par: ['hvit', 'bringebaer'], tekst: 'Syrlig bringebær balanserer den søte hvite sjokoladen.' },
      { par: ['hasselnott', 'karamell'], tekst: 'Hasselnøtter og karamell passer godt sammen.' },
      { par: ['melk', 'kjeks'], tekst: 'Kjeks i melkesjokolade gir sprøhet som barn ofte liker.' },
      { par: ['mandel', 'havsalt'], tekst: 'Mandler og havsalt gir tydelig salt-søt kontrast.' },
      { par: ['melk', 'bringebaer'], tekst: 'Bringebær frisker opp melkesjokoladen.' },
      { par: ['chili', 'jordbaer'], tekst: 'Chili og jordbær er uvanlig. Smak gjerne i verkstedet først.' }
    ],

    PRISER: { plate: 169, topping: 15, motiv: 25, bilde: 20, frakt: 79 },

    EKSEMPLER: [
      { navn: 'Bursdagsplaten', design: { base: 'melk', toppings: ['bringebaer', 'kjeks'], form: 'plate', motiv: 'stjerne', anledning: 'bursdag', til: '', hilsen: 'Gratulerer med dagen!', innpakning: 'hav' } },
      { navn: 'Til en du er glad i', design: { base: 'hvit', toppings: ['jordbaer', 'kokos'], form: 'hjerte', motiv: 'ingen', anledning: null, til: '', hilsen: 'Til deg', innpakning: 'baer' } },
      { navn: 'Julekvelden', design: { base: 'mork', toppings: ['appelsin', 'kakaonibs'], form: 'rund', motiv: 'ingen', anledning: 'jul', til: '', hilsen: 'God jul!', innpakning: 'gran' } }
    ]
  };
});
