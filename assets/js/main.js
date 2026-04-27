(function () {
  "use strict";

  var root = document.documentElement;
  var themeStorageKey = "as-theme";
  var savedTheme = localStorage.getItem(themeStorageKey);
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  function resolveTheme() {
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return prefersDark ? "dark" : "light";
  }

  function setTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (persist) {
      localStorage.setItem(themeStorageKey, theme);
    }

    var icon = theme === "dark" ? "sun" : "moon";
    var label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
      btn.textContent = icon;
    });
  }

  setTheme(resolveTheme(), false);

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(nextTheme, true);
    });
  });

  var navToggle = document.querySelector("[data-nav-toggle]");
  var navLinks = document.querySelector("[data-nav-links]");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", function (event) {
      var clickedInside = navLinks.contains(event.target) || navToggle.contains(event.target);
      if (!clickedInside) {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var currentPath = window.location.pathname.split("/").pop() || "home.html";
  if (currentPath === "") {
    currentPath = "home.html";
  }

  document.querySelectorAll("[data-nav-links] a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href) {
      return;
    }

    if (href === currentPath || (currentPath === "index.html" && href === "home.html")) {
      link.classList.add("is-active");
    }
  });

  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && revealItems.length > 0) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          var delay = Number(entry.target.getAttribute("data-delay") || "0");
          setTimeout(function () {
            entry.target.classList.add("is-visible");
          }, delay);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 320) {
        backToTop.classList.add("is-visible");
      } else {
        backToTop.classList.remove("is-visible");
      }
    });

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }

  function buildPdfSummary() {
    var points = Array.prototype.slice.call(document.querySelectorAll("[data-pdf-point]"));
    if (points.length === 0) {
      return [
        "Applied Statistics portfolio overview",
        "Includes concept summaries, worked examples, and lab implementations.",
      ];
    }

    return points
      .map(function (item) {
        return item.textContent.trim();
      })
      .filter(Boolean)
      .slice(0, 12);
  }

  function downloadPdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      window.print();
      return;
    }

    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var pageTitle = document.body.getAttribute("data-page-title") || document.title;
    var owner = document.body.getAttribute("data-owner") || "Akash";
    var y = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Applied Statistics Portfolio", 14, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Owner: " + owner, 14, y);
    y += 8;
    doc.text("Page: " + pageTitle, 14, y);
    y += 10;

    var summary = buildPdfSummary();
    doc.setFontSize(10.5);
    summary.forEach(function (line) {
      var wrapped = doc.splitTextToSize("- " + line, 180);
      wrapped.forEach(function (segment) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(segment, 14, y);
        y += 6;
      });
    });

    y += 6;
    doc.setFontSize(9);
    doc.text("Generated on: " + new Date().toLocaleString(), 14, y);
    doc.save(slugify(pageTitle) + "-summary.pdf");
  }

  document.querySelectorAll(".js-download-pdf").forEach(function (btn) {
    btn.addEventListener("click", downloadPdf);
  });

  document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-copy-target");
      var target = document.getElementById(targetId);
      if (!target) {
        return;
      }

      navigator.clipboard
        .writeText(target.textContent)
        .then(function () {
          var original = btn.textContent;
          btn.textContent = "Copied";
          setTimeout(function () {
            btn.textContent = original;
          }, 1200);
        })
        .catch(function () {
          btn.textContent = "Copy failed";
        });
    });
  });
})();
