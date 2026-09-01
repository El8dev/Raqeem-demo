# Agent Development Log

## Project: Raqeem-Demo (مختبرات رقيم — النسخة التجريبية)

### Log Entry: 2026-08-30
- **Action**: User requested to run the demo.
- **Investigation**: Evaluated runtime options (`server.js`, Vite dev server, standalone binary).
- **Execution**: User selected Option 1 (`node server.js`).
- **Observation**: Attempted to bind to port 5005; encountered `EADDRINUSE`.
- **Diagnostic**: Inspected port 5005 via PowerShell `Get-NetTCPConnection` and `Get-CimInstance`. Discovered an existing active instance of `node server.js` running under PID `5028`.
- **Verification**: Sent an HTTP GET request to `http://localhost:5005/` via `Invoke-WebRequest`, returning status code `200 OK`.
- **Current State**: The demo server is actively running and responding on `http://localhost:5005`.

### Log Entry: 2026-08-30 (Non-Polar Dielectric Overhaul Planning)
- **User Query**: 
  1. Why is scrolling blocked in `nonpolar.html`?
  2. Can the simulation be made smoother and optimized?
  3. Can the generic black slab be replaced with authentic non-polar materials (e.g., Polyethylene, Glass)?
- **Diagnosis**:
  1. `src/css/raqeem-experiment.css` applies `overflow: hidden; height: 100%` on `html, body`. Because it is linked after `<style>`, it overrides page scrolling.
  2. The simulation suffered from layout thrashing by updating `style.left`/`style.top` directly on mouse/touch events and mutating >20 DOM styles per frame inside `requestAnimationFrame`.
  3. Pre-existing tumbling dipoles misrepresented non-polar physics (non-polar molecules have zero net dipole moment at rest and are induced to polarize via field displacement).
- **Decision**: User approved Option 1: Complete physics and visual overhaul, restoring scrolling, switching to GPU hardware-accelerated transforms (`translate3d`), implementing authentic material mimicry (Polyethylene & Glass switcher), while preserving existing dipole capsules as requested.
- **Changes Applied**:
  - `src/experiments/nonpolar.html`: Overrode `raqeem-experiment.css` scroll lock via `overflow-y: auto !important; touch-action: pan-y;` and scoped `touch-action: none;` to `#dielectricObj`.
  - Replaced DOM reflows with GPU-composited `transform: translate3d(x, y, 0)` and stored coordinates in memory.
  - Added material switcher for Polyethylene (PE, $\kappa=2.3$) and Crown Glass ($\kappa=5.0$) with authentic frosted/glassmorphic textures, chemical formulas, and bound surface charges ($\pm \sigma_b$).
  - Synced changes to `dist/src/experiments/nonpolar.html`.
- **Verification**: Syntax validated using Node V8 parser. HTTP endpoint tested at `http://localhost:5005/experiments/nonpolar.html` returning status 200 OK.

### Log Entry: 2026-08-30 (Apparatus Centering in Workspace)
- **User Request**: Center the capacitor and the insulator inside the experiment field to resolve the vertical asymmetry observed in the UI (too much dead space at bottom, apparatus huddled at the top edge).
- **Solution Executed (Option A)**:
  - Overrode legacy `#workspace` min-height constraints with a balanced `height: 440px`.
  - Centered `#apparatus-stage` with `top: 50%; left: 50%; transform: translate(-50%, -50%)`.
  - Repositioned `#capacitorObj` to `top: 95px` (spanning $y = 95\text{px} \rightarrow 215\text{px}$).
  - Shifted external field vectors `#extField` down to $y = 105, 130, 155, 180, 205\text{px}$.
  - Positioned the insulator resting cleanly outside at $y = 275\text{px}$, with drag clamping bounds between $95\text{px}$ (fully centered inside capacitor) and $275\text{px}$ (resting).
  - Synced to `dist/src/experiments/nonpolar.html` and verified syntax.

