/* Tester for akseptansekriteriene som kan sjekkes uten nettleser.
   Kjør: node --test */
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../src/js/data.js');
const R = require('../src/js/regler.js');

const alleAllergener = D.ALLERGENER.map(a => a.id);
const kombinasjoner = [[]].concat(
  alleAllergener.map(a => [a]),
  alleAllergener.flatMap((a, i) => alleAllergener.slice(i + 1).map(b => [a, b])),
  [alleAllergener]
);

test('AK1: med nøtter på unngå-listen kan ingen ingrediens med nøtter velges', () => {
  for (const t of D.TOPPINGS) {
    if (t.allergener.includes('notter')) {
      assert.equal(R.erTillatt(t, ['notter']), false, t.navn);
      const r = R.veksleTopping({ base: 'melk', toppings: [] }, t.id, ['notter']);
      assert.equal(r.ok, false);
      assert.deepEqual(r.toppings, []);
    }
  }
});

test('AK1: ingen forslag inneholder noe fra unngå-listen, uansett kombinasjon', () => {
  const svarsett = [{}, { smak: 'sott', til: 'barn', mot: 'trygt' }, { smak: 'overrask', til: 'voksen', mot: 'nytt' }, { smak: 'salt' }, { smak: 'syrlig', til: 'voksen' }];
  for (const unngaa of kombinasjoner) {
    for (const svar of svarsett) {
      for (const f of R.foreslaa(svar, unngaa).forslag) {
        for (const a of unngaa) assert.equal(f.inneholder.includes(a), false, `${f.navn} inneholder ${a}`);
      }
    }
  }
});

test('AK2: høyst tre forslag, og alle har forklaring', () => {
  for (const unngaa of kombinasjoner) {
    const r = R.foreslaa({ smak: 'sott' }, unngaa);
    assert.ok(r.forslag.length <= 3);
    for (const f of r.forslag) assert.ok(f.hvorfor && f.hvorfor.length > 10);
  }
});

test('AK2: forslag til barn inneholder ikke forslag som bare er merket for voksne, når det finnes alternativer', () => {
  const r = R.foreslaa({ smak: 'sott', til: 'barn', mot: 'trygt' }, []);
  assert.equal(r.forslag.length, 3);
  for (const f of r.forslag) {
    const kilde = D.FORSLAG.find(x => x.id === f.id);
    assert.ok(kilde.til.includes('barn'), f.navn);
  }
});

test('AK3: melkesjokolade + lakris + hasselnøtter gir melk, nøtter, gluten og soya', () => {
  const a = R.allergenerFor({ base: 'melk', toppings: ['lakris', 'hasselnott'] });
  assert.deepEqual(a.inneholder.slice().sort(), ['gluten', 'melk', 'notter', 'soya']);
  assert.equal(a.spor.includes('notter'), false, 'spor skal ikke gjenta det som står under inneholder');
});

test('FR2: spor vises bare når det ikke allerede står under inneholder', () => {
  const a = R.allergenerFor({ base: 'mork', toppings: ['bringebaer'] });
  assert.deepEqual(a.inneholder, ['soya']);
  assert.deepEqual(a.spor.slice().sort(), ['melk', 'notter']);
});

test('AK4: kunden kan velge fritt antall toppinger, og pris og allergener følger med', () => {
  const d = { base: 'melk', toppings: ['bringebaer', 'jordbaer', 'kokos'] };
  const r = R.veksleTopping(d, 'havsalt', []);
  assert.equal(r.ok, true);
  assert.equal(r.toppings.length, 4);
  const alle = { base: 'melk', toppings: D.TOPPINGS.map(t => t.id), motiv: 'ingen' };
  assert.equal(R.pris(alle, 'hent').sum, D.PRISER.plate + D.TOPPINGS.length * D.PRISER.topping);
  assert.ok(R.allergenerFor(alle).inneholder.includes('peanotter'));
  assert.deepEqual(R.validerDesign(alle), []);
  const fjern = R.veksleTopping(d, 'kokos', []);
  assert.equal(fjern.ok, true);
  assert.deepEqual(fjern.toppings, ['bringebaer', 'jordbaer']);
});

