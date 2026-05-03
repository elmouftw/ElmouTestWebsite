// Trend Chaser — daily POD report
// Provides: copyPrompt, toggleSection, toggleCal, copyCalPrompt, copyTrendPrompt

(function () {
  "use strict";

  /**
   * Copy `text` to clipboard with a non-secure-context fallback so it works
   * over HTTP / file:// during local testing.
   */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        ta.setAttribute("readonly", "");
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) resolve(); else reject(new Error("execCommand failed"));
      } catch (err) {
        reject(err);
      }
    });
  }

  function flashCopied(btn) {
    var orig = btn.dataset.origText || btn.textContent;
    btn.dataset.origText = orig;
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(function () {
      btn.textContent = orig;
      btn.classList.remove("copied");
    }, 2000);
  }

  function flashCopiedFancy(btn) {
    var orig = btn.dataset.origText || btn.textContent;
    btn.dataset.origText = orig;
    btn.textContent = "\u2705 Copied!";
    btn.classList.add("copied");
    setTimeout(function () {
      btn.textContent = orig;
      btn.classList.remove("copied");
    }, 2200);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  function copyPrompt(id, btn) {
    var el = document.getElementById(id);
    if (!el) return;
    copyText(el.innerText).then(function () { flashCopied(btn); }).catch(function () {
      btn.textContent = "Copy failed";
    });
  }

  function toggleSection(id) {
    var body = document.getElementById(id);
    var caret = document.getElementById(id + "_caret");
    if (!body) return;
    var isHidden = body.classList.toggle("hidden");
    if (caret) caret.textContent = isHidden ? "\u25B6" : "\u25BC";
  }

  function toggleCal(el) {
    el.classList.toggle("open");
  }

  function copyCalPrompt(btn, evt) {
    var ev = evt || window.event;
    if (ev && typeof ev.stopPropagation === "function") ev.stopPropagation();
    var text = btn.getAttribute("data-prompt") || "";
    copyText(text)
      .then(function () { flashCopiedFancy(btn); })
      .catch(function () { btn.textContent = "\u2713"; });
  }

  function copyTrendPrompt(btn, evt) {
    var ev = evt || window.event;
    if (ev && typeof ev.stopPropagation === "function") ev.stopPropagation();
    var text = btn.getAttribute("data-prompt") || "";
    copyText(text)
      .then(function () { flashCopiedFancy(btn); })
      .catch(function () { btn.textContent = "\u2713"; });
  }

  // Inline-onclick "Copy" buttons in the variation block use
  // navigator.clipboard.writeText('…') directly. Provide a global shim that
  // monkey-patches it to use our copyText fallback, so http/local works.
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: copyText },
      configurable: true,
    });
  } else if (!window.isSecureContext) {
    var orig = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = function (t) {
      return copyText(t).catch(function () { return orig(t); });
    };
  }

  window.copyPrompt = copyPrompt;
  window.toggleSection = toggleSection;
  window.toggleCal = toggleCal;
  window.copyCalPrompt = copyCalPrompt;
  window.copyTrendPrompt = copyTrendPrompt;
})();