### Log Entry: 2026-08-30 (Parallel Capacitors Charge Indicator Alignment Fix)
- **User Issue**: In `parallel.html`, the positive ($+$) and negative ($-$) charge signs were broken/misaligned (bunched tightly to the left side and floating incorrectly above/below plates).
- **Diagnosis**: 
  - Elements used Tailwind arbitrary value classes (`w-[110px]`, `top-[20px]`, `bottom-[20px]`, `left-[15px]`).
  - Because `libs/tailwind.css` is a static pre-compiled build without JIT dynamic class compilation, these classes were unresolved.
  - Result: The container lacked `width` (causing `justify-around` to collapse) and lacked explicit `top`/`bottom`/`left` positions.
- **Action Taken**: 
  - Converted layout properties to inline styles: `top: 22px; bottom: 22px; left: 15px; width: 110px; font-size: 13px;` for both $C_1$ and $C_2$.
  - Preserved neon glow text shadows (`text-shadow: 0 0 6px rgba(239, 68, 68, 0.8)` and `rgba(59, 130, 246, 0.8)`).
  - Updated both `src/experiments/parallel.html` and `dist/src/experiments/parallel.html`.

### Log Entry: 2026-08-30 (Removal of Parallel Formulas HUD Ribbon)
- **User Request**: Remove the top HUD telemetry ribbon ("قوانين التوازي") from the workspace.
- **Action Taken**: 
  - Completely deleted the `#math-hud` DOM node from `src/experiments/parallel.html`.
  - Removed obsolete JavaScript state-handling logic (references in `onReset`, `handleSwitchClick`, and the per-frame DOM updates in `renderMolecules`).
  - Verified no residual console errors or memory overhead remain.

### Log Entry: 2026-08-31 (Keyboard Capacitor Distance Label Translation)
- **User Request**: Change the "Distance" label to Arabic in the keyboard capacitor experiment.
- **Action Taken**: 
  - Updated `<text id="distance-label">` in `src/experiments/capacitor_application_keyboard.html` from `Distance (d)` (`font-family="Outfit"`) to `البعد (d)` (`font-family="Tajawal"`).
  - Ensured synchronization with `dist/src/experiments/capacitor_application_keyboard.html`.

### Log Entry: 2026-08-31 (Keyboard Explanation Drawer Layout & Width Optimization)
- **User Issue**: The scientific explanation drawer modal ("كيف يعمل؟") was excessively wide and overlapped with the right side panel.
- **Diagnosis**: 
  - The modal used `max-w-[750px]` and `fixed inset-0` with screen centering (`justify-center`).
  - Because the 380px sidebar has `z-index: 9999`, the right portion of the 750px drawer slid underneath the sidebar.
- **Action Taken**:
  - Implemented Option 1: Set a compact `max-w-[540px]` on `#scientific-drawer`.
  - Added desktop positioning offset `@media (min-width: 900px) { #drawer-backdrop { right: 380px !important; left: 0 !important; } }` so the modal centers strictly within the visible workspace area without touching the sidebar.
  - Set `z-index: 10000` on `#drawer-backdrop` for robust layer isolation.
  - Condensed explanation cards padding, font sizing, and margins for a sleek fit.
  - Synced changes across `src/` and `dist/`.

### Log Entry: 2026-08-31 (Unified Purple Theme for Keyboard Scientific Drawer)
- **User Request**: Make the educational modal theme purple consistent with the rest of the application design.
- **Action Taken**:
  - Replaced cyan/blue accents in `#drawer-backdrop`, `#scientific-drawer`, and `#btn-open-drawer` with the unified Raqeem brand palette (`#7552FF`, `#5A46DA`, `--panel: #251758`, `--bg: #090617`).
  - Updated card styling to midnight purple glass (`rgba(26, 17, 60, 0.75)` with `rgba(117, 82, 255, 0.22)` borders).
  - Synchronized across both `src/` and `dist/`.
