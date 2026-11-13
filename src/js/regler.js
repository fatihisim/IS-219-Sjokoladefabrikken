/* SjokoDesigneren – forretningsregler (FR1–FR5 i spesifikasjonen).
   Rene funksjoner uten DOM, slik at de kan testes uavhengig av grensesnittet. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(require('./data.js')); }
  else { root.Regler = factory(root.SjokoData); }
})(typeof self !== 'undefined' ? self : this, function (D) {

  function finn(liste, id) {
    for (var i = 0; i < liste.length; i++) { if (liste[i].id === id) return liste[i]; }
    return null;
  }
  function base(id) { return finn(D.BASER, id); }
  function topping(id) { return finn(D.TOPPINGS, id); }
  function allergenNavn(id) { var a = finn(D.ALLERGENER, id); return a ? a.navn : id; }

  function unik(liste) {
    var ut = [];
    liste.forEach(function (x) { if (ut.indexOf(x) === -1) ut.push(x); });
    return ut;
  }
  /* Sorterer allergener i samme rekkefølge som D.ALLERGENER, så visningen er stabil. */
  function sorter(ids) {
    var rekke = D.ALLERGENER.map(function (a) { return a.id; });
    return ids.slice().sort(function (a, b) { return rekke.indexOf(a) - rekke.indexOf(b); });
  }

  /* FR3: tillatt når ingen av ingrediensens allergener står på unngå-listen. */
  function erTillatt(ingrediens, unngaa) {
    if (!ingrediens) return false;
    return !ingrediens.allergener.some(function (a) { return unngaa.indexOf(a) !== -1; });
  }
  /* Hvilke allergener på unngå-listen som sperrer ingrediensen. */
  function sperretAv(ingrediens, unngaa) {
    return ingrediens.allergener.filter(function (a) { return unngaa.indexOf(a) !== -1; });
  }
  /* Spor gir advarsel, ikke sperre. */
  function sporAdvarsel(ingrediens, unngaa) {
    return ingrediens.spor.filter(function (a) { return unngaa.indexOf(a) !== -1; });
  }

  /* FR1 og FR2. */
  function allergenerFor(design) {
    var deler = [];
    var b = base(design.base);
    if (b) deler.push(b);
    (design.toppings || []).forEach(function (id) { var t = topping(id); if (t) deler.push(t); });
    var inneholder = [], spor = [];
    deler.forEach(function (d) { inneholder = inneholder.concat(d.allergener); spor = spor.concat(d.spor); });
    inneholder = sorter(unik(inneholder));
    spor = sorter(unik(spor).filter(function (a) { return inneholder.indexOf(a) === -1; }));
    return { inneholder: inneholder, spor: spor };
  }

  /* FR4 + rangering. Returnerer høyst tre forslag, hvert med forklaring. */
  function foreslaa(svar, unngaa) {
    svar = svar || {};
    unngaa = unngaa || [];
    var tillatte = D.FORSLAG.filter(function (f) {
      return erTillatt(base(f.base), unngaa) &&
        f.toppings.every(function (id) { return erTillatt(topping(id), unngaa); });
    });
    var rangert = tillatte.map(function (f, i) {
      var p = 0;
      if (svar.smak === 'overrask') { if (f.mot === 'nytt') p += 2; }
      else if (svar.smak && f.smak === svar.smak) p += 2;
      if (svar.til && f.til.indexOf(svar.til) !== -1) p += 2;
      if (svar.til === 'barn' && f.til.indexOf('barn') === -1) p -= 3;
      if (svar.mot && f.mot === svar.mot) p += 1;
      return { f: f, p: p, i: i };
    }).sort(function (a, b) { return b.p - a.p || a.i - b.i; });

    var forslag = rangert.slice(0, 3).map(function (r) {
      var a = allergenerFor(r.f);
      return {
        id: r.f.id, navn: r.f.navn, base: r.f.base, toppings: r.f.toppings.slice(),
        hvorfor: r.f.hvorfor, inneholder: a.inneholder, spor: a.spor
      };
    });
    return { forslag: forslag, ingenTrygge: tillatte.length === 0 };
  }

  /* FK6: kommentar til kundens egne valg. «ukjent» er et gyldig svar. */
  function kommentar(design) {
    if (!design.base || !(design.toppings || []).length) return null;
    var valgt = [design.base].concat(design.toppings);
    var treff = D.PAR.filter(function (p) {
      return valgt.indexOf(p.par[0]) !== -1 && valgt.indexOf(p.par[1]) !== -1;
    });
    if (treff.length) return { type: 'kjent', tekst: treff.map(function (t) { return t.tekst; }).join(' ') };
    return { type: 'ukjent', tekst: 'Denne kombinasjonen har jeg ingen regel for. Den kan være god, men jeg kan ikke love noe.' };
  }

  /* FK7: legg til eller fjern en topping. */
  function veksleTopping(design, id, unngaa) {
    var liste = (design.toppings || []).slice();
    var pos = liste.indexOf(id);
    if (pos !== -1) { liste.splice(pos, 1); return { ok: true, toppings: liste }; }
    var t = topping(id);
    if (!t) return { ok: false, toppings: liste, grunn: 'Ukjent topping.' };
    if (!erTillatt(t, unngaa || [])) return { ok: false, toppings: liste, grunn: t.navn + ' inneholder noe du har bedt om å unngå.' };
    liste.push(id);
    return { ok: true, toppings: liste };
  }

  /* Edge case: unngå-listen endres etter at kunden har valgt. */
  function ryddEtterUnngaa(design, unngaa) {
    var fjernet = [];
    var ny = { base: design.base, toppings: [] };
    if (design.base && !erTillatt(base(design.base), unngaa)) { fjernet.push(base(design.base).navn); ny.base = null; }
    (design.toppings || []).forEach(function (id) {
      var t = topping(id);
      if (t && erTillatt(t, unngaa)) ny.toppings.push(id); else if (t) fjernet.push(t.navn);
    });
    return { base: ny.base, toppings: ny.toppings, fjernet: fjernet };
  }

  /* FR5. levering: 'post' | 'hent' | 'book'. */
  function pris(design, levering) {
    var P = D.PRISER;
    var linjer = [{ navn: 'Sjokoladeplate', kr: P.plate }];
    var n = (design.toppings || []).length;
    if (n) linjer.push({ navn: n + (n === 1 ? ' topping' : ' toppinger'), kr: n * P.topping });
    if (design.motiv && design.motiv !== 'ingen') linjer.push({ navn: 'Motiv', kr: P.motiv });
    if (design.bilde) linjer.push({ navn: 'Eget bilde på innpakningen', kr: P.bilde });
    if (levering === 'post') linjer.push({ navn: 'Frakt', kr: P.frakt });
    var sum = linjer.reduce(function (s, l) { return s + l.kr; }, 0);
    return { linjer: linjer, sum: sum };
  }

  function validerDesign(design) {
    var feil = [];
    if (!design.base) feil.push('Velg en sjokolade.');
    if ((design.hilsen || '').length > D.MAKS_HILSEN) feil.push('Hilsenen kan være høyst ' + D.MAKS_HILSEN + ' tegn.');
    if ((design.til || '').length > D.MAKS_NAVN) feil.push('Navnet kan være høyst ' + D.MAKS_NAVN + ' tegn.');
    return feil;
  }

  /* AK5: påkrevde felt for bestilling. Returnerer { feltId: feilmelding }. */
  function validerBestilling(b) {
    var feil = {};
    function tom(v) { return !v || !String(v).trim(); }
    if (tom(b.navn)) feil.navn = 'Skriv navnet ditt.';
    if (tom(b.mobil) || !/^[0-9 +]{8,}$/.test(String(b.mobil).trim())) feil.mobil = 'Skriv et mobilnummer med minst 8 siffer.';
    if (b.levering === 'post') {
      if (tom(b.adresse)) feil.adresse = 'Skriv adressen platen skal sendes til.';
      if (!/^[0-9]{4}$/.test(String(b.postnr || '').trim())) feil.postnr = 'Postnummer har fire siffer.';
      if (tom(b.sted)) feil.sted = 'Skriv poststed.';
    } else {
      if (tom(b.dato)) feil.dato = 'Velg en dato.';
    }
    if (!b.angrerett) feil.angrerett = 'Du må bekrefte at du har lest dette før du kan bestille.';
    return feil;
  }

  function beskriv(design) {
    var b = base(design.base);
    if (!b) return '';
    var t = (design.toppings || []).map(function (id) { return topping(id).kort; });
    var tekst = b.kort.charAt(0).toUpperCase() + b.kort.slice(1);
    if (t.length === 1) tekst += ' med ' + t[0];
    else if (t.length > 1) tekst += ' med ' + t.slice(0, -1).join(', ') + ' og ' + t[t.length - 1];
    return tekst;
  }

  function navnPaa(ids) { return ids.map(allergenNavn); }

  return {
    base: base, topping: topping, allergenNavn: allergenNavn, navnPaa: navnPaa,
    erTillatt: erTillatt, sperretAv: sperretAv, sporAdvarsel: sporAdvarsel,
    allergenerFor: allergenerFor, foreslaa: foreslaa, kommentar: kommentar,
    veksleTopping: veksleTopping, ryddEtterUnngaa: ryddEtterUnngaa,
    pris: pris, validerDesign: validerDesign, validerBestilling: validerBestilling, beskriv: beskriv
  };
});
