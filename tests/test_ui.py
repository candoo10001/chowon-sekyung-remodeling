"""Browser regressions for selection contrast, responsive layout, and controls.

Run: python -m unittest discover -s tests -v
Install first: python -m pip install -r requirements-dev.txt
              python -m playwright install chromium
"""
import functools
import http.server
import os
from pathlib import Path
import re
import threading
import unittest

from playwright.sync_api import sync_playwright, expect


ROOT = Path(os.environ.get('CHOWON_TEST_ROOT', Path(__file__).resolve().parents[1]))


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def contrast(foreground, background):
    def luminance(color):
        channels = [int(n) / 255 for n in re.findall(r'\d+', color)[:3]]
        linear = [n / 12.92 if n <= .04045 else ((n + .055) / 1.055) ** 2.4 for n in channels]
        return sum(a * b for a, b in zip(linear, (.2126, .7152, .0722)))
    a, b = sorted((luminance(foreground), luminance(background)))
    return (b + .05) / (a + .05)


class UIRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(
            ('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()
        cls.base_url = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def setUp(self):
        self.page = self.browser.new_page(viewport={'width': 375, 'height': 812}, reduced_motion='reduce')
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        self.page.goto(self.base_url, wait_until='networkidle')
        self.page.evaluate('document.fonts.ready')
        # Fail explicitly when the site's existing CDN styles could not load.
        self.assertEqual(self.page.locator('#main-header').evaluate('(e) => getComputedStyle(e).position'), 'sticky')

    def tearDown(self):
        self.page.close()
        self.assertEqual(self.errors, [])

    def assert_disjoint(self, first, second):
        a, b = first.bounding_box(), second.bounding_box()
        self.assertIsNotNone(a)
        self.assertIsNotNone(b)
        self.assertTrue(
            a['x'] + a['width'] <= b['x'] + 1 or b['x'] + b['width'] <= a['x'] + 1 or
            a['y'] + a['height'] <= b['y'] + 1 or b['y'] + b['height'] <= a['y'] + 1,
            f'Elements overlap: {a}, {b}')

    def test_responsive_layouts(self):
        for width in (320, 375, 390, 640, 768, 1024, 1280, 1440):
            with self.subTest(width=width):
                self.page.set_viewport_size({'width': width, 'height': 812})
                self.page.locator('#value-settings').evaluate('(e) => e.open = true')
                self.page.evaluate('scrollTo(0, 0)')
                self.assert_disjoint(self.page.locator('body > aside'), self.page.locator('#main-header'))
                nav = self.page.locator('#main-header nav[aria-label="주 메뉴"]')
                if nav.is_visible():
                    self.assert_disjoint(self.page.locator('.header-brand'), nav)
                    self.assertLessEqual(nav.bounding_box()['x'] + nav.bounding_box()['width'], width)
                else:
                    self.assert_disjoint(self.page.locator('.header-brand'), self.page.locator('#mobile-menu-btn'))
                if width < 768:
                    for selector in ('.plan-tab', '.map-filter'):
                        boxes = [button.bounding_box() for button in self.page.locator(selector).all()]
                        self.assertLess(max(b['y'] for b in boxes) - min(b['y'] for b in boxes), 1)
                        self.assertTrue(all(b['height'] >= 44 and b['width'] >= 44 for b in boxes))
                        self.assertTrue(self.page.locator(selector).evaluate_all('(es) => es.every(e => e.scrollWidth <= e.clientWidth)'))
                    fields = self.page.locator('.value-fields input')
                    self.assertAlmostEqual(fields.nth(2).bounding_box()['y'], fields.nth(3).bounding_box()['y'], delta=1)
                self.assert_disjoint(self.page.locator('#before-badge'), self.page.locator('#after-badge'))
                self.assert_disjoint(self.page.locator('#plan-badge'), self.page.locator('#plan-ratio'))
                self.assert_disjoint(self.page.locator('#plan-code'), self.page.locator('#plan-layout'))
                # Only the comparison table and blueprint intentionally scroll sideways.
                overflow = self.page.evaluate('''() => [...document.querySelectorAll('body *')].filter(e => {
                    if (e.closest('svg, #comparison-container, .comparison-table-scroll, #plan-svg-container, dialog')) return false;
                    const r = e.getBoundingClientRect();
                    return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
                }).map(e => e.id || e.tagName + '.' + e.className)''')
                self.assertEqual(overflow, [])
                self.page.locator('#calculator').scroll_into_view_if_needed()
                self.assertAlmostEqual(self.page.locator('#main-header').bounding_box()['y'], 0, delta=1)

    def test_calculator_selection_contrast_and_results(self):
        expect(self.page.locator('[data-premium="20"]')).to_have_attribute('aria-pressed', 'true')
        expect(self.page.locator('#res-value')).to_have_text('15.00억원')
        expect(self.page.locator('#value-premium')).to_have_value('20')
        self.assertLess(self.page.locator('#calculator').bounding_box()['height'], 700)
        self.assertEqual(self.page.locator('[data-price-disclosure][open]').count(), 0)
        self.page.locator('#value-settings > summary').click()
        buttons = self.page.locator('[data-premium]')
        for index, amount in ((1,'13.75'), (2,'15.00'), (0,'12.50'), (1,'13.75')):
            buttons.nth(index).click()
            self.assertEqual(self.page.locator('[data-premium][aria-pressed="true"]').count(), 1)
            expect(self.page.locator('#res-value')).to_have_text(amount + '억원')
            for button in buttons.all():
                colors = button.evaluate("e => [getComputedStyle(e).color,getComputedStyle(e).backgroundColor]")
                self.assertGreaterEqual(contrast(*colors),4.5)
                colors = button.evaluate("e => [getComputedStyle(e.querySelector('span')).color,getComputedStyle(e).backgroundColor]")
                self.assertGreaterEqual(contrast(*colors),4.5)
        self.page.locator('#value-new-area').fill('28')
        expect(self.page.locator('#res-value')).to_have_text('15.40억원')
        self.page.locator('#value-premium').fill('-20')
        expect(self.page.locator('#res-value')).to_have_text('11.20억원')
        self.assertEqual(self.page.locator('[data-premium][aria-pressed="true"]').count(),0)
        self.page.locator('#value-old-area').fill('0')
        expect(self.page.locator('#value-error')).to_be_visible()
        expect(self.page.locator('#res-value')).to_have_text('—')
        self.page.locator('#value-old-area').fill('19')
        self.page.locator('#value-sale').fill('')
        expect(self.page.locator('#res-value')).to_have_text('—')
        self.page.locator('#value-sale').fill('9.5')
        expect(self.page.locator('#value-error')).to_be_hidden()
        expect(self.page.locator('#res-value')).to_have_text('11.20억원')

    def test_floorplans_and_hover_contrast(self):
        for plan, label in (('type59B', '동선 · 서비스 공간'), ('type49old', '기존 2침실 배치'), ('type59A', '코어를 피한 수평증축')):
            button = self.page.locator(f'#tab-{plan}')
            button.click()
            button.hover()
            expect(button).to_have_attribute('aria-pressed', 'true')
            self.assertEqual(self.page.locator('.plan-tab[aria-pressed="true"]').count(), 1)
            expect(self.page.locator('#plan-layout')).to_have_text(label)
            colors = button.evaluate('e => [getComputedStyle(e).color, getComputedStyle(e).backgroundColor]')
            self.assertGreaterEqual(contrast(*colors), 4.5)
            self.assertLessEqual(self.page.locator('#plan-svg-container svg').bounding_box()['width'], self.page.locator('#plan-svg-container').bounding_box()['width'] + 1)

    def test_mobile_navigation_plan_zoom_and_calculator_helpers(self):
        self.page.set_viewport_size({'width': 320, 'height': 568})
        nav = self.page.locator('.mobile-quick-nav')
        for target in ('floorplans', 'apartment-tour', 'timeline', 'calculator'):
            link = nav.locator(f'a[href="#{target}"]')
            link.click()
            expect(link).to_have_attribute('aria-current', 'location')
            self.assertGreaterEqual(self.page.locator('#' + target).bounding_box()['y'], 64)
        self.page.locator('#value-settings > summary').click()
        self.page.locator('#value-new-area').fill('28')
        expect(nav).to_be_hidden()
        expect(self.page.locator('#new-area-metric')).to_contain_text('92.6')
        self.page.locator('#value-reset').click()
        expect(self.page.locator('#value-new-area')).to_have_value('25')
        expect(self.page.locator('#res-value')).to_have_text('15.00억원')
        expect(self.page.locator('[data-premium="20"]')).to_have_attribute('aria-pressed', 'true')
        expect(nav).to_be_visible()
        nav.locator('a[href="#floorplans"]').click()
        self.page.locator('#plan-zoom').click()
        container = self.page.locator('#plan-svg-container')
        self.assertGreater(container.evaluate('(e) => e.scrollWidth'), container.evaluate('(e) => e.clientWidth'))
        self.page.locator('#tab-type49old').click()
        expect(self.page.locator('#plan-zoom')).to_have_attribute('aria-pressed', 'true')
        self.page.locator('#plan-zoom').click()
        self.assertLessEqual(container.evaluate('(e) => e.scrollWidth'), container.evaluate('(e) => e.clientWidth') + 1)
        table = self.page.locator('.comparison-table-scroll')
        self.assertLessEqual(table.evaluate('(e) => e.scrollWidth'), table.evaluate('(e) => e.clientWidth') + 1)
        for row in self.page.locator('.comparison-table tbody tr').all():
            self.assertEqual(row.locator('td[data-label]').count(), 4)
        self.page.locator('.checklist-items summary').first.click()
        expect(self.page.locator('.checklist-items details').first).to_have_attribute('open', '')

    def test_section_and_plan_label_contrast(self):
        labels = self.page.locator('section > div > .text-center > span, #plan-badge, #plan-layout, #floorplans .bg-slate-50 > span:first-child')
        self.assertGreater(labels.count(), 8)
        for label in labels.all():
            colors = label.evaluate('''e => {
                let ancestor = e;
                while (ancestor && getComputedStyle(ancestor).backgroundColor === 'rgba(0, 0, 0, 0)') ancestor = ancestor.parentElement;
                return [getComputedStyle(e).color, ancestor ? getComputedStyle(ancestor).backgroundColor : 'rgb(255, 255, 255)'];
            }''')
            self.assertGreaterEqual(contrast(*colors), 4.5, label.inner_text())

    def test_location_filters(self):
        for index, category in enumerate(('transit', 'nature', 'edu', 'infra')):
            self.page.locator('.map-filter').nth(index).click()
            self.assertEqual(self.page.locator('.map-filter[aria-pressed="true"]').count(), 1)
            visible = self.page.locator('.map-point:visible')
            self.assertGreater(visible.count(), 0)
            self.assertEqual(visible.count(), self.page.locator(f'.map-point.{category}').count())
            for card in visible.all():
                self.assertEqual(card.evaluate('e => getComputedStyle(e).display'), 'block')
        self.page.locator('.map-filter').first.click()
        self.assertEqual(self.page.locator('.map-point:visible').count(), 2)

    def test_mobile_menu_and_anchor_navigation(self):
        self.page.set_viewport_size({'width': 667, 'height': 375})
        button = self.page.locator('#mobile-menu-btn')
        button.click()
        expect(button).to_have_attribute('aria-expanded', 'true')
        menu = self.page.locator('#mobile-menu')
        box = menu.bounding_box()
        self.assertLessEqual(box['y'] + box['height'], 376)
        self.page.locator('.mobile-nav-link[href="#calculator"]').click()
        expect(menu).to_be_hidden()
        expect(button).to_have_attribute('aria-expanded', 'false')
        section_y = self.page.locator('#calculator').bounding_box()['y']
        self.assertGreaterEqual(section_y, self.page.locator('#main-header').bounding_box()['height'])
        button.click()
        self.page.keyboard.press('Escape')
        expect(menu).to_be_hidden()
        expect(button).to_be_focused()
        button.click()
        self.page.set_viewport_size({'width': 1440, 'height': 900})
        expect(menu).to_be_hidden()
        self.page.set_viewport_size({'width': 375, 'height': 812})
        expect(button).to_have_attribute('aria-expanded', 'false')

    def test_lightbox_dialog_small_screens_and_keyboard(self):
        for width, height in ((320, 568), (667, 375), (1440, 900)):
            with self.subTest(viewport=(width, height)):
                self.page.set_viewport_size({'width': width, 'height': height})
                self.page.evaluate('window.openLightbox("assets/the_sharp_138_rendering.jpg", "제목", "설명")')
                modal = self.page.locator('#lightboxModal')
                expect(modal).to_be_visible()
                close = self.page.locator('#lightbox-close')
                close.focus()
                expect(close).to_be_focused()
                box = close.bounding_box()
                self.assertGreaterEqual(box['y'], 0)
                self.assertLessEqual(box['y'] + box['height'], height)
                self.page.keyboard.press('Tab')
                self.assertTrue(self.page.evaluate('document.querySelector("#lightboxModal").contains(document.activeElement)'))
                self.page.keyboard.press('Escape')
                expect(modal).to_be_hidden()
                self.assertEqual(self.page.evaluate('document.body.style.overflow'), '')
                self.page.evaluate('window.openLightbox("assets/the_sharp_138_rendering.jpg", "제목", "설명")')
                close.click()
                expect(modal).to_be_hidden()

    def test_comparison_slider_keyboard_and_drag(self):
        slider = self.page.locator('#comparison-slider')
        slider.focus()
        slider.press('ArrowRight')
        expect(slider).to_have_attribute('aria-valuenow', '55')
        slider.press('Home')
        expect(slider).to_have_attribute('aria-valuenow', '5')
        slider.press('End')
        expect(slider).to_have_attribute('aria-valuenow', '95')
        self.page.locator('#comparison-container').scroll_into_view_if_needed()
        box = self.page.locator('#comparison-container').bounding_box()
        self.page.mouse.move(box['x'] + box['width'] * .8, box['y'] + box['height'] / 2)
        self.page.mouse.down()
        self.page.mouse.move(box['x'] + box['width'] * .3, box['y'] + box['height'] / 2, steps=5)
        self.page.mouse.up()
        self.assertAlmostEqual(int(slider.get_attribute('aria-valuenow')), 30, delta=1)

    def test_comparison_touch_gestures(self):
        context = self.browser.new_context(viewport={'width': 390, 'height': 844},
                                           is_mobile=True, has_touch=True, reduced_motion='reduce')
        page = context.new_page()
        try:
            page.goto(self.base_url, wait_until='networkidle')
            page.locator('#comparison-container').scroll_into_view_if_needed()
            box = page.locator('#comparison-container').bounding_box()
            session = context.new_cdp_session(page)

            def swipe(start_x, start_y, end_x, end_y):
                session.send('Input.dispatchTouchEvent', {'type': 'touchStart',
                             'touchPoints': [{'x': start_x, 'y': start_y}]})
                for step in range(1, 9):
                    session.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{
                        'x': start_x + (end_x - start_x) * step / 8,
                        'y': start_y + (end_y - start_y) * step / 8}]})
                session.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})

            y = box['y'] + box['height'] / 2
            swipe(box['x'] + box['width'] * .8, y, box['x'] + box['width'] * .3, y)
            slider = page.locator('#comparison-slider')
            self.assertAlmostEqual(int(slider.get_attribute('aria-valuenow')), 30, delta=1)
            value = slider.get_attribute('aria-valuenow')
            previous_scroll = page.evaluate('scrollY')
            swipe(box['x'] + box['width'] / 2, y + 60, box['x'] + box['width'] / 2, y - 60)
            expect(slider).to_have_attribute('aria-valuenow', value)
            self.assertGreater(page.evaluate('scrollY'), previous_scroll)
        finally:
            context.close()


if __name__ == '__main__':
    unittest.main()