### Log Entry: 2026-09-01 (Faraday Experiment Wiring Configuration & Obstacle Avoidance Routing)
- **User Issue**:
  1. Primary ring connections were inverted: the upper ring node (`ring-p1`) was wired to the switch and the lower ring node (`ring-p2`) to the battery, causing crisscrossed overlapping wires.
  2. Induction wires needed Chapter 1's orthogonal avoidance logic so wires route cleanly around tools without crossing through internal component geometry.
- **Root Cause**:
  - `REQUIRED_PAIRS` and `autoConnectCircuit` in [faraday_experiment.html](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/experiments/faraday_experiment.html) mapped `switch-1` $\longleftrightarrow$ `ring-p1` and `battery-neg` $\longleftrightarrow$ `ring-p2`.
  - In [svg-wire-engine.js](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/engine/svg-wire-engine.js), terminal direction heuristics categorized `ring-p2` as `'right'` (pointing inwards into the ring core) and `ring-s1` as `'left'`, distorting the orthogonal clearance corridor generation.
- **Action Taken**:
  - Updated `REQUIRED_PAIRS` and `autoConnectCircuit` in [faraday_experiment.html](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/experiments/faraday_experiment.html):
    - `battery-pos` $\longleftrightarrow$ `ring-p1` (upper primary node connected directly to upper battery).
    - `ring-p2` $\longleftrightarrow$ `switch-1` (lower primary node connected directly to lower switch).
    - `switch-k` $\longleftrightarrow$ `battery-neg` (loop closed between switch and battery).
    - `ring-s1` $\longleftrightarrow$ `galvanometer-left` & `ring-s2` $\longleftrightarrow$ `galvanometer-right`.
  - Added `data-direction` support to `EliteComponents.createWrapper` in [elite-components.v2.js](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/engine/elite-components.v2.js) and [elite-components.js](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/engine/elite-components.js).
  - Explicitly designated `direction: 'left'` for `ring-p1`/`ring-p2` and `direction: 'right'` for `ring-s1`/`ring-s2`.
  - Synchronized all updates across `src/` and `dist/`.

### Log Entry: 2026-09-01 (Wire Stacking Z-Index Elevation & Chapter 1 Orthogonal Pathing)
- **User Issue**: Wires were hiding under component bodies and overlapping internal parts in induction experiments instead of neatly passing over tools with 90° corner routing like in Chapter 1.
- **Root Cause**:
  - `svg.wires-layer` was styled with `z-index: 2`, placing vector wire paths beneath `.component` and `.elite-component` (`z-index: 10`).
  - Missing candidate orthogonal corridors in `SVGWireEngine` for same-side horizontal exits (`left <-> left` and `right <-> right`) and face-to-face horizontal connections.
- **Action Taken**:
  - Elevated `svg.wires-layer` to `z-index: 25` and `.terminal-node` to `z-index: 30` in both [faraday_experiment.html](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/experiments/faraday_experiment.html) and [svg-wire-engine.js](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/engine/svg-wire-engine.js).
  - Ensured `<svg class="wires-layer raqeem-svg-wires">` connects to the single top-level SVG canvas.
  - Synchronized changes across `src/` and `dist/`.

### Log Entry: 2026-09-01 (Auto-Wiring Activation, Switch Node Inversion, & Galvanometer Clearance Fix)
- **User Issue**:
  1. Auto-wiring button was completely unresponsive.
  2. Wire routed horizontally through the center of the galvanometer face/dial.
  3. Switch nodes needed to be flipped so `battery-neg` wires to `switch-1` (left) and `ring-p2` wires to `switch-k` (right).
