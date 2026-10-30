/* ============================================================
   Personal Website — interactions
   Mobile nav · scroll reveal · project filters · contact form
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Mobile navigation toggle ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the menu after tapping a link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal elements on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Projects filter ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      projectCards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- Contact form: save message to Supabase ---------- */
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    const status = document.querySelector("#form-status");

    const SUPABASE_URL = "https://obxnrmhawsoowvlbqwkl.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY =
      "sb_publishable_uwrL4juhUsAZyDmyyRDLKw_QF5xQrxW";

    let supabase = null;
    if (window.supabase) {
      try {
        supabase = window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_PUBLISHABLE_KEY
        );
      } catch (err) {
        console.error("Supabase init failed:", err);
      }
    }

    function setStatus(text, type) {
      status.textContent = text;
      if (type === "success") {
        status.style.background = "#e2ecdf";
        status.style.color = "#4e6e4b";
      } else if (type === "error") {
        status.style.background = "#fde2e2";
        status.style.color = "#9c3f3f";
      } else {
        status.style.background = "#e2ecf0";
        status.style.color = "#3f5b9c";
      }
      status.classList.add("show");
    }

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = new FormData(contactForm);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();

      if (!name || !email || !message) {
        setStatus("Please fill in all required fields before sending.", "error");
        return;
      }

      if (!supabase) {
        setStatus(
          "Contact service is unavailable right now. Please email me directly at the address shown on the left.",
          "error"
        );
        return;
      }

      setStatus("Sending your message…", "info");

      try {
        const { error } = await supabase.from("contacts").insert({
          name,
          email,
          message,
        });

        if (error) throw error;

        setStatus(
          "Thanks! Your message has been sent. I'll get back to you soon.",
          "success"
        );
        contactForm.reset();
      } catch (err) {
        console.error("Contact form submit failed:", err);
        setStatus(
          "Sorry, something went wrong. Please email me directly at the address shown on the left.",
          "error"
        );
      }
    });
  }
});
