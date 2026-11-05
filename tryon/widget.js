/* VERTEX Try-On widget — one line on any store:
   <script src="https://bofrahi12.github.io/vertex-tryon/widget.js" async></script>
   Optional: ?room=<fitting-room-url> to point at your own hosted room. */
(function () {
  var script = document.currentScript;
  var base = "";
  if (script && script.src) base = script.src.replace(/\/widget\.js(\?.*)?$/, "");
  var room = base + "/tryon.html";
  try {
    var q = new URL(script.src).searchParams;
    if (q.get("room")) room = q.get("room");
  } catch (e) {}

  var CSS_ID = "vtx-tryon-style";
  function addStyle() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement("style");
    s.id = CSS_ID;
    s.textContent =
      ".vtx-wrap{position:relative!important}" +
      ".vtx-btn{position:absolute;top:10px;left:10px;z-index:60;background:#fff;color:#0a0a0a;border:1px solid rgba(0,0,0,.55);font:700 12px/1 system-ui,Arial,sans-serif;padding:7px 10px;cursor:pointer;letter-spacing:.04em;box-shadow:0 2px 10px rgba(0,0,0,.18)}" +
      ".vtx-btn:hover{background:#0a0a0a;color:#fff}" +
      ".vtx-pill{position:fixed;left:14px;bottom:126px;z-index:2147483000;background:#0a0a0a;color:#fff;border:none;font:800 13px/1 system-ui,Arial,sans-serif;padding:13px 16px;border-radius:999px;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.35)}" +
      ".vtx-overlay{position:fixed;inset:0;z-index:2147483600;background:rgba(5,5,8,.55);display:flex;align-items:flex-end;justify-content:center}" +
      "@media(min-width:760px){.vtx-overlay{align-items:center}}" +
      ".vtx-panel{background:#fff;width:100%;max-width:520px;height:92vh;border-radius:16px 16px 0 0;overflow:hidden;display:flex;flex-direction:column}" +
      "@media(min-width:760px){.vtx-panel{height:86vh;border-radius:16px}}" +
      ".vtx-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#0a0a0a;color:#fff;font:800 14px system-ui,Arial,sans-serif}" +
      ".vtx-head button{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1}" +
      ".vtx-frame{flex:1;border:none;width:100%}";
    document.head.appendChild(s);
  }

  function openRoom(garmentUrl) {
    closeRoom();
    var ov = document.createElement("div");
    ov.className = "vtx-overlay";
    ov.id = "vtx-overlay";
    var src = room + "?v=9&store=" + encodeURIComponent(location.hostname);
    if (garmentUrl) src += "&garment=" + encodeURIComponent(garmentUrl);
    ov.innerHTML =
      '<div class="vtx-panel"><div class="vtx-head"><span>Try-On ✦ VERTEX</span>' +
      '<button aria-label="Close">✕</button></div>' +
      '<iframe class="vtx-frame" allow="camera; microphone" src="' + src + '"></iframe></div>';
    ov.addEventListener("click", function (e) { if (e.target === ov) closeRoom(); });
    ov.querySelector("button").addEventListener("click", closeRoom);
    document.body.appendChild(ov);
    document.body.style.overflow = "hidden";
  }
  function closeRoom() {
    var ov = document.getElementById("vtx-overlay");
    if (ov) ov.remove();
    document.body.style.overflow = "";
  }

  /* Native integration: any element with [data-vtx-tryon="<garment url>"]
     opens the room — stores can hard-code their own Try-On buttons. */
  window.VTXTryOn = { open: openRoom, close: closeRoom };
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-vtx-tryon]") : null;
    if (!t) return;
    var g = t.getAttribute("data-vtx-tryon");
    if (!g) return;
    e.preventDefault(); e.stopPropagation();
    try { g = new URL(g, location.href).href; } catch (err) {}
    openRoom(g);
  }, true);

  function isGarment(img) {
    if (img.dataset.vtxDone) return false;
    var src = (img.currentSrc || img.src || "");
    if (!src || src.indexOf("data:") === 0) return false;
    if (/logo|avatar|icon|sprite|banner|hero|flag|payment|badge/i.test(src)) return false;
    var r = img.getBoundingClientRect();
    var w = Math.max(r.width, img.naturalWidth || 0);
    return w >= 280 && (img.naturalHeight || 0) >= 200;
  }

  function scan() {
    addStyle();
    var imgs = document.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        if (!isGarment(img)) return;
        img.dataset.vtxDone = "1";
        var parent = img.parentElement;
        if (!parent) return;
        if (parent.querySelector("[data-vtx-tryon]")) return; /* store has its own native button here */
        if (getComputedStyle(parent).position === "static") parent.classList.add("vtx-wrap");
        var b = document.createElement("button");
        b.className = "vtx-btn";
        b.textContent = "✦ Try-On";
        b.addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();
          openRoom(img.currentSrc || img.src);
        });
        parent.appendChild(b);
      })(imgs[i]);
    }
    if (!document.getElementById("vtx-pill")) {
      var p = document.createElement("button");
      p.className = "vtx-pill";
      p.id = "vtx-pill";
      p.textContent = "✦ AI Fitting Room";
      p.addEventListener("click", function () { openRoom(""); });
      document.body.appendChild(p);
    }
  }

  var t;
  function schedule() { clearTimeout(t); t = setTimeout(scan, 400); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
