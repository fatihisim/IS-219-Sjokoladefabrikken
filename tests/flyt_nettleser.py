# Kjører hele flyten i en nettleser (PC, mobil i mørkt tema, og bare tastatur) og sjekker akseptansekriteriene.
# Krever Python med Playwright. Start en lokal server i src/ og kjør:
# Animasjoner skrus ikke av i testen.
#   python3 tests/flyt_nettleser.py http://localhost:8000/index.html skjermbilder/
import sys, json
from playwright.sync_api import sync_playwright
url = sys.argv[1]; ut = sys.argv[2]
logg = []
def kjør(pg, navn, mobil=False):
    feil = []
    pg.on('console', lambda m: feil.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: feil.append(str(e)))
    pg.goto(url); pg.wait_for_timeout(500)
    # Platen ligger fast øverst på mobil. Rull derfor elementet til midten før klikk, slik en bruker ville gjort.
    def midt(sel):
        if pg.locator(sel).count(): pg.locator(sel).first.evaluate('e => e.scrollIntoView({block: "center"})')
    klikk0, kryss0, avkryss0 = pg.click, pg.check, pg.uncheck
    pg.click = lambda sel, **k: (midt(sel), klikk0(sel, **k))[1]
    pg.check = lambda sel, **k: (midt(sel), kryss0(sel, **k))[1]
    pg.uncheck = lambda sel, **k: (midt(sel), avkryss0(sel, **k))[1]
    pg.screenshot(path=f'{ut}/{navn}-1-start.png', full_page=True)
    pg.click('[data-start="blank"]')
    # AK7: soya sperrer alle sjokolader
    pg.check('#unngaa-soya', force=True); pg.wait_for_timeout(100)
    logg.append((navn, 'AK7 alle baser sperret', pg.locator('input[name=base]:not([disabled])').count() == 0 and pg.locator('#baser .varsel').count() == 1))
    logg.append((navn, 'AK7 videre-knapp deaktivert', pg.locator('[data-nav=neste]').is_disabled()))
    pg.uncheck('#unngaa-soya', force=True)
    # FK17: barnemodus
    pg.check('#hvem-barn', force=True); pg.wait_for_timeout(100)
    logg.append((navn, 'FK17 barnemodus gir ekstra pynt', pg.evaluate('document.documentElement.classList.contains("barn") && getComputedStyle(document.querySelector(".vimpler")).display !== "none"')))
    # AK1: nøtter
    pg.check('#unngaa-notter', force=True); pg.wait_for_timeout(100)
    pg.click('#toppinger [data-topping=hasselnott]', force=True); pg.wait_for_timeout(100)
    logg.append((navn, 'AK1 hasselnøtt kan ikke velges', pg.get_attribute('#toppinger [data-topping=hasselnott]', 'aria-pressed') == 'false'))
    # Smaksprofessor
    pg.click('#prof-knapp'); pg.check('#prof-smak-syrlig', force=True); pg.check('#prof-til-barn', force=True); pg.check('#prof-mot-trygt', force=True)
    pg.click('[data-prof=vis]'); pg.wait_for_timeout(150)
    n = pg.locator('.forslag').count()
    tekst = pg.locator('#prof-resultat').inner_text().lower()
    logg.append((navn, f'AK2 forslag 1-3 (fikk {n})', 1 <= n <= 3))
    logg.append((navn, 'AK1 forslag uten nøtter', 'hasseln' not in tekst and 'mandl' not in tekst))
    før = pg.locator('#visning .benk').inner_html()
    pg.locator('.forslag button').first.click(); pg.wait_for_timeout(150)
    logg.append((navn, 'AK6 forhåndsvisning endret ved forslag', før != pg.locator('#visning .benk').inner_html()))
    pg.screenshot(path=f'{ut}/{navn}-2-smaker.png', full_page=True)
    # AK4: fjerde topping
    for t in ['kokos', 'havsalt', 'kakaonibs', 'chili']:
        if pg.get_attribute(f'#toppinger [data-topping={t}]', 'aria-pressed') == 'false': pg.click(f'#toppinger [data-topping={t}]')
    pg.click('#toppinger [data-topping=appelsin]'); pg.wait_for_timeout(60)
    logg.append((navn, 'FK14 ny topping helles fra posen med animasjon', pg.locator('#visning .hell').count() > 0 and pg.locator('#visning .pose').count() == 1 and pg.locator('#visning .boble').count() == 1))
    antall = pg.locator('#toppinger [aria-pressed=true]').count()
    logg.append((navn, f'AK4 fritt antall toppinger (valgte {antall})', antall >= 5 and pg.locator('#visning .valgt-brikke').count() == antall))
    pg.locator('#visning .valgt-brikke').first.click(); pg.wait_for_timeout(100)
    logg.append((navn, 'FK7 topping kan fjernes fra platen', pg.locator('#toppinger [aria-pressed=true]').count() == antall - 1))
    scene = pg.locator('#visning .benk').bounding_box(); vindu = pg.viewport_size
    logg.append((navn, f'FK15 platen er stor ({round(scene["width"])} px bred)', scene['width'] >= (300 if mobil else 480) and scene['height'] <= vindu['height'] * 0.6))
    pg.click('[data-nav=neste]')
    før = pg.locator('#visning .benk').inner_html()
    pg.check('#form-hjerte', force=True); pg.wait_for_timeout(100)
    etter_form = pg.locator('#visning .benk').inner_html()
    pg.check('#motiv-blomst', force=True); pg.check('#form-plate', force=True); pg.wait_for_timeout(100)
    logg.append((navn, 'AK6 forhåndsvisning endret ved form og motiv', før != etter_form and etter_form != pg.locator('#visning .benk').inner_html()))
    pg.click('[data-anledning=bursdag]'); pg.wait_for_timeout(80)
    viser_eske = pg.get_attribute('#visning .faner [data-visning=innpakning]', 'aria-pressed') == 'true'
    pg.click('[data-anledning=bursdag]'); pg.wait_for_timeout(80)
    logg.append((navn, 'FK18 platen vises igjen når anledningen fjernes', viser_eske and pg.get_attribute('#visning .faner [data-visning=plate]', 'aria-pressed') == 'true'))
    pg.click('#visning .pip'); pg.wait_for_timeout(80)
    logg.append((navn, 'FK18 lite bilde bytter mellom plate og eske', pg.get_attribute('#visning .faner [data-visning=innpakning]', 'aria-pressed') == 'true'))
    pg.click('[data-anledning=bursdag]'); pg.fill('#til', 'Oliver'); pg.wait_for_timeout(100)
    logg.append((navn, 'FK2 innpakning viser hilsen og navn', 'Gratulerer' in pg.locator('#visning .benk').inner_html() and 'Til Oliver' in pg.locator('#visning .benk').inner_html()))
    pg.screenshot(path=f'{ut}/{navn}-3-design.png', full_page=True)
    pg.click('[data-nav=neste]')
    # AK5: tomt skjema avvises
    pg.click('[data-bestill]'); pg.wait_for_timeout(150)
    logg.append((navn, 'AK5 bestilling stoppes uten felt', pg.locator('#feil-oppsummering').count() == 1 and pg.locator('.feil').count() >= 5 and pg.locator('.kvittering').count() == 0))
    pg.screenshot(path=f'{ut}/{navn}-4a-feil.png', full_page=True)
    pg.fill('#navn', 'Maja Hansen'); pg.fill('#mobil', '900 00 000'); pg.fill('#adresse', 'Eksempelgata 1'); pg.fill('#postnr', '4610'); pg.fill('#sted', 'Kristiansand')
    pg.click('[data-bestill]'); pg.wait_for_timeout(150)
    logg.append((navn, 'AK5 angrerett må krysses av', pg.locator('#angrerett-feil').count() == 1 and pg.locator('.feil').count() == 1))
    pg.check('#angrerett'); pg.wait_for_timeout(50)
    pg.screenshot(path=f'{ut}/{navn}-4-bestilling.png', full_page=True)
    alg = pg.locator('.allergenboks').inner_text()
    logg.append((navn, 'FK8 allergener i oppsummering', 'Inneholder' in alg and 'unngå: nøtter' in alg))
    pg.click('[data-bestill]'); pg.wait_for_timeout(200)
    logg.append((navn, 'Bekreftelse vises', pg.locator('.kvittering h1').count() == 1 and 'DEMO-' in pg.locator('.merkelapp').inner_text()))
    pg.screenshot(path=f'{ut}/{navn}-5-ferdig.png', full_page=True)
    bred = pg.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth')
    logg.append((navn, 'Ingen vannrett rulling', not bred))
    logg.append((navn, f'Ingen feil i konsollen {feil[:2]}', len(feil) == 0))

