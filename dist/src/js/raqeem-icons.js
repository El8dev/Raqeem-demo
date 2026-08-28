/* =============================================================================
 * RAQEEM · Icon & Artwork Registry
 * -----------------------------------------------------------------------------
 * Hand-authored 24×24 stroke icons — no icon-font dependency, no network call,
 * fully themable because every stroke inherits `currentColor`.
 *
 *   RAQEEM_ICONS[name] -> { p: [paths…], f?: true, extra?: '<svg fragment>' }
 *   RAQEEM_ART[name]   -> full-bleed chapter artwork (viewBox 0 0 320 200)
 * ========================================================================== */

window.RAQEEM_ICONS = {

  /* ---- brand / chrome ---------------------------------------------------- */
  atom:     { p: ['M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0'],
              extra: '<ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)"/>' },
  globe:    { p: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M3.5 9h17M3.5 15h17', 'M12 3c-2.4 2.4-3.6 5.4-3.6 9s1.2 6.6 3.6 9c2.4-2.4 3.6-5.4 3.6-9S14.4 5.4 12 3Z'] },
  sun:      { p: ['M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z', 'M12 2.4v2.1M12 19.5v2.1M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M2.4 12h2.1M19.5 12h2.1M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5'] },
  moon:     { p: ['M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a8.6 8.6 0 1 0 11 11Z'] },
  user:     { p: ['M12 11.4a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4Z', 'M4.8 20.2a7.2 7.2 0 0 1 14.4 0'] },
  logout:   { p: ['M14.5 3.5H5.8A1.8 1.8 0 0 0 4 5.3v13.4a1.8 1.8 0 0 0 1.8 1.8h8.7', 'M17 8.5 20.5 12 17 15.5', 'M20.5 12H10'] },
  chevron:  { p: ['M9 5.5 15.5 12 9 18.5'] },
  chevronL: { p: ['M15 5.5 8.5 12 15 18.5'] },
  chevronD: { p: ['M5.5 9 12 15.5 18.5 9'] },
  arrow:    { p: ['M4 12h14.5', 'M13.2 6.7 18.5 12l-5.3 5.3'] },
  play:     { p: ['M8 5.4 18.2 12 8 18.6Z'] },
  lock:     { p: ['M6.7 10.5h10.6a1.4 1.4 0 0 1 1.4 1.4v7a1.4 1.4 0 0 1-1.4 1.4H6.7a1.4 1.4 0 0 1-1.4-1.4v-7a1.4 1.4 0 0 1 1.4-1.4Z', 'M8.4 10.5V7.9a3.6 3.6 0 0 1 7.2 0v2.6', 'M12 14.6v2.2'] },
  layers:   { p: ['M12 3.2 21 8l-9 4.8L3 8Z', 'M3 12.6 12 17.4l9-4.8', 'M3 17 12 21.8l9-4.8'] },
  flask:    { p: ['M9.4 3.2v5.4L4.8 17a2.1 2.1 0 0 0 1.8 3.2h10.8a2.1 2.1 0 0 0 1.8-3.2l-4.6-8.4V3.2', 'M8.2 3.2h7.6', 'M6.9 14.4h10.2'] },
  clock:    { p: ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2Z', 'M12 7.6V12l2.9 1.8'] },
  check:    { p: ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2Z', 'M8.2 12.2l2.6 2.6 5-5.2'] },
  info:     { p: ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2Z', 'M12 11.2v5', 'M12 7.9h.01'] },
  warn:     { p: ['M10.7 4.1 2.9 17.6a1.5 1.5 0 0 0 1.3 2.3h15.6a1.5 1.5 0 0 0 1.3-2.3L13.3 4.1a1.5 1.5 0 0 0-2.6 0Z', 'M12 9.4v4', 'M12 16.6h.01'] },
  sparkle:  { p: ['M12 2.8 13.9 9 20 10.9 13.9 12.8 12 19 10.1 12.8 4 10.9 10.1 9Z', 'M18.6 3.2v3.2M20.2 4.8H17'] },
  grid:     { p: ['M4 9.5h16M4 14.5h16M9.5 4v16M14.5 4v16'] },

  /* ---- physics ----------------------------------------------------------- */
  capacitor:{ p: ['M9.7 5.4v13.2M14.3 5.4v13.2', 'M2.8 12h6.9M14.3 12h6.9'] },
  series:   { p: ['M2.8 12h3.4M17.8 12h3.4', 'M6.2 8.6h4.1v6.8H6.2ZM13.7 8.6h4.1v6.8h-4.1Z'] },
  parallel: { p: ['M12 3.4v3.4M12 17.2v3.4', 'M4.6 6.8h14.8M4.6 17.2h14.8', 'M4.6 6.8v10.4M12 6.8v10.4M19.4 6.8v10.4'] },
  cubes:    { p: ['M4.2 4.4h6v6h-6ZM13.8 4.4h6v6h-6ZM4.2 13.6h6v6h-6ZM13.8 13.6h6v6h-6Z'] },
  area:     { p: ['M3.6 6.4h16.8v11.2H3.6Z', 'M3.6 10h16.8M3.6 14h16.8', 'M8 6.4v11.2M12 6.4v11.2M16 6.4v11.2'] },
  distance: { p: ['M6.6 4.6v14.8M17.4 4.6v14.8', 'M9 12h6', 'M11 9.8 8.8 12 11 14.2M13 9.8l2.2 2.2-2.2 2.2'] },
  charge:   { p: ['M12 3v6M12 15v6M3 12h6M15 12h6', 'M7 7l3 3M14 14l3 3', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'] },
  magnet:   { p: ['M5 4.4v7.2a7 7 0 0 0 14 0V4.4', 'M5 4.4h4.3M14.7 4.4H19', 'M5 9.6h4.3M14.7 9.6H19'] },
  ring:     { p: ['M12 4.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6Z', 'M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z'] },
  bolt:     { p: ['M13.4 2.6 5.2 13.4h5.1L9.9 21.4l8.6-11.1h-5.5Z'] },
  bulb:     { p: ['M9.4 18.2h5.2M10.4 21h3.2', 'M12 3a6.2 6.2 0 0 0-3.7 11.2c.7.5 1.1 1.3 1.2 2.1h5c.1-.8.5-1.6 1.2-2.1A6.2 6.2 0 0 0 12 3Z'] },
  flux:     { p: ['M12 4.4c-3.4 0-6.2 3.4-6.2 7.6S8.6 19.6 12 19.6s6.2-3.4 6.2-7.6S15.4 4.4 12 4.4Z', 'M2.6 8.4h5.2M2.6 15.6h5.2M16.2 8.4h5.2M16.2 15.6h5.2'] },
  arrowsV:  { p: ['M12 3.6v16.8', 'M8.6 7 12 3.6 15.4 7', 'M8.6 17 12 20.4 15.4 17'] },
  eddy:     { p: ['M12 3.6a8.4 8.4 0 1 0 0 16.8 8.4 8.4 0 0 0 0-16.8Z', 'M15.8 12a3.8 3.8 0 1 1-3.8-3.8', 'M12 8.2V5.4'] },
  fan:      { p: ['M12 9.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z', 'M12 9.4c0-3.6-.8-6-2.6-6s-2.4 3.4.6 5.2', 'M14.2 13.3c3.1 1.8 5.5 2 6.4.4s-1.6-3.6-4.9-2.8', 'M9.8 13.3c-3.1 1.8-4.2 3.9-3.4 5.5s3.9 1 4.9-2.7'] },
  battery:  { p: ['M3.4 8.2h14.2v7.6H3.4Z', 'M17.6 10.6h2.4v2.8h-2.4Z', 'M6.4 10.6v2.8M9.6 10.6v2.8M12.8 10.6v2.8'] },
  motor:    { p: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M9 16V8l6 4-6 4Z', 'M3 12h3M18 12h3'] },
  coil:     { p: ['M3 12h2c1.5-4 4.5-4 6 0s4.5-4 6 0h2', 'M5 12c1.5 4 4.5 4 6 0s4.5 4 6 0'] },
  link:     { p: ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'] },
  rotfield: { p: ['M21 12a9 9 0 1 1-6.219-8.56', 'M18 3.5l3 1-1 3', 'M12 8a4 4 0 1 0 4 4'] },
  apps:     { p: ['M4 4h6v6H4Z', 'M14 4h6v6h-6Z', 'M4 14h6v6H4Z', 'M17 14l3 6h-6Z'] },
  hand:     { p: ['M9 11.4V5.6a1.5 1.5 0 0 1 3 0v5.2', 'M12 10.4V6.8a1.5 1.5 0 0 1 3 0v4.2', 'M15 11v-2a1.5 1.5 0 0 1 3 0v6.4a5.4 5.4 0 0 1-5.4 5.4h-1.2a5 5 0 0 1-4-2l-2.6-3.5a1.5 1.5 0 0 1 2.3-1.9L9 15.2V11.4', 'M9 11.4a1.5 1.5 0 0 0-3 0v3.8'] },
  crt:      { p: ['M8.4 6.2h11.2a1.6 1.6 0 0 1 1.6 1.6v8.4a1.6 1.6 0 0 1-1.6 1.6H8.4Z', 'M8.4 9.4H5.2a1.4 1.4 0 0 0-1.4 1.4v2.4a1.4 1.4 0 0 0 1.4 1.4h3.2', 'M2.6 12h1.2', 'M17.4 12h.01'] },
  calculator:{ p: ['M6.2 3.4h11.6a1.4 1.4 0 0 1 1.4 1.4v14.4a1.4 1.4 0 0 1-1.4 1.4H6.2a1.4 1.4 0 0 1-1.4-1.4V4.8a1.4 1.4 0 0 1 1.4-1.4Z', 'M7.8 6.6h8.4v3.2H7.8Z', 'M8.6 13h.01M12 13h.01M15.4 13h.01M8.6 16.6h.01M12 16.6h.01M15.4 16.6h.01'] },
  wave:     { p: ['M2.4 12c1.6-6 3.2-6 4.8 0s3.2 6 4.8 0 3.2-6 4.8 0 3.2 6 4.8 0'] },
  waves:    { p: ['M12 11.4a.6.6 0 1 0 0 1.2.6.6 0 0 0 0-1.2Z', 'M8.9 15.1a4.4 4.4 0 0 1 0-6.2M15.1 8.9a4.4 4.4 0 0 1 0 6.2', 'M6 18a8.5 8.5 0 0 1 0-12M18 6a8.5 8.5 0 0 1 0 12'] }
};


/* =============================================================================
 * Chapter artwork — procedural fallback for a chapter shipped without an image.
 * viewBox is 0 0 320 200; the shell scales it to the card.
 * ========================================================================== */
window.RAQEEM_ART = {

  capacitor: `
    <defs>
      <linearGradient id="rq-a1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--brand-accent)" stop-opacity=".95"/>
        <stop offset="1" stop-color="var(--brand)" stop-opacity=".35"/>
      </linearGradient>
    </defs>
    <g class="art-field" stroke="url(#rq-a1)" stroke-width="1.6" fill="none" stroke-linecap="round">
      <path d="M126 46v108M194 46v108"/>
      <path d="M60 100h66M194 100h66"/>
      <path d="M138 60h44M138 78h44M138 96h44M138 114h44M138 132h44" stroke-dasharray="5 7" opacity=".75"/>
    </g>
    <g class="art-spark" fill="var(--brand-accent)">
      <circle cx="126" cy="66" r="3"/><circle cx="126" cy="100" r="3"/><circle cx="126" cy="134" r="3"/>
    </g>
    <g class="art-spark art-spark--b" fill="var(--text-2)" opacity=".55">
      <circle cx="194" cy="66" r="3"/><circle cx="194" cy="100" r="3"/><circle cx="194" cy="134" r="3"/>
    </g>`,

  induction: `
    <defs>
      <linearGradient id="rq-a2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="var(--brand)" stop-opacity=".2"/>
        <stop offset=".5" stop-color="var(--brand-accent)"/>
        <stop offset="1" stop-color="var(--brand)" stop-opacity=".2"/>
      </linearGradient>
    </defs>
    <g fill="none" stroke="url(#rq-a2)" stroke-width="1.7" stroke-linecap="round">
      <g class="art-field">
        <ellipse cx="160" cy="100" rx="92" ry="34" opacity=".45"/>
        <ellipse cx="160" cy="100" rx="66" ry="24" opacity=".6"/>
        <ellipse cx="160" cy="100" rx="40" ry="15" opacity=".8"/>
      </g>
      <g class="art-coil" stroke="var(--brand-accent)" stroke-width="2.4">
        <path d="M118 74c14-10 28-10 42 0s28 10 42 0"/>
        <path d="M118 100c14-10 28-10 42 0s28 10 42 0"/>
        <path d="M118 126c14-10 28-10 42 0s28 10 42 0"/>
      </g>
    </g>
    <rect class="art-spark" x="148" y="86" width="24" height="28" rx="4" fill="var(--brand)" opacity=".85"/>`,

  wave: `
    <g fill="none" stroke-linecap="round">
      <path class="art-grid" d="M20 100h280M160 40v120" stroke="var(--text-2)" stroke-width="1" opacity=".22"/>
      <path class="art-wave" d="M20 100c20-56 40-56 60 0s40 56 60 0 40-56 60 0 40-56 60 0"
            stroke="var(--brand-accent)" stroke-width="2.6"/>
      <path class="art-wave art-wave--b" d="M20 100c20-38 40-38 60 0s40 38 60 0 40-38 60 0 40 38 60 0"
            stroke="var(--brand)" stroke-width="1.8" opacity=".6"/>
    </g>`,

  emwave: `
    <g fill="none" stroke-linecap="round">
      <path class="art-grid" d="M16 100h288" stroke="var(--text-2)" stroke-width="1" opacity=".22"/>
      <path class="art-wave" d="M20 100c18-46 36-46 54 0s36 46 54 0 36-46 54 0 36 46 54 0"
            stroke="var(--brand-accent)" stroke-width="2.4"/>
      <path class="art-wave art-wave--b" d="M20 100c18 46 36 46 54 0s36-46 54 0 36 46 54 0 36-46 54 0"
            stroke="var(--brand)" stroke-width="2.4" opacity=".7"/>
      <g class="art-field" stroke="var(--brand-accent)" stroke-width="1.2" opacity=".5" stroke-dasharray="4 6">
        <path d="M74 54v92M128 54v92M182 54v92M236 54v92"/>
      </g>
    </g>`,

  quantum: `
    <g fill="none" stroke="var(--brand-accent)" stroke-width="1.7">
      <g class="art-orbit">
        <ellipse cx="160" cy="100" rx="96" ry="34"/>
        <ellipse cx="160" cy="100" rx="96" ry="34" transform="rotate(60 160 100)"/>
        <ellipse cx="160" cy="100" rx="96" ry="34" transform="rotate(120 160 100)"/>
      </g>
    </g>
    <circle class="art-spark" cx="160" cy="100" r="11" fill="var(--brand)"/>
    <g class="art-spark art-spark--b" fill="var(--brand-accent)">
      <circle cx="256" cy="100" r="4.5"/><circle cx="112" cy="41" r="4.5"/><circle cx="112" cy="159" r="4.5"/>
    </g>`
};
