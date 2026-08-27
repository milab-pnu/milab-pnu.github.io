/* 강의 노트 좌측 목차의 현재 섹션 추적. 의존성 없음.
   public/ 정적 파일 → 같은 출처에서 서빙되어 script-src 'self' 통과 (번들·인라인 아님).
   src/components/lecture/LectureNav.astro 가 <script is:inline src> 로 불러온다. */
(function () {
  "use strict";
  function init() {
    var nav = document.querySelector(".lecture-nav");
    if (!nav) return;

    var links = new Map();
    nav.querySelectorAll("a[href^='#']").forEach(function (a) {
      links.set(decodeURIComponent(a.hash.slice(1)), a);
    });

    var headings = [];
    links.forEach(function (_a, id) {
      var el = document.getElementById(id);
      if (el) headings.push(el);
    });
    if (headings.length === 0) return;

    var current = null;
    function setCurrent(id) {
      if (id === current) return;
      if (current && links.get(current)) links.get(current).removeAttribute("aria-current");
      if (id && links.get(id)) links.get(id).setAttribute("aria-current", "true");
      current = id;
    }

    var seen = new Set();
    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (e.isIntersecting) seen.add(e.target.id);
          else seen.delete(e.target.id);
        }
        for (var j = 0; j < headings.length; j++) {
          if (seen.has(headings[j].id)) {
            setCurrent(headings[j].id);
            break;
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );
    headings.forEach(function (h) {
      observer.observe(h);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
