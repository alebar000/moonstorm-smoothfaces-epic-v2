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
    page.wait_for_timeout(700)
    page.screenshot(path=os.path.join(art_dir, "v3_main_menu.png"))

    # Open Time Capsule Museum from Main Menu
    page.click("#btn-menu-credits")
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(art_dir, "v3_museum_tab1_team.png"))

    # Tab 2: Timeline (Production)
    page.click('.archive-tab-btn[data-tab="timeline"]')
    page.wait_for_timeout(400)
    page.click('.timeline-node-btn[data-node-id="tl_oct_2010"]')
    page.wait_for_timeout(400)
    page.screenshot(path=os.path.join(art_dir, "v3_museum_tab2_timeline.png"))

    # Tab 2b: Lore Timeline
    page.click('.timeline-mode-btn[data-tmode="lore"]')
    page.wait_for_timeout(400)
    page.screenshot(path=os.path.join(art_dir, "v3_museum_tab2_lore.png"))

    # Tab 3: Gallery
    page.click('.archive-tab-btn[data-tab="gallery"]')
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(art_dir, "v3_museum_tab3_gallery.png"))

    # Open Lightbox on GUImu003
    page.evaluate('window.__SPARKLE_GAME__.archiveMuseum.openLightbox("guimu003")')
    page.wait_for_timeout(400)
    page.screenshot(path=os.path.join(art_dir, "v3_museum_lightbox.png"))
    page.click("#btn-close-lightbox")
    page.wait_for_timeout(250)

    # Tab 4: Comparator 2010 vs 2026
    page.click('.archive-tab-btn[data-tab="compare"]')
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(art_dir, "v3_museum_tab4_compare.png"))

    # Tab 5: Docs & Easter Eggs
    page.click('.archive-tab-btn[data-tab="docs"]')
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(art_dir, "v3_museum_tab5_docs_eggs.png"))

    # Close museum and enter Z1S3 gameplay
    page.click("#btn-close-archive")
    page.wait_for_timeout(250)
    page.click("#btn-menu-quick-play")
    page.wait_for_timeout(600)

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

    browser.close()

print("Console errors:", console_errs)
print("Failed HTTP requests:", failed_reqs)
