/* dragon.js
   اژدهای خطی که دنبال نشانگر ماوس می‌آید.
   مسیر: personal/static/js/dragon.js
   - فقط روی دستگاه‌های دارای ماوس اجرا می‌شود (نه موبایل)
   - اگر کاربر «کاهش حرکت» را روشن کرده باشد اجرا نمی‌شود
   - رنگ‌ها از متغیرهای CSS تم (--text, --muted, --accent) خوانده می‌شوند */
(function () {
  "use strict";

  var mq = window.matchMedia;
  if (!mq) return;
  if (mq("(prefers-reduced-motion: reduce)").matches) return;
  if (!mq("(hover: hover) and (pointer: fine)").matches) return;
  try {
    if (localStorage.getItem("dragon") === "off") return;
  } catch (e) {}

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;";
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  /* رنگ‌ها از تم فعلی */
  var ink = "#888", soft = "#888", accent = "#888";
  function readColors() {
    var s = getComputedStyle(document.documentElement);
    ink = s.getPropertyValue("--text").trim() || ink;
    soft = s.getPropertyValue("--muted").trim() || soft;
    accent = s.getPropertyValue("--accent").trim() || accent;
  }
  readColors();
  if (window.MutationObserver) {
    new MutationObserver(readColors).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  }

  /* ستون فقرات: نقطه‌ها پشت سر هم می‌آیند */
  var N = 36;       // تعداد نقطه‌ها
  var GAP = 10;     // فاصله‌ی نقطه‌ها
  var pts = [];
  var i;
  for (i = 0; i < N; i++) pts.push({ x: W / 2, y: H / 2 });

  var mouse = { x: W / 2, y: H / 2, moved: false };
  window.addEventListener("pointermove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.moved = true;
  }, { passive: true });

  var WING_AT = 7;  // محل بال‌ها روی بدن

  function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawWing(p, a, side, t) {
    // بال: چند خط که از بدن باز می‌شوند و کمی تکان می‌خورند
    var flap = Math.sin(t * 3.2) * 0.22;
    var base = a + side * (1.25 + flap);
    var fan = 7;
    for (var k = 0; k < fan; k++) {
      var f = k / (fan - 1);
      var ang = base + side * f * 0.9;
      var len = 70 - f * 26 + Math.sin(t * 3.2 + k) * 3;
      var ex = p.x + Math.cos(ang) * len;
      var ey = p.y + Math.sin(ang) * len;
      ctx.lineWidth = 1.4 - f * 0.5;
      line(p.x, p.y, ex, ey);
      // پره‌ی کوچک انتهای هر خط
      var bx = ex - Math.cos(ang + side * 0.7) * 9;
      var by = ey - Math.sin(ang + side * 0.7) * 9;
      line(ex, ey, bx, by);
    }
  }

  var t0 = performance.now();
  var running = true;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);

    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    if (!mouse.moved) return;

    // سر آرام دنبال ماوس می‌رود و کمی دور آن می‌چرخد تا زنده بماند
    var tx = mouse.x + Math.cos(t * 1.3) * 16;
    var ty = mouse.y + Math.sin(t * 1.7) * 12;
    pts[0].x += (tx - pts[0].x) * 0.14;
    pts[0].y += (ty - pts[0].y) * 0.14;
    for (i = 1; i < N; i++) {
      var dx = pts[i - 1].x - pts[i].x;
      var dy = pts[i - 1].y - pts[i].y;
      var d = Math.atan2(dy, dx);
      pts[i].x = pts[i - 1].x - Math.cos(d) * GAP;
      pts[i].y = pts[i - 1].y - Math.sin(d) * GAP;
    }

    // زاویه و موقعیت موجی هر نقطه
    var draw = [];
    for (i = 0; i < N; i++) {
      var prev = pts[Math.max(i - 1, 0)];
      var next = pts[Math.min(i + 1, N - 1)];
      var ang = Math.atan2(prev.y - next.y, prev.x - next.x); // به سمت سر
      var wave = Math.sin(t * 4 - i * 0.55) * (i / N) * 9;
      draw.push({
        x: pts[i].x + Math.cos(ang + Math.PI / 2) * wave,
        y: pts[i].y + Math.sin(ang + Math.PI / 2) * wave,
        a: ang
      });
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // بال‌ها (پشت بدن)
    ctx.strokeStyle = soft;
    ctx.globalAlpha = 0.75;
    drawWing(draw[WING_AT], draw[WING_AT].a, 1, t);
    drawWing(draw[WING_AT], draw[WING_AT].a, -1, t);

    // دنده‌ها
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.8;
    for (i = 1; i < N - 1; i++) {
      var q = draw[i];
      var prof = Math.sin(Math.PI * Math.min(i / (N * 0.8), 1)); // کوتاه در دو سر
      var len = 3 + 13 * prof * (1 - i / N * 0.6);
      var nx = Math.cos(q.a + Math.PI / 2);
      var ny = Math.sin(q.a + Math.PI / 2);
      var tx2 = -Math.cos(q.a) * len * 0.6; // کمی به سمت دم خم می‌شود
      var ty2 = -Math.sin(q.a) * len * 0.6;
      ctx.lineWidth = 1.5 - (i / N) * 0.8;
      line(q.x, q.y, q.x + nx * len + tx2, q.y + ny * len + ty2);
      line(q.x, q.y, q.x - nx * len + tx2, q.y - ny * len + ty2);
    }

    // ستون فقرات
    ctx.globalAlpha = 0.9;
    for (i = 0; i < N - 1; i++) {
      ctx.lineWidth = 3.2 * (1 - i / N) + 0.6;
      line(draw[i].x, draw[i].y, draw[i + 1].x, draw[i + 1].y);
    }

    // سر: لوزی کوچک با دو شاخ
    var h = draw[0];
    var ca = Math.cos(h.a), sa = Math.sin(h.a);
    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(h.x + ca * 13, h.y + sa * 13);
    ctx.lineTo(h.x - sa * 6 - ca * 2, h.y + ca * 6 - sa * 2);
    ctx.lineTo(h.x - ca * 8, h.y - sa * 8);
    ctx.lineTo(h.x + sa * 6 - ca * 2, h.y - ca * 6 - sa * 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.6;
    line(h.x - ca * 2 - sa * 4, h.y - sa * 2 + ca * 4,
         h.x - ca * 12 - sa * 11, h.y - sa * 12 + ca * 11);
    line(h.x - ca * 2 + sa * 4, h.y - sa * 2 - ca * 4,
         h.x - ca * 12 + sa * 11, h.y - sa * 12 - ca * 11);
    ctx.globalAlpha = 1;
  }

  requestAnimationFrame(frame);
})();
