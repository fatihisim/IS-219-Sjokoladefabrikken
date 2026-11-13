/* SjokoDesigneren – grensesnittet. Tilstand, steg, skjemaer og hendelser.
   All logikk som avgjør hva som er tillatt, ligger i regler.js. */
(function () {
  'use strict';
  var D = window.SjokoData, R = window.Regler, P = window.Plate, esc = P.esc;
  var NØKKEL = 'sjokodesigneren-utkast';
  var STEG = ['Start', 'Smaker', 'Design', 'Bestilling', 'Ferdig'];

  function tomtDesign() {
    return { base: null, toppings: [], form: 'plate', motiv: 'ingen', anledning: null, til: '', hilsen: '', innpakning: 'baer', bilde: null };
  }
  var S = {
    steg: 1, design: tomtDesign(), unngaa: [], kategori: 'alle',
    prof: { aapen: false, svar: {}, resultat: null },
    bestilling: { levering: 'post', navn: '', mobil: '', adresse: '', postnr: '', sted: '', dato: '', antall: '2', angrerett: false },
    visning: 'plate', start: null, ordre: null, feil: {}
  };

  var $trinn = document.getElementById('trinn');
  var $visning = document.getElementById('visning');
  var $steg = document.getElementById('steg');
  var $melding = document.getElementById('melding');
  var $app = document.getElementById('app');

  /* ---------- lagring (bare i denne nettleseren) ---------- */
  function lagre() {
    try {
      var d = JSON.parse(JSON.stringify(S.design)); d.bilde = null;
      localStorage.setItem(NØKKEL, JSON.stringify({ design: d, unngaa: S.unngaa }));
    } catch (e) { /* lagring er en bekvemmelighet, ikke et krav */ }
  }
  function hentUtkast() {
    try {
      var u = JSON.parse(localStorage.getItem(NØKKEL) || 'null');
      if (u && u.design && u.design.base && R.base(u.design.base)) return u;
    } catch (e) { }
    return null;
  }

  /* ---------- små hjelpere ---------- */
  var meldingTid;
  function si(tekst) {
    $melding.textContent = tekst; $melding.classList.add('vis');
    clearTimeout(meldingTid);
    meldingTid = setTimeout(function () { $melding.classList.remove('vis'); }, 5000);
  }
  function kr(n) { return n + ' kr'; }
  function liste(navn) { return navn.join(', '); }
  function allergenTekst(ing) {
    var t = ing.allergener.length ? 'Inneholder ' + liste(R.navnPaa(ing.allergener)) : 'Ingen av allergenene på listen';
    return t;
  }
  function minDato() {
    var d = new Date(); d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  }

  /* ---------- stegviser ---------- */
  function tegnSteg() {
    $steg.innerHTML = STEG.map(function (navn, i) {
      var n = i + 1, kl = n === S.steg ? 'naa' : n < S.steg ? 'ferdig' : 'senere';
      var innhold = '<span class="nr" aria-hidden="true">' + n + '</span><span class="navn">' + navn + '</span>';
      if (n < S.steg && S.steg < 5) return '<li class="' + kl + '"><button type="button" data-gaa="' + n + '">' + innhold + '<span class="sr"> (fullført, gå tilbake)</span></button></li>';
      return '<li class="' + kl + '"' + (n === S.steg ? ' aria-current="step"' : '') + '><span class="punkt">' + innhold + '</span></li>';
    }).join('');
  }

  /* ---------- forhåndsvisning ---------- */
  function tegnVisning(anim) {
    var vis = S.steg >= 2 && S.steg <= 4;
    $visning.hidden = !vis;
    $app.classList.toggle('to-kolonner', vis);
    $visning.classList.toggle('rolig', S.steg === 4);
    if (!vis) return;
    anim = anim || {};
    var d = S.design, a = R.allergenerFor(d), p = R.pris(d, null);
    var h = '<div class="faner" role="group" aria-label="Velg forhåndsvisning">' +
      '<button type="button" data-visning="plate" aria-pressed="' + (S.visning === 'plate') + '">Platen</button>' +
      '<button type="button" data-visning="innpakning" aria-pressed="' + (S.visning === 'innpakning') + '">Esken</button></div>';
    h += '<div class="benk scene' + (anim.ny ? ' dunk' : '') + '">' +
      (S.visning === 'plate' ? P.tegnPlate(d, { alt: altTekst(), ny: anim.ny, pop: anim.pop, stempel: anim.stempel }) : P.tegnInnpakning(d)) +
      (d.base ? '<p class="pris-linje prislapp"><span>' + kr(p.sum) + '</span> <small>eksempelpris, uten frakt</small></p>' : '') +
      (d.base ? '<button type="button" class="pip" data-visning="' + (S.visning === 'plate' ? 'innpakning' : 'plate') + '">' +
        (S.visning === 'plate' ? P.tegnInnpakning(d) : P.tegnPlate(d, { alt: 'Platen' })) + '<span>Se ' + (S.visning === 'plate' ? 'esken' : 'platen') + '</span></button>' : '') + '</div>';
    if (d.toppings.length) {
      h += '<ul class="valgte" aria-label="Valgte toppinger. Trykk for å fjerne.">' + d.toppings.map(function (id) {
        var t = R.topping(id);
        return '<li><button type="button" class="valgt-brikke" data-topping="' + id + '">' + P.ikon(id) + '<span>' + esc(t.navn) + '</span><span class="kryss" aria-hidden="true">×</span><span class="sr"> – fjern fra platen</span></button></li>';
      }).join('') + '</ul>';
    }
    h += '<div class="visning-info" aria-live="polite">';
    if (d.base) {
      h += '<p class="hva">' + esc(R.beskriv(d)) + '</p>';
      h += '<p class="allergen-linje"><strong>Inneholder:</strong> ' + (a.inneholder.length ? esc(liste(R.navnPaa(a.inneholder))) : 'ingen av allergenene på listen') + '</p>';
      if (a.spor.length) h += '<p class="allergen-linje svak"><strong>Kan inneholde spor av:</strong> ' + esc(liste(R.navnPaa(a.spor))) + '</p>';
    } else {
      h += '<p class="svak">Platen din vises her. Velg en sjokolade og dryss på topping!</p>';
    }
    h += '</div>';
    $visning.innerHTML = h;
    if (anim.ny && anim.ny !== 'alle') {
      var boble = document.createElement('div');
      boble.className = 'boble'; boble.setAttribute('aria-hidden', 'true');
      boble.textContent = '+ ' + R.topping(anim.ny).navn + '!';
      var scene = $visning.querySelector('.scene');
      scene.appendChild(boble);
      if (erBarn()) for (var i = 0; i < 12; i++) {
        var st = document.createElement('i'); st.className = 'gnist'; st.setAttribute('aria-hidden', 'true');
        st.style.cssText = '--vx:' + Math.round(Math.cos(i * .52) * (90 + (i * 37) % 70)) + 'px;--vy:' + Math.round(Math.sin(i * .52) * (70 + (i * 53) % 60)) + 'px;animation-delay:' + (500 + i * 40) + 'ms;background:' + ['#FFC83D', '#FF6FA5', '#3CC8B4', '#8E7BFF'][i % 4];
        scene.appendChild(st);
      }
    }
  }
  /* Barnemodus: når platen er til et barn, pyntes siden ekstra. */
  function erBarn() { return S.prof.svar.til === 'barn'; }
  function settHvem(v, stille) {
    var var_ = S.prof.svar.til !== v;
    S.prof.svar.til = v;
    document.documentElement.classList.toggle('barn', v === 'barn');
    ['hvem-', 'prof-til-'].forEach(function (pre) { ['barn', 'voksen'].forEach(function (x) { var e = document.getElementById(pre + x); if (e) e.checked = x === v; }); });
    if (var_ && !stille) si(v === 'barn' ? 'Barnemodus! Nå blir det ekstra pynt og stjerner.' : 'Barnemodus er skrudd av.');
  }
  /* Smaksprofessoren – egen figur tegnet for prototypen. */
  function maskot(kl) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 130" class="maskot ' + (kl || '') + '" aria-hidden="true" focusable="false">' +
      '<ellipse cx="60" cy="124" rx="34" ry="5" fill="#000" fill-opacity=".15"/>' +
      '<path d="M34 34 C20 30 20 10 36 12 C40 0 62 -2 68 10 C82 2 100 14 90 30 L88 44 H34 Z" fill="#FFFFFF" stroke="#3A1B10" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M22 78 C22 52 38 42 60 42 C82 42 98 52 98 78 C98 106 84 120 60 120 C36 120 22 106 22 78 Z" fill="#8A4B2A" stroke="#3A1B10" stroke-width="3"/>' +
      '<path d="M32 66 C36 54 46 49 56 48" fill="none" stroke="#C98A5E" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="45" cy="76" r="12" fill="#FFF" stroke="#3A1B10" stroke-width="3"/><circle cx="75" cy="76" r="12" fill="#FFF" stroke="#3A1B10" stroke-width="3"/>' +
      '<path d="M57 76 H63" stroke="#3A1B10" stroke-width="3"/><circle class="øye" cx="47" cy="77" r="4.5" fill="#3A1B10"/><circle class="øye" cx="73" cy="77" r="4.5" fill="#3A1B10"/>' +
      '<circle cx="33" cy="93" r="5" fill="#FF8FB1" fill-opacity=".8"/><circle cx="87" cy="93" r="5" fill="#FF8FB1" fill-opacity=".8"/>' +
      '<path d="M49 96 Q60 106 71 96" fill="none" stroke="#3A1B10" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M60 110 L46 103 V117 Z M60 110 L74 103 V117 Z" fill="#E91E63" stroke="#3A1B10" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="110" r="3.5" fill="#FFC83D" stroke="#3A1B10" stroke-width="2"/></svg>';
  }
  function konfetti() {
    var farger = ['#E91E63', '#FFC83D', '#2BB3A3', '#7C4DFF', '#FF7A3D'], h = '<div class="konfetti" aria-hidden="true">';
    for (var i = 0; i < 44; i++) h += '<i style="left:' + (i * 2.3 + (i * 37) % 7) % 100 + '%;background:' + farger[i % 5] + ';animation-delay:' + ((i * 53) % 900) + 'ms;animation-duration:' + (2200 + (i * 71) % 1400) + 'ms"></i>';
    return h + '</div>';
  }
  function altTekst() {
    if (!S.design.base) return 'Tom plate. Ingen sjokolade er valgt ennå.';
    var f = D.FORMER.filter(function (x) { return x.id === S.design.form; })[0].navn.toLowerCase();
    var m = S.design.motiv !== 'ingen' ? ', med motivet ' + D.MOTIVER.filter(function (x) { return x.id === S.design.motiv; })[0].navn.toLowerCase() : '';
    return 'Forhåndsvisning: ' + R.beskriv(S.design) + ', form ' + f + m + '.';
  }

  /* ---------- steg 1: start ---------- */
  function steg1() {
    var u = hentUtkast();
    var h = '<div class="start">';
    h += '<div class="start-tekst"><p class="snakk">' + maskot() + '<span>Hei! Jeg er Smaksprofessoren. Skal vi lage sjokolade?</span></p>' +
      '<h1 id="tittel" tabindex="-1">Lag din egen <em>sjokoladeplate</em></h1>' +
      '<p class="ingress">Velg sjokolade, dryss på så mye topping du vil, og se platen bli til mens du lager den. Få den sendt, eller hent den i verkstedet. Du trenger ikke lage konto.</p>' +
      '<div class="knapper"><button type="button" class="knapp hoved" data-start="blank">Start å lage!</button>' +
      (u ? '<button type="button" class="knapp" data-start="utkast">Fortsett der du slapp</button>' : '') + '</div>' +
      '<ul class="lovnader"><li>Smaksprofessoren foreslår kombinasjoner og forklarer hvorfor de passer</li><li>Du ser platen og innpakningen før du bestiller</li><li>Allergener står ved hver ingrediens og i oppsummeringen</li></ul></div>';
    h += '<div class="start-bilde benk scene">' + P.tegnPlate(D.EKSEMPLER[0].design, { alt: 'Eksempel: ' + R.beskriv(D.EKSEMPLER[0].design) + ', med en stjerne som motiv.', ny: 'alle', pop: true }) + '</div></div>';
    h += '<section class="eksempler" aria-labelledby="eks-t"><h2 id="eks-t">Eller start med et eksempel</h2><p class="svak">Du kan endre alt etterpå.</p><div class="eks-rutenett">';
    D.EKSEMPLER.forEach(function (e, i) {
      h += '<article class="eks"><div class="benk liten">' + P.tegnPlate(e.design, { alt: 'Eksempel: ' + R.beskriv(e.design) + '.' }) + '</div>' +
        '<h3>' + esc(e.navn) + '</h3><p>' + esc(R.beskriv(e.design)) + '</p>' +
        '<button type="button" class="knapp" data-start="eks" data-i="' + i + '">Start med denne<span class="sr">: ' + esc(e.navn) + '</span></button></article>';
    });
    h += '</div></section>';
    $trinn.innerHTML = h;
  }

  /* ---------- steg 2: smaker ---------- */
  function steg2() {
    var h = '<h1 id="tittel" tabindex="-1">Velg smaker</h1>';
    h += '<fieldset class="blokk"><legend>Hvem er platen til?</legend><div class="brikker">' +
      [['voksen', 'En voksen'], ['barn', 'Et barn']].map(function (v) { return '<label class="brikke stor"><input type="radio" name="hvem" id="hvem-' + v[0] + '" data-hvem="' + v[0] + '"' + (S.prof.svar.til === v[0] ? ' checked' : '') + '><span>' + v[1] + '</span></label>'; }).join('') +
      '</div><p class="hjelp">Velger du «Et barn», får siden ekstra pynt, og Smaksprofessoren foreslår barnevennlige smaker.</p></fieldset>';
    h += '<fieldset class="blokk"><legend>Skal mottakeren unngå noe?</legend><p class="hjelp">Kryss av, så sperrer vi ingredienser som inneholder det.</p><div class="brikker">';
    D.ALLERGENER.forEach(function (a) {
      h += '<label class="brikke"><input type="checkbox" id="unngaa-' + a.id + '" data-unngaa="' + a.id + '"' + (S.unngaa.indexOf(a.id) !== -1 ? ' checked' : '') + '><span>' + esc(a.navn.charAt(0).toUpperCase() + a.navn.slice(1)) + '</span></label>';
    });
    h += '</div></fieldset>';
    h += '<section class="blokk prof" aria-labelledby="prof-t"><div class="prof-hode">' + maskot('liten') + '<div><h2 id="prof-t">Smaksprofessoren</h2><p class="hjelp">Usikker på hva som passer sammen? Svar på tre spørsmål og få inntil tre forslag.</p></div>' +
      '<button type="button" class="knapp" id="prof-knapp" data-prof="veksle" aria-expanded="' + S.prof.aapen + '" aria-controls="prof-panel">' + (S.prof.aapen ? 'Skjul' : 'Få forslag') + '</button></div><div id="prof-panel"' + (S.prof.aapen ? '' : ' hidden') + '></div></section>';
    h += '<fieldset class="blokk"><legend>Sjokolade</legend><div id="baser" class="kort-rad"></div></fieldset>';
    h += '<fieldset class="blokk"><legend>Topping <span class="svak" id="teller"></span></legend><p class="hjelp">Trykk på en topping, så helles den på platen fra posen. Velg så mange du vil. Trykk en gang til for å ta den bort.</p>' +
      '<div class="filtre" role="group" aria-label="Vis kategori" id="filtre"></div><div id="toppinger" class="topping-rutenett"></div>' +
      '<p id="kommentar" class="kommentar" aria-live="polite"></p></fieldset>';
    h += navKnapper('Tilbake', 'Videre til design');
    $trinn.innerHTML = h;
    tegnProf(); tegnBaser(); tegnToppinger();
  }
  function tegnBaser() {
    var el = document.getElementById('baser'); if (!el) return;
    var tillatte = D.BASER.filter(function (b) { return R.erTillatt(b, S.unngaa); });
    var h = '';
    if (!tillatte.length) {
      h += '<p class="varsel" role="alert">Ingen av sjokoladene i eksempelutvalget er uten ' + esc(liste(R.navnPaa(S.unngaa))) + '. Ta kontakt med verkstedet, så finner de en trygg løsning sammen med deg.</p>';
    }
    D.BASER.forEach(function (b) {
      var ok = R.erTillatt(b, S.unngaa), spor = R.sporAdvarsel(b, S.unngaa);
      h += '<label class="valgkort' + (ok ? '' : ' sperret') + '"><input type="radio" name="base" id="base-' + b.id + '" value="' + b.id + '"' + (S.design.base === b.id ? ' checked' : '') + (ok ? '' : ' disabled') + '>' +
        '<span class="prøve" style="background:linear-gradient(135deg,' + b.lys + ',' + b.farge + ' 55%,' + b.mork + ')"></span><span class="kort-tekst"><strong>' + esc(b.navn) + '</strong><span>' + esc(b.beskrivelse) + '</span>' +
        '<span class="allergen">' + (ok ? esc(allergenTekst(b)) : 'Sperret: inneholder ' + esc(liste(R.navnPaa(R.sperretAv(b, S.unngaa))))) + '</span>' +
        (ok && spor.length ? '<span class="spor">Obs: kan inneholde spor av ' + esc(liste(R.navnPaa(spor))) + '</span>' : '') + '</span></label>';
    });
    el.innerHTML = h;
    var videre = document.querySelector('[data-nav="neste"]');
    if (videre) videre.disabled = !S.design.base;
  }
  function tegnToppinger() {
    var el = document.getElementById('toppinger'); if (!el) return;
    var f = '<button type="button" data-kat="alle" aria-pressed="' + (S.kategori === 'alle') + '">Alle</button>';
    D.KATEGORIER.forEach(function (k) { f += '<button type="button" data-kat="' + k.id + '" aria-pressed="' + (S.kategori === k.id) + '">' + esc(k.navn) + '</button>'; });
    document.getElementById('filtre').innerHTML = f;
    var h = '';
    D.TOPPINGS.filter(function (t) { return S.kategori === 'alle' || t.kategori === S.kategori; }).forEach(function (t) {
      var ok = R.erTillatt(t, S.unngaa), valgt = S.design.toppings.indexOf(t.id) !== -1, spor = R.sporAdvarsel(t, S.unngaa);
      h += '<button type="button" class="topping' + (ok ? '' : ' sperret') + '" data-topping="' + t.id + '" aria-pressed="' + valgt + '"' + (ok ? '' : ' aria-disabled="true"') + '>' +
        P.ikon(t.id) + '<span class="kort-tekst"><strong>' + esc(t.navn) + '</strong>' +
        '<span class="allergen">' + (ok ? esc(allergenTekst(t)) : 'Sperret: inneholder ' + esc(liste(R.navnPaa(R.sperretAv(t, S.unngaa))))) + '</span>' +
        (ok && spor.length ? '<span class="spor">Obs: kan inneholde spor av ' + esc(liste(R.navnPaa(spor))) + '</span>' : '') + '</span>' +
        '<span class="hake" aria-hidden="true">' + (valgt ? '✓' : '+') + '</span></button>';
    });
    el.innerHTML = h;
    tegnTeller();
  }
  function tegnTeller() {
    var t = document.getElementById('teller');
    if (t) t.textContent = '(' + S.design.toppings.length + ' valgt)';
    var k = document.getElementById('kommentar'); if (!k) return;
    var c = R.kommentar(S.design);
    k.className = 'kommentar' + (c ? ' ' + c.type : '');
    k.innerHTML = c ? '<strong>Smaksprofessoren:</strong> ' + esc(c.tekst) : '';
  }
  function tegnProf() {
    var el = document.getElementById('prof-panel'); if (!el) return;
    var sp = [
      { id: 'smak', tekst: 'Hva slags smak?', valg: [['sott', 'Søtt'], ['syrlig', 'Syrlig og friskt'], ['salt', 'Salt og søtt'], ['overrask', 'Overrask meg']] },
      { id: 'til', tekst: 'Hvem er platen til?', valg: [['barn', 'Et barn'], ['voksen', 'En voksen']] },
      { id: 'mot', tekst: 'Hvor modig skal den være?', valg: [['trygt', 'Trygt og kjent'], ['nytt', 'Noe nytt']] }
    ];
    var h = '<div class="spm-rad">';
    sp.forEach(function (q) {
      h += '<fieldset class="spm"><legend>' + q.tekst + '</legend><div class="brikker">';
      q.valg.forEach(function (v) {
        h += '<label class="brikke"><input type="radio" name="prof-' + q.id + '" id="prof-' + q.id + '-' + v[0] + '" data-spm="' + q.id + '" value="' + v[0] + '"' + (S.prof.svar[q.id] === v[0] ? ' checked' : '') + '><span>' + v[1] + '</span></label>';
      });
      h += '</div></fieldset>';
    });
    h += '</div><button type="button" class="knapp hoved" data-prof="vis">Vis forslag</button><div id="prof-resultat" aria-live="polite">' + profResultat() + '</div>' +
      '<p class="fotnote">Smaksprofessoren i prototypen bruker faste regler, ikke kunstig intelligens.</p>';
    el.innerHTML = h;
  }
  function profResultat() {
    var r = S.prof.resultat; if (!r) return '';
    if (r.ingenTrygge) return '<p class="varsel">Jeg har ingen forslag som er trygge med det du vil unngå. Velg selv blant ingrediensene som ikke er sperret, eller ta kontakt med verkstedet.</p>';
    var h = '<div class="forslag-rad">';
    r.forslag.forEach(function (f) {
      h += '<article class="forslag"><div class="benk liten">' + P.tegnPlate({ base: f.base, toppings: f.toppings, form: S.design.form, motiv: 'ingen' }, { alt: 'Forslag: ' + R.beskriv(f) + '.' }) + '</div>' +
        '<h3>' + esc(f.navn) + '</h3><p>' + esc(R.beskriv(f)) + '</p><p class="hvorfor"><strong>Hvorfor:</strong> ' + esc(f.hvorfor) + '</p>' +
        '<p class="allergen">Inneholder: ' + esc(liste(R.navnPaa(f.inneholder))) + '</p>' +
        '<button type="button" class="knapp" data-forslag="' + f.id + '">Bruk dette<span class="sr">: ' + esc(f.navn) + '</span></button></article>';
    });
    return h + '</div>';
  }

  /* ---------- steg 3: design ---------- */
  function radioRad(navn, valg, valgt, tegn) {
    return valg.map(function (v) {
      return '<label class="brikke stor"><input type="radio" name="' + navn + '" id="' + navn + '-' + v.id + '" value="' + v.id + '"' + (valgt === v.id ? ' checked' : '') + '>' + '<span>' + (tegn ? tegn(v) : '') + esc(v.navn) + '</span></label>';
    }).join('');
  }
  function steg3() {
    var d = S.design;
    var h = '<h1 id="tittel" tabindex="-1">Gjør den personlig</h1>';
    h += '<fieldset class="blokk"><legend>Form</legend><div class="brikker">' + radioRad('form', D.FORMER, d.form) + '</div></fieldset>';
    h += '<fieldset class="blokk"><legend>Motiv på platen</legend><p class="hjelp">Motivet støpes inn midt på platen.</p><div class="brikker">' + radioRad('motiv', D.MOTIVER, d.motiv) + '</div></fieldset>';
    h += '<fieldset class="blokk" id="innpakning-blokk"><legend>Esken</legend><p class="hjelp">Platen kommer i en eske med vindu. Bildet viser esken mens du velger her. Trykk på det lille bildet i hjørnet for å se platen igjen.</p>';
    h += '<p class="etikett" id="anl-t">Anledning (valgfritt)</p><div class="brikker" role="group" aria-labelledby="anl-t">';
    D.ANLEDNINGER.forEach(function (a) { h += '<button type="button" class="brikke-knapp" data-anledning="' + a.id + '" aria-pressed="' + (d.anledning === a.id) + '">' + esc(a.navn) + '</button>'; });
    h += '</div>';
    h += '<div class="felt"><label for="hilsen">Hilsen på esken</label><input type="text" id="hilsen" maxlength="' + D.MAKS_HILSEN + '" value="' + esc(d.hilsen) + '" aria-describedby="hilsen-t" autocomplete="off"><span class="hjelp" id="hilsen-t"></span></div>';
    h += '<div class="felt"><label for="til">Til (navn, valgfritt)</label><input type="text" id="til" maxlength="' + D.MAKS_NAVN + '" value="' + esc(d.til) + '" autocomplete="off"></div>';
    h += '<p class="etikett" id="farge-t">Farge</p><div class="brikker" role="radiogroup" aria-labelledby="farge-t">' +
      radioRad('innpakning', D.INNPAKNING, d.innpakning, function (v) { return '<span class="fargeprøve" style="background:' + v.farge + '"></span>'; }) + '</div>';
    h += '<div class="felt"><label for="bilde">Eget bilde på esken (valgfritt)</label><input type="file" id="bilde" accept="image/*" aria-describedby="bilde-t">' +
      '<span class="hjelp" id="bilde-t">Bildet blir i nettleseren din. I den ferdige tjenesten slettes det når platen er laget.</span>' +
      '<button type="button" class="lenke" id="fjern-bilde" data-bilde="fjern"' + (d.bilde ? '' : ' hidden') + '>Fjern bildet</button></div>';
    h += '</fieldset>';
    h += navKnapper('Tilbake til smaker', 'Videre til bestilling');
    $trinn.innerHTML = h;
    tellHilsen();
  }
  function tellHilsen() {
    var t = document.getElementById('hilsen-t');
    if (t) t.textContent = S.design.hilsen.length + ' av ' + D.MAKS_HILSEN + ' tegn';
  }

  /* ---------- steg 4: bestilling ---------- */
  function felt(id, etikett, type, ekstra) {
    var f = S.feil[id];
    return '<div class="felt' + (f ? ' har-feil' : '') + '"><label for="' + id + '">' + etikett + '</label><input type="' + (type || 'text') + '" id="' + id + '" data-b="' + id + '" value="' + esc(S.bestilling[id]) + '"' + (ekstra || '') + (f ? ' aria-invalid="true" aria-describedby="' + id + '-feil"' : '') + '>' +
      (f ? '<span class="feil" id="' + id + '-feil">' + esc(f) + '</span>' : '') + '</div>';
  }
  function steg4() {
    var d = S.design, b = S.bestilling, a = R.allergenerFor(d);
    var navn = function (l, id) { return l.filter(function (x) { return x.id === id; })[0].navn; };
    var h = '<h1 id="tittel" tabindex="-1">Se over og bestill</h1>';
    var antallFeil = Object.keys(S.feil).length;
    if (antallFeil) h += '<div class="varsel" role="alert" id="feil-oppsummering" tabindex="-1"><strong>' + (antallFeil === 1 ? 'Én ting mangler.' : antallFeil + ' ting mangler.') + '</strong> Se feltene merket nedenfor.</div>';
    h += '<section class="blokk" aria-labelledby="opp-t"><div class="rad-mellom"><h2 id="opp-t">Platen din</h2><button type="button" class="knapp liten" id="les-opp" data-les="1" hidden>Les opp</button></div><dl class="oppsummering">' +
      '<dt>Sjokolade og topping</dt><dd>' + esc(R.beskriv(d)) + ' <button type="button" class="lenke" data-gaa="2">Endre<span class="sr"> smaker</span></button></dd>' +
      '<dt>Form og motiv</dt><dd>' + esc(navn(D.FORMER, d.form)) + ', ' + esc(navn(D.MOTIVER, d.motiv).toLowerCase()) + ' <button type="button" class="lenke" data-gaa="3">Endre<span class="sr"> design</span></button></dd>' +
      '<dt>Eske</dt><dd>' + (d.hilsen.trim() ? '«' + esc(d.hilsen.trim()) + '»' : 'Uten hilsen') + (d.til.trim() ? ', til ' + esc(d.til.trim()) : '') + (d.bilde ? ', med eget bilde' : '') + '</dd></dl>' +
      '<div class="allergenboks"><p><strong>Inneholder:</strong> ' + (a.inneholder.length ? esc(liste(R.navnPaa(a.inneholder))) : 'ingen av allergenene på listen') + '</p>' +
      (a.spor.length ? '<p><strong>Kan inneholde spor av:</strong> ' + esc(liste(R.navnPaa(a.spor))) + '</p>' : '') +
      (S.unngaa.length ? '<p class="svak">Du ba om å unngå: ' + esc(liste(R.navnPaa(S.unngaa))) + '.</p>' : '') + '</div></section>';
    h += '<fieldset class="blokk"><legend>Hvordan vil du ha platen?</legend><div class="levering">' +
      [['post', 'Få den sendt i posten', 'Frakt ' + kr(D.PRISER.frakt) + ' (eksempelpris)'], ['hent', 'Hent ferdig plate i verkstedet', 'Posebyen i Kristiansand. Ingen frakt'], ['book', 'Lag platen selv i verkstedet', 'Ta med designet og lag den sammen med oss']].map(function (v) {
        return '<label class="valgkort"><input type="radio" name="levering" id="levering-' + v[0] + '" value="' + v[0] + '"' + (b.levering === v[0] ? ' checked' : '') + '><span class="kort-tekst"><strong>' + v[1] + '</strong><span>' + v[2] + '</span></span></label>';
      }).join('') + '</div><div id="levering-felt"></div></fieldset>';
    h += '<fieldset class="blokk"><legend>Kontakt</legend><p class="hjelp">Vi ber bare om det vi trenger for å levere platen. Du trenger ikke lage konto.</p><div class="felt-rad">' +
      felt('navn', 'Navn', 'text', ' autocomplete="name"') + felt('mobil', 'Mobilnummer', 'tel', ' autocomplete="tel" inputmode="tel"') + '</div></fieldset>';
    h += '<section class="blokk" aria-labelledby="pris-t"><h2 id="pris-t">Pris</h2><div id="pris"></div></section>';
    h += '<div class="felt avkryss' + (S.feil.angrerett ? ' har-feil' : '') + '"><label><input type="checkbox" id="angrerett" data-b="angrerett"' + (b.angrerett ? ' checked' : '') + (S.feil.angrerett ? ' aria-invalid="true" aria-describedby="angrerett-feil"' : '') + '> <span>Jeg forstår at platen lages spesielt til meg og derfor ikke kan returneres. Personlig tilpassede varer har ikke angrerett.</span></label>' +
      (S.feil.angrerett ? '<span class="feil" id="angrerett-feil">' + esc(S.feil.angrerett) + '</span>' : '') + '</div>';
    h += '<div class="nav"><button type="button" class="knapp" data-nav="forrige">Tilbake til design</button><button type="button" class="knapp hoved" data-bestill="1">Betal med Vipps</button></div>' +
      '<p class="fotnote">Prototype: ingen betaling gjennomføres, og ingenting sendes ut av nettleseren din.</p>';
    $trinn.innerHTML = h;
    tegnLeveringFelt(); tegnPris();
    if ('speechSynthesis' in window && window.SpeechSynthesisUtterance) document.getElementById('les-opp').hidden = false;
  }
  function tegnLeveringFelt() {
    var el = document.getElementById('levering-felt'); if (!el) return;
    var l = S.bestilling.levering, h = '';
    if (l === 'post') h = felt('adresse', 'Adresse', 'text', ' autocomplete="street-address"') + '<div class="felt-rad">' + felt('postnr', 'Postnummer', 'text', ' autocomplete="postal-code" inputmode="numeric" maxlength="4"') + felt('sted', 'Poststed', 'text', ' autocomplete="address-level2"') + '</div><p class="hjelp">Leveringstid er ikke avklart med verkstedet ennå.</p>';
    else if (l === 'hent') h = felt('dato', 'Når vil du hente?', 'date', ' min="' + minDato() + '"') + '<p class="hjelp">Tidligste dato i prototypen er tre dager fram.</p>';
    else h = '<div class="felt-rad">' + felt('dato', 'Hvilken dag vil dere komme?', 'date', ' min="' + minDato() + '"') + '<div class="felt"><label for="antall">Antall personer</label><select id="antall" data-b="antall">' + [1, 2, 3, 4, 5, 6, 8, 10].map(function (n) { return '<option' + (String(n) === S.bestilling.antall ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></div></div><p class="hjelp">Verkstedet bekrefter tidspunktet. Pris for verkstedbesøk er ikke satt i prototypen.</p>';
    el.innerHTML = h;
  }
  function tegnPris() {
    var el = document.getElementById('pris'); if (!el) return;
    var p = R.pris(S.design, S.bestilling.levering);
    el.innerHTML = '<table class="pris"><tbody>' + p.linjer.map(function (l) { return '<tr><th scope="row">' + esc(l.navn) + '</th><td>' + kr(l.kr) + '</td></tr>'; }).join('') +
      '</tbody><tfoot><tr><th scope="row">Å betale</th><td>' + kr(p.sum) + '</td></tr></tfoot></table><p class="fotnote">Alle priser er eksempelpriser.</p>';
  }

  /* ---------- steg 5: ferdig ---------- */
  function steg5() {
    var o = S.ordre, d = S.design;
    var neste = o.levering === 'post' ? 'Platen lages og sendes til ' + esc(o.sted) + '.' : o.levering === 'hent' ? 'Platen er klar til henting i verkstedet ' + esc(norskDato(o.dato)) + '.' : 'Verkstedet bekrefter besøket ' + esc(norskDato(o.dato)) + ' for ' + esc(o.antall) + (o.antall === '1' ? ' person.' : ' personer.');
    var h = konfetti() + '<div class="kvittering"><p class="merkelapp">Bestilling ' + esc(o.nr) + '</p><h1 id="tittel" tabindex="-1">Takk, ' + esc(o.navn.split(' ')[0]) + '!</h1>' +
      '<p class="ingress">' + neste + ' Du får en bekreftelse på SMS til ' + esc(o.mobil) + '.</p>' +
      '<p class="varsel rolig">Dette er en prototype. Ingen bestilling er sendt, og ingen betaling er trukket.</p>';
    h += '<div class="kvittering-bilder"><div class="benk scene">' + P.tegnPlate(d, { alt: altTekst(), ny: 'alle', pop: true }) + '</div><div class="benk">' + P.tegnInnpakning(d) + '</div></div>';
    h += '<dl class="oppsummering"><dt>Platen</dt><dd>' + esc(R.beskriv(d)) + '</dd><dt>Betalt</dt><dd>' + kr(o.sum) + ' (eksempelpris)</dd><dt>Tid brukt</dt><dd>' + esc(o.tid) + '</dd></dl>';
    h += '<div class="knapper"><button type="button" class="knapp" data-kopier="1">Kopier oppsummering</button><button type="button" class="knapp hoved" data-start="ny">Lag en ny plate</button></div>' +
      '<p class="svak">Designet er lagret i denne nettleseren, så du kan hente det fram igjen fra forsiden.</p><textarea id="kopi" class="kopi" readonly hidden aria-label="Oppsummering du kan kopiere"></textarea></div>';
    $trinn.innerHTML = h;
  }
  function norskDato(iso) {
    if (!iso) return '';
    var d = iso.split('-'); return Number(d[2]) + '.' + Number(d[1]) + '.' + d[0];
  }
  function oppsummeringTekst() {
    var d = S.design, a = R.allergenerFor(d);
    var t = 'Min sjokoladeplate: ' + R.beskriv(d) + '.';
    if (d.hilsen.trim()) t += ' Hilsen: «' + d.hilsen.trim() + '».';
    t += ' Inneholder: ' + (a.inneholder.length ? liste(R.navnPaa(a.inneholder)) : 'ingen av allergenene på listen') + '.';
    if (a.spor.length) t += ' Kan inneholde spor av: ' + liste(R.navnPaa(a.spor)) + '.';
    return t;
  }

  function navKnapper(tilbake, videre) {
    return '<div class="nav"><button type="button" class="knapp" data-nav="forrige">' + tilbake + '</button><button type="button" class="knapp hoved" data-nav="neste">' + videre + '</button></div>';
  }

  /* ---------- navigasjon ---------- */
  function gaa(n, fokus) {
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) { } }
    S.steg = n;
    clearTimeout(meldingTid); $melding.classList.remove('vis');
    [null, steg1, steg2, steg3, steg4, steg5][n]();
    tegnSteg(); tegnVisning();
    if (fokus !== false) {
      var t = document.getElementById('feil-oppsummering') || document.getElementById('tittel');
      if (t) t.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }
  function start(design, unngaa) {
    S.design = design; S.unngaa = unngaa || []; S.start = Date.now(); S.ordre = null; S.feil = {};
    S.prof = { aapen: false, svar: {}, resultat: null }; S.kategori = 'alle'; S.visning = 'plate';
    document.documentElement.classList.remove('barn');
    S.bestilling.angrerett = false;
    gaa(2);
  }

  /* ---------- hendelser ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('button'); if (!el) return;
    var ds = el.dataset;
    if (ds.start) {
      if (ds.start === 'eks') { var k = JSON.parse(JSON.stringify(D.EKSEMPLER[Number(ds.i)].design)); k.bilde = null; start(k, []); }
      else if (ds.start === 'utkast') { var u = hentUtkast(); if (u) { var dd = tomtDesign(); Object.keys(u.design).forEach(function (n) { dd[n] = u.design[n]; }); start(dd, u.unngaa || []); } }
      else if (ds.start === 'ny') { S.steg = 1; gaa(1); }
      else start(tomtDesign(), []);
    } else if (ds.gaa) { gaa(Number(ds.gaa)); }
    else if (ds.nav === 'forrige') { gaa(S.steg - 1); }
    else if (ds.nav === 'neste') {
      if (S.steg === 2 && !S.design.base) { si('Velg en sjokolade før du går videre.'); return; }
      gaa(S.steg + 1);
    } else if (ds.visning) { S.visning = ds.visning; tegnVisning(); var pk = $visning.querySelector('[data-visning][aria-pressed="true"]'); if (pk && el.classList.contains('pip')) pk.focus({ preventScroll: true }); }
    else if (ds.kat) { S.kategori = ds.kat; tegnToppinger(); var kn = document.querySelector('[data-kat="' + ds.kat + '"]'); if (kn) kn.focus(); }
    else if (ds.topping) {
      var r = R.veksleTopping(S.design, ds.topping, S.unngaa);
      if (!r.ok) { si(r.grunn); return; }
      var lagtTil = r.toppings.length > S.design.toppings.length;
      S.design.toppings = r.toppings; lagre();
      if (lagtTil) S.visning = 'plate';
      tegnToppinger(); tegnVisning(lagtTil ? { ny: ds.topping } : null);
      var tk = document.querySelector('#toppinger [data-topping="' + ds.topping + '"]');
      if (tk) { tk.focus({ preventScroll: true }); if (lagtTil) tk.classList.add('hopp'); }
    } else if (ds.prof === 'veksle') {
      S.prof.aapen = !S.prof.aapen;
      document.getElementById('prof-panel').hidden = !S.prof.aapen;
      el.setAttribute('aria-expanded', S.prof.aapen); el.textContent = S.prof.aapen ? 'Skjul' : 'Få forslag';
    } else if (ds.prof === 'vis') {
      S.prof.resultat = R.foreslaa(S.prof.svar, S.unngaa);
      document.getElementById('prof-resultat').innerHTML = profResultat();
    } else if (ds.forslag) {
      var fs = D.FORSLAG.filter(function (x) { return x.id === ds.forslag; })[0];
      S.design.base = fs.base; S.design.toppings = fs.toppings.slice(); S.visning = 'plate'; lagre();
      tegnBaser(); tegnToppinger(); tegnVisning({ ny: 'alle', pop: true });
      si('«' + fs.navn + '» er valgt. Du kan endre alt nedenfor.');
    } else if (ds.anledning) {
      var an = D.ANLEDNINGER.filter(function (x) { return x.id === ds.anledning; })[0];
      var forrige = D.ANLEDNINGER.filter(function (x) { return x.id === S.design.anledning; })[0];
      var av = S.design.anledning === an.id;
      if (!S.design.hilsen.trim() || (forrige && S.design.hilsen === forrige.hilsen)) S.design.hilsen = av ? '' : an.hilsen;
      S.design.anledning = av ? null : an.id;
      document.getElementById('hilsen').value = S.design.hilsen; tellHilsen();
      document.querySelectorAll('[data-anledning]').forEach(function (k2) { k2.setAttribute('aria-pressed', k2.dataset.anledning === S.design.anledning); });
      S.visning = av ? 'plate' : 'innpakning'; lagre(); tegnVisning(av ? { pop: true } : null);
    } else if (ds.bilde === 'fjern') {
      S.design.bilde = null; document.getElementById('bilde').value = ''; el.hidden = true; tegnVisning(); tegnPris();
    } else if (ds.bestill) { bestill(); }
    else if (ds.les) { lesOpp(el); }
    else if (ds.kopier) { kopier(); }
  });

  document.addEventListener('change', function (e) {
    var el = e.target, ds = el.dataset;
    if (ds.unngaa) {
      var pos = S.unngaa.indexOf(ds.unngaa);
      if (el.checked && pos === -1) S.unngaa.push(ds.unngaa); else if (!el.checked && pos !== -1) S.unngaa.splice(pos, 1);
      var r = R.ryddEtterUnngaa(S.design, S.unngaa);
      S.design.base = r.base; S.design.toppings = r.toppings;
      if (r.fjernet.length) si('Fjernet fra platen fordi det ikke lenger er trygt: ' + r.fjernet.join(', ') + '.');
      if (S.prof.resultat) { S.prof.resultat = R.foreslaa(S.prof.svar, S.unngaa); var pr = document.getElementById('prof-resultat'); if (pr) pr.innerHTML = profResultat(); }
      lagre(); tegnBaser(); tegnToppinger(); tegnVisning();
    } else if (el.name === 'base') { S.design.base = el.value; S.visning = 'plate'; lagre(); tegnBaser(); tegnTeller(); tegnVisning({ pop: true }); var bb = document.getElementById('base-' + el.value); if (bb) bb.focus(); }
    else if (ds.hvem) { settHvem(ds.hvem); if (S.prof.resultat) { S.prof.resultat = R.foreslaa(S.prof.svar, S.unngaa); var pr2 = document.getElementById('prof-resultat'); if (pr2) pr2.innerHTML = profResultat(); } }
    else if (ds.spm) { if (ds.spm === 'til') settHvem(el.value); else S.prof.svar[ds.spm] = el.value; }
    else if (el.name === 'form' || el.name === 'motiv') { S.design[el.name] = el.value; S.visning = 'plate'; lagre(); tegnVisning(el.name === 'motiv' ? { stempel: true } : { pop: true }); }
    else if (el.name === 'innpakning') { S.design.innpakning = el.value; S.visning = 'innpakning'; lagre(); tegnVisning(); }
    else if (el.id === 'bilde') { lastBilde(el); }
    else if (el.name === 'levering') { S.bestilling.levering = el.value; tegnLeveringFelt(); tegnPris(); }
    else if (ds.b) { S.bestilling[ds.b] = el.type === 'checkbox' ? el.checked : el.value; }
  });

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'hilsen' || el.id === 'til') {
      S.design[el.id] = el.value;
      if (S.visning !== 'innpakning') S.visning = 'innpakning';
      if (el.id === 'hilsen') tellHilsen();
      lagre(); tegnVisning();
    } else if (el.dataset.b && el.type !== 'checkbox') { S.bestilling[el.dataset.b] = el.value; }
  });

  function lastBilde(el) {
    var fil = el.files && el.files[0]; if (!fil) return;
    if (!/^image\//.test(fil.type)) { si('Filen er ikke et bilde. Velg en JPG- eller PNG-fil.'); el.value = ''; return; }
    if (fil.size > 4 * 1024 * 1024) { si('Bildet er for stort. Velg et bilde under 4 MB.'); el.value = ''; return; }
    var les = new FileReader();
    les.onload = function () { S.design.bilde = les.result; S.visning = 'innpakning'; document.getElementById('fjern-bilde').hidden = false; tegnVisning(); };
    les.onerror = function () { si('Klarte ikke å lese bildet. Prøv et annet.'); };
    les.readAsDataURL(fil);
  }

  function bestill() {
    S.feil = R.validerBestilling(S.bestilling);
    var designFeil = R.validerDesign(S.design);
    if (designFeil.length) { si(designFeil[0]); gaa(2); return; }
    if (Object.keys(S.feil).length) { gaa(4); return; }
    var ms = Date.now() - (S.start || Date.now()), min = Math.floor(ms / 60000), sek = Math.round((ms % 60000) / 1000);
    var b = S.bestilling;
    S.ordre = {
      nr: 'DEMO-' + String(Math.floor(1000 + Math.random() * 9000)), navn: b.navn.trim(), mobil: b.mobil.trim(), levering: b.levering,
      sted: b.sted.trim(), dato: b.dato, antall: b.antall, sum: R.pris(S.design, b.levering).sum,
      tid: (min ? min + ' min ' : '') + sek + ' sek'
    };
    lagre(); gaa(5);
  }

  function lesOpp(knapp) {
    var syn = window.speechSynthesis;
    try {
      if (syn.speaking) { syn.cancel(); knapp.textContent = 'Les opp'; return; }
      var u = new SpeechSynthesisUtterance(oppsummeringTekst() + ' Pris: ' + R.pris(S.design, S.bestilling.levering).sum + ' kroner.');
      u.lang = 'nb-NO';
      u.onend = u.onerror = function () { knapp.textContent = 'Les opp'; };
      knapp.textContent = 'Stopp opplesning';
      syn.speak(u);
    } catch (e) { si('Opplesning er ikke tilgjengelig i denne nettleseren.'); knapp.textContent = 'Les opp'; }
  }

  function kopier() {
    var tekst = oppsummeringTekst(), felt2 = document.getElementById('kopi');
    function reserve() { felt2.hidden = false; felt2.value = tekst; felt2.focus(); felt2.select(); si('Marker teksten og kopier den.'); }
    try { navigator.clipboard.writeText(tekst).then(function () { si('Oppsummeringen er kopiert.'); }, reserve); }
    catch (e) { reserve(); }
  }

  document.documentElement.lang = 'nb';
  gaa(1, false);
})();
