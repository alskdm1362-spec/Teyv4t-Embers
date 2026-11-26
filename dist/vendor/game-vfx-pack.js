/**
 * 2D Side-Scroller Real-Fantasy Game VFX Pack (22 Effects)
 * Standalone HTML5 Canvas 2D Library — Zero External Assets
 */
(function (global) {
  "use strict";

function mulberry32(seed) {
      let a = seed >>> 0;
      return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

function hash2D(ix, iy) {
      let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
      n = (n ^ (n >>> 13)) >>> 0;
      n = Math.imul(n, 1274126177) >>> 0;
      return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    }

function valueNoise2D(x, y) {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const fx = x - ix;
      const fy = y - iy;
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      const a = hash2D(ix, iy);
      const b = hash2D(ix + 1, iy);
      const c = hash2D(ix, iy + 1);
      const d = hash2D(ix + 1, iy + 1);
      return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    }

function fbm2D(x, y, octaves) {
      let v = 0;
      let amp = 0.5;
      let freq = 1;
      for (let i = 0; i < (octaves || 3); i++) {
        v += amp * valueNoise2D(x * freq, y * freq);
        freq *= 2.05;
        amp *= 0.5;
      }
      return v;
    }

function clamp(v, min, max) {
      return v < min ? min : v > max ? max : v;
    }

function lerp(a, b, t) {
      return a + (b - a) * t;
    }

function easeOutCubic(t) {
      return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
    }

function easeOutExpo(t) {
      t = clamp(t, 0, 1);
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

function easeInOutQuad(t) {
      t = clamp(t, 0, 1);
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

function lerpColorRGB(c1, c2, t) {
      t = clamp(t, 0, 1);
      return [
        Math.round(lerp(c1[0], c2[0], t)),
        Math.round(lerp(c1[1], c2[1], t)),
        Math.round(lerp(c1[2], c2[2], t))
      ];
    }

function rgbaStr(rgb, a) {
      return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + clamp(a, 0, 1).toFixed(3) + ')';
    }

function createProceduralSprites() {
      const sprites = {};

      function bakeNoiseCloud(size, rgb, power, contrast, seedOff) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const g = c.getContext('2d');
        const img = g.createImageData(size, size);
        const d = img.data;
        const half = size * 0.5;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const dx = (x - half) / half;
            const dy = (y - half) / half;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist >= 1) continue;
            const radial = Math.pow(1 - dist, power);
            const n = fbm2D(x * 0.065 + seedOff, y * 0.065 + seedOff * 0.7, 4);
            const alpha = clamp((n * contrast - 0.16) * radial * 2.1, 0, 1);
            const idx = (y * size + x) * 4;
            d[idx] = rgb[0];
            d[idx + 1] = rgb[1];
            d[idx + 2] = rgb[2];
            d[idx + 3] = Math.round(alpha * 255);
          }
        }
        g.putImageData(img, 0, 0);
        return c;
      }

      function bakeGlow(size, coreRgb, midRgb, outerRgb) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const g = c.getContext('2d');
        const half = size * 0.5;
        const grad = g.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0, rgbaStr(coreRgb, 1));
        grad.addColorStop(0.18, rgbaStr(midRgb, 0.78));
        grad.addColorStop(0.5, rgbaStr(outerRgb, 0.28));
        grad.addColorStop(1, rgbaStr(outerRgb, 0));
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
        return c;
      }

      // Organic volumetric cloud textures
      sprites.smokeDark = bakeNoiseCloud(96, [12, 10, 18], 1.65, 1.35, 11.3);
      sprites.smokeCrimson = bakeNoiseCloud(96, [120, 18, 22], 1.5, 1.4, 27.1);
      sprites.smokeBlue = bakeNoiseCloud(96, [14, 55, 98], 1.6, 1.3, 41.7);
      sprites.smokeGold = bakeNoiseCloud(96, [135, 86, 18], 1.6, 1.3, 55.2);
      sprites.smokeTeal = bakeNoiseCloud(96, [12, 74, 90], 1.6, 1.3, 68.4);
      sprites.fireWisp = bakeNoiseCloud(96, [255, 120, 40], 1.35, 1.55, 83.9);
      sprites.healMist = bakeNoiseCloud(96, [90, 235, 160], 1.6, 1.35, 97.6);
      sprites.cyanMist = bakeNoiseCloud(96, [56, 215, 245], 1.55, 1.35, 112.1);
      sprites.smokeWine = bakeNoiseCloud(96, [105, 14, 42], 1.45, 1.45, 128.7);
      sprites.smokePurple = bakeNoiseCloud(96, [76, 22, 130], 1.5, 1.4, 143.5);

      // Physically soft atmospheric bloom sprites
      sprites.glowSky = bakeGlow(128, [255, 255, 255], [125, 225, 255], [14, 145, 233]);
      sprites.glowRed = bakeGlow(128, [255, 245, 220], [255, 90, 50], [185, 22, 22]);
      sprites.glowGold = bakeGlow(128, [255, 255, 240], [254, 224, 102], [217, 119, 6]);
      sprites.glowPink = bakeGlow(128, [255, 245, 252], [244, 114, 182], [190, 24, 93]);
      sprites.glowCyan = bakeGlow(128, [245, 255, 255], [34, 211, 238], [6, 148, 162]);
      sprites.glowHeal = bakeGlow(128, [254, 252, 220], [110, 245, 165], [16, 185, 129]);
      sprites.glowWarm = bakeGlow(128, [255, 250, 225], [251, 155, 65], [220, 75, 18]);
      sprites.glowPurple = bakeGlow(128, [250, 240, 255], [168, 85, 247], [88, 28, 135]);
      sprites.glowWhite = bakeGlow(128, [255, 255, 255], [226, 232, 240], [148, 163, 184]);

      return sprites;
    }

function stampSprite(ctx, img, x, y, w, h, rot, alpha, comp) {
      if (alpha <= 0.005 || w <= 0.5 || h <= 0.5) return;
      ctx.save();
      if (comp) ctx.globalCompositeOperation = comp;
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
      ctx.restore();
    }

function drawPainterlyArc(ctx, radius, ryRatio, aStart, aEnd, maxThick, noiseSeed, p, style) {
      const steps = 38;
      if (Math.abs(aEnd - aStart) < 0.03) return;
      const outerPts = [];
      const innerPts = [];

      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const a = lerp(aStart, aEnd, u);
        // Taper sharply at tail and leading edge, bulge in upper-mid
        const profile = Math.sin(u * Math.PI) * Math.pow(u, 0.55);
        const nOut = (fbm2D(u * 5.5 + noiseSeed, p * 3.2, 3) - 0.5) * style.jagOut;
        const nIn = (fbm2D(u * 6.5 + noiseSeed + 17, p * 4.0, 3) - 0.5) * style.jagIn;
        const rOut = radius + profile * 16 + nOut;
        const rIn = rOut - Math.max(1.5, profile * maxThick + nIn);

        outerPts.push([Math.cos(a) * rOut, Math.sin(a) * rOut * ryRatio]);
        innerPts.push([Math.cos(a) * rIn, Math.sin(a) * rIn * ryRatio]);
      }

      ctx.beginPath();
      ctx.moveTo(outerPts[0][0], outerPts[0][1]);
      for (let i = 1; i <= steps; i++) ctx.lineTo(outerPts[i][0], outerPts[i][1]);
      for (let i = steps; i >= 0; i--) ctx.lineTo(innerPts[i][0], innerPts[i][1]);
      ctx.closePath();
      ctx.fill();
    }

let _fireCanvas = null, _fireCtx = null, _fireImg = null;

function getFireShaderBuffer() {
      if (!_fireCanvas) {
        _fireCanvas = document.createElement('canvas');
        _fireCanvas.width = 72;
        _fireCanvas.height = 72;
        _fireCtx = _fireCanvas.getContext('2d');
        _fireImg = _fireCtx.createImageData(72, 72);
      }
      return { canvas: _fireCanvas, ctx: _fireCtx, img: _fireImg };
    }

function drawSharpRibbon(ctx, pts, maxW, fillStyle, comp, alpha) {
      if (pts.length < 3 || alpha <= 0.01) return;
      const n = pts.length;
      const left = [];
      const right = [];
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        const prev = pts[Math.max(0, i - 1)];
        const next = pts[Math.min(n - 1, i + 1)];
        let dx = next[0] - prev[0];
        let dy = next[1] - prev[1];
        const d = Math.hypot(dx, dy) || 1;
        dx /= d;
        dy /= d;
        // Sharp needle taper at both head and tail
        const halfW = maxW * 0.5 * Math.pow(Math.sin(u * Math.PI), 1.35);
        left.push([pts[i][0] - dy * halfW, pts[i][1] + dx * halfW]);
        right.push([pts[i][0] + dy * halfW, pts[i][1] - dx * halfW]);
      }
      ctx.save();
      if (comp) ctx.globalCompositeOperation = comp;
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.moveTo(left[0][0], left[0][1]);
      for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