def tastatur(pg):
    # AK8: hele flyten med bare tastatur
    pg.goto(url); pg.wait_for_timeout(400)
    def tabb_til(sel, maks=120):
        for _ in range(maks):
            if pg.evaluate(f'document.activeElement && document.activeElement.matches({json.dumps(sel)})'): return True
            pg.keyboard.press('Tab')
        return False
    ok = tabb_til('[data-start=blank]'); pg.keyboard.press('Enter'); pg.wait_for_timeout(100)
    ok &= tabb_til('#base-melk'); pg.keyboard.press('Space')
    ok &= tabb_til('#toppinger [data-topping=bringebaer]'); pg.keyboard.press('Enter')
    ok &= tabb_til('[data-nav=neste]'); pg.keyboard.press('Enter'); pg.wait_for_timeout(100)
    ok &= tabb_til('#hilsen'); pg.keyboard.type('Til deg')
    ok &= tabb_til('[data-nav=neste]'); pg.keyboard.press('Enter'); pg.wait_for_timeout(100)
    ok &= tabb_til('#levering-post'); pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(100)   # velger «hent»
    ok &= tabb_til('#dato'); pg.keyboard.type('12122026')
    ok &= tabb_til('#navn'); pg.keyboard.type('Truls')
    ok &= tabb_til('#mobil'); pg.keyboard.type('90000000')
    ok &= tabb_til('#angrerett'); pg.keyboard.press('Space')
    ok &= tabb_til('[data-bestill]'); pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
    logg.append(('tastatur', 'AK8 flyten fullført med bare tastatur', bool(ok) and pg.locator('.kvittering h1').count() == 1))

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 900}); kjør(pg, 'pc'); pg.close()
    c = b.new_context(viewport={'width': 390, 'height': 800}, device_scale_factor=2, has_touch=True, color_scheme='dark'); pg = c.new_page(); kjør(pg, 'mobil', True); c.close()
    pg = b.new_page(viewport={'width': 1280, 'height': 900}); tastatur(pg); pg.close()
    b.close()
alle = True
for navn, hva, ok in logg:
    print(('OK  ' if ok else 'FEIL'), navn, '-', hva); alle &= bool(ok)
print('ALT OK' if alle else 'NOE FEILET')
