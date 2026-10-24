import os
import shutil
from playwright.sync_api import sync_playwright

dst_repo = r"C:\AntiGravityStuff\Moonstorm2"
art_dir = r"C:\Users\alexb\.gemini\antigravity\brain\52bc129d-1cf6-4895-ace6-d76dd5a74539"

failed_reqs = []
console_errs = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 900})
    page.on("console", lambda m: console_errs.append(m.text) if m.type == "error" else None)
    page.on("response", lambda r: failed_reqs.append(f"{r.status} {r.url}") if r.status >= 400 else None)

    page.goto("http://127.0.0.1:8765/play", wait_until="networkidle")
    page.wait_for_timeout(800)
    page.screenshot(path=os.path.join(art_dir, "v6_title_chap1_barbershop.png"))

    # Switch to Chapter II of Rupert's Life Story on the Title Stage (Years 13-19: The Streets & MGWDBTTGPnP Poster)
    page.click("#btn-origin-chap-2")
    page.wait_for_timeout(700)
    page.screenshot(path=os.path.join(art_dir, "v6_title_chap2_streets.png"))

    # Switch to Chapter III of Rupert's Life Story on the Title Stage (Year 20: Port Machete Pier & The Substampede)
    page.click("#btn-origin-chap-3")
    page.wait_for_timeout(700)
    page.screenshot(path=os.path.join(art_dir, "v6_title_chap3_pier.png"))

    # Open Time Capsule Museum from Main Menu
    page.click("#btn-menu-credits")
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(art_dir, "v3_museum_tab1_team.png"))

    # Close museum and enter Z1S3 gameplay
    page.click("#btn-close-archive")
    page.wait_for_timeout(250)
    page.click("#btn-menu-quick-play")
    page.wait_for_timeout(700)

    # Give player canonical inventory items, select one, trigger Captain Dread dialogue, and open RMB menu
    page.evaluate("""() => {
        const g = window.__SPARKLE_GAME__;
        g.addInventoryItem('blueprint');
        g.addInventoryItem('hammer_bag');
        g.addInventoryItem('glue');
        g.selectInventoryItem('hammer_bag');
        const hit = g.getVisibleHotspots().find(h => h.id === 'z1s3_cap_dread');
        if (hit) {
            g.executeVerbOnHotspot(hit, 'talk');
            g.openRmbMenuForHotspot(hit, new MouseEvent('contextmenu', { clientX: 1120, clientY: 360 }));
        }
        g.flushDialogueTypewriter();
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(art_dir, "v4_hud_and_rmb.png"))

    # Close RMB & switch to Z1S2
    page.evaluate("""() => {
        const g = window.__SPARKLE_GAME__;
        document.getElementById('rmb-action-menu').style.display = 'none';
        g.switchRoom('Z1S2');
        g.flushDialogueTypewriter();
    }""")
    page.wait_for_timeout(600)
    page.screenshot(path=os.path.join(art_dir, "v4_z1s2_hud.png"))

    # Open Island Map Modal to verify Aguilar's 2010 map
    page.click("#btn-island-map")
    page.wait_for_timeout(400)
    page.screenshot(path=os.path.join(art_dir, "v3_island_map_modal.png"))
    page.click("#btn-close-map")
    page.wait_for_timeout(250)

    # Toggle 2010 Sketch Mode in Z1S3
    page.click("#btn-sketch-mode")
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(art_dir, "v3_z1s3_sketch_mode.png"))

    # Verify iMUSE room cues and HUD music cycling button
    cues = []
    cues.append(page.locator("#hud-music-label").inner_text())
    page.evaluate('window.__SPARKLE_GAME__.switchRoom("Z1S2")')
    cues.append(page.locator("#hud-music-label").inner_text())
    page.evaluate('window.__SPARKLE_GAME__.switchRoom("Z1S1")')
    cues.append(page.locator("#hud-music-label").inner_text())
    page.evaluate('window.__SPARKLE_GAME__.installPerpetualMachine()')
    cues.append(page.locator("#hud-music-label").inner_text())
    page.evaluate('window.__SPARKLE_GAME__.switchRoom("LOLDEMO")')
    cues.append(page.locator("#hud-music-label").inner_text())
    page.click("#btn-hud-music")
    cues.append(page.locator("#hud-music-label").inner_text())
    print("Verified Music Cues:", " -> ".join(cues))

    browser.close()

print("Console errors:", console_errs)
print("Failed HTTP requests:", failed_reqs)
