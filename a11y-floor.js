/* Mobile accessibility floor.
 *
 * Hand-picked selectors never survive 15 different markups, so this measures
 * what is actually rendered and raises only what falls short: 44px interactive
 * boxes (Apple/Material consensus; WCAG 2.2 asks 24) and 12px text.
 *
 * It only ever increases a value. Runs once at mobile widths, after layout.
 */
(function () {
  var MIN_BOX = 44, MIN_TEXT = 12, BREAK = 767;
  if (!window.matchMedia || !matchMedia('(max-width: ' + BREAK + 'px)').matches) return;

  /* Deliberately does NOT treat opacity:0 as hidden. Scroll-reveal sections
     start transparent, and skipping them left everything below the fold
     untouched — which is most of the page. */
  function visible(el) {
    var s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function run() {
    // --- interactive boxes -------------------------------------------------
    var nodes = document.querySelectorAll('a,button,[role="button"],select,textarea');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!visible(el)) continue;

      var r = el.getBoundingClientRect();
      if (r.height >= MIN_BOX && r.width >= MIN_BOX) continue;

      // a link wrapped around a block of copy is already easy to hit
      if (r.height >= MIN_BOX && r.width > 120) continue;

      var s = getComputedStyle(el);
      if (r.height < MIN_BOX) {
        el.style.minHeight = MIN_BOX + 'px';
        if (s.display === 'inline') el.style.display = 'inline-flex';
        el.style.alignItems = 'center';
      }
      // only widen things that are icon-sized; never stretch a text link
      if (r.width < MIN_BOX && r.width < 90 && (el.textContent || '').trim().length <= 3) {
        el.style.minWidth = MIN_BOX + 'px';
        el.style.justifyContent = 'center';
        if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-flex';
      }
    }

    // --- text --------------------------------------------------------------
    var all = document.body.querySelectorAll('*');
    for (var j = 0; j < all.length; j++) {
      var e = all[j];
      var hasText = false;
      for (var k = 0; k < e.childNodes.length; k++) {
        var n = e.childNodes[k];
        if (n.nodeType === 3 && n.textContent.trim()) { hasText = true; break; }
      }
      if (!hasText || !visible(e)) continue;
      var fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs && fs < MIN_TEXT) e.style.fontSize = MIN_TEXT + 'px';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { requestAnimationFrame(run); });
  } else {
    requestAnimationFrame(run);
  }
  // webfonts change metrics; re-check once they land
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
})();