- **Root Cause**:
  1. `EliteEngine` instance was assigned to local scope (`const engine = ...`) without assigning `window.engine = engine;`, causing `autoConnectCircuit` to fail on `if (!window.engine) return;`.
  2. `Candidate A` in `SVGWireEngine` traversed horizontally across $x_1 \rightarrow x_2$ at the initial Y level ($y_1$) before dropping into $y_2$, causing it to slice through the galvanometer's internal dial before reaching the bottom binding posts.
  3. `REQUIRED_PAIRS` had `ring-p2-switch-1` and `switch-k-battery-neg`.
- **Action Taken**:
  - Assigned `window.engine = engine;` in [faraday_experiment.html](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/experiments/faraday_experiment.html).
  - Updated `REQUIRED_PAIRS` and `autoConnectCircuit` to use `battery-neg` $\longleftrightarrow$ `switch-1` and `ring-p2` $\longleftrightarrow$ `switch-k`.
  - Synchronized across `src/` and `dist/`.

### Log Entry: 2026-09-01 (Sidebar Toolbox Scrolling, Sub-Pixel Node Precision, & Galvanometer Bottom Wire Routing)
- **User Issue**:
  1. Toolbox in sidebar could not be scrolled when component cards exceeded viewport height.
  2. Terminal nodes were not positioned with precise alignment.
  3. Wiring crossed horizontally through the center face/dial of the galvanometer.
- **Root Cause**:
  1. Inline `overflow: visible !important;` on `<aside class="exp-sidebar-v2">` and `#inventory` completely suppressed vertical scroll events.
  2. Galvanometer terminals lacked explicit `direction: 'bottom'`, causing orthogonal routing to assume `right` and cut across the meter's face to reach the right binding post.
