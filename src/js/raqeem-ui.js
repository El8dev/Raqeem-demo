/* =============================================================================
 * RAQEEM · Physics Educational Labs — Shell Controller
 * -----------------------------------------------------------------------------
 * Owns: theme, language, splash, screen routing, the chapter carousel (drag +
 * flip + luminous trail), the experiment panel, toasts and session restore.
 *
 * Owns NOTHING inside /experiments — those pages are navigated to by href and
 * are never inspected, styled or modified from here.
 *
 * No framework, no animation library: every transition is either a CSS
 * transition or a Web Animations call on `transform` / `opacity`, so the
 * compositor does the work and the main thread stays free.
 * ========================================================================== */
(function () {
  'use strict';

  var DATA  = window.RAQEEM_DATA;
  var ICONS = window.RAQEEM_ICONS;
  var ART   = window.RAQEEM_ART;

  var EASE_OUT   = 'cubic-bezier(.22,1,.36,1)';
  var EASE_INOUT = 'cubic-bezier(.65,0,.35,1)';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- utils */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /** Render an icon from the registry as an inline SVG string. */
  function icon(name) {
    var def = ICONS[name] || ICONS.atom;
    var body = (def.p || []).map(function (d) {
      return '<path d="' + d + '"' + (def.f ? ' fill="currentColor" stroke="none"' : '') + '/>';
    }).join('') + (def.extra || '');
    return '<span class="rq-i" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + body + '</svg></span>';
  }

  /* Unfilled placeholders survive, so fmt() stays composable: a string may
     pass through more than one call without losing its remaining slots. */
  function fmt(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (whole, k) {
      return vars && vars[k] != null ? vars[k] : whole;
    });
  }

  /* --------------------------------------------------------------- storage */
  var Store = {
    get: function (k, fb) {
      try { var v = localStorage.getItem('rq.' + k); return v === null ? fb : JSON.parse(v); }
      catch (e) { return fb; }
    },
    set: function (k, v) { try { localStorage.setItem('rq.' + k, JSON.stringify(v)); } catch (e) {} },
    sget: function (k, fb) {
      try { var v = sessionStorage.getItem('rq.' + k); return v === null ? fb : JSON.parse(v); }
      catch (e) { return fb; }
    },
    sset: function (k, v) { try { sessionStorage.setItem('rq.' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* Legacy key kept so a session started on the old shell still resolves. */
  function getUser() {
    try { return localStorage.getItem('username') || ''; } catch (e) { return ''; }
  }
  function setUser(name) {
    try { name ? localStorage.setItem('username', name) : localStorage.removeItem('username'); } catch (e) {}
  }

  /* ------------------------------------------------------------- language */
  var lang = Store.get('lang', 'ar');
  function T() { return DATA.i18n[lang]; }
  function tx(key, vars) { return fmt(T()[key] || key, vars); }

  function applyLang(next) {
    lang = next;
    Store.set('lang', next);
    var t = T();
    document.documentElement.lang = next;
    document.documentElement.dir = t.dir;
    /* reading-flow multiplier drives every directional hover nudge */
    document.documentElement.style.setProperty('--flow', t.dir === 'rtl' ? -1 : 1);
    render();
  }

  /* ---------------------------------------------------------------- theme */
  var theme = Store.get('theme', null) ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  var _vtBusy = false;

  function applyTheme(next, origin) {
    theme = next;
    Store.set('theme', next);

    var meta = $('meta[name="theme-color"]');
    var commit = function () {
      document.documentElement.setAttribute('data-theme', next);
      if (meta) meta.setAttribute('content', next === 'light' ? '#F7F5FF' : '#090617');
      /* The canvas field paints from JS, so it has to be told the tokens
         moved — and repainted at once rather than waiting on the next frame,
         which may never come if the loop is paused. */
      if (Atmos._readTheme) {
        Atmos._readTheme();
        if (Atmos._drawParticles) Atmos._drawParticles();
      }
    };

    if (REDUCED) { commit(); return; }

    /* Circular reveal from the toggle when the engine supports it.
       Skipped while hidden or while one is already running — in both cases
       startViewTransition rejects, and an unhandled rejection would surface
       as a console error even though the theme itself applied fine. */
    if (document.startViewTransition && origin && !document.hidden && !_vtBusy) {
      var r = origin.getBoundingClientRect();
      document.documentElement.style.setProperty('--tx', (r.left + r.width / 2) + 'px');
      document.documentElement.style.setProperty('--ty', (r.top + r.height / 2) + 'px');
      _vtBusy = true;
      var vt = document.startViewTransition(commit);
      var clear = function () { _vtBusy = false; };
      if (vt.finished) vt.finished.then(clear, clear);
      if (vt.ready) vt.ready.catch(function () {});
      if (vt.updateCallbackDone) vt.updateCallbackDone.catch(function () {});
      return;
    }
    /* … otherwise a short global colour crossfade. */
    document.documentElement.classList.add('theme-tweening');
    commit();
    setTimeout(function () {
      document.documentElement.classList.remove('theme-tweening');
    }, 420);
  }

  /* --------------------------------------------------------------- toasts */
  function toast(msg, kind) {
    var host = $('#toasts');
    var name = kind === 'warn' ? 'warn' : kind === 'ok' ? 'check' : 'info';
    var node = el('div', 'toast' + (kind === 'warn' ? ' toast--warn' : ''), icon(name) + '<span>' + msg + '</span>');
    host.appendChild(node);
    requestAnimationFrame(function () { node.classList.add('is-on'); });
    setTimeout(function () {
      node.classList.remove('is-on');
      setTimeout(function () { node.remove(); }, 340);
    }, 3200);
  }

  /* ================================================================ ROUTER
   * Screens live in normal flow; only one is displayed. The outgoing screen
   * lifts and fades while the incoming one rises into place, overlapping so
   * the whole change reads at ~420ms.
   * ===================================================================== */
  var Router = {
    current: null,

    go: function (name, opts) {
      opts = opts || {};
      if (this.current === name) return Promise.resolve();

      var prev = this.current ? $('.screen[data-screen="' + this.current + '"]') : null;
      var next = $('.screen[data-screen="' + name + '"]');
      if (!next) return Promise.resolve();

      this.current = name;
      Store.sset('route', name);
      var self = this;

      var show = function () {
        if (prev) { prev.classList.remove('is-active'); }
        next.classList.add('is-active');
        self.onEnter(name, opts);
        if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
        if (REDUCED || opts.instant) return;
        next.animate(
          [{ opacity: 0, transform: 'translateY(16px) scale(.99)' }, { opacity: 1, transform: 'none' }],
          { duration: 380, easing: EASE_OUT }
        );
      };

      if (!prev || REDUCED || opts.instant || document.hidden) { show(); return Promise.resolve(); }

      return new Promise(function (done) {
        var a = prev.animate(
          [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-14px) scale(.985)' }],
          { duration: 220, easing: EASE_INOUT, fill: 'forwards' }
        );
        setTimeout(function () { a.cancel(); show(); done(); }, 210);
      });
    },

    onEnter: function (name, opts) {
      opts = opts || {};
      /* the background field leans on the route (see --route rules in CSS) */
      document.documentElement.setAttribute('data-route', name);
      if (name === 'dash') {
        Dash.refresh();
        /* The carousel could only be measured now that the screen has a box. */
        if (Carousel.measure()) Carousel.apply(Carousel.idx);
        /* The deal is an arrival, not a page paint: coming back from an
           experiment restores an existing view, and replaying a 1.5s spread
           on every Back press would put the effect ahead of the navigation. */
        if (!opts.quiet) Carousel.reveal();
      }
      if (name === 'home' && !opts.quiet) revealHome();
      Atmos.setHero(name === 'home');
    }
  };

  /* =============================================================== ATMOS
   * Particle field, drifting equations, pointer parallax. All optional —
   * everything here shuts down under reduced-motion or a hidden tab.
   * ===================================================================== */
  var Atmos = {
    heroOn: false,
    paused: document.hidden,

    init: function () {
      /* Under reduced motion the field is still drawn — once, then frozen.
         Removing it entirely would strip the page's depth, not just its
         movement, which is not what the preference asks for. */
      this.particles();
      if (REDUCED) return;
      this.parallax();
      this.equations();
      var self = this;
      document.addEventListener('visibilitychange', function () {
        self.paused = document.hidden;
        if (!self.paused && self.heroOn) self.tick();
      });
    },

    setHero: function (on) {
      this.heroOn = on;
      if (on && !this.paused) {
        this.tick();
      } else {
        if (this._raf) {
          cancelAnimationFrame(this._raf);
          this._raf = 0;
        }
        var cv = $('#atmos-canvas');
        if (cv) {
          var ctx = cv.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, cv.width, cv.height);
        }
      }
    },

    /* --- the network field ---------------------------------------------
     * Drawn, not photographed. A background mesh has to be faint AND finely
     * detailed at the same time, and an upscaled bitmap cannot be both — its
     * lines go soft exactly where the detail is supposed to live. Rendering
     * it here keeps every strand a true hairline at the device's own pixel
     * density, on any screen, at any zoom, for zero bytes.
     *
     * Nodes drift slowly and ride a long sine, so the whole mesh breathes
     * like a wave instead of twitching. Links fade with distance, which is
     * what keeps it calm: the eye reads a soft depth field, not a diagram.
     * ------------------------------------------------------------------ */
    particles: function () {
      var cv = $('#atmos-canvas');
      if (!cv) return;
      var ctx = cv.getContext('2d', { alpha: true });
      var w = 0, h = 0, dpr = 1, nodes = [], N = 0, LINK = 140;
      var t = 0;

      /* palette is read from the live tokens, so the field follows the theme */
      var ink = { line: '117,82,255', dot: '117,82,255', aLine: .40, aDot: .85 };
      function readTheme() {
        var light = document.documentElement.getAttribute('data-theme') === 'light';
        ink.line = light ? '90,70,218' : '134,104,255';
        ink.dot = light ? '68,50,180' : '198,182,255';
        ink.aLine = light ? .32 : .40;
        ink.aDot = light ? .72 : .88;
      }
      readTheme();
      this._readTheme = readTheme;

      function build() {
        w = cv.clientWidth; h = cv.clientHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 1.25);
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        /* density scales with area: capped at 42 for lightweight 60fps loop */
        N = Math.round(Math.min(42, Math.max(20, (w * h) / 36000)));
        LINK = w < 760 ? 110 : 140;
        nodes = [];
        for (var i = 0; i < N; i++) {
          nodes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - .5) * .16,
            vy: (Math.random() - .5) * .16,
            r: Math.random() * 1.5 + 1.0,
            ph: Math.random() * 6.283,          /* own phase in the wave */
            am: Math.random() * 10 + 5          /* own amplitude */
          });
        }
      }
      build();

      var self = this, rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
          build();
          if (self._drawParticles) self._drawParticles();
        }, 180);
      }, { passive: true });

      var linkSq = LINK * LINK;

      this._drawParticles = function () {
        t += 0.004;
        ctx.clearRect(0, 0, w, h);

        /* advance, wrap, and lift each node onto the travelling sine */
        for (var i = 0; i < N; i++) {
          var p = nodes[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < -30) p.x = w + 30; else if (p.x > w + 30) p.x = -30;
          if (p.y < -30) p.y = h + 30; else if (p.y > h + 30) p.y = -30;
          p.dy = Math.sin(t + p.ph + p.x * 0.0035) * p.am;
        }

        /* Links are bucketed by strength without Math.sqrt overhead */
        var B = 3, buckets = [], b;
        for (b = 0; b < B; b++) buckets.push(new Path2D());

        for (var a = 0; a < N; a++) {
          var p1 = nodes[a];
          var y1 = p1.y + p1.dy;
          for (var c = a + 1; c < N; c++) {
            var p2 = nodes[c];
            var dx = p1.x - p2.x;
            if (dx > LINK || dx < -LINK) continue;      /* cheap reject */
            var dy = y1 - (p2.y + p2.dy);
            if (dy > LINK || dy < -LINK) continue;
            var d2 = dx * dx + dy * dy;
            if (d2 > linkSq) continue;
            var k = 1 - (d2 / linkSq);                  /* fast linear ratio */
            var bi = Math.min(B - 1, (k * B) | 0);
            buckets[bi].moveTo(p1.x, y1);
            buckets[bi].lineTo(p2.x, p2.y + p2.dy);
          }
        }

        ctx.lineWidth = 1.0;
        for (b = 0; b < B; b++) {
          ctx.strokeStyle = 'rgba(' + ink.line + ',' + (ink.aLine * ((b + 1) / B)).toFixed(3) + ')';
          ctx.stroke(buckets[b]);
        }

        var dots = new Path2D();
        for (var n = 0; n < N; n++) {
          var q = nodes[n];
          dots.moveTo(q.x + q.r, q.y + q.dy);
          dots.arc(q.x, q.y + q.dy, q.r, 0, 6.2832);
        }
        ctx.fillStyle = 'rgba(' + ink.dot + ',' + ink.aDot + ')';
        ctx.fill(dots);
      };

      /* Paint once up front. A page opened in a background tab gets no
         animation frames at all, and would otherwise show an empty field
         until the moment it is first looked at. */
      this._drawParticles();
      this.tick();
    },

    tick: function () {
      if (this._raf) cancelAnimationFrame(this._raf);
      var self = this;
      if (REDUCED || !self.heroOn) { if (self._drawParticles) self._drawParticles(); return; }
      (function loop() {
        if (self.paused || !self.heroOn) { self._raf = 0; return; }
        if (self._drawParticles) self._drawParticles();
        self._raf = requestAnimationFrame(loop);
      })();
    },

    /* --- pointer parallax ---------------------------------------------
     * The atom leads the pointer slightly and tips on two axes, which reads
     * as depth without ever leaving the compositor. Deliberately gentle: the
     * hero is meant to be restful, not reactive.
     * ------------------------------------------------------------------ */
    parallax: function () {
      var copy = $('.home__copy');
      var auraA = $('.rq-atmos__aura--a');
      var px = 0, py = 0, queued = false;

      function flush() {
        queued = false;
        if (!Atmos.heroOn) return;
        /* barely-there drift: enough to feel alive, never enough to distract */
        if (copy) copy.style.transform = 'translate3d(' + (px * 7) + 'px,' + (py * 7) + 'px,0)';
        if (auraA) auraA.style.setProperty('--nudge', px.toFixed(3));
      }

      window.addEventListener('pointermove', function (e) {
        px = (e.clientX / window.innerWidth) - .5;
        py = (e.clientY / window.innerHeight) - .5;
        if (!queued) { queued = true; requestAnimationFrame(flush); }
      }, { passive: true });
    },

    /* --- drifting equations ------------------------------------------- */
    equations: function () {
      var EQ = ['E = mc²', 'F = ma', 'λ = h/p', '∇ × B = μ₀J', 'C = Q/V', 'PV = nRT',
        'Φ = B·A·cosθ', 'ε = −N dΦ/dt', '∮ E · dA = Q/ε₀', 'P = IV', 'E = hν', 'τ = r × F'];
      var self = this;

      function spawn() {
        if (!self.heroOn || self.paused) return;
        if (document.querySelectorAll('.rq-eq').length >= 3) return;
        var src = $('#eq-source');
        if (!src) return;
        var r = src.getBoundingClientRect();
        var n = el('div', 'rq-eq', EQ[(Math.random() * EQ.length) | 0]);
        n.style.left = (r.left + window.scrollX) + 'px';
        n.style.top = (r.top + window.scrollY) + 'px';
        document.body.appendChild(n);
        var dx = (Math.random() - .45) * 180 - 60;
        var dy = -(Math.random() * 190 + 90);
        var rot = (Math.random() - .5) * 34;
        var ms = 4200 + Math.random() * 1800;
        n.animate([
          { opacity: 0, transform: 'translate(0,0) scale(.6) rotate(0deg)' },
          { opacity: .55, offset: .22 },
          { opacity: 0, transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1) rotate(' + rot + 'deg)' }
        ], { duration: ms, easing: 'cubic-bezier(.25,.6,.35,1)' });
        setTimeout(function () { n.remove(); }, ms);
      }
      setInterval(spawn, 2800);
      this.burst = function (n) {
        for (var i = 0; i < Math.min(n || 3, 3); i++) setTimeout(spawn, i * 130);
      };
    }
  };

  /* ---------------------------------------------------- home entrance ----
   * The title materialises rather than slides: blur and scale resolving
   * together read as "forming out of nothing", which is what was asked for,
   * and both are compositor properties so it stays smooth.
   *
   * Deliberately animated as ONE element. The heading paints its gradient
   * through `background-clip: text`, and that clip is unreliable once child
   * spans carry their own transforms — a per-word split would look superb in
   * Chrome and drop the gradient in the packaged WebView.
   * ------------------------------------------------------------------- */
  function revealHome() {
    if (REDUCED || document.hidden) return;
    var scr = $('.screen[data-screen="home"]');
    if (!scr) return;

    $$('[data-rise]', scr).forEach(function (n, i) {
      var isTitle = n.classList.contains('t-display');
      n.animate([
        {
          opacity: 0,
          transform: 'translateY(' + (isTitle ? 30 : 22) + 'px) scale(' + (isTitle ? .965 : .98) + ')',
          filter: 'blur(' + (isTitle ? 16 : 8) + 'px)'
        },
        { opacity: 1, transform: 'none', filter: 'blur(0px)' }
      ], {
        duration: isTitle ? 1250 : 950,
        delay: 60 + i * 135,
        easing: EASE_OUT,
        fill: 'backwards'
      });
    });
  }

  /* ============================================================== SPLASH */
  function runSplash() {
    var sp = $('#splash');
    if (!sp) return Promise.resolve();
    /* A hidden tab never advances Web Animations, so an animation-driven
       teardown would strand the splash forever. Skip it outright. */
    if (REDUCED || document.hidden) { sp.remove(); return Promise.resolve(); }

    var mark = $('.splash__mark', sp);
    var orbs = $('.splash__orbits', sp);
    var word = $$('.splash__word span', sp);
    var tag = $('.splash__tag', sp);
    var opt = { duration: 780, easing: EASE_OUT, fill: 'both' };

    orbs.animate([{ opacity: 0, transform: 'scale(.55) rotate(-25deg)' },
    { opacity: .85, transform: 'none' }], { duration: 950, easing: EASE_OUT, fill: 'both', delay: 220 });
    mark.animate([{ opacity: 0, transform: 'scale(.35) rotate(-70deg)' },
    { opacity: 1, transform: 'none' }], { duration: 860, easing: 'cubic-bezier(.34,1.4,.5,1)', fill: 'both', delay: 120 });
    word.forEach(function (s, i) {
      s.animate([{ opacity: 0, transform: 'translateY(26px) scale(.7)' },
      { opacity: 1, transform: 'none' }], { duration: 620, easing: EASE_OUT, fill: 'both', delay: 480 + i * 85 });
    });
    tag.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
      Object.assign({}, opt, { delay: 1080 }));

    /* Teardown is clock-driven, never animation-driven: the splash must come
       down even if the engine throttles or drops the exit animation. */
    return new Promise(function (done) {
      setTimeout(function () {
        sp.animate([{ opacity: 1, transform: 'none', filter: 'blur(0)' },
        { opacity: 0, transform: 'scale(1.07)', filter: 'blur(6px)' }],
          { duration: 620, easing: EASE_INOUT, fill: 'forwards' });
        setTimeout(function () { sp.remove(); done(); }, 600);
      }, 2350);
    });
  }

  /* ============================================================ CAROUSEL
   * Transform-driven, not scroll-driven — that keeps the RTL maths exact,
   * keeps every frame on the compositor, and gives us the velocity signal
   * the luminous trail and the flip both need.
   * ===================================================================== */
  var Carousel = {
    idx: 0,
    fi: 0,            /* fractional index — the single source of truth */
    target: 0,
    dirSign: 1,       /* +1 LTR, −1 RTL: which way later chapters lie */
    dragging: false,
    cards: [],

    /* Desktop defaults, present from the start. mount() lays the stack out
       once while the dashboard is still display:none — measure() cannot read
       a box yet and returns false, so depth() has to have real numbers to
       work with or the very first layout pass throws. */
    P: { spread: 190, depth: 155, angle: 27, scale: .105, fade: .26, range: 2.6 },
    cardW: 384,
    dragUnit: 275,

    /* Safe to call after every re-render: listeners bind once, the rest
       re-reads the freshly generated cards. */
    mount: function () {
      var self = this;
      this.viewport = $('#car-viewport');
      this.stage = $('#car-stage');
      this.dots = $('#car-dots');
      this.warp = $('#car-warp');
      this.cards = $$('.ch-card', this.stage);
      this.faces = this.cards.map(function (c) { return $('.ch-card__face', c); });
      /* later chapters sit to the right in LTR and to the left in RTL */
      this.dirSign = document.documentElement.dir === 'rtl' ? -1 : 1;
      this._lastFi = null;
      this.fi = this.idx;
      this.target = this.idx;
      this.measure();
      this.buildDots();
      this.goto(clamp(this.idx, 0, this.cards.length - 1), { instant: true });

      if (this._bound) return;
      this._bound = true;
      this.bindDrag();
      this.bindActivation();
      this.bindKeys();
      /* Both, not either. ResizeObserver catches layout-driven size changes
         the window never hears about (the panel opening, a font landing),
         but it only delivers at a rendering opportunity — a backgrounded or
         throttled tab gets none, and an orientation flip would then leave the
         stack laid out for the previous width. The window listener is the
         floor under that. Debounced, so the two never fight. */
      var relayout = function () {
        clearTimeout(self._rt);
        self._rt = setTimeout(function () {
          if (self.measure()) self.apply(self.idx);
        }, 120);
      };
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(relayout);
        this._ro.observe(this.viewport);
      }
      window.addEventListener('resize', relayout, { passive: true });
      window.addEventListener('orientationchange', relayout, { passive: true });
    },

    /* Reads the card box and picks the depth constants for this breakpoint.
       Interaction changes shape by device, not just size: a phone gets one
       card and a sliver, a desktop gets a two-deep stack on each side.
       Returns false while the dashboard is still display:none. */
    measure: function () {
      if (!this.cards.length) return false;
      var w = this.cards[0].offsetWidth;
      if (!w) return false;

      /* Tier is decided on window width, not on this element's width, so the
         breakpoints line up exactly with the CSS ones (1080 / 720). Measuring
         the inner element instead puts the two out of step by the page
         gutter, and a 768px tablet lands in the phone tier. */
      var vw = window.innerWidth;
      var P;
      if (vw >= 1080) {
        P = { spread: w * 0.50, depth: 155, angle: 27, scale: .105, fade: .26, range: 2.6 };
      } else if (vw >= 720) {
        P = { spread: w * 0.44, depth: 125, angle: 23, scale: .120, fade: .30, range: 1.9 };
      } else {
        P = { spread: w * 0.30, depth: 95, angle: 16, scale: .140, fade: .34, range: 1.45 };
      }
      this.P = P;
      this.cardW = w;
      this.dragUnit = P.spread * 1.45;   /* pixels of drag per one chapter */

      /* Cards are absolutely positioned, so the stage has no height of its
         own — take it from the tallest card and keep the layout stable. */
      var tallest = 0;
      for (var i = 0; i < this.cards.length; i++) {
        tallest = Math.max(tallest, this.cards[i].offsetHeight);
      }
      if (tallest) this.stage.style.height = tallest + 'px';
      return true;
    },

    /* Where a card sits, given its distance from the (fractional) selection.
       One function so the layout, the entrance and the drag all agree. */
    place: function (d) {
      var P = this.P, ad = Math.abs(d);
      var cap = Math.min(ad, 3);
      var dx = d * this.dirSign;
      return {
        x: dx * P.spread * (1 + cap * 0.05),
        z: -cap * P.depth,
        rot: -clamp(dx, -2, 2) * P.angle,
        scale: Math.max(.62, 1 - cap * P.scale),
        opacity: Math.max(0, 1 - cap * P.fade),
        lift: -12 * (1 - Math.min(ad, 1))
      };
    },

    /* Lays out every card for a fractional index without thrashing */
    depth: function (fi) {
      var speed = Math.min(1, Math.abs(fi - (this._lastFi == null ? fi : this._lastFi)) * 3.2);
      this._lastFi = fi;
      var sel = Math.round(fi);

      for (var i = 0; i < this.cards.length; i++) {
        var c = this.cards[i];
        var d = i - fi;
        var ad = Math.abs(d);

        if (ad > this.P.range) {
          if (c._hidden !== true) { c.style.visibility = 'hidden'; c._hidden = true; }
          continue;
        }
        if (c._hidden !== false) { c.style.visibility = ''; c._hidden = false; }

        var p = this.place(d);
        var tr =
          'translate3d(' + p.x.toFixed(1) + 'px,' + p.lift.toFixed(1) + 'px,' + p.z.toFixed(1) + 'px)' +
          ' rotateY(' + p.rot.toFixed(2) + 'deg)' +
          ' scale(' + p.scale.toFixed(3) + ')';
        if (c._tr !== tr) { c.style.transform = tr; c._tr = tr; }

        var op = p.opacity.toFixed(3);
        if (c._op !== op) { c.style.opacity = op; c._op = op; }

        var zi = String(1000 - Math.round(ad * 10));
        if (c._zi !== zi) { c.style.zIndex = zi; c._zi = zi; }

        /* depth-of-field bucket — written only when it actually changes */
        var bucket = ad < .55 ? '0' : ad < 1.55 ? '1' : '2';
        if (c._depth !== bucket) { c.dataset.depth = bucket; c._depth = bucket; }

        var active = sel === i;
        if (c._active !== active) { c.classList.toggle('is-active', active); c._active = active; }
      }
    },

    /* ---- the motion loop ------------------------------------------------ */
    glide: function () {
      if (document.hidden) {
        if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
        this.fi = this.target;
        this.depth(this.fi);
        return;
      }
      if (this._raf) return;
      var self = this;
      var last = performance.now();
      var step = function (now) {
        var dt = Math.min(34, now - last);
        last = now;
        var diff = self.target - self.fi;
        if (Math.abs(diff) < 0.002) {
          self.fi = self.target;
          self.depth(self.fi);
          self._raf = 0;
          self.settle();
          return;
        }
        var factor = 1 - Math.exp(-14 * (dt / 1000));
        self.fi += diff * factor;
        self.depth(self.fi);
        self._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    },

    settle: function () {
      this.viewport.classList.remove('is-warping');
      var c = this.cards[this.idx];
      if (!c || REDUCED) return;
      var f = $('.ch-card__face', c);
      if (!f) return;
      f.animate([{ transform: 'scale(.988)' }, { transform: 'scale(1)' }],
        { duration: 420, easing: EASE_OUT });
    },

    apply: function (i, animate) {
      this.target = i;
      if (!animate || REDUCED) {
        this.fi = i;
        if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }
        this.depth(i);
        return;
      }
      this.glide();
    },

    buildDots: function () {
      var self = this;
      this.dots.innerHTML = '';
      this.cards.forEach(function (_, i) {
        var d = el('button', 'car-dot');
        d.type = 'button';
        d.setAttribute('aria-label', String(i + 1));
        d.addEventListener('click', function () { self.goto(i); });
        self.dots.appendChild(d);
      });
      this.syncDots();
    },

    syncDots: function () {
      var kids = this.dots.children;
      for (var i = 0; i < kids.length; i++) kids[i].classList.toggle('is-on', i === this.idx);
      var prev = $('#car-prev'), next = $('#car-next');
      if (prev) prev.disabled = this.idx <= 0;
      if (next) next.disabled = this.idx >= this.cards.length - 1;
    },

    goto: function (i, opts) {
      opts = opts || {};
      i = clamp(i, 0, this.cards.length - 1);
      var from = this.idx;
      var moved = i !== from;
      this.idx = i;
      Store.sset('chapter', i);
      this.syncDots();

      /* An open list belongs to the chapter that was centred. Once a different
         one takes the stage, retire it rather than leaving a mismatched panel
         under the carousel. */
      if (moved && Panel.openId && Panel.openId !== DATA.chapters[i].id) Panel.close();

      if (opts.instant || REDUCED) { this.apply(i, false); return; }

      if (moved && !opts.fromDrag) {
        this.microLabel('label_switching');
      }
      this.apply(i, true);
    },

    /* The travel effect: light streaks crossing in the direction of the move,
       plus a brief extra softening of the out-of-focus cards. Purely additive
       and self-clearing — nothing it draws survives the transition. */
    warpBurst: function (dir) {
      if (REDUCED || !this.warp) return;
      var vp = this.viewport;
      vp.classList.add('is-warping');
      clearTimeout(this._warpT);
      this._warpT = setTimeout(function () { vp.classList.remove('is-warping'); }, 620);

      var w = this.warp;
      w.innerHTML = '';
      var travel = (this.viewport.clientWidth * 0.9) * dir * this.dirSign;
      for (var i = 0; i < 4; i++) {
        var s = document.createElement('i');
        s.style.top = (14 + Math.random() * 72) + '%';
        s.style.left = (dir * this.dirSign > 0 ? -45 : 100) + '%';
        w.appendChild(s);
        (function (node, k) {
          node.animate([
            { opacity: 0, transform: 'translate3d(0,0,0) scaleX(.4)' },
            { opacity: .9, offset: .3 },
            { opacity: 0, transform: 'translate3d(' + travel + 'px,0,0) scaleX(1.5)' }
          ], { duration: 520 + k * 70, delay: k * 45, easing: 'cubic-bezier(.3,0,.2,1)' });
        })(s, i);
      }
      setTimeout(function () { w.innerHTML = ''; }, 900);
    },

    /* small energy particles trailing the switch */
    sparks: function (dir) {
      if (REDUCED) return;
      var host = this.viewport;
      var r = host.getBoundingClientRect();
      for (var i = 0; i < 7; i++) {
        var s = el('span', 'car-spark');
        s.style.left = (r.width / 2) + 'px';
        s.style.top = (r.height / 2 + (Math.random() - .5) * r.height * .5) + 'px';
        host.appendChild(s);
        var travel = (r.width * .42 + Math.random() * 90) * dir * this.dirSign;
        (function (node) {
          var ms = 480 + Math.random() * 260;
          node.animate([
            { opacity: .9, transform: 'translate(0,0) scale(1)' },
            { opacity: 0, transform: 'translate(' + travel + 'px,' + ((Math.random() - .5) * 40) + 'px) scale(.3)' }
          ], { duration: ms, easing: EASE_OUT });
          setTimeout(function () { node.remove(); }, ms);
        })(s);
      }
    },

    /* Arrival of the chapter row — the deal.
     *
     * Every card starts gathered at the centre of the track as a small fanned
     * stack, then travels out to its own place while growing to full size.
     * The start offset is computed from the layout itself (sign * d * step),
     * so the gather point is exactly the centre no matter the direction of
     * the language or how many chapters exist.
     *
     * Stagger runs OUTWARD from the selected card, so the eye is taken to the
     * chapter it will act on first and the rest unfold around it.
     *
     * `fill: backwards` holds the start frame during the delay and then hands
     * the element back to CSS — without it the final transform would stick and
     * silently block the hover state afterwards.
     */
    reveal: function () {
      if (REDUCED || document.hidden || !this.faces.length) return;
      var self = this;

      this.faces.forEach(function (f, i) {
        if (!f) return;
        var d = i - self.idx;
        var ad = Math.abs(d);
        /* Start where the card's own stack slot ISN'T: cancel its layout
           offset so every chapter begins gathered on the centre, then let it
           travel out to the place the 3D layout already assigns it. */
        var gather = -self.place(d).x * 0.88;

        f.animate([
          {
            offset: 0,
            opacity: 0,
            transform: 'translate3d(' + gather.toFixed(1) + 'px, 30px, 0) ' +
              'rotate(' + (d * 2.6).toFixed(2) + 'deg) scale(.46)',
            filter: 'blur(5px)'
          },
          { offset: .45, opacity: 1 },
          { offset: 1, opacity: 1, transform: 'none', filter: 'blur(0px)' }
        ], {
          duration: 1150,
          delay: 130 + ad * 105,
          easing: 'cubic-bezier(.16,1,.3,1)',   /* long, soft settle — no bounce */
          fill: 'backwards'
        });
      });

      /* the guide and the dots resolve last, once the row has settled */
      [$('.car-marker'), $('#car-dots')].forEach(function (n, k) {
        if (!n) return;
        n.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
          { duration: 700, delay: 620 + k * 90, easing: EASE_OUT, fill: 'backwards' });
      });
    },

    microLabel: function (key) {
      var m = $('#car-micro');
      if (!m) return;
      m.textContent = tx(key);
      m.classList.add('is-on');
      clearTimeout(this._micro);
      this._micro = setTimeout(function () { m.classList.remove('is-on'); }, 700);
    },

    /* --- pointer drag with inertia ------------------------------------
     * Pointer capture is taken ONLY once the pointer has travelled past
     * DRAG_MIN. Capturing on pointerdown would make the browser deliver the
     * following `click` to the viewport instead of the card underneath, and
     * a plain tap on a chapter would silently do nothing.
     * ------------------------------------------------------------------ */
    bindDrag: function () {
      var self = this;
      var DRAG_MIN = 6;
      var id = null, armed = false, x0 = 0, y0 = 0, dx = 0, vx = 0, lastX = 0, lastT = 0, base = 0;
      var moveRaf = 0;

      this.viewport.addEventListener('pointerdown', function (e) {
        if (e.button != null && e.button !== 0) return;
        if (e.target.closest && e.target.closest('.exp-panel')) return;
        id = e.pointerId;
        armed = true;
        self.dragging = false;          /* not a drag until it moves */
        base = self.idx;
        x0 = lastX = e.clientX; y0 = e.clientY; lastT = performance.now(); dx = 0; vx = 0;
      });

      this.viewport.addEventListener('pointermove', function (e) {
        if (!armed || e.pointerId !== id) return;
        dx = e.clientX - x0;
        var dy = e.clientY - y0;

        if (!self.dragging) {
          if (Math.abs(dx) < DRAG_MIN) return;   /* still a click, leave it alone */
          /* Disambiguate vertical page scrolling from horizontal carousel dragging */
          if (Math.abs(dy) > Math.abs(dx) * 1.1) {
            armed = false;
            return;
          }
          self.dragging = true;
          if (self._raf) { cancelAnimationFrame(self._raf); self._raf = 0; }
          self.viewport.classList.add('is-dragging');
          try { self.viewport.setPointerCapture(id); } catch (err) {}
        }

        var now = performance.now(), dt = now - lastT;
        if (dt > 8) { vx = (e.clientX - lastX) / dt; lastX = e.clientX; lastT = now; }

        /* RAF-throttled to avoid layout thrashing on high-frequency pointer polling */
        if (!moveRaf) {
          moveRaf = requestAnimationFrame(function () {
            moveRaf = 0;
            if (!armed || !self.dragging) return;
            var fi = base - (dx / self.dragUnit) * self.dirSign;
            fi = clamp(fi, -.4, self.cards.length - 1 + .4);
            self.fi = fi;
            self.target = fi;
            self.depth(fi);
          });
        }
      });

      function end(e) {
        if (!armed || (e && e.pointerId !== id)) return;
        armed = false;
        if (moveRaf) { cancelAnimationFrame(moveRaf); moveRaf = 0; }
        if (!self.dragging) return;     /* a tap — let the click through */

        self.dragging = false;
        self.viewport.classList.remove('is-dragging');
        try { self.viewport.releasePointerCapture(id); } catch (err) {}

        var fi = base - (dx / self.dragUnit) * self.dirSign;
        /* momentum: a quick flick carries one chapter regardless of distance */
        var flick = Math.abs(vx) > .42 ? -Math.sign(vx) * self.dirSign : 0;
        var target = flick ? Math.round(fi) + (Math.abs(fi - base) < .5 ? flick : 0) : Math.round(fi);

        self.microLabel(target > base ? 'label_next' : target < base ? 'label_prev' : 'label_explore');
        self.goto(target, { fromDrag: true });

        /* a real drag must not also open the chapter it ended on */
        self._suppressClick = true;
        setTimeout(function () { self._suppressClick = false; }, 80);
      }
      this.viewport.addEventListener('pointerup', end);
      this.viewport.addEventListener('pointercancel', end);

      /* Horizontal wheel / trackpad swipe only. Vertical wheel is left alone
         on purpose: the carousel sits mid-page, and swallowing vertical
         scroll would trap the reader inside it. */
      var wheelLock = 0;
      this.viewport.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 8) return;
        e.preventDefault();
        var now = performance.now();
        if (now - wheelLock < 380) return;
        wheelLock = now;
        self.goto(self.idx + (e.deltaX > 0 ? 1 : -1) * self.dirSign);
      }, { passive: false });
    },

    /* Activation is delegated to the viewport so it survives every re-render,
       and falls back to a hit-test if anything retargets the click. */
    bindActivation: function () {
      var self = this;

      function cardFrom(e) {
        var c = e.target && e.target.closest ? e.target.closest('.ch-card') : null;
        if (!c && e.clientX != null && e.clientY != null) {
          var hit = document.elementFromPoint(e.clientX, e.clientY);
          c = hit && hit.closest ? hit.closest('.ch-card') : null;
        }
        return c;
      }

      this.viewport.addEventListener('click', function (e) {
        if (self._suppressClick) return;
        var c = cardFrom(e);
        if (c) activateChapter(c);
      });

      this.viewport.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var c = e.target && e.target.closest ? e.target.closest('.ch-card') : null;
        if (!c) return;
        e.preventDefault();
        activateChapter(c);
      });
    },

    bindKeys: function () {
      var self = this;
      this.viewport.addEventListener('keydown', function (e) {
        var rtl = document.documentElement.dir === 'rtl';
        if (e.key === 'ArrowRight') { self.goto(self.idx + (rtl ? -1 : 1)); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { self.goto(self.idx + (rtl ? 1 : -1)); e.preventDefault(); }
        if (e.key === 'Home') { self.goto(0); e.preventDefault(); }
        if (e.key === 'End') { self.goto(self.cards.length - 1); e.preventDefault(); }
      });
    }
  };

  /* ======================================================== EXPERIMENTS  */
  var Panel = {
    openId: null,

    toggle: function (chapter, cardEl) {
      if (this.openId === chapter.id) { this.close(); return; }
      this.open(chapter, cardEl);
    },

    open: function (chapter, cardEl) {
      var host = $('#exp-panel');
      var self = this;
      /* Every open/close bumps the sequence. A pending teardown from the
         previous state checks it and stands down, so a close immediately
         followed by an open cannot hide the panel it just opened. */
      var seq = this._seq = (this._seq || 0) + 1;
      this.openId = chapter.id;
      Store.sset('open', chapter.id);

      $$('.ch-card').forEach(function (c) {
        var on = c.dataset.id === chapter.id;
        c.classList.toggle('is-open', on);
        c.setAttribute('aria-expanded', on ? 'true' : 'false');
      });

      host.innerHTML = this.markup(chapter);
      host.hidden = false;
      this.bindRows(chapter, host);

      if (REDUCED || document.hidden) { host.style.height = 'auto'; return; }
      var h = host.firstElementChild.getBoundingClientRect().height;
      host.style.height = '0px';
      host.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }],
        { duration: 360, easing: EASE_OUT });
      setTimeout(function () {
        if (self._seq !== seq) return;
        host.style.height = 'auto';
      }, 350);

      if (cardEl) {
        cardEl.animate([{ transform: cardEl.style.transform + ' scale(1)' },
        { transform: cardEl.style.transform + ' scale(1.015)' },
        { transform: cardEl.style.transform + ' scale(1)' }],
          { duration: 420, easing: EASE_OUT });
      }
    },

    close: function () {
      var host = $('#exp-panel');
      if (host.hidden) return;
      var self = this;
      var seq = this._seq = (this._seq || 0) + 1;
      this.openId = null;
      Store.sset('open', null);
      $$('.ch-card').forEach(function (c) {
        c.classList.remove('is-open');
        c.setAttribute('aria-expanded', 'false');
      });

      var strip = function () { host.hidden = true; host.style.height = ''; host.innerHTML = ''; };
      if (REDUCED || document.hidden) { strip(); return; }

      var h = host.getBoundingClientRect().height;
      host.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
        { duration: 260, easing: EASE_INOUT });
      setTimeout(function () {
        if (self._seq !== seq) return;   /* something re-opened it meanwhile */
        strip();
      }, 250);
    },

    markup: function (ch) {
      var visited = Store.get('visited', []);
      var rows = ch.experiments.map(function (ex, i) {
        var seen = visited.indexOf(ex.id) > -1;
        return '<a class="exp-row" style="--n:' + i + '" href="' + ex.href + '" ' +
          'data-exp="' + ex.id + '" data-ch="' + ch.id + '">' +
          (seen ? '<i class="exp-row__seen" title="' + tx('exp_visited') + '"></i>' : '') +
          '<span class="exp-row__thumb">' + icon(ex.icon) + '</span>' +
          '<span class="exp-row__txt">' +
          '<span class="exp-row__title">' + ex.title[lang] + '</span>' +
          '<span class="exp-row__desc">' + (ex.desc ? ex.desc[lang] : '') + '</span>' +
          '</span>' +
          '<span class="exp-row__n">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="exp-row__go">' + icon(document.documentElement.dir === 'rtl' ? 'chevronL' : 'chevron') + '</span>' +
          '</a>';
      }).join('');

      return '<div class="exp-panel__inner glass">' +
        '<div class="exp-panel__head">' +
        '<span class="stat__ico">' + icon('flask') + '</span>' +
        '<h3 class="t-h3">' + tx('panel_title', { chapter: ch.title[lang] }) + '</h3>' +
        '<button class="icon-btn" id="panel-close" aria-label="' + tx('panel_close') + '">' + icon('chevronD') + '</button>' +
        '</div>' +
        '<div class="exp-list">' + rows + '</div>' +
        '</div>';
    },

    bindRows: function (ch, host) {
      var self = this;
      $('#panel-close', host).addEventListener('click', function () { self.close(); });
      $$('.exp-row', host).forEach(function (row) {
        row.addEventListener('click', function (e) {
          e.preventDefault();
          leaveFor(row.getAttribute('href'), row.dataset.ch, row.dataset.exp);
        });
      });
    }
  };

  /* --------------------------------------------- leaving for an experiment */
  function leaveFor(href, chId, expId) {
    /* record progress + recents so the dashboard is meaningful on return */
    var visited = Store.get('visited', []);
    if (visited.indexOf(expId) < 0) { visited.push(expId); Store.set('visited', visited); }
    var recents = Store.get('recents', []).filter(function (r) { return r.exp !== expId; });
    recents.unshift({ exp: expId, ch: chId, t: Date.now() });
    Store.set('recents', recents.slice(0, 6));

    /* remember exactly where we were, so coming back lands in place (§15) */
    Store.sset('chapter', Carousel.idx);
    Store.sset('open', chId);
    Store.sset('scroll', window.scrollY);
    Store.sset('route', 'dash');

    var veil = $('#veil');
    veil.classList.add('is-on');
    setTimeout(function () { window.location.href = href; }, 190);
  }

  /* ============================================================ DASHBOARD */
  var Dash = {
    refresh: function () {
      var chapters = DATA.chapters;
      var open = chapters.filter(function (c) { return c.status === 'available'; });
      var total = open.reduce(function (n, c) { return n + c.experiments.length; }, 0);
      var visited = Store.get('visited', []);

      $('#dash-greeting').textContent = tx('dash_greeting', { name: getUser() || '—' }) + ' 👋';
      $('#stat-chapters').textContent = open.length;
      $('#stat-experiments').textContent = total;
      $('#stat-progress').textContent = visited.length;
      this.recents();
      this.rings();
    },

    recents: function () {
      var host = $('#recents');
      var list = Store.get('recents', []);
      if (!list.length) {
        host.className = 'empty';
        host.textContent = tx('dash_recent_empty');
        return;
      }
      host.className = 'recents';
      host.innerHTML = list.map(function (r) {
        var found = null, chap = null;
        DATA.chapters.forEach(function (c) {
          c.experiments.forEach(function (e) { if (e.id === r.exp) { found = e; chap = c; } });
        });
        if (!found) return '';
        return '<a class="recent" href="' + found.href + '" data-exp="' + found.id + '" data-ch="' + chap.id + '">' +
          '<span class="recent__ico">' + icon(found.icon) + '</span>' +
          '<span class="recent__txt"><b>' + found.title[lang] + '</b><span>' + chap.title[lang] + '</span></span>' +
          '</a>';
      }).join('');

      $$('.recent', host).forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          leaveFor(a.getAttribute('href'), a.dataset.ch, a.dataset.exp);
        });
      });
    },

    rings: function () {
      var visited = Store.get('visited', []);
      DATA.chapters.forEach(function (ch) {
        var ring = $('.ring[data-ch="' + ch.id + '"]');
        if (!ring) return;
        var total = ch.experiments.length;
        var done = ch.experiments.filter(function (e) { return visited.indexOf(e.id) > -1; }).length;
        var pct = total ? done / total : 0;
        var C = 2 * Math.PI * 14;
        $('.fg', ring).style.strokeDasharray = C;
        $('.fg', ring).style.strokeDashoffset = C * (1 - pct);
        $('b', ring).textContent = total ? done + '/' + total : '—';
        ring.title = tx('card_progress', { done: done, total: total });
      });
    }
  };

  /* ============================================================== RENDER */
  /* Arabic count agreement — dual and 11+ both differ from the naive plural. */
  function countLabel(n) {
    if (n === 0) return tx('card_experiments_zero');
    if (n === 1) return tx('card_experiment_one');
    if (n === 2) return tx('card_experiments_two');
    return tx(n <= 10 ? 'card_experiments_few' : 'card_experiments_many', { n: n });
  }

  function chapterCard(ch) {
    var badge = ch.status === 'locked'
      ? icon('lock') + '<span>' + tx('card_soon') + '</span>'
      : icon('flask') + '<span>' + countLabel(ch.experiments.length) + '</span>';

    /* Every chapter image is fetched up front — all five together are well
       under half a megabyte, and lazy-loading them would leave an off-screen
       card empty until the flip that reveals it, popping in mid-animation.
       Priority, not laziness, is what separates them.
       ART is only a safety net for a chapter added without artwork. */
    var pos = DATA.chapters.indexOf(ch);
    var art = ch.image
      ? '<img src="' + ch.image + '" alt="" decoding="async" ' +
        'fetchpriority="' + (pos < 2 ? 'high' : 'low') + '">'
      : '<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      (ART[ch.art] || ART.quantum) + '</svg>';

    var ring = ch.status === 'locked' ? '' :
      '<span class="ring" data-ch="' + ch.id + '">' +
      '<svg viewBox="0 0 34 34"><circle class="bg" cx="17" cy="17" r="14"/>' +
      '<circle class="fg" cx="17" cy="17" r="14"/></svg><b></b></span>';

    /* Three transform layers, deliberately separate — the JS coverflow writes
       to .ch-card, the idle bob animates .ch-card__float, and the chapter flip
       animates .ch-card__face. On one element they would overwrite each other. */
    return '<article class="ch-card' + (ch.status === 'locked' ? ' is-locked' : '') + '" ' +
      'data-id="' + ch.id + '" data-tone="' + (ch.tone || 'dark') + '" ' +
      'style="--bob:' + (6.4 + pos * 0.7).toFixed(1) + 's;--bobdelay:-' + (pos * 1.3).toFixed(1) + 's" ' +
      'tabindex="0" role="button" aria-expanded="false">' +
      '<div class="ch-card__float"><div class="ch-card__face">' +
      '<span class="ch-card__sweep"></span>' +
      '<div class="ch-card__art">' + art +
      '<span class="ch-card__num t-num">' + ch.num + '</span>' +
      '<span class="ch-card__badge">' + badge + '</span>' +
      '</div>' +
      '<div class="ch-card__body">' +
      '<h3 class="ch-card__title">' + ch.title[lang] + '</h3>' +
      '<p class="ch-card__desc">' + ch.desc[lang] + '</p>' +
      '<div class="ch-card__meta">' + ring +
      '<span class="ch-card__cta">' + (ch.status === 'locked' ? tx('card_soon') : tx('card_open')) +
      icon(document.documentElement.dir === 'rtl' ? 'chevronL' : 'chevron') + '</span>' +
      '</div></div></div></div></article>';
  }

  /** Full re-render of every translatable surface. Cheap: the shell is small. */
  function render() {
    var t = T();

    /* --- static strings ------------------------------------------------ */
    $$('[data-t]').forEach(function (n) { n.textContent = tx(n.dataset.t); });
    $$('[data-t-ph]').forEach(function (n) { n.placeholder = tx(n.dataset.tPh); });
    $$('[data-t-aria]').forEach(function (n) { n.setAttribute('aria-label', tx(n.dataset.tAria)); });

    document.title = t.home_title + ' | RAQEEM';
    $('#lang-label').textContent = t.lang_switch;
    $('.rq-brand__sub').textContent = t.brand_sub;
    $('#theme-label').textContent = theme === 'dark' ? tx('theme_to_light') : tx('theme_to_dark');

    /* --- home figures --------------------------------------------------- */
    var open = DATA.chapters.filter(function (c) { return c.status === 'available'; });
    var total = open.reduce(function (n, c) { return n + c.experiments.length; }, 0);
    $('#home-ch-count').textContent = DATA.chapters.length;
    $('#home-ex-count').textContent = total;

    /* --- chapter cards -------------------------------------------------- */
    var stage = $('#car-stage');
    var keepIdx = Carousel.idx;
    var keepOpen = Panel.openId;
    stage.innerHTML = DATA.chapters.map(chapterCard).join('');
    Carousel.idx = keepIdx;
    Carousel.mount();

    /* --- directional arrow glyphs -------------------------------------- */
    var rtl = t.dir === 'rtl';
    $('#car-prev').innerHTML = icon(rtl ? 'chevron' : 'chevronL') +
      '<span class="micro">' + tx('label_prev') + '</span>';
    $('#car-next').innerHTML = icon(rtl ? 'chevronL' : 'chevron') +
      '<span class="micro">' + tx('label_next') + '</span>';
    $('#car-prev').style.setProperty('--dirsign', rtl ? 1 : -1);
    $('#car-next').style.setProperty('--dirsign', rtl ? -1 : 1);

    /* --- account chip --------------------------------------------------- */
    var user = getUser();
    $('#chip-name').textContent = user || tx('dash_profile');
    $('#chip-ava').textContent = (user || 'R').trim().charAt(0).toUpperCase();

    if (Router.current === 'dash') Dash.refresh();
    if (keepOpen) {
      var ch = DATA.chapters.filter(function (c) { return c.id === keepOpen; })[0];
      if (ch) { Panel.openId = null; Panel.open(ch, null); }
    }
  }

  /* Opening a chapter: centre it first, then reveal (or hide) its list. */
  function activateChapter(cardEl) {
    var id = cardEl.dataset.id;
    var ch = null, i = -1;
    for (var k = 0; k < DATA.chapters.length; k++) {
      if (DATA.chapters[k].id === id) { ch = DATA.chapters[k]; i = k; break; }
    }
    if (!ch) return;

    if (i !== Carousel.idx) Carousel.goto(i);
    if (ch.status === 'locked') { toast(tx('toast_locked'), 'warn'); return; }
    Panel.toggle(ch, cardEl);
  }

  /* ================================================================ BOOT */
  function wire() {
    /* language */
    $('#lang-btn').addEventListener('click', function () {
      applyLang(lang === 'ar' ? 'en' : 'ar');
    });

    /* theme */
    $('#theme-btn').addEventListener('click', function (e) {
      applyTheme(theme === 'dark' ? 'light' : 'dark', e.currentTarget);
      $('#theme-label').textContent = theme === 'dark' ? tx('theme_to_light') : tx('theme_to_dark');
    });

    /* brand → home / dashboard */
    $('#brand').addEventListener('click', function () {
      Router.go(getUser() ? 'dash' : 'home');
    });

    /* home → auth (or straight to the dashboard if already signed in) */
    $('#cta').addEventListener('click', function () {
      if (Atmos.burst) Atmos.burst(5);
      Router.go(getUser() ? 'dash' : 'auth');
    });

    $('#auth-back').addEventListener('click', function () { Router.go('home'); });

    /* sign-in */
    $('#auth-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#auth-name');
      var name = input.value.trim();
      if (name.length < 3) {
        toast(tx('toast_name'), 'warn');
        input.focus();
        input.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' },
        { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
          { duration: 260, easing: EASE_OUT });
        return;
      }
      setUser(name);
      input.value = '';
      render();
      Router.go('dash');
      toast(tx('toast_welcome', { name: name }), 'ok');
    });

    /* sign-out */
    $('#logout').addEventListener('click', function () {
      setUser('');
      Panel.close();
      render();
      Router.go('home');
      toast(tx('toast_logout'));
    });

    /* carousel arrows */
    $('#car-prev').addEventListener('click', function () { Carousel.goto(Carousel.idx - 1); });
    $('#car-next').addEventListener('click', function () { Carousel.goto(Carousel.idx + 1); });

    /* Esc closes the experiment list */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') Panel.close();
    });

    /* returning through the browser's back/forward cache */
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        $('#veil').classList.remove('is-on');
        Atmos.paused = false;
        Atmos.tick();
      }
    });
  }

  function restore() {
    var wantsMenu = new URLSearchParams(location.search).get('showMenu') === 'true';
    var user = getUser();

    if (wantsMenu) {
      /* Contract with the experiment pages: ?showMenu=true lands on the
         dashboard, in the same chapter, with the same list open. */
      if (!user) setUser(lang === 'ar' ? 'أستاذ' : 'Professor');
      render();
      Carousel.idx = Store.sget('chapter', 0);
      Router.go('dash', { instant: true, keepScroll: true, quiet: true });
      Carousel.goto(Carousel.idx, { instant: true });

      var openId = Store.sget('open', null);
      if (openId) {
        var ch = DATA.chapters.filter(function (c) { return c.id === openId; })[0];
        if (ch && ch.status === 'available') Panel.open(ch, null);
      }
      var y = Store.sget('scroll', 0);
      if (y) requestAnimationFrame(function () { window.scrollTo(0, y); });

      $('#app').animate([{ opacity: 0, transform: 'scale(.995)' }, { opacity: 1, transform: 'none' }],
        { duration: 340, easing: EASE_OUT });
      return true;
    }
    return false;
  }

  function boot() {
    document.documentElement.setAttribute('data-theme', theme);
    var t = DATA.i18n[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    document.documentElement.style.setProperty('--flow', t.dir === 'rtl' ? -1 : 1);

    wire();
    Atmos.init();

    if (restore()) {
      var sp = $('#splash'); if (sp) sp.remove();
      return;
    }

    render();
    /* Router.onEnter drives the entrance for whichever screen we land on. */
    runSplash().then(function () {
      Router.go(getUser() ? 'dash' : 'home', { instant: true });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
