/* =========================================================================
   Rayyan Enterprises — main.js
   ========================================================================= */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Sticky header ---------------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Mobile nav ---------------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (navToggle && mobileMenu) {
    const closeMenu = () => {
      navToggle.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    };

    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      mobileMenu.classList.toggle("is-open", !expanded);
      document.body.classList.toggle("nav-open", !expanded);
    });

    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) closeMenu();
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) closeMenu();
    });
  }

  /* ---------------- Active nav ---------------- */
  const currentPage = document.body.dataset.page;
  if (currentPage) {
    document.querySelectorAll(`a[data-nav="${currentPage}"]`).forEach((a) => {
      a.setAttribute("aria-current", "page");
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------------- Animated counters ---------------- */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length) {
    const animateCounter = (el) => {
      const raw = el.dataset.counter.replace(/,/g, "");
      const target = parseFloat(raw);
      const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
      const suffix = el.dataset.suffix || "";
      const duration = 1400;
      const start = performance.now();

      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) + suffix;
        return;
      }

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              cio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      counters.forEach((el) => cio.observe(el));
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------------- Meter / bar animations ---------------- */
  const meters = document.querySelectorAll("[data-meter]");
  if (meters.length) {
    const runMeter = (el) => {
      const val = el.dataset.meter;
      const fill = el.querySelector(".meter-fill");
      const bar = el.classList.contains("bar") ? el : null;
      requestAnimationFrame(() => {
        if (fill) fill.style.width = val + "%";
        if (bar) bar.style.height = val + "%";
      });
    };
    if ("IntersectionObserver" in window) {
      const mio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runMeter(entry.target);
              mio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      meters.forEach((el) => mio.observe(el));
    } else {
      meters.forEach(runMeter);
    }
  }

  /* ---------------- Back to top ---------------- */
  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => backToTop.classList.toggle("is-visible", window.scrollY > 500),
      { passive: true }
    );
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------- Toast ---------------- */
  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg><span></span>`;
      document.body.appendChild(toast);
    }
    toast.querySelector("span").textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }
  window.RayyanToast = showToast;

  /* ---------------- Simple email forms ---------------- */
  document.querySelectorAll("form[data-simple-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type=email]");
      if (input && !input.checkValidity()) {
        input.reportValidity();
        return;
      }
      showToast("Thanks — our team will reach out within one business day.");
      form.reset();
    });
  });

  /* ---------------- Chip toggles ---------------- */
  document.querySelectorAll(".chip.is-toggle").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("is-active");
      chip.setAttribute("aria-pressed", chip.classList.contains("is-active") ? "true" : "false");
    });
  });

  /* ---------------- Accepted items filter ---------------- */
  const filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    const buttons = filterBar.querySelectorAll("[data-filter]");
    const cards = document.querySelectorAll("[data-category]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const filter = btn.dataset.filter;
        cards.forEach((card) => {
          const show = filter === "all" || card.dataset.category === filter;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---------------- Request pickup wizard ---------------- */
  const wizard = document.querySelector("[data-wizard]");
  if (wizard) {
    const steps = Array.from(wizard.querySelectorAll(".form-step"));
    const bars = Array.from(wizard.querySelectorAll(".step-bar"));
    const labels = Array.from(wizard.querySelectorAll(".form-steps-labels span"));
    const nextBtns = wizard.querySelectorAll("[data-action='next']");
    const prevBtns = wizard.querySelectorAll("[data-action='prev']");
    const draftBtn = wizard.querySelector("[data-action='save-draft']");
    const submitBtn = wizard.querySelector("[data-action='submit']");
    let current = 0;
    const DRAFT_KEY = "rayyan_pickup_draft";

    function updateProgress() {
      bars.forEach((bar, i) => {
        bar.classList.toggle("is-done", i < current);
        bar.classList.toggle("is-active", i <= current);
      });
      labels.forEach((label, i) => label.classList.toggle("is-active", i === current));
    }

    function showStep(index, options = {}) {
      const { scroll = true } = options;
      steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
      current = index;
      updateProgress();
      if (scroll) {
        wizard.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
      if (index === steps.length - 1) buildReview();
    }

    function validateStep(index) {
      const step = steps[index];
      const requiredFields = step.querySelectorAll("[required]");
      let valid = true;
      requiredFields.forEach((field) => {
        const fieldWrap = field.closest(".field") || field.parentElement;
        if (!field.checkValidity()) {
          valid = false;
          fieldWrap.classList.add("has-error");
        } else {
          fieldWrap.classList.remove("has-error");
        }
      });
      if (!valid) {
        const firstInvalid = step.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
      }
      return valid;
    }

    function buildReview() {
      const reviewEl = wizard.querySelector("[data-review]");
      if (!reviewEl) return;
      const data = collectData();
      const rows = [
        ["Company", data.company],
        ["Industry", data.industry],
        ["Estimated volume", data.volume ? `${data.volume} kg` : "—"],
        ["Hardware type", data.hardwareType],
        ["Materials", data.materials.join(", ") || "None specified"],
        ["Pickup address", data.address],
        ["Preferred date", data.date],
        ["Contact email", data.email],
      ];
      reviewEl.innerHTML = rows
        .map(([label, value]) => `<div class="review-row"><dt>${label}</dt><dd>${value ? escapeHtml(String(value)) : "—"}</dd></div>`)
        .join("");
    }

    function escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    function collectData() {
      const get = (name) => wizard.querySelector(`[name="${name}"]`)?.value || "";
      const materials = Array.from(wizard.querySelectorAll(".chip.is-toggle.is-active")).map((c) => c.dataset.material);
      return {
        company: get("company"),
        industry: get("industry"),
        volume: get("volume"),
        hardwareType: get("hardwareType"),
        materials,
        address: get("address"),
        date: get("date"),
        email: get("email"),
      };
    }

    nextBtns.forEach((btn) =>
      btn.addEventListener("click", () => {
        if (!validateStep(current)) return;
        if (current < steps.length - 1) showStep(current + 1, { scroll: true });
      })
    );
    prevBtns.forEach((btn) =>
      btn.addEventListener("click", () => {
        if (current > 0) showStep(current - 1, { scroll: true });
      })
    );
    if (draftBtn) {
      draftBtn.addEventListener("click", () => {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(collectData()));
          showToast("Draft saved on this device.");
        } catch {
          showToast("Could not save draft in this browser.");
        }
      });
    }
    if (submitBtn) {
      submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!validateStep(current)) return;
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        wizard.querySelector("[data-wizard-body]").style.display = "none";
        wizard.querySelector("[data-success]").hidden = false;
        showToast("Pickup request submitted.");
      });
    }

    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([key, val]) => {
          if (key === "materials") return;
          const field = wizard.querySelector(`[name="${key}"]`);
          if (field && val) field.value = val;
        });
        if (Array.isArray(data.materials)) {
          data.materials.forEach((m) => {
            const chip = wizard.querySelector(`.chip[data-material="${m}"]`);
            if (chip) chip.classList.add("is-active");
          });
        }
      }
    } catch { /* ignore */ }

    showStep(0, { scroll: false });
  }

  /* ---------------- Footer year ---------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