- **Action Taken**:
  - Restored vertical scrolling to `.exp-sidebar-v2` (`overflow-y: auto; overflow-x: hidden;`) and added a custom slim scrollbar in [faraday_experiment.html](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/experiments/faraday_experiment.html).
  - Explicitly designated `direction: 'bottom'` for `galvanometer-left` and `galvanometer-right` in [elite-components.v2.js](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/engine/elite-components.v2.js) and [elite-components.js](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/engine/elite-components.js).
  - Enhanced Candidate B routing in [svg-wire-engine.js](file:///c:/Users/hayder/Desktop/مشاريعي/phy/Raqeem-Demo/src/engine/svg-wire-engine.js) to enforce under-chassis drop down paths for bidirectional bottom connections.
  - Confirmed 1:1 sub-pixel matching between DOM `.terminal-node` divs and SVG anchors across all four components.
  - Restored `.flux-ccw` keyframe animation rule for counter-clockwise magnetic flux collapse on switch opening.
  - Aligned Faraday Ring SVG terminal winding endpoints, anchor circles, and DOM `.terminal-node` coordinates with exact concentric precision at `(22, 72)`, `(22, 128)`, `(178, 72)`, and `(178, 128)`.
  - Fixed `autoConnectCircuit` by directing execution to `SVGWireEngine.autoWire`, resolving the `TypeError: Cannot read properties of undefined (reading 'has')`.
  - Synchronized changes across both `src/` and `dist/`.

### Log Entry: 2026-09-01 (Full Unification of Chapter 2 & Chapter 3 Demo Experiments)
- **User Request**: Unify Chapter 2 and Chapter 3 demo experiments to match Chapter 1 and Faraday experiment design standards.
- **Action Taken**:
  - **Chapter 2 — `fields_effect.html` (Motion of Charged Particles / Lorentz Force)**:
    - Replaced legacy cyan theme tokens with unified Raqeem purple palette (`--bg: #090617`, `--panel: #251758`, `--border: rgba(117, 82, 255, 0.25)`, `--cyan: #7552FF`, `--blue: #5A46DA`, `--gold: #facc15`).
    - Upgraded side drawer to midnight purple glass (`#120b2e`), unified chapter headers, and updated links.
    - Restyled vacuum chamber borders (`rgba(117, 82, 255, 0.28)`), firing buttons, info cards, and scrollbars.
  - **Chapter 3 — `intro_dc_vs_ac.html` (DC vs AC Comparison)**:
    - Updated Tailwind runtime config and CSS variables to the Raqeem purple theme (`cyber.off: #090617`, `cyber.panel: #251758`, `cyber.cyan: #7552FF`, `cyber.blue: #5A46DA`).
    - Applied radial glassmorphic gradients to workspace area (`#1b1042` to `#090617`), updated toolbox card glass styling, footer console, and formulas modal.
  - **Chapter 3 — `concept_rms_thermal_effect.html` (AC RMS Value & Thermal Equivalent)**:
    - Updated Tailwind runtime config, CSS variables, and canvas containers to the Raqeem purple theme.
    - Updated toolbox items, footer console, and modal dialogs to match unified brand aesthetic.
  - **Synchronization**:
    - Synchronized all updated source files from `src/experiments/` to `dist/src/experiments/`.
### Log Entry: 2026-09-01 (DC Frequency Removal & Workspace White Blueprint Grid Alignment)
- **User Feedback**:
  1. Remove frequency control from DC mode in `intro_dc_vs_ac.html`.
  2. Switch workspace background in Chapter 3 to the exact white blueprint grid background (`#f8f9fb` with purple grid lines) used in Chapter 1 and Faraday experiment.
- **Action Taken**:
  - **`intro_dc_vs_ac.html`**:
    - Completely hid `#freq-ctrl-box` in DC mode (`display: none;`), displaying it only when switching to AC mode.
    - Updated `.workspace-area` styling to `#f8f9fb` with `rgba(117, 82, 255, 0.08)` grid lines.
    - Adjusted canvas wire skeleton and slot dropzone text/stroke colors for high contrast and sharpness on white background.
  - **`concept_rms_thermal_effect.html`**:
    - Updated `.workspace-area` to the `#f8f9fb` white blueprint grid.
    - Updated Section 1 & Section 2 headers, subtext, and dropzone labels for clarity on white background.
  - **Synchronization**:
    - Synchronized both files to `dist/src/experiments/`.
- **Verification**: Verified HTTP 200 OK responses on local endpoints.

### Log Entry: 2026-09-01 (Lorentz White Grid, Standard Components & 90-Degree Box Wiring)
- **User Feedback**:
  1. Apply white blueprint grid background to the Lorentz experiment (`fields_effect.html`).
  2. Use standard Chapter 1/2 Battery (`EliteComponents.getBattery`) and 2-node knife Switch (`EliteComponents.getSwitch`) in `intro_dc_vs_ac.html`.
  3. Fix terminal nodes light emission/pulsing (`@keyframes pulseGlow`, `.connected`, `.target-glow`) to match Chapter 1/Faraday.
  4. Fix wiring in `intro_dc_vs_ac.html` to create a clean, sharp 90-degree box shape around the circuit loop.
- **Action Taken**:
  - **`fields_effect.html` (Lorentz Experiment)**:
    - Updated `#vacuum-chamber` to the `#f8f9fb` white blueprint grid with purple grid lines.
    - Updated CRT glass envelope, injector body, magnetic 'X' symbols, E-field arrows, and text labels for high contrast on the light background.
  - **`intro_dc_vs_ac.html` (DC vs AC)**:
    - Replaced battery with the Chapter 1/2 gold strip EL8 12V MAX PRO component.
    - Replaced switch with the Chapter 1/2 2-node SW-1 knife switch and animated arm.
    - Added `pulseGlow` keyframe animation and `.connected` state styling to all terminal nodes.
    - Updated `createOrthogonalPath` to calculate exact 90-degree box corner paths between horizontal (Resistor/Source) and vertical (Ammeter/Switch) stations.
  - **Synchronization**:
    - Synchronized all modified files to `dist/src/experiments/`.
- **Verification**: Verified HTTP 200 OK responses on local endpoints.









