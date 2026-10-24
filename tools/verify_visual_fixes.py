import os
import shutil
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from playwright.sync_api import sync_playwright

ROOT = r"C:\AntiGravityStuff\Moonstorm2"
DIST_DIR = os.path.join(ROOT, "dist")
OUT_DIR = os.path.join(ROOT, "review", "l24_qa")
LAYOUT_DIR = os.path.join(ROOT, "review", "layout_shots", "slice2_act1_rooms")
ART_DIR = r"C:\Users\alexb\.gemini\antigravity\brain\52bc129d-1cf6-4895-ace6-d76dd5a74539"
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
        shutil.copy2(os.path.join(OUT_DIR, "fixed_z1s2_hallway.png"), os.path.join(ART_DIR, "v2_z1s2_hallway.png"))

        # 2. Z1S1 Machine Room (Default: Nihongo + 4 pedal stations + prominent foreground bilge)
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
        shutil.copy2(os.path.join(OUT_DIR, "fixed_z1s1_default.png"), os.path.join(ART_DIR, "v2_z1s1_default.png"))

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
        shutil.copy2(os.path.join(OUT_DIR, "fixed_z1s1_perpetual_installed.png"), os.path.join(ART_DIR, "v2_z1s1_perpetual_installed.png"))

        # 4. Z0 Spooky Paper Castle (6-piece Cutout Bridge Troll)
        page.evaluate("""() => {
            const g = window.__sparkleGame || window.__SPARKLE_GAME__;
            g.switchRoom('LOLDEMO');
            g.player.x = 760;
            g.cameraX = 240;
        }""")
        page.wait_for_timeout(700)
        page.screenshot(path=os.path.join(OUT_DIR, "fixed_z0_cutout_troll.png"))
        shutil.copy2(os.path.join(OUT_DIR, "fixed_z0_cutout_troll.png"), os.path.join(ART_DIR, "v2_z0_cutout_troll.png"))

        # 5. Mesa de Luz (http://localhost:8765/)
        mesa_page = browser.new_page(viewport={"width": 1600, "height": 1000})
        mesa_page.goto("http://localhost:8765/", wait_until="networkidle")
        mesa_page.wait_for_timeout(600)
        for puppet in ["nihongo", "ababy", "ventriloquist", "troll"]:
            mesa_page.click(f'[data-switch-puppet="{puppet}"]')
            mesa_page.wait_for_function("""() => {
                const imgs = Array.from(document.querySelectorAll('#rig-viewport img'));
                return imgs.length > 0 && imgs.every(im => im.complete && im.naturalWidth > 0);
            }""", timeout=5000)
            broken = mesa_page.evaluate("""() => {
                return Array.from(document.querySelectorAll('#rig-viewport img'))
                    .filter(im => !im.complete || im.naturalWidth === 0)
                    .map(im => im.dataset.key);
            }""")
            print(f"Mesa de Luz [{puppet}] broken layers: {broken}")
            mesa_page.locator(".rig-card").screenshot(path=os.path.join(ART_DIR, f"v2_mesa_{puppet}.png"))
        mesa_page.screenshot(path=os.path.join(ART_DIR, "v2_mesa_full.png"))

        browser.close()
        print("Captured all live game + Mesa de Luz verification screenshots!")
finally:
    server.shutdown()
