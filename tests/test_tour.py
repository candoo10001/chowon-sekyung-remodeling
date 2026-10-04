"""Real WebGL checks for the original, predicted apartment tour."""
import functools
import http.server
from pathlib import Path
import threading
import unittest
from playwright.sync_api import sync_playwright, expect


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class ApartmentTourTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root = Path(__file__).resolve().parents[1]
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(root)))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.playwright = sync_playwright().start()
        # Software WebGL is explicit in headless tests, never in the shipped app.
        cls.browser = cls.playwright.chromium.launch(args=['--enable-unsafe-swiftshader'])
        cls.url = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def setUp(self):
        self.page = self.browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        self.page.goto(self.url, wait_until='networkidle')

    def tearDown(self):
        self.page.close()
        self.assertEqual(self.errors, [])

    def start(self):
        self.page.locator('#tour-start').click()
        expect(self.page.locator('#tour-shell')).to_have_attribute('data-state', 'ready')
        return self.page.locator('#tour-canvas-host canvas')

    def test_lazy_loading_and_all_rooms(self):
        resources = self.page.evaluate('performance.getEntriesByType("resource").map(r => r.name)')
        self.assertFalse(any('three.module' in url or 'tour-scene' in url for url in resources))
        expect(self.page.locator('#tour-disclaimer')).to_contain_text('확정 아님')
        canvas = self.start()
        overview = canvas.screenshot()
        room_images = []
        for room in ('living', 'kitchen', 'master', 'bedroom', 'study', 'bath', 'ensuite', 'entry'):
            self.page.locator(f'.tour-room[data-room="{room}"]').click()
            expect(canvas).to_have_attribute('data-view', 'interior')
            expect(canvas).to_have_attribute('data-current-room', room)
            self.assertEqual(self.page.locator('.tour-room[aria-pressed="true"]').count(), 1)
            room_images.append(canvas.screenshot())
        self.assertEqual(len(set(room_images)), 8, 'Every room must produce a different rendered view')
        self.assertNotIn(overview, room_images)
        self.page.locator('#tour-reset').click()
        expect(canvas).to_have_attribute('data-view', 'overview')

    def test_materials_camera_and_keyboard(self):
        canvas = self.start()
        before = canvas.screenshot()
        self.page.locator('[data-palette="cool"]').click()
        expect(self.page.locator('[data-palette="cool"]')).to_have_attribute('aria-pressed', 'true')
        cool = canvas.screenshot()
        self.assertNotEqual(before, cool)
        self.page.locator('#tour-right').click()
        rotated = canvas.screenshot()
        self.assertNotEqual(cool, rotated)
        canvas.focus()
        canvas.press('+')
        self.assertNotEqual(rotated, canvas.screenshot())
        self.page.locator('#tour-mode-interior').click()
        interior = canvas.screenshot()
        canvas.press('ArrowRight')
        self.assertNotEqual(interior, canvas.screenshot())

    def test_guided_tour_advances_and_stops_on_input(self):
        canvas = self.start()
        self.page.clock.install()
        self.page.locator('#tour-guide').click()
        expect(self.page.locator('#tour-guide')).to_have_attribute('aria-pressed', 'true')
        self.page.clock.run_for(7100)
        expect(canvas).to_have_attribute('data-current-room', 'kitchen')
        self.page.locator('#tour-left').click()
        expect(self.page.locator('#tour-guide')).to_have_attribute('aria-pressed', 'false')
        self.page.locator('#tour-guide').click()
        self.page.evaluate('scrollTo(0, 0)')
        self.page.clock.run_for(100)
        expect(self.page.locator('#tour-guide')).to_have_attribute('aria-pressed', 'false')

    def test_load_failure_fallback_and_retry(self):
        self.page.route('**/tour-scene.js*', lambda route: route.abort())
        self.page.locator('#tour-start').click()
        expect(self.page.locator('#tour-shell')).to_have_attribute('data-state', 'error')
        expect(self.page.locator('.tour-fallback-link')).to_be_visible()
        expect(self.page.locator('#tour-start')).to_be_enabled()
        expect(self.page.locator('#tour-mode-interior')).to_be_disabled()
        self.page.unroute('**/tour-scene.js*')
        self.start()

    def test_phone_controls_and_resizing(self):
        self.page.set_viewport_size({'width': 320, 'height': 700})
        canvas = self.start()
        for width in (320, 375, 768, 1024, 1440):
            self.page.set_viewport_size({'width': width, 'height': 900})
            self.page.locator('#tour-stage').scroll_into_view_if_needed()
            overflow = self.page.locator('#tour-shell').evaluate('''root => [...root.querySelectorAll('*')].filter(e => {
                const r = e.getBoundingClientRect(); return r.width && (r.left < -1 || r.right > innerWidth + 1);
            }).map(e => e.id || e.className)''')
            self.assertEqual(overflow, [], width)
            self.assertGreater(canvas.bounding_box()['width'], 250)
        self.page.set_viewport_size({'width': 375, 'height': 812})
        self.page.locator('.tour-room[data-room="master"]').click()
        expect(canvas).to_have_attribute('data-current-room', 'master')
        self.assertGreaterEqual(self.page.locator('#tour-stage').bounding_box()['y'], 80)
        self.assertLess(self.page.locator('#tour-stage').bounding_box()['y'], 120)


if __name__ == '__main__':
    unittest.main()
