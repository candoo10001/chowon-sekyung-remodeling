# 초원세경 리모델링 정보 웹사이트

Static HTML/CSS/JavaScript site with a research-based **concept** floor plan,
interactive 3D tour, and editable price scenarios. The model is not an approved
architectural or structural design. Live site: https://chowon-sekyung.surge.sh (published 2026-10-05).

## Run

```sh
python -m http.server 8080
```

Open http://localhost:8080. HTTP is required for the tour's ES modules.
The existing Tailwind, font and icon CDNs require internet access. Three.js,
textures and HDR environments are served locally.

## Plan and tour

- `plan-layout.js`: shared unit boundary, walls, openings, room/camera positions,
  furniture footprints and SVG diagrams.
- `app.js`: navigation, comparison slider, plan selection, market calculator,
  map filters and accessible gallery dialog.
- `tour.js`: lazy loading, room selection, guide, retry and visibility handling.
- `tour-scene.js`: procedural furniture, PBR surfaces, HDR lighting and SSAO.
- `tour.css`, `styles.css`: responsive controls, layout and selection contrast.
- `research/notes.md`: source provenance, dates, design choices and limitations.
- `assets/tour-materials/README.md`: CC0 material/background credits.

The existing two-bedroom plan comes from the designer linked in the user's Ohou
reference. A February 2026 community-shared remodeling drawing informs the stepped
outline, external common core, three bedrooms, two bathrooms, dressing and utility
spaces. Its current approval, dimensions and unit-type correspondence are unknown.
The proposed model is a furniture-scale planning study; coordinates must not be
used to establish measured floor area or construction feasibility.

Tour controls: drag to orbit/look, pinch or buttons to zoom, eight fixed viewpoints,
two material palettes and a 7-second guided sequence. Keyboard: Left/Right, +/−,
Home. This is not free walking. Rendering and guide stop offscreen or in hidden tabs;
reduced motion is respected. Load/WebGL failure retains a poster, 2D link and retry.

## Mobile experience

Phones have a compact header, safe-area-aware bottom navigation, larger reading
text and tap targets, and comparison cards instead of a horizontally scrolling
table. Floor plans fit the screen by default; the enlargement button preserves
access to detailed labels. The bottom navigation hides while editing inputs and
in short landscape viewports. Reduced-motion preferences apply to anchor links.

On touch devices the 3D canvas initially allows page scrolling. Enable touch
interaction with the button below the viewer, or use the room/camera buttons.
Touch devices use a lower rendering pixel ratio and skip ambient occlusion.
Gallery images load lazily. The calculator adds supply-area conversions to square
metres and a default-value reset. A collapsible consultation checklist covers
unit plans, additional costs and the dates of project notices.

## Price scenarios

The user's confirmed sale is 9.5억원 / supplied 19평 = approximately 5,000만원/평.
The exact trade has not been independently matched to the official register.
The calculator's supplied 25평 is an editable example, not a confirmed allocation.
At unchanged unit price it yields 12.50억; +10% yields 13.75억; +20% yields 15.00억.
The initial selection and reset use the +20% scenario (15.00억). Mobile price
inputs, calculation breakdown and transaction sources are expandable.
These are arithmetic scenarios, excluding contributions, taxes and financing costs.
Nearby transaction dates, areas, floors and reaggregation sources are on the page.

## Tests

Requires Python 3.10+, Node.js, and Chromium:

```sh
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
python -m unittest discover -s tests -v
```

Tests cover 320–1440px layouts, selected-text contrast, input validation and price
arithmetic, floor-plan tabs, touch/keyboard controls, dialogs, eight WebGL views,
load failure/retry, mobile quick navigation, plan enlargement, calculator reset,
real touch scrolling over the viewer, and simplified furniture/fixture/door-sweep geometry. Geometry
checks are design sanity checks, not architectural or code-compliance certification.
Browser tests explicitly enable software WebGL; production does not force it.

Interaction reference: https://threejs.org/examples/misc_controls_orbit
Three.js r180 MIT license: `assets/vendor/three/LICENSE`.
