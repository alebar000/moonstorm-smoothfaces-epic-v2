import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from playwright.sync_api import sync_playwright

ROOT = r"C:\AntiGravityStuff\Moonstorm2"
DIST_DIR = os.path.join(ROOT, "dist")
OUT_DIR = os.path.join(ROOT, "review", "l24_qa")
LAYOUT_DIR = os.path.join(ROOT, "review", "layout_shots", "slice2_act1_rooms")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(LAYOUT_DIR, exist_ok=True)

handler = partial(SimpleHTTPRequestHandler, directory=DIST_DIR)
server = ThreadingHTTPServer(("127.0.0.1", 8788), handler)
t = threading.Thread(target=server.serve_forever, daemon=True)
t.start()

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto("http://127.0.0.1:8788/index.html", wait_until="networkidle")
        page.wait_for_timeout(1000)

        # 1. Z1S2 Main Hallway (A Baby + Ventriloquist & Rapoleon)
        page.evaluate("""() => {
            const g = window.__sparkleGame || window.__SPARKLE_GAME__;
            g.enterGameplay('Z1S2');
            g.player.x = 1360;
            g.cameraX = 580;
        }""")
        page.wait_for_timeout(700)
        page.screenshot(path=os.path.join(OUT_DIR, "fixed_z1s2_hallway.png"))
        page.screenshot(path=os.path.join(LAYOUT_DIR, "z1s2_with_chars.png"))

        # 2. Z1S1 Machine Room (Default: Nihongo + 4 recumbent pedal stations + dense bilge)
        page.evaluate("""() => {
            const g = window.__sparkleGame || window.__SPARKLE_GAME__;
            g.flags.pedalBrokenBam = false;
            g.flags.perpetualMachineInstalled = false;
            g.switchRoom('Z1S1');
            g.player.x = 1040;
            g.cameraX = 280;
        }""")
        page.wait_for_timeout(700)
        page.screenshot(path=os.path.join(OUT_DIR, "fixed_z1s1_default.png"))
        page.screenshot(path=os.path.join(LAYOUT_DIR, "z1s1_with_chars.png"))

        # 3. Z1S1 Machine Room (Perpetual Movement Machine Installed on Station #4)
        page.evaluate("""() => {
            const g = window.__sparkleGame || window.__SPARKLE_GAME__;
            g.flags.pedalBrokenBam = true;
            g.flags.perpetualMachineInstalled = true;
            g.switchRoom('Z1S1');
            g.player.x = 1480;
            g.player.facing = 1;
            g.cameraX = 640;
        }""")
        page.wait_for_timeout(700)
        page.screenshot(path=os.path.join(OUT_DIR, "fixed_z1s1_perpetual_installed.png"))

        # 4. Z0 Spooky Paper Castle (6-piece Cutout Bridge Troll)
        page.evaluate("""() => {
            const g = window.__sparkleGame || window.__SPARKLE_GAME__;
            g.switchRoom('LOLDEMO');
            g.player.x = 760;
            g.cameraX = 240;
        }""")
        page.wait_for_timeout(700)
        page.screenshot(path=os.path.join(OUT_DIR, "fixed_z0_cutout_troll.png"))

        browser.close()
        print("Captured all 4 live verification screenshots!")
finally:
    server.shutdown()