function renderHemisphereGuard(ctx, x, y, p, dir, scale, seed, t, theme) {
      t = t || {};
      const expandEnd = t.expandEnd || 0.22;
      const fadeStart = t.fadeStart || 0.70;
      const rand = mulberry32(seed);

      const intro = easeOutExpo(clamp(p / expandEnd, 0, 1));
      const outro = p > fadeStart ? 1 - easeInOutQuad((p - fadeStart) / Math.max(0.05, 1 - fadeStart)) : 1;
      const alpha = intro * outro;
      if (alpha <= 0.01) return;

      ctx.save();
      ctx.translate(x + dir * 16 * scale, y - 4);
      ctx.scale(dir * scale, scale);

      const R = 64 * (0.45 + 0.55 * intro);
      const breath = 1 + Math.sin(p * 16) * 0.025;
      const rX = R * 0.86 * breath;
      const rY = R * 1.12 * breath;

      if (theme.smoke) {
        stampSprite(ctx, SPRITES[theme.smoke], 10, 0, rX * 2.2, rY * 2.0, p * 0.6, 0.55 * alpha, 'source-over');
      }

      stampSprite(ctx, SPRITES[theme.glow], 18, 0, rX * 2.4, rY * 2.3, 0, (theme.glowAlpha || 0.55) * alpha, 'lighter');

      ctx.save();
      ctx.globalCompositeOperation = theme.shellComp || 'lighter';
      const domeG = ctx.createRadialGradient(-rX * 0.2, 0, rX * 0.15, 0, 0, rY * 1.05);
      domeG.addColorStop(0, rgbaStr(theme.c1, 0.04 * alpha));
      domeG.addColorStop(0.58, rgbaStr(theme.c1, 0.16 * alpha));
      domeG.addColorStop(0.86, rgbaStr(theme.c2, 0.48 * alpha));
      domeG.addColorStop(1, rgbaStr(theme.rim, 0.82 * alpha));

      ctx.fillStyle = domeG;
      ctx.beginPath();
      ctx.ellipse(0, 0, rX, rY, 0, -Math.PI * 0.52, Math.PI * 0.52);
      ctx.quadraticCurveTo(rX * 0.22, 0, 0, -rY * Math.sin(Math.PI * 0.52));
      ctx.closePath();
      ctx.fill();

      const ribG = ctx.createLinearGradient(0, -rY, rX, rY);
      ribG.addColorStop(0, rgbaStr(theme.c1, 0.72 * alpha));
      ribG.addColorStop(0.5, rgbaStr(theme.rim, 0.88 * alpha));
      ribG.addColorStop(1, rgbaStr(theme.c2, 0.72 * alpha));

      ctx.strokeStyle = ribG;
      ctx.lineWidth = 3.2 * alpha;
      ctx.beginPath();
      ctx.ellipse(0, 0, rX, rY, 0, -Math.PI * 0.52, Math.PI * 0.52);
      ctx.stroke();

      ctx.strokeStyle = rgbaStr(theme.c2, 0.38 * alpha);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(0, 0, rX * 0.62, rY * 0.94, 0, -Math.PI * 0.48, Math.PI * 0.48);
      ctx.stroke();

      const ripP = clamp((p - 0.08) / 0.55, 0, 1);
      if (ripP > 0 && ripP < 1) {
        const ra = (1 - ripP) * 0.82 * alpha;
        ctx.strokeStyle = rgbaStr(theme.rim, ra);
        ctx.lineWidth = 2.6 * (1 - ripP);
        ctx.beginPath();
        ctx.ellipse(rX * 0.55 * (1 - ripP * 0.4), 0, rX * (0.25 + ripP * 0.65), rY * (0.22 + ripP * 0.72), 0, -Math.PI * 0.46, Math.PI * 0.46);
        ctx.stroke();
      }

      ctx.strokeStyle = rgbaStr(theme.rim, 0.65 * alpha);
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.ellipse(0, 0, rX * 0.88, rY * 0.88, 0, -Math.PI * 0.36, -Math.PI * 0.08);
      ctx.stroke();

      for (let i = 0; i < 14; i++) {
        const sp = clamp((p - rand() * 0.22) / 0.72, 0, 1);
        if (sp <= 0 || sp >= 1) continue;
        const ang = (rand() - 0.5) * Math.PI * 0.9;
        const dist = 1 + easeOutCubic(sp) * (0.25 + rand() * 0.35);
        const px = Math.cos(ang) * rX * dist;
        const py = Math.sin(ang) * rY * dist;
        const sz = (2.2 + rand() * 2.5) * (1 - sp);
        ctx.fillStyle = rgbaStr(i % 2 === 0 ? theme.rim : theme.c2, (1 - sp) * alpha);
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.restore();
    }

const CARD_ASSETS = { imgA: null, imgB: null, defaultA: null, defaultB: null };

function buildDefaultCardCanvas(variant) {
      const c = document.createElement('canvas');
      c.width = 160;
      c.height = 230;
      const g = c.getContext('2d');
      const isB = variant === 'B';

      const bg = g.createLinearGradient(0, 0, 160, 230);
      if (isB) {
        bg.addColorStop(0, '#0f172a');
        bg.addColorStop(0.55, '#1e3a5f');
        bg.addColorStop(1, '#164e63');
      } else {
        bg.addColorStop(0, '#1e1124');
        bg.addColorStop(0.55, '#2d142c');
        bg.addColorStop(1, '#120a18');
      }
      g.fillStyle = bg;
      g.fillRect(0, 0, 160, 230);

      // Ornate border
      g.strokeStyle = isB ? '#38bdf8' : '#a855f7';
      g.lineWidth = 4;
      g.strokeRect(5, 5, 150, 220);

      // Artwork frame
      g.fillStyle = isB ? 'rgba(14, 165, 233, 0.18)' : 'rgba(147, 51, 234, 0.18)';
      g.fillRect(14, 34, 132, 102);
      g.strokeStyle = isB ? 'rgba(125,211,252,0.6)' : 'rgba(192,132,252,0.55)';
      g.lineWidth = 1.5;
      g.strokeRect(14, 34, 132, 102);

      // Emblem inside art box
      g.strokeStyle = isB ? '#7dd3fc' : '#e879f9';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(80, 48);
      g.lineTo(110, 85);
      g.lineTo(80, 122);
      g.lineTo(50, 85);
      g.closePath();
      g.stroke();

      // Title bar & Cost badge
      g.fillStyle = isB ? '#bae6fd' : '#f3e8ff';
      g.font = '700 13px Cinzel, Georgia, serif';
      g.textAlign = 'left';
      g.fillText(isB ? 'AETHER RELIC' : 'CURSED ARCANA', 16, 24);

      g.fillStyle = isB ? '#0284c7' : '#7e22ce';
      g.beginPath();
      g.arc(138, 20, 11, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#ffffff';
      g.font = '700 12px Inter, sans-serif';
      g.textAlign = 'center';
      g.fillText(isB ? '4' : '3', 138, 24);

      // Card info / description lines (so glitch distortion is super clear!)
      g.fillStyle = isB ? 'rgba(186,230,253,0.85)' : 'rgba(233,213,255,0.82)';
      g.font = '600 10px Inter, sans-serif';
      g.textAlign = 'center';
      g.fillText(isB ? 'AWAKENED FORM' : 'FORBIDDEN SEAL', 80, 158);
      g.fillStyle = 'rgba(203,213,225,0.75)';
      g.font = '400 9.5px Inter, sans-serif';
      g.fillText(isB ? 'ATK 950 / DEF 820' : 'ATK 640 / HP -15%', 80, 178);
      g.fillText(isB ? 'CARD B PREVIEW' : 'CARD A PREVIEW', 80, 198);

      return c;
    }

function getCardSource(variant, opts) {
      if (opts && variant === 'A' && opts.cardImgA) return opts.cardImgA;
      if (opts && variant === 'B' && opts.cardImgB) return opts.cardImgB;
      if (variant === 'A') {
        if (CARD_ASSETS.imgA) return CARD_ASSETS.imgA;
        if (!CARD_ASSETS.defaultA) CARD_ASSETS.defaultA = buildDefaultCardCanvas('A');
        return CARD_ASSETS.defaultA;
      } else {
        if (CARD_ASSETS.imgB) return CARD_ASSETS.imgB;
        if (!CARD_ASSETS.defaultB) CARD_ASSETS.defaultB = buildDefaultCardCanvas('B');
        return CARD_ASSETS.defaultB;
      }
    }

function drawCoverImage(ctx, img, dx, dy, dw, dh) {
      const iw = img.naturalWidth || img.width || dw;
      const ih = img.naturalHeight || img.height || dh;
      const scale = Math.max(dw / iw, dh / ih);
      const sw = dw / scale;
      const sh = dh / scale;
      const sx = (iw - sw) * 0.5;
      const sy = (ih - sh) * 0.5;
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }

  let SPRITES = null;
  function ensureSprites() {
    if (!SPRITES) SPRITES = createProceduralSprites();
    return SPRITES;
  }

  const VFXRenderers = {
  spearThrust: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const extEnd = t.extEnd || 0.22;
        const fadeStart = t.fadeStart || 0.22;
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(dir * scale, scale);

        const ext = easeOutExpo(clamp(p / extEnd, 0, 1));
        const fade = p < fadeStart ? 1 : 1 - easeInOutQuad((p - fadeStart) / Math.max(0.05, 1 - fadeStart));
        const len = 278 * ext;

        // Subtle dark-cobalt painterly thrust wake (like 8589 dark contrast)
        for (let i = 0; i < 6; i++) {
          const u = i / 5;
          const sp = clamp((p - u * 0.08) / 0.74, 0, 1);
          if (sp <= 0 || sp >= 1) continue;
          stampSprite(ctx, SPRITES.smokeBlue, u * len * 0.85, (rand() - 0.5) * 14, 48 + sp * 28, 22 + sp * 16, 0, (1 - sp) * 0.42, 'source-over');
        }

        // Core atmospheric sky-blue bloom along thrust
        stampSprite(ctx, SPRITES.glowSky, len * 0.55, 0, len * 1.05, 42 * fade, 0, 0.72 * fade, 'lighter');
        stampSprite(ctx, SPRITES.glowSky, len, 0, 88 * fade, 62 * fade, 0, 0.95 * fade, 'lighter');

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Razor-thin straight piercing needle beam
        if (fade > 0.01 && len > 4) {
          const beamG = ctx.createLinearGradient(-14, 0, len + 34, 0);
          beamG.addColorStop(0, 'rgba(14,165,233,0)');
          beamG.addColorStop(0.18, 'rgba(56,189,248,' + (0.9 * fade) + ')');
          beamG.addColorStop(0.84, 'rgba(186,230,253,' + fade + ')');
          beamG.addColorStop(1, 'rgba(255,255,255,' + fade + ')');
          ctx.fillStyle = beamG;
          const halfW = 6.2 * (1 - p * 0.55) * fade;
          ctx.beginPath();
          ctx.moveTo(-14, 0);
          ctx.lineTo(len * 0.78, -halfW);
          ctx.lineTo(len + 36, 0);
          ctx.lineTo(len * 0.78, halfW);
          ctx.closePath();
          ctx.fill();

          // White-hot needle core
          ctx.fillStyle = 'rgba(255,255,255,' + (0.98 * fade) + ')';
          const coreW = 2.2 * (1 - p * 0.45) * fade;
          ctx.beginPath();
          ctx.moveTo(-4, 0);
          ctx.lineTo(len * 0.85, -coreW);
          ctx.lineTo(len + 40, 0);
          ctx.lineTo(len * 0.85, coreW);
          ctx.closePath();
          ctx.fill();
        }

        // Forward-cupped parabolic shockwave rings (opposite direction: curving FORWARD like ')' in 8588!)
        // NO '>' chevron lines!
        const rings = [
          { pos: 0.24, rY: 46, bow: 26, delay: 0.00, thick: 5.5 },
          { pos: 0.56, rY: 56, bow: 34, delay: 0.04, thick: 6.2 },
          { pos: 0.84, rY: 42, bow: 28, delay: 0.08, thick: 4.8 }
        ];
        for (let i = 0; i < rings.length; i++) {
          const r = rings[i];
          const rp = clamp((p - r.delay) / 0.66, 0, 1);
          if (rp <= 0 || rp >= 1) continue;
          const ra = (1 - rp) * 0.94;
          const rx = 250 * r.pos + easeOutCubic(rp) * 28;
          const ry = (18 + easeOutCubic(rp) * r.rY);
          const bow = r.bow * (0.7 + 0.55 * easeOutCubic(rp));

          // Painterly forward-bowed crescent shockwave shell (curves forward: ')' )
          const arcPts = [];
          const steps = 18;
          for (let s = 0; s <= steps; s++) {
            const u = s / steps;
            const ang = lerp(-Math.PI * 0.48, Math.PI * 0.48, u);
            const j = (fbm2D(u * 4 + i * 3, rp * 3, 2) - 0.5) * 6;
            const px = rx + Math.cos(ang) * bow + j * 0.5;
            const py = Math.sin(ang) * ry + j * 0.4;
            arcPts.push([px, py]);
          }
          drawSharpRibbon(ctx, arcPts, r.thick * (1 - rp * 0.45), i === 1 ? '#e0f2fe' : '#7dd3fc', 'lighter', ra);

          // Thin back-side elliptical ring closure for 3D cylindrical thrust-ring feel (like 8588 & 8589)
          ctx.strokeStyle = 'rgba(56,189,248,' + (ra * 0.55) + ')';
          ctx.lineWidth = 1.8 * (1 - rp);
          ctx.beginPath();
          ctx.ellipse(rx, 0, bow * 0.42, ry * 0.86, 0, Math.PI * 0.55, Math.PI * 1.45);
          ctx.stroke();
        }

        // Sharp needle-tapered flying horizontal sparks (zero blunt ends!)
        for (let i = 0; i < 18; i++) {
          const sp = clamp((p - rand() * 0.14) / 0.64, 0, 1);
          if (sp <= 0 || sp >= 1) continue;
          const side = i % 2 === 0 ? 1 : -1;
          const py = side * (8 + rand() * 34) * (1 + sp * 0.35);
          const px = rand() * 45 + easeOutCubic(sp) * (225 + rand() * 75);
          const sl = (18 + rand() * 36) * (1 - sp * 0.55);
          const sw = (1.6 + rand() * 1.4) * (1 - sp * 0.5);
          ctx.fillStyle = i % 3 === 0
            ? 'rgba(255,255,255,' + (1 - sp) + ')'
            : 'rgba(125,211,252,' + ((1 - sp) * 0.9) + ')';
          ctx.beginPath();
          ctx.moveTo(px - sl, py);
          ctx.lineTo(px - sl * 0.35, py - sw);
          ctx.lineTo(px, py);
          ctx.lineTo(px - sl * 0.35, py + sw);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        ctx.restore();
      },

  daggerThrow: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const swingEnd = t.swingEnd || 0.32;
        const launchAt = t.launchAt || 0.10;
        const flyDur = t.flyDur || 0.36;
        const impactAt = Math.min(0.92, launchAt + flyDur);
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(dir * scale, scale);

        // PHASE 1 (0..0.32): Razor-sharp sky-blue crescent swing slash at throw hand
        if (p < swingEnd + 0.02) {
          const sp = clamp(p / swingEnd, 0, 1);
          const sFade = sp < 0.30 ? 1 : 1 - easeInOutQuad((sp - 0.30) / 0.70);
          const sweep = easeOutExpo(clamp(sp / 0.48, 0, 1));
          const aStart = -Math.PI * 0.70;
          const aEnd = lerp(aStart + 0.14, Math.PI * 0.54, sweep);
          const aTail = lerp(aStart, aEnd - 0.12, clamp((sp - 0.18) / 0.72, 0, 1));

          stampSprite(ctx, SPRITES.glowSky, 14, 0, 82 * sFade, 82 * sFade, 0, 0.72 * sFade, 'lighter');
          const cPts = [];
          for (let i = 0; i <= 20; i++) {
            const u = i / 20;
            const a = lerp(aTail, aEnd, u);
            cPts.push([Math.cos(a) * 50, Math.sin(a) * 46]);
          }
          drawSharpRibbon(ctx, cPts, 17 * sFade, '#38bdf8', 'lighter', 0.92 * sFade);
          drawSharpRibbon(ctx, cPts, 6.5 * sFade, '#ffffff', 'lighter', 0.98 * sFade);
        }

        // PHASE 2 (0.10..1.0): Blistering-fast straight horizontal flight (completes flight by p=0.46!)
        if (p > launchAt) {
          const fp = clamp((p - launchAt) / flyDur, 0, 1);
          const travel = 16 + 276 * easeOutExpo(fp);
          const trailFade = p < impactAt ? 1 : 1 - easeInOutQuad((p - impactAt) / Math.max(0.05, 1 - impactAt));

          if (trailFade > 0.01) {
            const tailX = Math.max(10, travel - 245);
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            // Razor-tapered straight trajectory beam (pinches sharply at both ends!)
            const tg = ctx.createLinearGradient(tailX, 0, travel + 14, 0);
            tg.addColorStop(0, 'rgba(14,165,233,0)');
            tg.addColorStop(0.40, 'rgba(56,189,248,' + (0.78 * trailFade) + ')');
            tg.addColorStop(0.86, 'rgba(186,230,253,' + (0.96 * trailFade) + ')');
            tg.addColorStop(1, 'rgba(255,255,255,' + trailFade + ')');
            ctx.fillStyle = tg;
            const tw = 5.2 * trailFade;
            ctx.beginPath();
            ctx.moveTo(tailX, 0);
            ctx.lineTo(lerp(tailX, travel, 0.82), -tw);
            ctx.lineTo(travel + 16, 0);
            ctx.lineTo(lerp(tailX, travel, 0.82), tw);
            ctx.closePath();
            ctx.fill();

            // Needle-sharp white center streak
            const cw = 1.9 * trailFade;
            ctx.fillStyle = 'rgba(255,255,255,' + (0.98 * trailFade) + ')';
            ctx.beginPath();
            ctx.moveTo(lerp(tailX, travel, 0.25), 0);
            ctx.lineTo(lerp(tailX, travel, 0.88), -cw);
            ctx.lineTo(travel + 12, 0);
            ctx.lineTo(lerp(tailX, travel, 0.88), cw);
            ctx.closePath();
            ctx.fill();

            // Sharp needle-pointed parallel speed lines
            for (let i = 0; i < 8; i++) {
              const ly = (i % 2 === 0 ? 1 : -1) * (7 + (i >> 1) * 5.5);
              const lx1 = lerp(tailX, travel, 0.28 + rand() * 0.62);
              const sl = 26 + rand() * 34;
              const sw = 1.25 * trailFade;
              ctx.fillStyle = i % 2 === 0
                ? 'rgba(224,242,254,' + (0.75 * trailFade) + ')'
                : 'rgba(56,189,248,' + (0.7 * trailFade) + ')';
              ctx.beginPath();
              ctx.moveTo(lx1 - sl, ly);
              ctx.lineTo(lx1 - sl * 0.35, ly - sw);
              ctx.lineTo(lx1, ly);
              ctx.lineTo(lx1 - sl * 0.35, ly + sw);
              ctx.closePath();
              ctx.fill();
            }
            ctx.restore();
          }

          // Sleek Beveled Fantasy Dagger (fast transit)
          if (p < impactAt + 0.10) {
            const dAlpha = p < impactAt ? 1 : 1 - (p - impactAt) / 0.10;
            stampSprite(ctx, SPRITES.glowSky, travel + 6, 0, 74, 38, 0, 0.82 * dAlpha, 'lighter');

            ctx.save();
            ctx.translate(travel, 0);
            ctx.globalAlpha = dAlpha;

            const bTop = ctx.createLinearGradient(-10, -7, 30, 0);
            bTop.addColorStop(0, '#7dd3fc');
            bTop.addColorStop(0.5, '#f0f9ff');
            bTop.addColorStop(1, '#ffffff');
            ctx.fillStyle = bTop;
            ctx.beginPath();
            ctx.moveTo(30, 0);
            ctx.lineTo(2, -6.2);
            ctx.lineTo(-9, -2.0);
            ctx.lineTo(-9, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.moveTo(30, 0);
            ctx.lineTo(2, 6.2);
            ctx.lineTo(-9, 2.0);
            ctx.lineTo(-9, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#bae6fd';
            ctx.beginPath();
            ctx.moveTo(-7, -9);
            ctx.lineTo(-11, -10);
            ctx.lineTo(-13, 0);
            ctx.lineTo(-11, 10);
            ctx.lineTo(-7, 9);
            ctx.lineTo(-9, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#0c4a6e';
            ctx.fillRect(-23, -1.8, 11, 3.6);
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-6, 0);
            ctx.lineTo(14, -1.1);
            ctx.lineTo(27, 0);
            ctx.lineTo(14, 1.1);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // Razor-sharp impact burst at target
          if (p > impactAt - 0.04) {
            const ip = clamp((p - (impactAt - 0.04)) / Math.max(0.08, 1 - (impactAt - 0.04)), 0, 1);
            const ia = 1 - ip;
            const ix = 294;
            stampSprite(ctx, SPRITES.glowSky, ix, 0, 96 * ia, 96 * ia, 0, ia, 'lighter');
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'rgba(186,230,253,' + ia + ')';
            ctx.lineWidth = 2.4 * ia;
            ctx.beginPath();
            ctx.arc(ix, 0, 6 + easeOutCubic(ip) * 42, 0, Math.PI * 2);
            ctx.stroke();
            for (let k = 0; k < 10; k++) {
              const ang = (k / 10) * Math.PI * 2 + 0.3;
              const d0 = 4 + easeOutCubic(ip) * 14;
              const d1 = d0 + (16 + rand() * 26) * (1 - ip * 0.4);
              const w = 2.2 * ia;
              const cx = ix + Math.cos(ang) * lerp(d0, d1, 0.35);
              const cy = Math.sin(ang) * lerp(d0, d1, 0.35);
              ctx.fillStyle = k % 2 === 0 ? 'rgba(255,255,255,' + ia + ')' : 'rgba(56,189,248,' + ia + ')';
              ctx.beginPath();
              ctx.moveTo(ix + Math.cos(ang) * d0, Math.sin(ang) * d0);
              ctx.lineTo(cx - Math.sin(ang) * w, cy + Math.cos(ang) * w);
              ctx.lineTo(ix + Math.cos(ang) * d1, Math.sin(ang) * d1);
              ctx.lineTo(cx + Math.sin(ang) * w, cy - Math.cos(ang) * w);
              ctx.closePath();
              ctx.fill();
            }
            ctx.restore();
          }
        }
        ctx.restore();
      },

  dragonWingFlap: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const unfoldDur = t.unfoldDur || 0.44;
        const downStart = t.downStart || 0.46;
        const fadeStart = t.fadeStart || 0.74;
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x, y - 16);
        ctx.scale(dir * scale, scale);

        // Unfolding choreography:
        // 0.00..0.14: Tightly folded close behind character
        // 0.14..0.52: Sweeping majestic unfold into high arched 8591 silhouette
        // 0.52..0.80: Powerful downward wingbeat into 8590 umbrella-arch
        const unfold = easeOutExpo(clamp((p - 0.04) / unfoldDur, 0, 1));
        const downbeat = easeInOutQuad(clamp((p - downStart) / Math.max(0.10, 0.85 - downStart), 0, 1));
        const wingFade = p < 0.08 ? p / 0.08 : p > fadeStart ? 1 - easeInOutQuad((p - fadeStart) / Math.max(0.05, 1 - fadeStart)) : 1;

        const scaleX = lerp(0.14, 1.06, unfold);
        const scaleY = lerp(0.82, 1.02, unfold);
        const rotAng = lerp(-0.52, -0.18, unfold) + downbeat * 0.48;

        // Pass 1: Smoky black-wine aura billowing behind unfolding wings
        for (let i = 0; i < 12; i++) {
          const sp = clamp((p - 0.14 - rand() * 0.16) / 0.80, 0, 1);
          if (sp <= 0 || sp >= 1) continue;
          const side = i % 2 === 0 ? 1 : -1;
          const px = side * (22 + easeOutCubic(sp) * (110 + rand() * 75));
          const py = 10 + (rand() - 0.5) * 65 + sp * 24;
          const sz = 58 + sp * 74;
          const tex = i % 3 === 0 ? SPRITES.smokeDark : i % 3 === 1 ? SPRITES.smokeWine : SPRITES.smokeCrimson;
          stampSprite(ctx, tex, px, py, sz, sz * 0.72, sp * side * 1.5, (1 - sp) * 0.74, 'source-over');
        }

        // Pass 2: Reference 8590/8591 Iconic Bat-Dragon Wing Anatomy in Black-Wine-Crimson VFX
        function drawReferenceDragonWing(side) {
          ctx.save();
          ctx.scale(side, 1);
          ctx.rotate(rotAng);
          ctx.scale(scaleX, scaleY);
          ctx.globalAlpha = wingFade;

          // Key anatomical landmarks modeled after 8590 & 8591:
          // Shoulder base (6, 12) -> deep concave inner C-scoop curving up to hooked thumb-claw (42, -62)
          // -> sweeping outer high wingtip (168, -66) -> 4 distinct downward-fanning curved finger tips with deep scalloped webs!
          const tip1 = [168, -64 + downbeat * 34]; // Upper sweeping wingtip
          const tip2 = [152, -14 + downbeat * 38]; // Finger 2
          const tip3 = [124, 34 + downbeat * 26];  // Finger 3
          const tip4 = [84, 62 + downbeat * 12];   // Finger 4
          const tip5 = [42, 66];                   // Inner lower lobe
          const claw = [44, -60];                  // Hooked thumb-claw apex (like 8590/8591)

          // Layer A: Main multi-tone Black -> Wine -> Crimson translucent VFX membrane
          ctx.save();
          ctx.shadowColor = 'rgba(220, 38, 38, 0.82)';
          ctx.shadowBlur = 16;

          const memG = ctx.createRadialGradient(44, -40, 12, 108, -8, 155);
          memG.addColorStop(0, 'rgba(239, 68, 68, 0.90)');    // Glowing crimson inner web
          memG.addColorStop(0.32, 'rgba(136, 19, 55, 0.92)'); // Deep wine-burgundy mid-panels
          memG.addColorStop(0.72, 'rgba(54, 8, 24, 0.90)');   // Dark wine
          memG.addColorStop(1, 'rgba(10, 4, 12, 0.86)');      // Pitch black outer wing rim

          ctx.fillStyle = memG;
          ctx.beginPath();
          // Start at shoulder root
          ctx.moveTo(6, 18);
          // Graceful concave C-scoop curving outward then upward to the hooked thumb-claw (like 8590 & 8591!)
          ctx.bezierCurveTo(28, 22, 54, -18, claw[0], claw[1]);
          // High arched upper leading edge sweeping from thumb-claw to outer wingtip
          ctx.bezierCurveTo(82, -88, 134, -84, tip1[0], tip1[1]);
          // Deep bat-wing membrane scallops between finger tips
          ctx.quadraticCurveTo(134, -36 + downbeat * 26, tip2[0], tip2[1]);
          ctx.quadraticCurveTo(116, 4 + downbeat * 22, tip3[0], tip3[1]);
          ctx.quadraticCurveTo(90, 36 + downbeat * 14, tip4[0], tip4[1]);
          ctx.quadraticCurveTo(60, 46, tip5[0], tip5[1]);
          ctx.quadraticCurveTo(22, 42, 6, 18);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Layer B: Dark obsidian-wine sculpted bone spines (gives that layered 8590/8591 rib structure)
          ctx.strokeStyle = 'rgba(16, 4, 10, 0.92)';
          ctx.lineWidth = 5.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(6, 18);
          ctx.bezierCurveTo(28, 22, 54, -18, claw[0], claw[1]);
          ctx.bezierCurveTo(82, -88, 134, -84, tip1[0], tip1[1]);
          ctx.stroke();

          // Layer C: Glowing crimson-wine VFX energy ribs fanning from the thumb-claw joint to each tip
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const ribs = [
            [claw[0], claw[1], 106, -80, tip1[0], tip1[1], 3.2],
            [claw[0], claw[1], 106, -34, tip2[0], tip2[1], 2.5],
            [claw[0], claw[1], 92, -6, tip3[0], tip3[1], 2.2],
            [claw[0], claw[1], 68, 14, tip4[0], tip4[1], 1.9],
            [claw[0], claw[1], 40, 26, tip5[0], tip5[1], 1.6]
          ];
          for (let r = 0; r < ribs.length; r++) {
            const rb = ribs[r];
            const rg = ctx.createLinearGradient(rb[0], rb[1], rb[4], rb[5]);
            rg.addColorStop(0, 'rgba(254, 205, 211, 0.92)');
            rg.addColorStop(0.45, 'rgba(239, 68, 68, 0.85)');
            rg.addColorStop(1, 'rgba(136, 19, 55, 0.55)');
            ctx.strokeStyle = rg;
            ctx.lineWidth = rb[6];
            ctx.beginPath();
            ctx.moveTo(rb[0], rb[1]);
            ctx.quadraticCurveTo(rb[2], rb[3], rb[4], rb[5]);
            ctx.stroke();
          }

          // Hooked crimson thumb-claw accent (like the little red/pink claw in 8590/8591!)
          ctx.fillStyle = '#fb7185';
          ctx.beginPath();
          ctx.moveTo(claw[0] + 4, claw[1] + 2);
          ctx.lineTo(claw[0] - 10, claw[1] - 6);
          ctx.lineTo(claw[0] - 2, claw[1] + 8);
          ctx.closePath();
          ctx.fill();

          stampSprite(ctx, SPRITES.smokeWine, tip1[0] - 12, tip1[1] + 10, 68, 52, -0.3, 0.58, 'lighter');
          ctx.restore();
          ctx.restore();
        }

        stampSprite(ctx, SPRITES.glowRed, 0, -4, 130 * wingFade, 100 * wingFade, 0, 0.68 * wingFade, 'lighter');
        drawReferenceDragonWing(-1);
        drawReferenceDragonWing(1);

        // Pass 3: Downstroke crimson-wine wind arc & embers
        if (p > 0.34) {
          const gp = clamp((p - 0.34) / 0.66, 0, 1);
          const ga = 1 - gp;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = 'rgba(190,18,60,' + (0.60 * ga) + ')';
          drawPainterlyArc(ctx, 58 + easeOutCubic(gp) * 112, 0.60, Math.PI * 0.12, Math.PI * 0.88, 22 * ga, 5.1, gp, { jagOut: 12, jagIn: 8 });

          for (let i = 0; i < 24; i++) {
            const ep = clamp((gp - rand() * 0.22) / 0.78, 0, 1);
            if (ep <= 0 || ep >= 1) continue;
            const ang = Math.PI * 0.5 + (rand() - 0.5) * Math.PI * 1.4;
            const dist = 28 + easeOutCubic(ep) * (105 + rand() * 82);
            const px = Math.cos(ang) * dist * 1.35;
            const py = Math.sin(ang) * dist * 0.62 - ep * 20;
            const sz = (2.2 + rand() * 2.8) * (1 - ep);
            ctx.fillStyle = i % 3 === 0
              ? 'rgba(254,205,211,' + (1 - ep) + ')'
              : i % 2 === 0
                ? 'rgba(239,68,68,' + (1 - ep) + ')'
                : 'rgba(136,19,55,' + (1 - ep) + ')';
            ctx.beginPath();
            ctx.arc(px, py, sz, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
        ctx.restore();
      },

  darkFireMagic: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const introEnd = t.introEnd || 0.16;
        const outroStart = t.outroStart || 0.76;
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x, y + 40);
        ctx.scale(scale, scale);

        const intro = easeOutCubic(clamp(p / introEnd, 0, 1));
        const outro = p > outroStart ? 1 - easeInOutQuad((p - outroStart) / Math.max(0.05, 1 - outroStart)) : 1;
        const fade = intro * outro;

        // Soft glowing red-black atmosphere behind the shader fire
        stampSprite(ctx, SPRITES.glowRed, 0, -48, 210 * intro, 175 * intro, 0, 0.72 * fade, 'lighter');
        for (let i = 0; i < 6; i++) {
          const ep = (p * 1.2 + i / 6) % 1;
          stampSprite(ctx, SPRITES.smokeDark, (rand() - 0.5) * 64, -20 - ep * 125, 58 + ep * 42, 68 + ep * 42, ep * 1.5, Math.sin(ep * Math.PI) * 0.55 * fade, 'source-over');
        }

        // Real-time 72x72 procedural shader-eroded 2-band fire (just like 8592.gif!)
        // Outer luminous crimson band + inner obsidian pitch-black core + organic detached rising fire islands!
        const fb = getFireShaderBuffer();
        const data = fb.img.data;
        const W = 72;
        const H = 72;
        const scrollY = p * 7.8;
        const seedOff = (seed % 97) * 0.37;
        const heightScale = 0.35 + 0.65 * intro;
        const erodeBias = (1 - outro) * 0.55;

        for (let py = 0; py < H; py++) {
          const ny = 1 - py / (H - 1); // 0 at bottom, 1 at top
          for (let px = 0; px < W; px++) {
            const nx = (px / (W - 1)) * 2 - 1; // -1..1 horizontal
            const idx = (py * W + px) * 4;

            // Rounded flame bowl/dome base tapering smoothly upward (like 8592.gif left fireball)
            const yNorm = ny / Math.max(0.15, heightScale);
            if (yNorm > 1.08) {
              data[idx + 3] = 0;
              continue;
            }
            const dx = nx * (1.15 + yNorm * 0.35);
            const dy = (yNorm - 0.28) * 1.15;
            const bowl = 1.0 - Math.sqrt(dx * dx + dy * dy);

            // Scrolling swirling turbulence (2-octave fBM) that carves organic holes & detached floating fire islands!
            const warp = (valueNoise2D(nx * 2.6 + seedOff, ny * 2.6 + scrollY * 0.75) - 0.5) * 0.65;
            const n1 = valueNoise2D((nx + warp) * 3.6 + seedOff, ny * 3.8 + scrollY);
            const n2 = valueNoise2D((nx - warp * 0.5) * 7.2 + seedOff + 13, ny * 7.4 + scrollY * 1.45);
            const turb = n1 * 0.68 + n2 * 0.32;

            // Combine base fire volume + upward-scrolling noise erosion
            const field = bowl + (turb - 0.46) * 0.92 - yNorm * 0.28 - erodeBias;

            if (field > 0.34) {
              // Inner pitch-black obsidian fire core with subtle deep-crimson ember glow near boundary
              const rim = clamp((0.42 - field) / 0.08, 0, 1);
              data[idx] = Math.round(10 + rim * 135);
              data[idx + 1] = Math.round(4 + rim * 14);
              data[idx + 2] = Math.round(12 + rim * 16);
              data[idx + 3] = Math.round(248 * fade);
            } else if (field > 0.17) {
              // Crisp blazing crimson-red outer flame band (exact 2-tone shader fire look of 8592.gif!)
              const edgeT = clamp((field - 0.17) / 0.17, 0, 1);
              data[idx] = Math.round(lerp(220, 255, edgeT));
              data[idx + 1] = Math.round(lerp(24, 92, edgeT));
              data[idx + 2] = Math.round(lerp(28, 72, edgeT));
              data[idx + 3] = Math.round(245 * fade);
            } else {
              data[idx + 3] = 0;
            }
          }
        }
        fb.ctx.putImageData(fb.img, 0, 0);

        // Draw crisp shader-fire onto main stage with subtle outer crimson glow
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.85)';
        ctx.shadowBlur = 16;
        ctx.drawImage(fb.canvas, -96, -186, 192, 198);
        ctx.restore();

        // Rising crisp red embers
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 18; i++) {
          const ep = clamp((p - rand() * 0.25) / 0.75, 0, 1);
          if (ep <= 0 || ep >= 1) continue;
          const ex = (rand() - 0.5) * 105 + Math.sin(ep * 8 + i) * 14;
          const ey = -18 - easeOutCubic(ep) * (155 + rand() * 70);
          const sz = (1.8 + rand() * 2.6) * (1 - ep);
          ctx.fillStyle = i % 3 === 0 ? 'rgba(254,202,202,' + (1 - ep) + ')' : 'rgba(239,68,68,' + (1 - ep) + ')';
          ctx.beginPath();
          ctx.arc(ex, ey, sz, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ctx.restore();
      },

  spearSlash: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const sweepEnd = t.sweepEnd || 0.38;
        const fadeStart = t.fadeStart || 0.26;
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x + dir * 20 * scale, y);
        ctx.scale(dir * scale, scale);

        const sweep = easeOutExpo(clamp(p / sweepEnd, 0, 1));
        const fade = p < fadeStart ? 1 : 1 - easeInOutQuad((p - fadeStart) / Math.max(0.05, 1 - fadeStart));

        const startAng = -Math.PI * 0.82;
        const endAng = lerp(startAng + 0.12, Math.PI * 0.62, sweep);
        const tailAng = lerp(startAng, endAng - 0.14, clamp((p - 0.16) / 0.68, 0, 1));
        const R = 116;

        // Pass 1: Deep burnished-bronze smoke shadow underlay
        for (let i = 0; i < 8; i++) {
          const u = i / 7;
          const a = lerp(tailAng, endAng, u);
          stampSprite(ctx, SPRITES.smokeGold, Math.cos(a) * R * 0.94, Math.sin(a) * R * 0.80, 56 * fade, 56 * fade, a, 0.45 * fade * u, 'source-over');
        }

        // Pass 2: Painterly noise-eroded liquid gold slash layers (NO lightning/electric zig-zag)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const outerG = ctx.createRadialGradient(0, 0, R * 0.45, 0, 0, R + 32);
        outerG.addColorStop(0, 'rgba(180,83,9,0)');
        outerG.addColorStop(0.55, 'rgba(234,179,8,' + (0.80 * fade) + ')');
        outerG.addColorStop(0.88, 'rgba(254,240,138,' + (0.95 * fade) + ')');
        outerG.addColorStop(1, 'rgba(255,255,255,' + fade + ')');
        ctx.fillStyle = outerG;
        drawPainterlyArc(ctx, R, 0.82, tailAng, endAng, 44 * fade, 2.3, p, { jagOut: 15, jagIn: 20 });

        // Incandescent white-gold core ribbon
        ctx.fillStyle = 'rgba(255,253,235,' + (0.94 * fade) + ')';
        drawPainterlyArc(ctx, R + 4, 0.82, lerp(tailAng, endAng, 0.2), endAng, 14 * fade, 9.1, p, { jagOut: 6, jagIn: 7 });

        // Subtle secondary golden echo arc
        ctx.fillStyle = 'rgba(250,204,21,' + (0.42 * fade) + ')';
        drawPainterlyArc(ctx, R * 0.78, 0.82, tailAng, lerp(tailAng, endAng, 0.88), 10 * fade, 14.2, p, { jagOut: 5, jagIn: 5 });
        ctx.restore();

        // Pass 3: Leading blade-tip bloom flare
        const tipX = Math.cos(endAng) * (R + 6);
        const tipY = Math.sin(endAng) * (R + 6) * 0.82;
        stampSprite(ctx, SPRITES.glowGold, tipX, tipY, 92 * fade, 92 * fade, 0, 0.9 * fade, 'lighter');

        // Pass 4: Elongated tangential golden sparks
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 24; i++) {
          const sp = clamp((p - rand() * 0.18) / 0.72, 0, 1);
          if (sp <= 0 || sp >= 1) continue;
          const a = lerp(-Math.PI * 0.68, Math.PI * 0.56, rand());
          const r = R + 4 + easeOutCubic(sp) * (40 + rand() * 58);
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r * 0.82;
          const tangA = a + Math.PI * 0.42;
          const len = (10 + rand() * 18) * (1 - sp);
          ctx.strokeStyle = i % 3 === 0
            ? 'rgba(255,255,255,' + (1 - sp) + ')'
            : 'rgba(250,204,21,' + (1 - sp) + ')';
          ctx.lineWidth = 2.2 * (1 - sp);
          ctx.beginPath();
          ctx.moveTo(px - Math.cos(tangA) * len, py - Math.sin(tangA) * len);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
        ctx.restore();
        ctx.restore();
      },

  goldenLightBeam: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const introEnd = t.introEnd || 0.24;
        const outroStart = t.outroStart || 0.72;
        const rand = mulberry32(seed);
        ctx.save();
        // Centered at player's held light (hand/chest height)
        ctx.translate(x + dir * 10 * scale, y - 4);
        ctx.scale(scale, scale);

        const intro = easeOutCubic(clamp(p / introEnd, 0, 1));
        const outro = p > outroStart ? 1 - easeInOutQuad((p - outroStart) / Math.max(0.05, 1 - outroStart)) : 1;
        const alpha = intro * outro;
        const breath = 0.92 + 0.08 * Math.sin(p * 14);

        // Pass 1: Wide warm golden illumination sphere radiating from the character
        const maxR = 175 * intro * breath;
        stampSprite(ctx, SPRITES.glowGold, 0, 0, maxR * 2.1, maxR * 2.1, 0, 0.85 * alpha, 'lighter');
        stampSprite(ctx, SPRITES.glowWarm, 0, 0, maxR * 1.15, maxR * 1.15, 0, 0.72 * alpha, 'lighter');

        // Pass 2: Soft 360-degree radial volumetric light rays fanning out from held light
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const rayCount = 14;
        for (let i = 0; i < rayCount; i++) {
          const a = (i / rayCount) * Math.PI * 2 + p * 0.25 + (rand() - 0.5) * 0.15;
          const rLen = (115 + (i % 3) * 38) * intro * (0.85 + 0.15 * Math.sin(p * 9 + i));
          const spread = 0.065 + (i % 2) * 0.04;
          const rg = ctx.createLinearGradient(0, 0, Math.cos(a) * rLen, Math.sin(a) * rLen);
          rg.addColorStop(0, 'rgba(255,254,235,' + (0.48 * alpha) + ')');
          rg.addColorStop(0.45, 'rgba(253,224,71,' + (0.28 * alpha) + ')');
          rg.addColorStop(1, 'rgba(250,204,21,0)');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a - spread) * rLen, Math.sin(a - spread) * rLen);
          ctx.lineTo(Math.cos(a + spread) * rLen, Math.sin(a + spread) * rLen);
          ctx.closePath();
          ctx.fill();
        }

        // Expanding soft golden light-wave pulses outward from player
        for (let w = 0; w < 2; w++) {
          const wp = clamp((p - w * 0.24) / 0.76, 0, 1);
          if (wp <= 0 || wp >= 1) continue;
          const wr = 18 + easeOutCubic(wp) * 142;
          ctx.strokeStyle = 'rgba(254,249,195,' + ((1 - wp) * 0.62) + ')';
          ctx.lineWidth = 3.2 * (1 - wp);
          ctx.beginPath();
          ctx.arc(0, 0, wr, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Warm horizontal anamorphic lantern glint + bright incandescent core
        stampSprite(ctx, SPRITES.glowGold, 0, 0, 190 * alpha, 16 * alpha, 0, 0.78 * alpha, 'lighter');
        ctx.fillStyle = 'rgba(255,255,255,' + (0.95 * alpha) + ')';
        ctx.beginPath();
        ctx.arc(0, 0, 9 * intro * breath, 0, Math.PI * 2);
        ctx.fill();

        // Pass 3: Gently drifting golden light motes illuminating the air around the player
        for (let i = 0; i < 28; i++) {
          const mp = clamp((p - rand() * 0.22) / 0.78, 0, 1);
          if (mp <= 0 || mp >= 1) continue;
          const a = rand() * Math.PI * 2;
          const dist = 16 + easeOutCubic(mp) * (80 + rand() * 85);
          const mx = Math.cos(a) * dist;
          const my = Math.sin(a) * dist - mp * 18;
          const ma = Math.sin(mp * Math.PI) * alpha;
          const sz = 1.6 + rand() * 2.8;
          ctx.fillStyle = i % 3 === 0
            ? 'rgba(255,255,255,' + ma + ')'
            : 'rgba(254,240,138,' + ma + ')';
          ctx.beginPath();
          ctx.arc(mx, my, sz, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ctx.restore();
      },

  kickSweep: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const sweepEnd = t.sweepEnd || 0.40;
        const fadeStart = t.fadeStart || 0.28;
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x + dir * 14 * scale, y + 6);
        ctx.scale(dir * scale, scale);

        const sweep = easeOutExpo(clamp(p / sweepEnd, 0, 1));
        const fade = p < fadeStart ? 1 : 1 - easeInOutQuad((p - fadeStart) / Math.max(0.05, 1 - fadeStart));

        const startAng = Math.PI * 0.65;
        const endAng = lerp(startAng - 0.12, -Math.PI * 0.76, sweep);
        const tailAng = lerp(startAng, endAng + 0.14, clamp((p - 0.15) / 0.68, 0, 1));
        const R = 98;

        for (let i = 0; i < 7; i++) {
          const u = i / 6;
          const a = lerp(tailAng, endAng, u);
          stampSprite(ctx, SPRITES.smokeTeal, Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.85, 50 * fade, 50 * fade, a, 0.50 * fade * u, 'source-over');
        }

        if (fade > 0.01 && tailAng > endAng + 0.03) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const segs = 34;
          for (let i = 0; i < segs; i++) {
            const u0 = i / segs;
            const u1 = (i + 1) / segs;
            const a0 = lerp(tailAng, endAng, u0);
            const a1 = lerp(tailAng, endAng, u1);

            const prof0 = Math.sin(u0 * Math.PI) * Math.pow(u0, 0.65);
            const prof1 = Math.sin(u1 * Math.PI) * Math.pow(u1, 0.65);
            const j0 = (fbm2D(u0 * 6 + 3.1, p * 4, 2) - 0.5) * 14;
            const j1 = (fbm2D(u1 * 6 + 3.1, p * 4, 2) - 0.5) * 14;

            const rOut0 = R + prof0 * 16 + j0;
            const rOut1 = R + prof1 * 16 + j1;
            const rIn0 = rOut0 - Math.max(2, prof0 * 38 * fade);
            const rIn1 = rOut1 - Math.max(2, prof1 * 38 * fade);

            const pinkMix = clamp((u1 - 0.45) / 0.50, 0, 1);
            const rgb = lerpColorRGB([14, 210, 232], [244, 114, 182], pinkMix);
            ctx.fillStyle = rgbaStr(rgb, 0.92 * fade * (0.25 + 0.75 * u1));

            ctx.beginPath();
            ctx.moveTo(Math.cos(a0) * rOut0, Math.sin(a0) * rOut0 * 0.88);
            ctx.lineTo(Math.cos(a1) * rOut1, Math.sin(a1) * rOut1 * 0.88);
            ctx.lineTo(Math.cos(a1) * rIn1, Math.sin(a1) * rIn1 * 0.88);
            ctx.lineTo(Math.cos(a0) * rIn0, Math.sin(a0) * rIn0 * 0.88);
            ctx.closePath();
            ctx.fill();
          }

          const edgeG = ctx.createLinearGradient(
            Math.cos(tailAng) * R, Math.sin(tailAng) * R * 0.88,
            Math.cos(endAng) * R, Math.sin(endAng) * R * 0.88
          );
          edgeG.addColorStop(0, 'rgba(34,211,238,0)');
          edgeG.addColorStop(0.5, 'rgba(103,232,249,' + (0.9 * fade) + ')');
          edgeG.addColorStop(0.82, 'rgba(244,114,182,' + fade + ')');
          edgeG.addColorStop(1, 'rgba(255,255,255,' + fade + ')');

          ctx.strokeStyle = edgeG;
          ctx.lineWidth = 4.2 * fade;
          ctx.lineCap = 'round';
          ctx.beginPath();
          for (let i = 0; i <= 26; i++) {
            const u = i / 26;
            const a = lerp(tailAng, endAng, u);
            const rOut = R + Math.sin(u * Math.PI) * 16;
            const px = Math.cos(a) * rOut;
            const py = Math.sin(a) * rOut * 0.88;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.restore();
        }

        const tipX = Math.cos(endAng) * (R + 10);
        const tipY = Math.sin(endAng) * (R + 10) * 0.88;
        stampSprite(ctx, SPRITES.glowPink, tipX, tipY, 94 * fade, 94 * fade, 0, 0.92 * fade, 'lighter');

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 24; i++) {
          const sp = clamp((p - rand() * 0.16) / 0.68, 0, 1);
          if (sp <= 0 || sp >= 1) continue;
          const u = rand();
          const a = lerp(Math.PI * 0.45, -Math.PI * 0.76, u);
          const dist = R + 8 + easeOutCubic(sp) * (42 + rand() * 54);
          const px = Math.cos(a) * dist;
          const py = Math.sin(a) * dist * 0.88;
          const len = (10 + rand() * 14) * (1 - sp);
          const rgb = lerpColorRGB([34, 211, 238], [244, 114, 182], clamp((u - 0.35) / 0.65, 0, 1));
          ctx.strokeStyle = rgbaStr(rgb, 1 - sp);
          ctx.lineWidth = 2.4 * (1 - sp);
          ctx.beginPath();
          ctx.moveTo(px - Math.cos(a - 1.2) * len, py - Math.sin(a - 1.2) * len);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
        ctx.restore();
        ctx.restore();
      },

  glintSparkle: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const riseEnd = t.riseEnd || 0.54;
        const glintStart = t.glintStart || 0.68;
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const crownY = -64; // Noticeably higher above the character's head!

        function drawMiniStar(sx, sy, armLen, waist, rot, colA, colB, alpha) {
          if (armLen <= 0.5 || alpha <= 0.01) return;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(rot);
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = clamp(alpha, 0, 1);
          const g = ctx.createLinearGradient(-armLen, -armLen * 0.5, armLen, armLen * 0.5);
          g.addColorStop(0, colA);
          g.addColorStop(0.5, '#ffffff');
          g.addColorStop(1, colB);
          ctx.fillStyle = g;
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            const a0 = i * Math.PI * 0.5;
            const a1 = a0 + Math.PI * 0.5;
            const aMid = a0 + Math.PI * 0.25;
            const x0 = Math.cos(a0) * armLen;
            const y0 = Math.sin(a0) * armLen;
            const cx = Math.cos(aMid) * waist;
            const cy = Math.sin(aMid) * waist;
            const x1 = Math.cos(a1) * armLen;
            const y1 = Math.sin(a1) * armLen;
            if (i === 0) ctx.moveTo(x0, y0);
            ctx.quadraticCurveTo(cx, cy, x1, y1);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // PHASE 1 (0.00..0.54): Cyan-to-pink ribbons & sparkles spiral upward around the character
        const riseP = clamp(p / riseEnd, 0, 1);
        const riseFade = p < riseEnd * 0.82 ? 1 : clamp(1 - (p - riseEnd * 0.82) / Math.max(0.06, riseEnd * 0.24), 0, 1);

        if (riseFade > 0.01) {
          for (let r = 0; r < 2; r++) {
            const headU = easeInOutQuad(riseP);
            const tailU = Math.max(0, headU - 0.45);
            const pts = [];
            for (let s = 0; s <= 18; s++) {
              const u = lerp(tailU, headU, s / 18);
              const a = u * Math.PI * 3.8 + r * Math.PI;
              const rad = lerp(36, 4, u);
              pts.push([Math.cos(a) * rad, lerp(44, crownY + 8, u) + Math.sin(a) * 6]);
            }
            const g = ctx.createLinearGradient(0, 44, 0, crownY);
            g.addColorStop(0, '#22d3ee');
            g.addColorStop(1, '#f472b6');
            drawSharpRibbon(ctx, pts, 3.6 * riseFade, g, 'lighter', 0.88 * riseFade);
          }

          for (let i = 0; i < 18; i++) {
            const delay = (i / 18) * 0.24;
            const sp = clamp((p - delay) / 0.36, 0, 1);
            if (sp <= 0 || sp >= 1) continue;
            const ang = rand() * Math.PI * 2 + sp * 4.2;
            const rad = lerp(38 + rand() * 14, 6, easeInOutQuad(sp));
            const sx = Math.cos(ang) * rad;
            const sy = lerp(42 - rand() * 14, crownY + 10, easeOutCubic(sp)) + Math.sin(ang) * 5;
            const twinkle = Math.sin(sp * Math.PI);
            const isPink = sp > 0.5 ? (i % 3 !== 0) : (i % 3 === 0);
            drawMiniStar(
              sx, sy,
              (4.5 + rand() * 5) * twinkle,
              (1.1 + rand() * 0.7) * twinkle,
              sp * 1.4,
              isPink ? '#f472b6' : '#22d3ee',
              isPink ? '#22d3ee' : '#f472b6',
              twinkle * 0.95
            );
          }
        }

        // BEAT / PAUSE (0.54..0.68): Crisp brief anticipation beat before the glint pops!

        // PHASE 2 (0.68..1.00): Crisp small "반짝!" glint high above the hero's head!
        if (p > glintStart) {
          const gp = clamp((p - glintStart) / Math.max(0.06, 1 - glintStart), 0, 1);
          const pop = gp < 0.26 ? easeOutExpo(gp / 0.26) : 1 - easeInOutQuad((gp - 0.26) / 0.74);

          stampSprite(ctx, SPRITES.glowCyan, -2.5, crownY, 52 * pop, 52 * pop, 0, 0.82 * pop, 'lighter');
          stampSprite(ctx, SPRITES.glowPink, 2.5, crownY, 52 * pop, 52 * pop, 0, 0.82 * pop, 'lighter');

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const ringG = ctx.createLinearGradient(-22, crownY - 22, 22, crownY + 22);
          ringG.addColorStop(0, 'rgba(34,211,238,' + ((1 - gp) * 0.9) + ')');
          ringG.addColorStop(1, 'rgba(244,114,182,' + ((1 - gp) * 0.9) + ')');
          ctx.strokeStyle = ringG;
          ctx.lineWidth = 1.9 * (1 - gp);
          ctx.beginPath();
          ctx.arc(0, crownY, 3 + easeOutCubic(gp) * 26, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          drawMiniStar(0, crownY, 34 * pop, 3.4 * pop, gp * 0.32, '#22d3ee', '#f472b6', pop);
          drawMiniStar(0, crownY, 19 * pop, 2.2 * pop, gp * 0.32 + Math.PI * 0.25, '#f472b6', '#22d3ee', pop * 0.9);
          drawMiniStar(0, crownY, 15 * pop, 1.8 * pop, gp * 0.32, '#ffffff', '#ffffff', pop);
        }
        ctx.restore();
      },

  hitImpact: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const flashEnd = t.flashEnd || 0.42;
        const ringEnd = t.ringEnd || 0.68;
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        for (let i = 0; i < 5; i++) {
          const dp = clamp(p / 0.85, 0, 1);
          const a = (i / 5) * Math.PI * 2 + 0.3;
          const dist = easeOutCubic(dp) * (24 + rand() * 22);
          stampSprite(ctx, SPRITES.smokeDark, Math.cos(a) * dist, Math.sin(a) * dist, 42 + dp * 44, 42 + dp * 44, dp * 2, (1 - dp) * 0.65, 'source-over');
        }

        if (p < 0.14) {
          const ia = 1 - p / 0.14;
          ctx.strokeStyle = 'rgba(10,8,16,' + (0.85 * ia) + ')';
          ctx.lineWidth = 10 * ia;
          ctx.beginPath();
          ctx.arc(0, 0, 20 + p * 120, 0, Math.PI * 2);
          ctx.stroke();
        }

        stampSprite(ctx, SPRITES.glowWarm, 0, 0, 118 * (1 - p * 0.7), 118 * (1 - p * 0.7), 0, clamp(1 - p * 1.4, 0, 1), 'lighter');

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        if (p < flashEnd) {
          const bp = p / flashEnd;
          const ba = 1 - bp;
          const spikes = 12;
          ctx.fillStyle = 'rgba(255,250,230,' + (ba * 0.95) + ')';
          ctx.beginPath();
          for (let i = 0; i < spikes * 2; i++) {
            const a = (i / (spikes * 2)) * Math.PI * 2 + 0.15;
            const r = i % 2 === 0
              ? (22 + easeOutExpo(bp) * (38 + (i % 3) * 18))
              : (8 + bp * 6);
            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
        }

        const rp = clamp(p / ringEnd, 0, 1);
        if (rp < 1) {
          ctx.strokeStyle = 'rgba(251,146,60,' + ((1 - rp) * 0.92) + ')';
          ctx.lineWidth = 4.2 * (1 - rp);
          ctx.beginPath();
          ctx.arc(0, 0, 12 + easeOutCubic(rp) * 74, 0, Math.PI * 2);
          ctx.stroke();
        }

        for (let i = 0; i < 22; i++) {
          const sp = clamp(p / (0.62 + rand() * 0.38), 0, 1);
          if (sp >= 1) continue;
          const ang = rand() * Math.PI * 2;
          const spd = 75 + rand() * 95;
          const px = Math.cos(ang) * spd * easeOutCubic(sp);
          const py = Math.sin(ang) * spd * easeOutCubic(sp) + sp * sp * 58;
          const prevSp = Math.max(0, sp - 0.08);
          const tx = Math.cos(ang) * spd * easeOutCubic(prevSp);
          const ty = Math.sin(ang) * spd * easeOutCubic(prevSp) + prevSp * prevSp * 58;
          ctx.strokeStyle = i % 3 === 0
            ? 'rgba(255,255,255,' + (1 - sp) + ')'
            : i % 2 === 0
              ? 'rgba(253,186,116,' + (1 - sp) + ')'
              : 'rgba(239,68,68,' + (1 - sp) + ')';
          ctx.lineWidth = 2.6 * (1 - sp);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
        ctx.restore();
        ctx.restore();
      },

  stageClear: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const introEnd = t.introEnd || 0.22;
        const outroStart = t.outroStart || 0.78;
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const intro = easeOutExpo(clamp(p / introEnd, 0, 1));
        const outro = p > outroStart ? 1 - easeInOutQuad((p - outroStart) / Math.max(0.05, 1 - outroStart)) : 1;
        const alpha = intro * outro;

        // Soft ambient celebration halo (NO vertical light pillar, NO horizontal flare!)
        stampSprite(ctx, SPRITES.glowGold, 0, 0, 210 * intro, 210 * intro, 0, 0.45 * alpha, 'lighter');

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Triple crisp expanding celebration shockwave rings
        for (let r = 0; r < 3; r++) {
          const rp = clamp((p - r * 0.11) / 0.62, 0, 1);
          if (rp <= 0 || rp >= 1) continue;
          const rad = 16 + easeOutCubic(rp) * (170 - r * 24);
          ctx.strokeStyle = r === 0
            ? 'rgba(254,240,138,' + ((1 - rp) * 0.92) + ')'
            : r === 1
              ? 'rgba(255,255,255,' + ((1 - rp) * 0.78) + ')'
              : 'rgba(125,211,252,' + ((1 - rp) * 0.68) + ')';
          ctx.lineWidth = (4.2 - r * 0.9) * (1 - rp);
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Blooming central starlight emblem (compact, clean, no flare)
        const starPop = p < 0.24 ? easeOutExpo(p / 0.24) : 1 - (p - 0.24) * 0.55;
        const arm = 52 * starPop * alpha;
        if (arm > 1) {
          ctx.fillStyle = 'rgba(255,254,240,' + alpha + ')';
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            const a0 = i * Math.PI * 0.5;
            const a1 = a0 + Math.PI * 0.5;
            const aMid = a0 + Math.PI * 0.25;
            if (i === 0) ctx.moveTo(Math.cos(a0) * arm, Math.sin(a0) * arm);
            ctx.quadraticCurveTo(Math.cos(aMid) * arm * 0.16, Math.sin(aMid) * arm * 0.16, Math.cos(a1) * arm, Math.sin(a1) * arm);
          }
          ctx.closePath();
          ctx.fill();
        }

        // Celebratory firework star bursts & rising golden-sky sparkles
        const cols = ['#fef08a', '#ffffff', '#7dd3fc', '#fde047', '#fbcfe8'];
        for (let i = 0; i < 56; i++) {
          const cp = clamp((p - rand() * 0.28) / 0.72, 0, 1);
          if (cp <= 0 || cp >= 1) continue;
          const side = i % 2 === 0 ? -1 : 1;
          const ox = side * (24 + rand() * 100);
          const ang = -Math.PI * 0.5 + side * (0.14 + rand() * 0.85);
          const spd = 95 + rand() * 150;
          const px = ox + Math.cos(ang) * spd * easeOutCubic(cp);
          const py = 32 + Math.sin(ang) * spd * easeOutCubic(cp) + cp * cp * 108;
          const sz = (3.5 + rand() * 5.8) * Math.sin(cp * Math.PI);
          ctx.fillStyle = cols[i % cols.length];
          ctx.globalAlpha = (1 - cp) * outro;
          ctx.beginPath();
          ctx.moveTo(px, py - sz);
          ctx.lineTo(px + sz * 0.34, py);
          ctx.lineTo(px, py + sz);
          ctx.lineTo(px - sz * 0.34, py);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        ctx.restore();
      },

  screenShatter: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const crackEnd = t.crackEnd || 0.18;
        const fallStart = Math.max(crackEnd + 0.04, t.fallStart || 0.56);
        const rand = mulberry32(seed);
        const W = bounds ? bounds.w : 256;
        const H = bounds ? bounds.h : 256;
        const cx = bounds ? x : W * 0.5;
        const cy = bounds ? y : H * 0.5;

        ctx.save();
        const crackP = clamp(p / crackEnd, 0, 1);
        const fallP = clamp((p - fallStart) / Math.max(0.06, 1 - fallStart), 0, 1);

        // Very subtle impact flash (reduced glare so it's easy on the eyes!)
        if (p < 0.12) {
          const fa = 1 - p / 0.12;
          ctx.fillStyle = 'rgba(226,232,240,' + (fa * 0.14) + ')';
          ctx.fillRect(0, 0, W, H);
        }

        function drawPressureCrack(ax, ay, bx, by, wStart, wEnd, col, comp, alpha, jitter) {
          if (alpha <= 0.01) return;
          const dx = bx - ax;
          const dy = by - ay;
          const d = Math.hypot(dx, dy) || 1;
          const nx = -dy / d;
          const ny = dx / d;
          const mx = (ax + bx) * 0.5 + nx * jitter;
          const my = (ay + by) * 0.5 + ny * jitter;
          const wMid = (wStart + wEnd) * 0.55;

          ctx.save();
          if (comp) ctx.globalCompositeOperation = comp;
          ctx.globalAlpha = clamp(alpha, 0, 1);
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(ax + nx * wStart, ay + ny * wStart);
          ctx.lineTo(mx + nx * wMid, my + ny * wMid);
          ctx.lineTo(bx + nx * wEnd, by + ny * wEnd);
          ctx.lineTo(bx - nx * wEnd, by - ny * wEnd);
          ctx.lineTo(mx - nx * wMid, my - ny * wMid);
          ctx.lineTo(ax - nx * wStart, ay - ny * wStart);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        const maxRad = Math.hypot(W, H) * 0.88;
        const rayCount = 14;
        const angles = [];
        let accA = rand() * 0.4;
        for (let i = 0; i < rayCount; i++) {
          angles.push(accA);
          accA += (Math.PI * 2 / rayCount) * (0.48 + rand() * 1.05);
        }
        const totalSpan = accA - angles[0];
        for (let i = 0; i < rayCount; i++) {
          angles[i] = angles[0] + ((angles[i] - angles[0]) / totalSpan) * Math.PI * 2;
        }

        const shards = [];
        for (let s = 0; s < rayCount; s++) {
          const a0 = angles[s];
          const a1 = s === rayCount - 1 ? angles[0] + Math.PI * 2 : angles[s + 1];
          const breaks = [0];
          let curR = (16 + rand() * 24) * scale;
          while (curR < maxRad) {
            breaks.push(curR);
            curR += (34 + rand() * 78) * scale * (1 + curR / 260);
          }
          breaks.push(maxRad);

          for (let b = 0; b < breaks.length - 1; b++) {
            const r0L = breaks[b];
            const r1L = breaks[b + 1];
            const r0R = b === 0 ? 0 : Math.max(8, r0L * (0.76 + rand() * 0.48));
            const r1R = b === breaks.length - 2 ? maxRad : Math.max(r0R + 14, r1L * (0.76 + rand() * 0.48));

            const p0 = [Math.cos(a0) * r0L, Math.sin(a0) * r0L];
            const p1 = [Math.cos(a0) * r1L, Math.sin(a0) * r1L];
            const p2 = [Math.cos(a1) * r1R, Math.sin(a1) * r1R];
            const p3 = [Math.cos(a1) * r0R, Math.sin(a1) * r0R];

            if (b > 0 && rand() > 0.45) {
              shards.push({ pts: [p0, p1, p2], minR: Math.min(r0L, r0R), seed: rand() });
              shards.push({ pts: [p0, p2, p3], minR: Math.min(r0L, r0R), seed: rand() });
            } else if (b === 0) {
              shards.push({ pts: [[0, 0], p1, p2], minR: 0, seed: rand() });
            } else {
              shards.push({ pts: [p0, p1, p2, p3], minR: Math.min(r0L, r0R), seed: rand() });
            }
          }
        }

        for (let i = 0; i < shards.length; i++) {
          const sh = shards[i];
          const pts = sh.pts;
          let mx = 0;
          let my = 0;
          for (let k = 0; k < pts.length; k++) {
            mx += pts[k][0];
            my += pts[k][1];
          }
          mx /= pts.length;
          my /= pts.length;
          const midA = Math.atan2(my, mx);
          const distFromOrigin = Math.hypot(mx, my);

          const delay = clamp((distFromOrigin / maxRad) * 0.16 + sh.seed * 0.09, 0, 0.28);
          const sp = clamp((fallP - delay) / (1 - delay), 0, 1);
          const burst = (24 + sh.seed * 115) * easeOutCubic(sp);
          const grav = sp * sp * (340 + sh.seed * 240);
          const rot = sp * (sh.seed - 0.5) * 6.8;
          const flipY = fallP > 0 ? 0.34 + 0.66 * Math.abs(Math.cos(sp * (2.2 + sh.seed * 3.8))) : 1;
          const alpha = fallP > 0 ? clamp(1 - sp * 1.12, 0, 1) : 1;
          if (alpha <= 0.01) continue;

          ctx.save();
          ctx.translate(cx + mx + Math.cos(midA) * burst, cy + my + Math.sin(midA) * burst + grav);
          ctx.rotate(rot);
          ctx.scale(1, flipY);

          if (fallP > 0) {
            const sheen = 0.08 + 0.26 * Math.pow(Math.sin(sp * 7 + i * 1.3), 2);
            const sg = ctx.createLinearGradient(-40, -30, 40, 30);
            sg.addColorStop(0, 'rgba(226,232,240,' + (sheen * alpha) + ')');
            sg.addColorStop(0.5, 'rgba(148,163,184,' + (0.09 * alpha) + ')');
            sg.addColorStop(1, 'rgba(15,23,42,' + (0.38 * alpha) + ')');
            ctx.fillStyle = sg;
            ctx.beginPath();
            ctx.moveTo(pts[0][0] - mx, pts[0][1] - my);
            for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0] - mx, pts[k][1] - my);
            ctx.closePath();
            ctx.fill();
          }

          if (sh.minR <= maxRad * crackP) {
            const edgeRand = mulberry32(Math.floor(sh.seed * 100000) + i * 17);
            for (let k = 0; k < pts.length; k++) {
              const a = pts[k];
              const b = pts[(k + 1) % pts.length];
              const dA = Math.hypot(a[0], a[1]);
              const dB = Math.hypot(b[0], b[1]);
              const wA = clamp(2.5 - (dA / maxRad) * 2.1, 0.35, 2.5);
              const wB = clamp(2.5 - (dB / maxRad) * 2.1, 0.35, 2.5);
              const jit = (edgeRand() - 0.5) * 4.2;

              // Only ~24% of crack seams have sparse, deep blood-crimson seeping in (source-over, muted, NOT blinding!)
              const hasBlood = edgeRand() < 0.24;
              if (hasBlood) {
                const seepP = clamp((p - crackEnd * 0.5) / 0.28, 0, 1);
                const bloodA = (fallP > 0 ? alpha * 0.85 : 0.82 * seepP);
                drawPressureCrack(a[0] - mx, a[1] - my, b[0] - mx, b[1] - my, wA * 1.55, wB * 1.55, '#991b1b', 'source-over', bloodA, jit);
                drawPressureCrack(a[0] - mx, a[1] - my, b[0] - mx, b[1] - my, wA * 0.72, wB * 0.72, '#dc2626', 'source-over', bloodA * 0.85, jit);

                // Occasional tiny blood bead clinging to the crack seam
                if (edgeRand() < 0.45 && seepP > 0.2) {
                  const bx = lerp(a[0], b[0], 0.45) - mx;
                  const by = lerp(a[1], b[1], 0.45) - my;
                  const beadR = (1.6 + edgeRand() * 2.4) * seepP;
                  ctx.save();
                  ctx.globalAlpha = bloodA * 0.92;
                  ctx.fillStyle = '#7f1d1d';
                  ctx.beginPath();
                  ctx.ellipse(bx, by + beadR * 0.6, beadR * 0.85, beadR * 1.35, 0, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.fillStyle = '#dc2626';
                  ctx.beginPath();
                  ctx.arc(bx - beadR * 0.2, by + beadR * 0.2, beadR * 0.35, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.restore();
                }
              }

              // Calm, realistic silver-white glass fracture edge (source-over so it doesn't blow out brightness!)
              drawPressureCrack(a[0] - mx, a[1] - my, b[0] - mx, b[1] - my, wA * 0.62, wB * 0.62, '#e2e8f0', 'source-over', (fallP > 0 ? alpha * 0.78 : 0.80), jit);
            }
          }
          ctx.restore();
        }

        if (fallP > 0) {
          for (let i = 0; i < 26; i++) {
            const a = rand() * Math.PI * 2;
            const d = easeOutCubic(fallP) * (35 + rand() * 195);
            const px = cx + Math.cos(a) * d;
            const py = cy + Math.sin(a) * d + fallP * fallP * 155;
            const gl = (1 - fallP) * 0.72;
            ctx.fillStyle = i % 5 === 0 ? 'rgba(185,28,28,' + gl + ')' : 'rgba(226,232,240,' + gl + ')';
            ctx.fillRect(px - 1.4, py - 1.4, 2.8, 2.8);
          }
        }
        ctx.restore();
      },

  warmFlameHeal: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const flameHold = t.flameHold || 0.68;
        const healStart = t.healStart || 0.70;
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x, y + 18);
        ctx.scale(scale, scale);

        const flameA = p < 0.14
          ? p / 0.14
          : p < flameHold
            ? 1
            : clamp(1 - (p - flameHold) / 0.15, 0, 1);

        const healP = clamp((p - healStart) / Math.max(0.06, 1 - healStart), 0, 1);
        const healA = healP <= 0 ? 0 : healP < 0.25 ? healP / 0.25 : 1 - (healP - 0.25) / 0.75;

        // Pass 1: Cozy Hearth-Fire Cocoon with RAZOR-SHARP tapered ribbon tips!
        if (flameA > 0.01) {
          stampSprite(ctx, SPRITES.glowWarm, 0, -16, 172 * flameA, 172 * flameA, 0, 0.72 * flameA, 'lighter');
          for (let i = 0; i < 14; i++) {
            const ep = (p * 1.45 + i / 14) % 1;
            const ang = ep * 6.8 + i * 1.3;
            const rad = 30 + Math.sin(ep * Math.PI) * 14;
            const fx = Math.cos(ang) * rad;
            const fy = 26 - ep * 96;
            stampSprite(ctx, SPRITES.fireWisp, fx, fy, 42, 54, ang * 0.18, Math.sin(ep * Math.PI) * 0.55 * flameA, 'lighter');
          }

          // 3 warm helical flame ribbons with sharp tapered needle tips at BOTH ends
          for (let r = 0; r < 3; r++) {
            const baseA = (r / 3) * Math.PI * 2 + p * 7.2;
            const pts = [];
            for (let s = 0; s <= 24; s++) {
              const u = s / 24;
              const a = baseA + u * 2.6;
              const rad = 46 - u * 14 + Math.sin(u * 6) * 4;
              pts.push([Math.cos(a) * rad, 28 - u * 96 + Math.sin(a) * 10]);
            }
            const col = r % 2 === 0 ? '#fb923c' : '#fef08a';
            drawSharpRibbon(ctx, pts, 8.2 * flameA, col, 'lighter', 0.88 * flameA);
            drawSharpRibbon(ctx, pts, 3.0 * flameA, '#ffffff', 'lighter', 0.65 * flameA);
          }
        }

        // Pass 2: Brief, crisp emerald-green healing bloom at the very end (0.70..1.00)
        if (healP > 0 && healA > 0.01) {
          stampSprite(ctx, SPRITES.glowHeal, 0, -16, 165 * easeOutCubic(healP), 165 * easeOutCubic(healP), 0, 0.78 * healA, 'lighter');
          stampSprite(ctx, SPRITES.healMist, 0, 2, 115, 80, healP, 0.45 * healA, 'lighter');

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = 'rgba(134,239,172,' + (0.85 * healA) + ')';
          ctx.lineWidth = 2.4 * healA;
          ctx.beginPath();
          ctx.ellipse(0, 24, 24 + easeOutCubic(healP) * 58, 7 + easeOutCubic(healP) * 16, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Sharp-ended '+' diamond crosses rising briefly
          for (let i = 0; i < 12; i++) {
            const ip = clamp((healP - rand() * 0.2) / 0.8, 0, 1);
            if (ip <= 0 || ip >= 1) continue;
            const px = (rand() - 0.5) * 86;
            const py = 18 - easeOutCubic(ip) * (78 + rand() * 42);
            const ia = Math.sin(ip * Math.PI) * healA;
            const sz = 7.2;
            const w = 1.6;
            ctx.fillStyle = i % 3 === 0 ? 'rgba(254,249,195,' + ia + ')' : 'rgba(74,222,128,' + ia + ')';
            ctx.beginPath();
            ctx.moveTo(px - sz, py);
            ctx.lineTo(px - w, py - w);
            ctx.lineTo(px, py - sz);
            ctx.lineTo(px + w, py - w);
            ctx.lineTo(px + sz, py);
            ctx.lineTo(px + w, py + w);
            ctx.lineTo(px, py + sz);
            ctx.lineTo(px - w, py + w);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
        ctx.restore();
      },

  clockRewind: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const cyanStart = t.cyanStart || 0.60;
        const spinEnd = t.spinEnd || 0.86;
        const rand = mulberry32(seed);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const intro = easeOutCubic(clamp(p / 0.15, 0, 1));
        const outro = p > 0.85 ? 1 - easeInOutQuad((p - 0.85) / 0.15) : 1;
        const alpha = intro * outro;

        const cyanMix = easeInOutQuad(clamp((p - cyanStart) / Math.max(0.08, 0.90 - cyanStart), 0, 1));
        const mainRGB = lerpColorRGB([245, 185, 25], [34, 211, 238], cyanMix);
        const brightRGB = lerpColorRGB([254, 243, 165], [186, 248, 255], cyanMix);
        const mainCol = rgbaStr(mainRGB, 1);
        const brightCol = rgbaStr(brightRGB, 1);

        const R = 84 * intro;

        stampSprite(ctx, SPRITES.glowGold, 0, 0, 215 * intro, 215 * intro, 0, 0.56 * alpha * (1 - cyanMix), 'lighter');
        stampSprite(ctx, SPRITES.glowCyan, 0, 0, 235 * intro, 235 * intro, 0, 0.72 * alpha * cyanMix, 'lighter');
        stampSprite(ctx, SPRITES.cyanMist, 0, 0, 180 * intro, 180 * intro, -p * 2, 0.40 * alpha * cyanMix, 'lighter');

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha;

        // Rotating Concentric Clockwork Gear Ring
        ctx.save();
        ctx.rotate(-p * 3.8);
        const teeth = 24;
        ctx.strokeStyle = rgbaStr(mainRGB, 0.6);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i < teeth; i++) {
          const a0 = (i / teeth) * Math.PI * 2;
          const a1 = ((i + 0.42) / teeth) * Math.PI * 2;
          const a2 = ((i + 0.52) / teeth) * Math.PI * 2;
          const a3 = ((i + 0.92) / teeth) * Math.PI * 2;
          const rIn = R * 0.52;
          const rOut = R * 0.61;
          if (i === 0) ctx.moveTo(Math.cos(a0) * rIn, Math.sin(a0) * rIn);
          else ctx.lineTo(Math.cos(a0) * rIn, Math.sin(a0) * rIn);
          ctx.lineTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn);
          ctx.lineTo(Math.cos(a2) * rOut, Math.sin(a2) * rOut);
          ctx.lineTo(Math.cos(a3) * rOut, Math.sin(a3) * rOut);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Outer ornate dial rings
        ctx.strokeStyle = mainCol;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = brightCol;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.89, 0, Math.PI * 2);
        ctx.stroke();

        // Roman Numerals & dial ticks
        ctx.font = '700 11px Cinzel, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = brightCol;
        const romans = { 0: 'XII', 3: 'III', 6: 'VI', 9: 'IX' };
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 - Math.PI * 0.5;
          if (romans[i]) {
            ctx.fillText(romans[i], Math.cos(a) * R * 0.77, Math.sin(a) * R * 0.77);
          } else {
            ctx.strokeStyle = mainCol;
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78);
            ctx.lineTo(Math.cos(a) * R * 0.87, Math.sin(a) * R * 0.87);
            ctx.stroke();
          }
        }

        // Ultra-Detailed Ornate Antique Filigree Clock Hands (Breguet/Cathedral Style!)
        const spin = easeInOutQuad(clamp(p / spinEnd, 0, 1));
        const minAng = -Math.PI * 0.5 - spin * Math.PI * 6.5;
        const hrAng = -Math.PI * 0.1 - spin * Math.PI * 1.9;

        function drawDetailedClockHand(angle, length, isHour, col, rimCol, handAlpha) {
          ctx.save();
          ctx.rotate(angle);
          ctx.globalAlpha = alpha * handAlpha;
          ctx.strokeStyle = rimCol;
          ctx.fillStyle = col;
          ctx.lineWidth = 1.6;
          ctx.lineJoin = 'round';

          const tailLen = length * 0.24;
          const eyePos = length * (isHour ? 0.56 : 0.68);
          const eyeR = isHour ? 5.6 : 4.2;

          // 1) Counterweight crescent/diamond tail
          ctx.beginPath();
          ctx.moveTo(-tailLen, 0);
          ctx.lineTo(-tailLen * 0.55, -3.4);
          ctx.lineTo(0, -2.0);
          ctx.lineTo(0, 2.0);
          ctx.lineTo(-tailLen * 0.55, 3.4);
          ctx.closePath();
          ctx.fill();

          // Open counterweight ring at rear tip
          ctx.beginPath();
          ctx.arc(-tailLen - 3.2, 0, 3.0, 0, Math.PI * 2);
          ctx.stroke();

          // 2) Tapered filigree shaft up to decorative eye
          ctx.beginPath();
          ctx.moveTo(0, -2.8);
          ctx.lineTo(eyePos - eyeR, -1.8);
          ctx.lineTo(eyePos - eyeR, 1.8);
          ctx.lineTo(0, 2.8);
          ctx.closePath();
          ctx.fill();

          // 3) Decorative pierced cathedral/Breguet filigree eye (hollow diamond or ring)
          if (isHour) {
            // Gothic spade/diamond pierced filigree ornament for hour hand
            ctx.beginPath();
            ctx.moveTo(eyePos - eyeR * 1.25, 0);
            ctx.lineTo(eyePos, -eyeR * 1.15);
            ctx.lineTo(eyePos + eyeR * 1.35, 0);
            ctx.lineTo(eyePos, eyeR * 1.15);
            ctx.closePath();
            ctx.stroke();
            // Side baroque curls
            ctx.beginPath();
            ctx.arc(eyePos - 1, -eyeR * 0.95, 2.1, 0, Math.PI * 2);
            ctx.arc(eyePos - 1, eyeR * 0.95, 2.1, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            // Pierced Breguet moon-ring + diamond collar for minute hand
            ctx.beginPath();
            ctx.arc(eyePos, 0, eyeR, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(eyePos - eyeR * 1.6, 0);
            ctx.lineTo(eyePos - eyeR, -2.4);
            ctx.lineTo(eyePos - eyeR, 2.4);
            ctx.closePath();
            ctx.fill();
          }

          // 4) Fine needle spear tip extending from filigree eye to dial edge
          ctx.beginPath();
          ctx.moveTo(eyePos + eyeR, -1.7);
          ctx.lineTo(length, 0);
          ctx.lineTo(eyePos + eyeR, 1.7);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }

        // Counter-clockwise afterimage ghost hands
        for (let g = 4; g >= 1; g--) {
          drawDetailedClockHand(minAng + g * 0.24, R * 0.78, false, mainCol, mainCol, (5 - g) * 0.09);
        }
        drawDetailedClockHand(hrAng, R * 0.52, true, mainCol, brightCol, 0.96);
        drawDetailedClockHand(minAng, R * 0.78, false, brightCol, '#ffffff', 1.0);

        // Layered center jewel boss pin
        ctx.strokeStyle = mainCol;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 7.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
        ctx.fill();

        // Final Cyan Temporal Lock Shockwave & Stardust Burst
        if (p > cyanStart) {
          const cp = clamp((p - cyanStart) / Math.max(0.08, 1 - cyanStart), 0, 1);
          ctx.globalAlpha = (1 - cp) * 0.95;
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 4.2 * (1 - cp);
          ctx.beginPath();
          ctx.arc(0, 0, R * (0.88 + easeOutCubic(cp) * 0.85), 0, Math.PI * 2);
          ctx.stroke();

          for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2 + rand() * 0.25;
            const d = R * 0.8 + easeOutCubic(cp) * (42 + rand() * 38);
            ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#67e8f9';
            ctx.beginPath();
            ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 2.8 * (1 - cp), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
        ctx.restore();
      },

  guardSky: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        renderHemisphereGuard(ctx, x, y, p, dir, scale, seed, t, {
          c1: [14, 165, 233], c2: [125, 211, 252], rim: [240, 249, 255], glow: 'glowSky', glowAlpha: 0.52
        });
      },

  guardGold: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        renderHemisphereGuard(ctx, x, y, p, dir, scale, seed, t, {
          c1: [217, 119, 6], c2: [250, 204, 21], rim: [254, 249, 195], glow: 'glowGold', glowAlpha: 0.55
        });
      },

  guardCyanPink: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        renderHemisphereGuard(ctx, x, y, p, dir, scale, seed, t, {
          c1: [34, 211, 238], c2: [244, 114, 182], rim: [255, 240, 248], glow: 'glowCyan', glowAlpha: 0.48
        });
      },

  guardDarkRed: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        renderHemisphereGuard(ctx, x, y, p, dir, scale, seed, t, {
          c1: [20, 6, 10], c2: [185, 28, 28], rim: [248, 113, 113], glow: 'glowRed', smoke: 'smokeDark', shellComp: 'source-over', glowAlpha: 0.42
        });
      },

  guardPinkPurple: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        renderHemisphereGuard(ctx, x, y, p, dir, scale, seed, t, {
          c1: [147, 51, 234], c2: [236, 72, 153], rim: [252, 207, 232], glow: 'glowPurple', glowAlpha: 0.52
        });
      },

  guardWhite: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        renderHemisphereGuard(ctx, x, y, p, dir, scale, seed, t, {
          c1: [148, 163, 184], c2: [226, 232, 240], rim: [255, 255, 255], glow: 'glowWhite', glowAlpha: 0.42
        });
      },

  cardOminousAura: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const glitchFreq = t.glitchFreq || 0.45;
        const warpPower = t.warpPower || 0.55;
        const rand = mulberry32(seed);
        const cardImg = getCardSource('A', t);

        // Continuous time (seamless wrap on p for sprite sheets, continuous elapsed in live view!)
        const time = typeof t._elapsed === 'number' ? t._elapsed : p * 2.4;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const cw = 112;
        const ch = 160;
        const halfW = cw * 0.5;
        const halfH = ch * 0.5;

        // Irregular glitch burst detector (calm ominous aura -> sudden unpredictable distortion spasms!)
        const slot = Math.floor(time * 5.5);
        const slotFrac = (time * 5.5) - slot;
        const slotRand = mulberry32(seed + slot * 7919);
        const isGlitching = slotRand() < glitchFreq * 0.65;
        const burstStrength = isGlitching ? Math.sin(slotFrac * Math.PI) * warpPower : 0;

        // Pass 1: Continuous billowing pitch-black & dark-purple sinister smoke around card perimeter
        for (let i = 0; i < 18; i++) {
          const ep = (time * 0.48 + i / 18) % 1;
          const perim = i % 4;
          const rOff = (hash2D(i, 7) - 0.5);
          let sx, sy;
          if (perim === 0) { sx = rOff * cw * 1.05; sy = -halfH - ep * 30; }
          else if (perim === 1) { sx = rOff * cw * 1.05; sy = halfH - ep * 22; }
          else if (perim === 2) { sx = -halfW - 8 - ep * 12; sy = rOff * ch - ep * 34; }
          else { sx = halfW + 8 + ep * 12; sy = rOff * ch - ep * 34; }
          const sz = 46 + Math.sin(ep * Math.PI) * 32;
          stampSprite(ctx, i % 2 === 0 ? SPRITES.smokeDark : SPRITES.smokePurple, sx, sy, sz, sz * 1.15, ep * 2 + i, Math.sin(ep * Math.PI) * 0.84, 'source-over');
        }

        // Continuous eerie violet breathing halo behind card
        const pulse = 0.85 + 0.15 * Math.sin(time * 3.8);
        stampSprite(ctx, SPRITES.glowPurple, 0, 0, cw * 2.15 * pulse, ch * 1.75 * pulse, 0, 0.56, 'lighter');

        // Continuous sharp black-purple cursed tendrils creeping upward along both sides
        for (let side = -1; side <= 1; side += 2) {
          const pts = [];
          for (let s = 0; s <= 18; s++) {
            const u = s / 18;
            const wave = Math.sin(u * 7.5 - time * 5.2 + side) * 8.5;
            pts.push([side * (halfW + 7 + u * 9) + wave, lerp(halfH + 8, -halfH - 22, u)]);
          }
          drawSharpRibbon(ctx, pts, 7.5, '#12061c', 'source-over', 0.90);
          drawSharpRibbon(ctx, pts, 3.4, '#a855f7', 'lighter', 0.85);
        }

        // Pass 2: Draw Card Artwork/Info WITH Irregular Horizontal Slice Distortion!
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-halfW, -halfH, cw, ch, 8);
        ctx.clip();

        // Base card image
        drawCoverImage(ctx, cardImg, -halfW, -halfH, cw, ch);

        // When an irregular glitch spasm fires, slice & horizontally displace strips of the actual card info!
        if (burstStrength > 0.04) {
          const gRand = mulberry32(seed + Math.floor(time * 24) * 313);
          const slices = 5 + Math.floor(burstStrength * 8);
          const iw = cardImg.naturalWidth || cardImg.width || cw;
          const ih = cardImg.naturalHeight || cardImg.height || ch;

          for (let i = 0; i < slices; i++) {
            const syNorm = gRand();
            const shNorm = 0.035 + gRand() * 0.12;
            const dy = -halfH + syNorm * ch;
            const dh = shNorm * ch;
            const shiftX = (gRand() - 0.5) * 42 * burstStrength;

            // Dark void tear underneath displaced strip
            ctx.fillStyle = 'rgba(8, 4, 14, 0.82)';
            ctx.fillRect(-halfW, dy, cw, dh);

            // Displaced slice of the actual card artwork/text!
            ctx.save();
            ctx.beginPath();
            ctx.rect(-halfW, dy, cw, dh);
            ctx.clip();
            drawCoverImage(ctx, cardImg, -halfW + shiftX, -halfH + (gRand() - 0.5) * 4, cw, ch);

            // Purple/magenta chromatic ghost tint on the warped card info
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = i % 2 === 0
              ? 'rgba(168, 85, 247, ' + (0.38 * burstStrength) + ')'
              : 'rgba(232, 121, 249, ' + (0.30 * burstStrength) + ')';
            ctx.fillRect(-halfW, dy, cw, dh);
            ctx.restore();
          }
        }
        ctx.restore();

        // Card cursed violet border (twitches slightly during glitch burst)
        const bJit = burstStrength > 0.1 ? (slotRand() - 0.5) * 4 : 0;
        ctx.strokeStyle = burstStrength > 0.15 ? 'rgba(232, 121, 249, 0.92)' : 'rgba(168, 85, 247, 0.78)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-halfW + bJit, -halfH, cw, ch, 8);
        ctx.stroke();

        // Occasional jagged purple/black glitch shards tearing outside the card frame during bursts
        if (burstStrength > 0.08) {
          const oRand = mulberry32(seed + Math.floor(time * 30) * 521);
          for (let i = 0; i < 6; i++) {
            const gy = (oRand() - 0.5) * (ch + 16);
            const gh = 1.8 + oRand() * 4.5;
            const gw = cw * (0.35 + oRand() * 0.75);
            const gx = -gw * 0.5 + (oRand() - 0.5) * 34 * burstStrength;
            ctx.fillStyle = i % 3 === 0
              ? 'rgba(10, 5, 16, ' + (0.85 * burstStrength) + ')'
              : 'rgba(168, 85, 247, ' + (0.72 * burstStrength) + ')';
            ctx.fillRect(gx, gy, gw, gh);
          }
        }

        // Continuous rising cursed violet motes
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 16; i++) {
          const mp = (time * 0.55 + hash2D(i, 19)) % 1;
          const mx = (hash2D(i, 31) - 0.5) * (cw + 44) + Math.sin(mp * 6 + i) * 6;
          const my = halfH - mp * (ch + 72);
          const sz = (1.6 + hash2D(i, 43) * 2.4) * Math.sin(mp * Math.PI);
          ctx.fillStyle = i % 2 === 0 ? 'rgba(192,132,252,' + Math.sin(mp * Math.PI) + ')' : 'rgba(232,121,249,' + Math.sin(mp * Math.PI) + ')';
          ctx.beginPath();
          ctx.arc(mx, my, sz, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ctx.restore();
      },

  cardBurnTransition: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const burnStart = t.burnStart || 0.14;
        const burnEnd = Math.max(burnStart + 0.15, t.burnEnd || 0.82);
        const rand = mulberry32(seed);
        const cardA = getCardSource('A', t);
        const cardB = getCardSource('B', t);

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const cw = 112;
        const ch = 160;
        const halfW = cw * 0.5;
        const halfH = ch * 0.5;
        const burnP = clamp((p - burnStart) / (burnEnd - burnStart), 0, 1);
        const burnY = lerp(halfH + 12, -halfH - 14, easeInOutQuad(burnP));

        function getBurnEdgeY(lx) {
          const n = (fbm2D(lx * 0.045 + seed * 0.01, p * 3.8, 3) - 0.5) * 26;
          return burnY + n;
        }

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-halfW, -halfH, cw, ch, 8);
        ctx.clip();

        // CARD B (Revealed below rising burn front)
        drawCoverImage(ctx, cardB, -halfW, -halfH, cw, ch);

        // CARD A (Consumed above rising burn front)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(-halfW - 4, -halfH - 4);
        ctx.lineTo(halfW + 4, -halfH - 4);
        for (let i = 20; i >= 0; i--) {
          const lx = lerp(-halfW - 2, halfW + 2, i / 20);
          ctx.lineTo(lx, getBurnEdgeY(lx));
        }
        ctx.closePath();
        ctx.clip();
        drawCoverImage(ctx, cardA, -halfW, -halfH, cw, ch);
        ctx.restore();

        // Charred soot & incandescent ember line along burn edge
        if (burnP > 0.01 && burnP < 0.99) {
          const edgePts = [];
          for (let i = 0; i <= 20; i++) {
            const lx = lerp(-halfW - 2, halfW + 2, i / 20);
            edgePts.push([lx, getBurnEdgeY(lx)]);
          }
          drawSharpRibbon(ctx, edgePts, 18, '#0c080a', 'source-over', 0.92);
          drawSharpRibbon(ctx, edgePts, 11, '#ea580c', 'lighter', 0.95);
          drawSharpRibbon(ctx, edgePts, 4.5, '#fef08a', 'lighter', 0.98);
        }
        ctx.restore();

        ctx.strokeStyle = burnP > 0.5 ? 'rgba(56,189,248,0.72)' : 'rgba(249,115,22,0.75)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(-halfW, -halfH, cw, ch, 8);
        ctx.stroke();

        if (burnP > 0.01 && burnP < 0.99) {
          const fireA = Math.sin(burnP * Math.PI);
          stampSprite(ctx, SPRITES.glowWarm, 0, burnY, cw * 1.65, 58, 0, 0.72 * fireA, 'lighter');
          for (let i = 0; i < 8; i++) {
            const lx = (rand() - 0.5) * cw;
            const ey = getBurnEdgeY(lx);
            stampSprite(ctx, SPRITES.fireWisp, lx, ey - 10, 34, 46, (rand() - 0.5) * 0.5, 0.65 * fireA, 'lighter');
          }
        }

        for (let i = 0; i < 28; i++) {
          const ep = clamp((p - burnStart - rand() * 0.45) / 0.55, 0, 1);
          if (ep <= 0 || ep >= 1) continue;
          const sx = (rand() - 0.5) * (cw + 18) + Math.sin(ep * 8 + i) * 14;
          const sy = lerp(halfH * 0.6, -halfH - 58, ep);
          const sz = (2.0 + rand() * 3.2) * (1 - ep);
          if (i % 3 === 0) {
            ctx.fillStyle = 'rgba(24, 18, 22, ' + (1 - ep) + ')';
            ctx.fillRect(sx - sz, sy - sz * 0.6, sz * 2, sz * 1.2);
          } else {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = i % 2 === 0 ? 'rgba(253,224,71,' + (1 - ep) + ')' : 'rgba(249,115,22,' + (1 - ep) + ')';
            ctx.beginPath();
            ctx.arc(sx, sy, sz, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
        ctx.restore();
      },

  screenGlitch: function (ctx, x, y, p, dir, scale, seed, bounds, t) {
        t = t || {};
        const edgeDepth = t.edgeDepth || 0.28;
        const burstFreq = t.burstFreq || 0.48;
        const W = bounds ? bounds.w : 256;
        const H = bounds ? bounds.h : 256;

        // Continuous time so edge glitch persists smoothly with irregular bursts!
        const time = typeof t._elapsed === 'number' ? t._elapsed : p * 2.4;

        // Irregular multi-rate glitch pulse (calm corrupted edges -> sudden sharp erratic bursts)
        const beatA = Math.floor(time * 4.5);
        const beatB = Math.floor(time * 13.0);
        const rBeat = mulberry32(seed + beatA * 4999);
        const isSurge = rBeat() < burstFreq;
        const intensity = isSurge ? (0.62 + 0.38 * Math.sin((time * 4.5 - beatA) * Math.PI)) : 0.28;
        const rand = mulberry32(seed + beatB * 997);

        const padX = W * edgeDepth;
        const padY = H * edgeDepth;

        ctx.save();

        // Pass 1: Dark-purple edge vignette frame (keeps center crystal clear!)
        const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * (0.48 - edgeDepth * 0.55), W * 0.5, H * 0.5, Math.hypot(W, H) * 0.56);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(0.65, 'rgba(30, 8, 52, ' + (0.18 * intensity) + ')');
        vig.addColorStop(1, 'rgba(8, 4, 14, ' + (0.68 * intensity) + ')');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        const palette = [
          'rgba(8, 4, 14, ',      // Black void
          'rgba(124, 58, 237, ',  // Deep Purple
          'rgba(34, 211, 238, ',  // Electric Cyan
          'rgba(236, 72, 153, '   // Hot Pink
        ];

        // Pass 2: Edge-Anchored Irregular Glitch Tear Strips (Top, Bottom, Left, Right borders!)
        const edgeBands = Math.floor(14 + intensity * 24);
        for (let i = 0; i < edgeBands; i++) {
          const side = Math.floor(rand() * 4); // 0:left, 1:right, 2:top, 3:bottom
          const colIdx = Math.floor(rand() * palette.length);
          const alpha = (colIdx === 0 ? 0.78 : 0.52) * intensity;
          let bx, by, bw, bh;

          if (side === 0) { // Left edge
            bw = 10 + Math.pow(rand(), 1.6) * padX * 1.15;
            bh = 2 + Math.pow(rand(), 2) * 22;
            bx = (rand() - 0.2) * padX * 0.35;
            by = rand() * H;
          } else if (side === 1) { // Right edge
            bw = 10 + Math.pow(rand(), 1.6) * padX * 1.15;
            bh = 2 + Math.pow(rand(), 2) * 22;
            bx = W - bw + (rand() - 0.8) * padX * 0.35;
            by = rand() * H;
          } else if (side === 2) { // Top edge
            bw = 24 + rand() * (W * 0.42);
            bh = 2 + Math.pow(rand(), 1.8) * padY * 0.55;
            bx = rand() * (W - bw * 0.5);
            by = rand() * padY * 0.78;
          } else { // Bottom edge
            bw = 24 + rand() * (W * 0.42);
            bh = 2 + Math.pow(rand(), 1.8) * padY * 0.55;
            bx = rand() * (W - bw * 0.5);
            by = H - bh - rand() * padY * 0.78;
          }

          ctx.fillStyle = palette[colIdx] + alpha.toFixed(3) + ')';
          ctx.fillRect(bx, by, bw, bh);

          // Chromatic split (Cyan / Hot Pink) along edge bars
          if (colIdx > 0 && rand() < 0.55) {
            const shift = (5 + rand() * 14) * intensity;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = 'rgba(34, 211, 238, ' + (0.36 * intensity) + ')';
            ctx.fillRect(bx - shift, by + 1, bw * 0.75, Math.max(1.5, bh * 0.4));
            ctx.fillStyle = 'rgba(236, 72, 153, ' + (0.36 * intensity) + ')';
            ctx.fillRect(bx + shift, by - 1, bw * 0.75, Math.max(1.5, bh * 0.4));
            ctx.restore();
          }
        }

        // Pass 3: Corner corrupted data-block clusters
        const cornerBlocks = Math.floor(8 + intensity * 12);
        for (let i = 0; i < cornerBlocks; i++) {
          const isRight = rand() > 0.5;
          const isBottom = rand() > 0.5;
          const bw = 8 + rand() * 44;
          const bh = 4 + rand() * 14;
          const bx = isRight ? W - rand() * padX - bw * 0.5 : rand() * padX - bw * 0.5;
          const by = isBottom ? H - rand() * padY - bh * 0.5 : rand() * padY - bh * 0.5;
          const colIdx = Math.floor(rand() * palette.length);
          ctx.fillStyle = palette[colIdx] + ((colIdx === 0 ? 0.85 : 0.60) * intensity).toFixed(3) + ')';
          ctx.fillRect(bx, by, bw, bh);
        }

        // Pass 4: Edge-only scanlines & occasional razor-thin neon wire during surges
        ctx.fillStyle = 'rgba(8, 4, 14, ' + (0.32 * intensity) + ')';
        for (let sy = 0; sy < H; sy += 4) {
          if (sy < padY * 0.9 || sy > H - padY * 0.9) {
            ctx.fillRect(0, sy, W, 1.4);
          } else {
            ctx.fillRect(0, sy, padX * 0.65, 1.4);
            ctx.fillRect(W - padX * 0.65, sy, padX * 0.65, 1.4);
          }
        }

        if (isSurge) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 4; i++) {
            const isTop = i % 2 === 0;
            const wy = isTop ? rand() * padY : H - rand() * padY;
            ctx.fillStyle = i < 2 ? 'rgba(34, 211, 238, 0.72)' : 'rgba(236, 72, 153, 0.72)';
            ctx.fillRect(rand() * W * 0.25, wy, W * (0.35 + rand() * 0.45), 1.5);
          }
          ctx.restore();
        }
        ctx.restore();
      }
  };

  const DEFAULT_TIMINGS = {"spearThrust":{"duration":0.56,"extEnd":0.22,"fadeStart":0.22},"daggerThrow":{"duration":0.52,"swingEnd":0.32,"launchAt":0.1,"flyDur":0.36},"dragonWingFlap":{"duration":1.1,"unfoldDur":0.44,"downStart":0.46,"fadeStart":0.74},"darkFireMagic":{"duration":1.25,"introEnd":0.16,"outroStart":0.76},"spearSlash":{"duration":0.64,"sweepEnd":0.38,"fadeStart":0.26},"goldenLightBeam":{"duration":1.3,"introEnd":0.24,"outroStart":0.72},"kickSweep":{"duration":0.64,"sweepEnd":0.4,"fadeStart":0.28},"glintSparkle":{"duration":1.12,"riseEnd":0.54,"glintStart":0.68},"hitImpact":{"duration":0.54,"flashEnd":0.42,"ringEnd":0.68},"stageClear":{"duration":1.85,"introEnd":0.22,"outroStart":0.78},"screenShatter":{"duration":2.15,"crackEnd":0.18,"fallStart":0.56},"warmFlameHeal":{"duration":1.5,"flameHold":0.68,"healStart":0.7},"clockRewind":{"duration":1.55,"cyanStart":0.6,"spinEnd":0.86},"guardSky":{"duration":0.95,"expandEnd":0.22,"fadeStart":0.7},"guardGold":{"duration":0.95,"expandEnd":0.22,"fadeStart":0.7},"guardCyanPink":{"duration":0.95,"expandEnd":0.22,"fadeStart":0.7},"guardDarkRed":{"duration":0.95,"expandEnd":0.22,"fadeStart":0.7},"guardPinkPurple":{"duration":0.95,"expandEnd":0.22,"fadeStart":0.7},"guardWhite":{"duration":0.95,"expandEnd":0.22,"fadeStart":0.7},"cardOminousAura":{"duration":2.4,"glitchFreq":0.45,"warpPower":0.55},"cardBurnTransition":{"duration":1.5,"burnStart":0.14,"burnEnd":0.82},"screenGlitch":{"duration":3.35,"edgeDepth":0.14,"burstFreq":0.17}};

  class GameVFXManager {
    constructor() {
      this.instances = [];
      ensureSprites();
    }
    spawn(id, x, y, opts) {
      opts = opts || {};
      const defT = DEFAULT_TIMINGS[id] || { duration: 0.85 };
      this.instances.push({
        id: id,
        x: x,
        y: y,
        elapsed: 0,
        duration: opts.duration || defT.duration || 0.85,
        loop: opts.loop === true || id === "cardOminousAura" || id === "screenGlitch",
        timings: Object.assign({}, defT, opts.timings || {}, { cardImgA: opts.cardImgA || null, cardImgB: opts.cardImgB || null }),
        dir: opts.dir === -1 ? -1 : 1,
        scale: opts.scale || 1.0,
        seed: opts.seed || Math.floor(Math.random() * 999999) + 1
      });
    }
    updateAndDraw(ctx, dt, width, height) {
      ensureSprites();
      const next = [];
      for (let i = 0; i < this.instances.length; i++) {
        const inst = this.instances[i];
        inst.elapsed += dt;
        const p = inst.loop ? ((inst.elapsed % inst.duration) / inst.duration) : (inst.elapsed / inst.duration);
        if (inst.loop || p < 1) {
          const fn = VFXRenderers[inst.id];
          if (fn) { inst.timings._elapsed = inst.elapsed; fn(ctx, inst.x, inst.y, p, inst.dir, inst.scale, inst.seed, { w: width, h: height }, inst.timings); }
          next.push(inst);
        }
      }
      this.instances = next;
    }
  }

  global.GameVFXManager = GameVFXManager;
  global.GameVFXRenderers = VFXRenderers;
})(typeof window !== "undefined" ? window : globalThis);