test('AK7: med soya på unngå-listen er ingen sjokoladetype tillatt, og det finnes ingen forslag', () => {
  assert.equal(D.BASER.filter(b => R.erTillatt(b, ['soya'])).length, 0);
  const r = R.foreslaa({}, ['soya']);
  assert.equal(r.ingenTrygge, true);
  assert.deepEqual(r.forslag, []);
});

test('Edge case: valg som ikke lenger er tillatt, fjernes når unngå-listen endres', () => {
  const r = R.ryddEtterUnngaa({ base: 'melk', toppings: ['hasselnott', 'bringebaer'] }, ['notter']);
  assert.equal(r.base, 'melk');
  assert.deepEqual(r.toppings, ['bringebaer']);
  assert.deepEqual(r.fjernet, ['Ristede hasselnøtter']);
  const r2 = R.ryddEtterUnngaa({ base: 'melk', toppings: [] }, ['melk']);
  assert.equal(r2.base, null);
});

test('FK6: kjent kombinasjon får forklaring, ukjent kombinasjon sier fra', () => {
  assert.equal(R.kommentar({ base: 'mork', toppings: ['appelsin'] }).type, 'kjent');
  assert.equal(R.kommentar({ base: 'hvit', toppings: ['kaffe'] }).type, 'ukjent');
  assert.equal(R.kommentar({ base: 'melk', toppings: [] }), null);
});

test('FR5: pris summeres riktig', () => {
  const P = D.PRISER;
  const d = { base: 'melk', toppings: ['bringebaer', 'lakris'], motiv: 'stjerne', bilde: null };
  assert.equal(R.pris(d, 'post').sum, P.plate + 2 * P.topping + P.motiv + P.frakt);
  assert.equal(R.pris(d, 'hent').sum, P.plate + 2 * P.topping + P.motiv);
  assert.equal(R.pris({ base: 'melk', toppings: [], motiv: 'ingen' }, 'hent').sum, P.plate);
});

test('AK5: bestilling krever påkrevde felt og bekreftet angrerett', () => {
  assert.deepEqual(Object.keys(R.validerBestilling({ levering: 'post' })).sort(), ['adresse', 'angrerett', 'mobil', 'navn', 'postnr', 'sted']);
  assert.deepEqual(R.validerBestilling({ levering: 'post', navn: 'Maja', mobil: '90000000', adresse: 'Gata 1', postnr: '4610', sted: 'Kristiansand', angrerett: true }), {});
  assert.deepEqual(Object.keys(R.validerBestilling({ levering: 'hent', navn: 'Maja', mobil: '90000000', angrerett: true })), ['dato']);
  assert.ok(R.validerBestilling({ levering: 'post', navn: 'M', mobil: '9', adresse: 'a', postnr: '46', sted: 's', angrerett: true }).postnr);
});

test('Data: alle forslag og par peker på ingredienser som finnes', () => {
  const ids = new Set([...D.BASER.map(b => b.id), ...D.TOPPINGS.map(t => t.id)]);
  for (const f of D.FORSLAG) {
    assert.ok(ids.has(f.base), f.navn);
    for (const t of f.toppings) assert.ok(ids.has(t), f.navn + ': ' + t);
    assert.ok(f.toppings.length <= 3);
  }
  for (const p of D.PAR) for (const id of p.par) assert.ok(ids.has(id), id);
  for (const e of D.EKSEMPLER) { assert.ok(ids.has(e.design.base)); for (const t of e.design.toppings) assert.ok(ids.has(t)); }
});

test('beskriv: lager lesbar tekst av designet', () => {
  assert.equal(R.beskriv({ base: 'melk', toppings: [] }), 'Melkesjokolade');
  assert.equal(R.beskriv({ base: 'melk', toppings: ['lakris'] }), 'Melkesjokolade med lakris');
  assert.equal(R.beskriv({ base: 'mork', toppings: ['bringebaer', 'lakris', 'havsalt'] }), 'Mørk sjokolade med bringebær, lakris og havsalt');
});
