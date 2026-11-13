/* SjokoDesigneren – tegner platen, esken og toppingene som SVG ut fra et design.
   Samme design gir alltid samme tegning. Hver topping har faste plasser på platen,
   slik at biter ikke flytter seg når kunden legger til eller fjerner andre toppinger. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(require('./data.js'), require('./regler.js')); }
  else { root.Plate = factory(root.SjokoData, root.Regler); }
})(typeof self !== 'undefined' ? self : this, function (D, R) {

  var teller = 0;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function f(n) { return Math.round(n * 10) / 10; }

  function hash(tekst) {
    var h = 2166136261;
    for (var i = 0; i < tekst.length; i++) { h ^= tekst.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function tilfeldig(seed) {
    var a = seed;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var HJERTE = 'M180 236 C70 158 34 70 104 46 C142 34 172 58 180 84 C188 58 218 34 256 46 C326 70 290 158 180 236 Z';

  function formSvg(form) {
    if (form === 'hjerte') return '<path d="' + HJERTE + '"/>';
    if (form === 'rund') return '<circle cx="180" cy="134" r="104"/>';
    return '<rect x="24" y="38" width="312" height="192" rx="16"/>';
  }
  function innenfor(form, x, y) {
    if (form === 'rund') { var dx = x - 180, dy = y - 134; return dx * dx + dy * dy < 86 * 86; }
    if (form === 'hjerte') {
      var u = (x - 180) / 96, v = (146 - y) / 88;
      var k = u * u + v * v - 1;
      return k * k * k - u * u * v * v * v < -0.06;
    }
    return x > 44 && x < 316 && y > 58 && y < 210;
  }

  /* Faste plasser, jevnt spredt over platen («beste kandidat»): hvert nye punkt legges der det er mest ledig. */
  var PER = 16, plassLager = {};
  function plasser(form, medMotiv) {
    var nokkel = form + (medMotiv ? '|m' : '');
    if (plassLager[nokkel]) return plassLager[nokkel];
    var rnd = tilfeldig(hash('plasser|' + nokkel)), pkt = [], maks = D.TOPPINGS.length * PER;
    /* Én runde gir én plass til hver topping. En ny plass skal ligge langt fra alle andre biter,
       og ekstra langt fra biter av samme topping, slik at ingen topping klumper seg. */
    var nT = D.TOPPINGS.length;
    for (var i = 0; i < maks; i++) {
      var best = null, bd = -1, eier = i % nT;
      for (var k = 0; k < 40; k++) {
        var x = 30 + rnd() * 300, y = 40 + rnd() * 190;
        if (!innenfor(form, x, y)) continue;
        if (medMotiv) { var mx = (x - 180) / 66, my = (y - 134) / 54; if (mx * mx + my * my < 1) continue; }
        var d = 1e9;
        for (var j = 0; j < pkt.length; j++) {
          if (!pkt[j]) continue;
          var ex = pkt[j][0] - x, ey = pkt[j][1] - y, e = ex * ex + ey * ey;
          if (j % nT === eier) e /= 9;
          if (e < d) d = e;
        }
        if (d > bd) { bd = d; best = [x, y]; }
      }
      pkt.push(best);
    }
    plassLager[nokkel] = pkt;
    return pkt;
  }

  function stjerne(r1, r2) {
    var p = [];
    for (var i = 0; i < 10; i++) {
      var r = i % 2 ? r2 : r1, a = -Math.PI / 2 + i * Math.PI / 5;
      p.push(f(Math.cos(a) * r) + ',' + f(Math.sin(a) * r));
    }
    return '<polygon points="' + p.join(' ') + '"/>';
  }
  function motivSvg(id) {
    if (id === 'hjerte') return '<path d="M0 34 C-50 2 -46 -38 -18 -38 C-7 -38 0 -27 0 -20 C0 -27 7 -38 18 -38 C46 -38 50 2 0 34 Z"/>';
    if (id === 'stjerne') return stjerne(42, 18);
    if (id === 'blomst') {
      var s = '';
      for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; s += '<circle cx="' + f(Math.cos(a) * 24) + '" cy="' + f(Math.sin(a) * 24) + '" r="15"/>'; }
      return s + '<circle r="13"/>';
    }
    return '';
  }

  /* Fargeoverganger som gir toppingene lys og skygge. p er et forledd som gjør id-ene unike per tegning. */
  function rg(id, a, b, c) { return '<radialGradient id="' + id + '" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="' + a + '"/><stop offset=".55" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/></radialGradient>'; }
  function lg(id, a, b) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
  function toppDefs(p) {
    return rg(p + 'bb', '#FF8FA8', '#D42E57', '#8E1238') + rg(p + 'jb', '#FFD3CC', '#F0605F', '#C2202B') + lg(p + 'ap', '#FFB347', '#D9620A') +
      rg(p + 'hn', '#E9BE8A', '#B77E48', '#7A4A22') + rg(p + 'mn', '#EBC48E', '#C8935A', '#96642F') + rg(p + 'pn', '#FBEBC4', '#E3BE80', '#B98F52') +
      lg(p + 'kt', '#F2B45A', '#D08A2A') + lg(p + 'kf', '#C9801F', '#8E5210') + lg(p + 'lt', '#4A403C', '#1B1512') +
      lg(p + 'hs', '#FFFFFF', '#C7DCE6') + lg(p + 'kj', '#F3D6A0', '#D2A45F') + rg(p + 'kb', '#7A4B32', '#3F2417', '#22120B') + lg(p + 'kk', '#FFFFFF', '#E9E0CE');
  }

  var SK = ' fill="#1A0A05" fill-opacity=".3"';
  var KANT = ' stroke="#2A130B" stroke-opacity=".35" stroke-width=".6"';
  function kube(p, topp, front, side) {
    return '<path d="M-4.5 -2.5 L6.8 -2.5 L6.8 7.4 L-4.5 7.4 Z"' + SK + '/>' +
      '<path d="M-6 -2.6 H3.6 V6 H-6 Z" fill="' + front + '"' + KANT + '/>' +
      '<path d="M-6 -2.6 L-3.2 -5.8 H6.4 L3.6 -2.6 Z" fill="' + topp + '"' + KANT + '/>' +
      '<path d="M3.6 -2.6 L6.4 -5.8 V2.8 L3.6 6 Z" fill="' + side + '"' + KANT + '/>' +
      '<path d="M-2.4 -4.6 H3.4" stroke="#FFF" stroke-opacity=".55" stroke-width="1" stroke-linecap="round"/>';
  }
  var TEGN = {
    bringebaer: function (p) {
      var s = '<ellipse cx="1.2" cy="2.6" rx="8" ry="7"' + SK + '/>';
      [[-4.4, -3], [0, -4.6], [4.2, -2.8], [-5.4, 1.4], [-1.4, -0.6], [2.8, 0.8], [5.6, 2.2], [-3, 4.6], [1.4, 5]].forEach(function (q) {
        s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.9" fill="url(#' + p + 'bb)" stroke="#7A0F2E" stroke-opacity=".5" stroke-width=".4"/>';
      });
      return s + '<circle cx="-2.2" cy="-1.6" r=".6" fill="#FFF" fill-opacity=".7"/><circle cx="2" cy="-.2" r=".5" fill="#FFF" fill-opacity=".6"/>';
    },
    jordbaer: function (p) {
      return '<path d="M1.2 -6.8 C8 -6 8.6 1.8 1.8 9 C-5.4 3.6 -6.2 -5 1.2 -6.8 Z"' + SK + '/>' +
        '<path d="M0 -8.2 C7.2 -7.6 7.8 0.6 0.6 8.2 C-6.8 2.4 -7.6 -6.6 0 -8.2 Z" fill="url(#' + p + 'jb)" stroke="#9E1A22" stroke-opacity=".6" stroke-width=".7"/>' +
        '<path d="M0 -4.6 C2.6 -3 2.6 1 0.4 3.6 C-2 1.2 -2.2 -3 0 -4.6 Z" fill="#FFE9E2" fill-opacity=".8"/>' +
        '<g fill="#FFE28A"><circle cx="-4" cy="-3" r=".6"/><circle cx="4" cy="-2.2" r=".6"/><circle cx="-3.4" cy="1.6" r=".6"/><circle cx="3.6" cy="2.2" r=".6"/><circle cx=".4" cy="5.8" r=".6"/><circle cx="0" cy="-6.4" r=".6"/></g>';
    },
    appelsin: function (p) {
      return '<path d="M-8.4 4 Q0 -7.4 8.4 4" fill="none" stroke="#1A0A05" stroke-opacity=".3" stroke-width="5.2" stroke-linecap="round" transform="translate(1 2)"/>' +
        '<path d="M-8.4 3.2 Q0 -8.2 8.4 3.2" fill="none" stroke="url(#' + p + 'ap)" stroke-width="5.2" stroke-linecap="round"/>' +
        '<path d="M-7.6 4.6 Q0 -5.6 7.6 4.6" fill="none" stroke="#FFE3B0" stroke-width="1.4" stroke-linecap="round"/>' +
        '<g fill="#B8500A" fill-opacity=".55"><circle cx="-5" cy="-.6" r=".5"/><circle cx="-1.6" cy="-3.2" r=".5"/><circle cx="2.4" cy="-3" r=".5"/><circle cx="5.4" cy="0" r=".5"/></g>';
    },
    kokos: function (p) {
      return '<path d="M-8 3 Q-1 -6 8 -1.6" fill="none" stroke="#1A0A05" stroke-opacity=".3" stroke-width="3.8" stroke-linecap="round" transform="translate(1 1.8)"/>' +
        '<path d="M-8 3 Q-1 -6 8 -1.6" fill="none" stroke="url(#' + p + 'kk)" stroke-width="3.8" stroke-linecap="round"/>' +
        '<path d="M-6.6 3.4 Q-1 -3.4 6.8 -.6" fill="none" stroke="#CFC3A8" stroke-width=".8" stroke-linecap="round"/>' +
        '<path d="M-2 5.4 Q2 2.6 6 5" fill="none" stroke="url(#' + p + 'kk)" stroke-width="2.4" stroke-linecap="round"/>';
    },
    hasselnott: function (p) {
      return '<circle cx="1.2" cy="2.2" r="7.2"' + SK + '/><circle r="7.2" fill="url(#' + p + 'hn)" stroke="#5E3618" stroke-opacity=".6" stroke-width=".6"/>' +
        '<path d="M-6 -3.8 A7.1 7.1 0 0 1 3.4 -6.3 Q0 -2.2 -6 -3.8 Z" fill="#6E4320" fill-opacity=".85"/>' +
        '<ellipse cx="-2.4" cy="-.6" rx="2" ry="1.2" fill="#FFF" fill-opacity=".35" transform="rotate(-30 -2.4 -.6)"/>';
    },
    mandel: function (p) {
      return '<path d="M-8 1.8 Q0 -6.8 10 1.8 Q0 10 -8 1.8 Z"' + SK + '/><path d="M-9.4 0 Q0 -8.4 9.4 0 Q0 8.4 -9.4 0 Z" fill="url(#' + p + 'mn)" stroke="#7A4E22" stroke-opacity=".6" stroke-width=".6"/>' +
        '<path d="M-7 0 Q0 -3.6 7 0 M-6 2 Q0 -1 6 2 M-5.6 -2 Q0 -5.2 5.6 -2" fill="none" stroke="#8C5E2C" stroke-opacity=".7" stroke-width=".7" stroke-linecap="round"/>' +
        '<circle cx="-3" cy="-2.4" r=".5" fill="#FFF"/><circle cx="1.6" cy="-3.4" r=".4" fill="#FFF"/><circle cx="3.6" cy="1.4" r=".4" fill="#FFF"/>';
    },
    peanott: function (p) {
      return '<ellipse cx="1.2" cy="2.2" rx="8" ry="5"' + SK + '/><ellipse rx="8" ry="5" fill="url(#' + p + 'pn)" stroke="#8E6A34" stroke-opacity=".6" stroke-width=".6"/>' +
        '<path d="M-6 .4 Q0 -1.4 6 .4" fill="none" stroke="#A47C40" stroke-width="1" stroke-linecap="round"/><ellipse cx="-2.4" cy="-2.2" rx="2.8" ry=".9" fill="#FFF" fill-opacity=".5"/>';
    },
    lakris: function (p) { return kube(p, '#4A403C', 'url(#' + p + 'lt)', '#0E0A08'); },
    karamell: function (p) { return kube(p, '#F6C777', 'url(#' + p + 'kt)', 'url(#' + p + 'kf)'); },
    havsalt: function (p) {
      return '<path d="M1 -2.4 L5.4 2 L1 6.4 L-3.4 2 Z"' + SK + '/><path d="M0 -4.6 L4.6 0 L0 4.6 L-4.6 0 Z" fill="url(#' + p + 'hs)" stroke="#7F99A6" stroke-width=".6"/>' +
        '<path d="M0 -4.6 L0 4.6 M-4.6 0 L4.6 0" stroke="#AFC6D1" stroke-width=".5"/><path d="M-2.6 -1 L-1 -2.6" stroke="#FFF" stroke-width="1" stroke-linecap="round"/>';
    },
    kjeks: function (p) {
      return '<path d="M-5 -3.6 L3.6 -5 L8 0 L4.6 6.8 L-3.4 6.4 L-6.6 1.4 Z"' + SK + '/><path d="M-6 -5 L2.6 -6.4 L7 -1.4 L3.6 5.4 L-4.4 5 L-7.6 0 Z" fill="url(#' + p + 'kj)" stroke="#9A6E32" stroke-opacity=".7" stroke-width=".7"/>' +
        '<g fill="#9A6E32"><circle cx="-2.8" cy="-1.8" r=".8"/><circle cx="2.2" cy="-2.8" r=".8"/><circle cx=".4" cy="2" r=".8"/><circle cx="-3.6" cy="2.4" r=".5"/><circle cx="4" cy=".8" r=".5"/></g>' +
        '<path d="M-5 -4 L2 -5.2" stroke="#FFF" stroke-opacity=".5" stroke-width=".9" stroke-linecap="round"/>';
    },
    kakaonibs: function (p) {
      return '<path d="M-2.8 -2.4 L2.8 -3.6 L5 1 L1 4.8 L-3.8 2.8 Z" fill="#000" fill-opacity=".32" transform="translate(.9 1.3)"/><path d="M-2.8 -2.4 L2.8 -3.6 L5 1 L1 4.8 L-3.8 2.8 Z" fill="url(#' + p + 'kb)" stroke="#C9A088" stroke-opacity=".45" stroke-width=".5"/>' +
        '<path d="M-2 -1.6 L2 -2.6" stroke="#B98A6E" stroke-width=".7" stroke-linecap="round"/>';
    },
    chili: function (p) {
      return '<path d="M-5.4 1 Q0 -4 5.8 -0.6 Q1 4 -5.4 1 Z" fill="#000" fill-opacity=".3" transform="translate(.9 1.4)"/><path d="M-5.4 1 Q0 -4 5.8 -0.6 Q1 4 -5.4 1 Z" fill="#C4281C" stroke="#7A120B" stroke-opacity=".6" stroke-width=".5"/>' +
        '<path d="M-3.4 .4 Q0 -2.2 3.6 -.6" fill="none" stroke="#FF8A6A" stroke-width=".7" stroke-linecap="round"/><circle cx="5.8" cy="3.8" r="1.1" fill="#F4D47A" stroke="#8A6A1A" stroke-opacity=".5" stroke-width=".4"/>';
    },
    kaffe: function (p) {
      return '<ellipse cx="1" cy="1.8" rx="6" ry="4.4"' + SK + '/><ellipse rx="6" ry="4.4" fill="url(#' + p + 'kb)" stroke="#120804" stroke-opacity=".6" stroke-width=".5"/>' +
        '<path d="M-4.4 0 Q-1.6 -2.4 0 0 Q1.6 2.4 4.4 0" fill="none" stroke="#1A0C06" stroke-width="1.1" stroke-linecap="round"/><ellipse cx="-1.6" cy="-2.2" rx="2.4" ry=".8" fill="#FFF" fill-opacity=".28"/>';
    }
  };
  var SMÅ = { havsalt: 1, kakaonibs: 1, chili: 1, kaffe: 1 };

  function bit(id, p) { return (TEGN[id] || TEGN.kakaonibs)(p); }

  /* Lite bilde av toppingen, til knapper og lister. Samme tegning som på platen. */
  function ikon(id) {
    var p = 'k' + (++teller) + '-', stor = SMÅ[id] ? 2.2 : 1.55;
    function en(x, y, r) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + stor + ')">' + bit(id, p) + '</g>'; }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -24 48 48" class="t-ikon" aria-hidden="true" focusable="false"><defs>' + toppDefs(p) + '</defs>' + en(-8, -7, -20) + en(9, -2, 35) + en(-3, 10, 80) + '</svg>';
  }

  var MUNN = [190, 50];   // der posen heller fra

  function toppingSvg(design, valg, p) {
    var ids = design.toppings || [];
    if (!ids.length) return '';
    var antall = ids.length <= 2 ? PER : ids.length <= 4 ? 12 : ids.length <= 7 ? 9 : 7;
    var pkt = plasser(design.form || 'plate', !!(design.motiv && design.motiv !== 'ingen'));
    var nT = D.TOPPINGS.length, ut = '';
    ids.forEach(function (id) {
      var nr = -1;
      D.TOPPINGS.forEach(function (t, i) { if (t.id === id) nr = i; });
      if (nr < 0) return;
      var rnd = tilfeldig(hash('bit|' + id));
      var helles = valg.ny === id, regner = valg.ny === 'alle';
      for (var m = 0; m < PER; m++) {
        var q = pkt[nr + nT * m], rot = rnd() * 360, skala = (SMÅ[id] ? 1.5 : 1.28) * (0.88 + rnd() * 0.28), ox = (rnd() - .5) * 9, oy = (rnd() - .5) * 9;
        if (!q || m >= antall) continue;
        var kl = '';
        if (helles) kl = ' class="hell" style="--dx:' + f(MUNN[0] - q[0]) + 'px;--dy:' + f(MUNN[1] - q[1]) + 'px;animation-delay:' + (380 + m * 55) + 'ms"';
        else if (regner) kl = ' class="dryss" style="animation-delay:' + Math.round(rnd() * 500 + m * 12) + 'ms"';
        var tegning = '<g transform="rotate(' + f(rot) + ') scale(' + f(skala) + ')">' + bit(id, p) + '</g>';
        if (SMÅ[id]) tegning += '<g transform="translate(' + f(ox) + ' ' + f(oy) + ') rotate(' + f(rot * 2) + ') scale(' + f(skala * .8) + ')">' + bit(id, p) + '</g>';
        ut += '<g transform="translate(' + f(q[0]) + ' ' + f(q[1]) + ')"><g' + kl + '>' + tegning + '</g></g>';
      }
    });
    return ut;
  }

  /* Posen som toppingen helles fra. */
  function pose(id, p) {
    var t = R.topping(id); if (!t) return '';
    return '<g class="pose"><g transform="translate(180 18) rotate(162)">' +
      '<path d="M-24 -30 L24 -30 L28 30 Q0 40 -28 30 Z" fill="#D9B382" stroke="#5C3629" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M-24 -30 L24 -30 L22 -38 L-22 -38 Z" fill="#C49A66" stroke="#5C3629" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M-27 18 Q0 27 27 18 L28 30 Q0 40 -28 30 Z" fill="' + t.farge + '" fill-opacity=".9" stroke="#5C3629" stroke-width="1.6"/>' +
      '<path d="M-17 -26 L-19 14" stroke="#FFF" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cy="-4" r="16" fill="#FFFBF0" stroke="#5C3629" stroke-width="1.6"/><g transform="translate(0 -4) rotate(180) scale(1.5)">' + bit(id, p) + '</g></g></g>';
  }

  /* Selve platen, uten <svg>-ramme. Brukes både på scenen og i vinduet på esken. */
  function plateInni(design, valg, id) {
    var b = R.base(design.base), tom = !b;
    var c = b || { farge: '#B9A99C', lys: '#CDBFB3', mork: '#9C8B7D' };
    var form = design.form || 'plate';
    var s = '<defs><clipPath id="' + id + 'c">' + formSvg(form) + '</clipPath>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c.lys + '"/><stop offset=".5" stop-color="' + c.farge + '"/><stop offset="1" stop-color="' + c.mork + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c.lys + '"/><stop offset="1" stop-color="' + c.farge + '"/></linearGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="1" y2="1"><stop offset=".12" stop-color="#FFF" stop-opacity="0"/><stop offset=".24" stop-color="#FFF" stop-opacity=".26"/><stop offset=".3" stop-color="#FFF" stop-opacity=".08"/><stop offset=".38" stop-color="#FFF" stop-opacity=".2"/><stop offset=".48" stop-color="#FFF" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="' + id + 'v" cx=".5" cy=".5" r=".72"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>' +
      toppDefs(id) + '</defs>';
    s += '<ellipse cx="184" cy="250" rx="132" ry="8" fill="#1A0A05" fill-opacity=".22"/>';
    s += '<g' + (valg.pop ? ' class="plate-pop"' : '') + (tom ? ' opacity=".5"' : '') + '>';
    s += '<g transform="translate(0 8)" fill="' + c.mork + '">' + formSvg(form) + '</g><g transform="translate(0 8)" fill="#000" fill-opacity=".28">' + formSvg(form) + '</g>';
    s += '<g fill="url(#' + id + 'g)">' + formSvg(form) + '</g>';
    s += '<g clip-path="url(#' + id + 'c)">';
    for (var kol = 0; kol < 6; kol++) for (var rad = 0; rad < 4; rad++) {
      var x = 24 + kol * 52 + 4, y = 38 + rad * 48 + 4;
      s += '<rect x="' + (x - 1.5) + '" y="' + (y - 1.5) + '" width="47" height="43" rx="8" fill="' + c.mork + '" fill-opacity=".55"/>' +
        '<rect x="' + x + '" y="' + y + '" width="44" height="40" rx="7" fill="url(#' + id + 'r)"/>' +
        '<path d="M' + (x + 3) + ' ' + (y + 36) + ' V' + (y + 8) + ' Q' + (x + 3) + ' ' + (y + 3) + ' ' + (x + 8) + ' ' + (y + 3) + ' H' + (x + 40) + '" fill="none" stroke="#FFF" stroke-opacity=".3" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M' + (x + 41) + ' ' + (y + 6) + ' V' + (y + 32) + ' Q' + (x + 41) + ' ' + (y + 37) + ' ' + (x + 36) + ' ' + (y + 37) + ' H' + (x + 6) + '" fill="none" stroke="' + c.mork + '" stroke-opacity=".8" stroke-width="1.8" stroke-linecap="round"/>';
    }
    var m = tom ? '' : motivSvg(design.motiv);
    if (m) {
      s += '<ellipse cx="180" cy="134" rx="72" ry="60" fill="' + c.mork + '" fill-opacity=".5"/><ellipse cx="180" cy="133" rx="70" ry="58" fill="url(#' + id + 'r)"/>' +
        '<g transform="translate(180 134)"><g' + (valg.stempel ? ' class="stempel"' : '') + ' stroke-linejoin="round" stroke-width="3.2">' +
        '<g transform="translate(1.8 2.2)" fill="none" stroke="' + c.mork + '">' + m + '</g>' +
        '<g transform="translate(-1.4 -1.6)" fill="none" stroke="' + c.lys + '">' + m + '</g>' +
        '<g fill="' + c.lys + '" fill-opacity=".55" stroke="' + c.mork + '" stroke-opacity=".5" stroke-width="1">' + m + '</g></g></g>';
    }
    s += '<rect x="0" y="0" width="360" height="260" fill="url(#' + id + 'v)"/><rect x="0" y="0" width="360" height="260" fill="url(#' + id + 's)"/>';
    s += '</g>';
    s += '<g fill="none" stroke="' + c.mork + '" stroke-width="1.6">' + formSvg(form) + '</g>';
    if (!tom) s += toppingSvg(design, valg, id);
    s += '</g>';
    return s;
  }

  /* valg: { alt, ny: toppingId | 'alle', pop: true, stempel: true } – de tre siste styrer animasjon. */
  function tegnPlate(design, valg) {
    valg = valg || {};
    var id = 'p' + (++teller);
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260" role="img" aria-label="' + esc(valg.alt || 'Forhåndsvisning av sjokoladeplaten') + '">' + plateInni(design, valg, id);
    if (!R.base(design.base)) s += '<rect x="62" y="114" width="236" height="40" rx="20" fill="#FFFFFF" fill-opacity=".94"/><text x="180" y="139" text-anchor="middle" font-size="14.5" font-weight="700" font-family="inherit" fill="#3E2723">Velg en sjokolade for å starte</text>';
    if (valg.ny && valg.ny !== 'alle') s += pose(valg.ny, id);
    return s + '</svg>';
  }

  function brytTekst(tekst, maks) {
    var ord = String(tekst).split(/\s+/), linjer = [], cur = '';
    ord.forEach(function (o) {
      if (!cur) cur = o;
      else if ((cur + ' ' + o).length <= maks) cur += ' ' + o;
      else { linjer.push(cur); cur = o; }
    });
    if (cur) linjer.push(cur);
    return linjer;
  }

  /* Esken: lokk i valgt farge med hilsen, et vindu der platen synes, og en etikett med innhold og allergener. */
  function tegnInnpakning(design) {
    var id = 'i' + (++teller);
    var w = D.INNPAKNING.filter(function (x) { return x.id === design.innpakning; })[0] || D.INNPAKNING[0];
    var a = R.allergenerFor(design), b = R.base(design.base);
    var hilsen = (design.hilsen || '').trim() || 'Din hilsen her';
    var harBilde = !!design.bilde, tx = harBilde ? 208 : 180;
    var linjer = brytTekst(hilsen, harBilde ? 18 : 24).slice(0, 2);
    var str = linjer.length > 1 ? 19 : hilsen.length > 16 ? 21 : 26;
    var til = (design.til || '').trim();
    var hoyde = linjer.length * (str + 3) + (til ? 18 : 0), hy = 66 - hoyde / 2 + str * .8;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260" role="img" aria-label="Forhåndsvisning av esken platen kommer i">';
    s += '<defs><clipPath id="' + id + 'b"><circle cx="64" cy="66" r="30"/></clipPath><clipPath id="' + id + 'k"><rect x="14" y="18" width="332" height="212" rx="16"/></clipPath><clipPath id="' + id + 'w"><rect x="28" y="110" width="156" height="108" rx="12"/></clipPath>' +
      '<linearGradient id="' + id + 'l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF" stop-opacity=".28"/><stop offset=".5" stop-color="#FFF" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>' +
      '<linearGradient id="' + id + 'p" x1="0" y1="0" x2="1" y2="1"><stop offset=".2" stop-color="#FFF" stop-opacity="0"/><stop offset=".34" stop-color="#FFF" stop-opacity=".4"/><stop offset=".4" stop-color="#FFF" stop-opacity=".08"/><stop offset=".52" stop-color="#FFF" stop-opacity=".3"/><stop offset=".62" stop-color="#FFF" stop-opacity="0"/></linearGradient></defs>';
    s += '<ellipse cx="184" cy="251" rx="150" ry="7" fill="#1A0A05" fill-opacity=".22"/>';
    /* eskens side og lokk */
    s += '<rect x="14" y="30" width="332" height="212" rx="16" fill="' + w.farge + '"/><rect x="14" y="30" width="332" height="212" rx="16" fill="#000" fill-opacity=".32"/>';
    s += '<rect x="14" y="18" width="332" height="212" rx="16" fill="' + w.farge + '"/>';
    var rnd = tilfeldig(hash('eske|' + w.id)), k = '';
    for (var i = 0; i < 46; i++) {
      var kx = 18 + rnd() * 324, ky = 22 + rnd() * 204, kr = rnd() * 360;
      k += i % 3 ? '<rect x="' + f(kx) + '" y="' + f(ky) + '" width="8" height="2.8" rx="1.4" fill="' + w.tekst + '" fill-opacity=".22" transform="rotate(' + f(kr) + ' ' + f(kx) + ' ' + f(ky) + ')"/>' : '<circle cx="' + f(kx) + '" cy="' + f(ky) + '" r="2.4" fill="' + w.tekst + '" fill-opacity=".22"/>';
    }
    s += '<g clip-path="url(#' + id + 'k)">' + k + '<rect x="14" y="18" width="332" height="212" fill="url(#' + id + 'l)"/></g>';
    s += '<rect x="21" y="25" width="318" height="198" rx="11" fill="none" stroke="' + w.tekst + '" stroke-opacity=".4" stroke-width="1.4" stroke-dasharray="1 5" stroke-linecap="round"/>';
    /* hilsen */
    if (harBilde) s += '<circle cx="64" cy="66" r="33" fill="#FFFBF0" stroke="' + w.tekst + '" stroke-opacity=".5" stroke-width="1.2"/><image href="' + esc(design.bilde) + '" x="34" y="36" width="60" height="60" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + 'b)"/>';
    linjer.forEach(function (l, n) {
      s += '<text x="' + tx + '" y="' + f(hy + n * (str + 3)) + '" text-anchor="middle" font-size="' + str + '" font-weight="700" font-family="inherit" fill="' + w.tekst + '">' + esc(l) + '</text>';
    });
    if (til) s += '<text x="' + tx + '" y="' + f(hy + linjer.length * (str + 3)) + '" text-anchor="middle" font-size="14" font-weight="600" font-family="inherit" fill="' + w.tekst + '">Til ' + esc(til) + '</text>';
    /* vindu med platen */
    s += '<rect x="26" y="108" width="160" height="112" rx="14" fill="#000" fill-opacity=".25"/><rect x="28" y="110" width="156" height="108" rx="12" fill="#FFF6E0"/>';
    s += '<g clip-path="url(#' + id + 'w)"><g transform="translate(34 114) scale(.4)">' + plateInni(design, {}, id + 'm') + '</g><rect x="28" y="110" width="156" height="108" fill="url(#' + id + 'p)"/></g>';
    s += '<rect x="28" y="110" width="156" height="108" rx="12" fill="none" stroke="' + w.tekst + '" stroke-opacity=".55" stroke-width="1.6"/>';
    /* etikett */
    s += '<rect x="196" y="110" width="136" height="108" rx="10" fill="#FFFBF0" stroke="#5C3629" stroke-opacity=".3"/>';
    s += '<text x="264" y="126" text-anchor="middle" font-size="7.6" letter-spacing="1.2" font-weight="700" font-family="inherit" fill="#8B2F2F">HÅNDLAGET SJOKOLADE</text><path d="M210 132 H318" stroke="#5C3629" stroke-opacity=".25"/>';
    var nt = (design.toppings || []).length, y = 146;
    brytTekst(b && nt > 3 ? b.navn + ' med ' + nt + ' toppinger' : (R.beskriv(design) || 'Velg sjokolade og topping'), 24).slice(0, 3).forEach(function (l) {
      s += '<text x="264" y="' + y + '" text-anchor="middle" font-size="10.5" font-weight="700" font-family="inherit" fill="#3E2723">' + esc(l) + '</text>'; y += 12.5;
    });
    var info = [];
    if (a.inneholder.length) info.push('Inneholder: ' + R.navnPaa(a.inneholder).join(', ') + '.');
    if (a.spor.length) info.push('Kan inneholde spor av: ' + R.navnPaa(a.spor).join(', ') + '.');
    y += 3;
    brytTekst(info.join(' '), 32).slice(0, Math.max(1, Math.floor((214 - y) / 10) + 1)).forEach(function (l) {
      s += '<text x="264" y="' + y + '" text-anchor="middle" font-size="8.2" font-family="inherit" fill="#3E2723">' + esc(l) + '</text>'; y += 10;
    });
    return s + '</svg>';
  }

  return { tegnPlate: tegnPlate, tegnInnpakning: tegnInnpakning, ikon: ikon, esc: esc };
});
