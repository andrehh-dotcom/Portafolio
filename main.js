const root = document.documentElement;
root.classList.add("js");

const createMediaQuery = (query) => {
  if (typeof window.matchMedia === "function") return window.matchMedia(query);
  return { matches: false, addEventListener() {} };
};

const prefersReducedMotion = createMediaQuery("(prefers-reduced-motion: reduce)");
const finePointer = createMediaQuery("(hover: hover) and (pointer: fine)");

const safeStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // El sitio sigue funcionando si el navegador bloquea el almacenamiento local.
    }
  },
};

function initializeCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
}

function initializeProfileImage() {
  const image = document.querySelector("[data-profile-image]");
  const container = document.querySelector("[data-profile-photo]");

  if (!image || !container) return;

  const showImage = () => {
    container.classList.add("is-image-loaded");
  };

  image.addEventListener("load", showImage, { once: true });

  if (image.complete && image.naturalWidth > 0) {
    showImage();
  }
}

function initializeHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

function initializeNavigationMenu() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");

  if (!menuButton || !navigation) return;

  const focusableSelector = "a[href], button:not([disabled])";

  const setMenuState = (isOpen) => {
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    navigation.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  };

  const closeMenu = () => setMenuState(false);

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);

    if (!isOpen) {
      window.setTimeout(() => navigation.querySelector(focusableSelector)?.focus(), 0);
    }
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
      window.setTimeout(() => menuButton.focus(), 0);
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInside =
      navigation.contains(event.target) || menuButton.contains(event.target);
    if (!clickedInside && menuButton.getAttribute("aria-expanded") === "true") closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      menuButton.focus();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = [...navigation.querySelectorAll(focusableSelector)];
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  const desktopQuery = createMediaQuery("(min-width: 901px)");
  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  }
}

function initializeTheme() {
  const themeButtons = [...document.querySelectorAll("[data-theme-toggle]")];
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const getTheme = () => root.dataset.theme === "light" ? "light" : "dark";

  const syncThemeControls = () => {
    const currentTheme = getTheme();
    const nextTheme = currentTheme === "dark" ? "claro" : "oscuro";

    themeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(currentTheme === "light"));
      button.setAttribute("aria-label", `Cambiar a modo ${nextTheme}`);
      button.setAttribute("title", `Cambiar a modo ${nextTheme}`);
    });

    if (themeMeta) {
      themeMeta.setAttribute("content", currentTheme === "dark" ? "#0a0a0f" : "#f4f5fa");
    }
  };

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = getTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = nextTheme;
      safeStorage.set("portfolio-theme", nextTheme);
      syncThemeControls();
    });
  });

  syncThemeControls();
}

function initializeRevealAnimations() {
  const revealElements = [...document.querySelectorAll(".reveal")];

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px",
    },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

function initializeActiveNavigation() {
  const links = [...document.querySelectorAll(".nav-link")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  let scheduled = false;

  const updateActiveLink = () => {
    const marker = window.scrollY + Math.min(window.innerHeight * 0.32, 260);
    let activeSection = sections[0];

    sections.forEach((section) => {
      if (section.offsetTop <= marker) activeSection = section;
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
      activeSection = sections[sections.length - 1];
    }

    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeSection.id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });

    scheduled = false;
  };

  const requestUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateActiveLink);
  };

  updateActiveLink();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
}

function initializeTiltEffect() {
  const visual = document.querySelector("[data-tilt]");
  if (!visual || prefersReducedMotion.matches || !finePointer.matches) return;

  let animationFrame = null;

  visual.addEventListener("pointermove", (event) => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);

    animationFrame = window.requestAnimationFrame(() => {
      const bounds = visual.getBoundingClientRect();
      const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
      const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
      const tiltX = (vertical * -5).toFixed(2);
      const tiltY = (horizontal * 6).toFixed(2);
      visual.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
  });

  visual.addEventListener("pointerleave", () => {
    visual.style.removeProperty("transform");
  });
}

function initializeCounters() {
  const counters = [...document.querySelectorAll("[data-counter]")];

  const animateCounter = (element) => {
    const target = Number(element.dataset.counter);
    const suffix = element.dataset.suffix || "";
    const duration = 650;
    const start = performance.now();

    const draw = (currentTime) => {
      const progress = Math.min((currentTime - start) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * easedProgress)}${suffix}`;

      if (progress < 1) window.requestAnimationFrame(draw);
    };

    window.requestAnimationFrame(draw);
  };

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) return;

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.7 },
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

function initializeContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const fields = [...form.querySelectorAll("input:not(.honeypot), textarea")];
  const submitButton = form.querySelector('button[type="submit"]');
  const buttonLabel = form.querySelector("[data-button-label]");
  const formStatus = form.querySelector("[data-form-status]");
  const honeypot = form.querySelector('[name="company"]');

  const showStatus = (message, type = "") => {
    formStatus.textContent = message;
    formStatus.className = "form-status";
    if (type) formStatus.classList.add(`is-${type}`);
  };

  const validateField = (field) => {
    const fieldWrapper = field.closest(".form-field");
    field.setCustomValidity("");

    const trimmedValue = field.value.trim();
    const minimumLength = Number(field.getAttribute("minlength") || 0);
    const hasValue = !field.required || trimmedValue.length > 0;
    const hasMinimumLength = minimumLength === 0 || trimmedValue.length >= minimumLength;
    let isValid = field.checkValidity() && hasValue && hasMinimumLength;

    if (!isValid && field.value.length > 0 && field.checkValidity()) {
      field.setCustomValidity("Revisa este campo.");
      isValid = false;
    }

    fieldWrapper.classList.toggle("has-error", !isValid);
    field.setAttribute("aria-invalid", String(!isValid));
    return isValid;
  };

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      if (field.value.length > 0) validateField(field);
    });

    field.addEventListener("input", () => {
      if (field.closest(".form-field").classList.contains("has-error")) validateField(field);
      if (formStatus.textContent) showStatus("");
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = fields.map(validateField).every(Boolean);

    if (!isValid) {
      showStatus("Revisa los campos señalados antes de continuar.", "error");
      form.querySelector(".has-error input, .has-error textarea")?.focus();
      return;
    }

    if (honeypot?.value) {
      showStatus("Mensaje preparado.", "success");
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const emailSubject = `${subject} — ${name}`;
    const emailBody = [
      `Hola Orlando,`,
      "",
      message,
      "",
      `Enviado por: ${name}`,
      `Correo: ${email}`,
    ].join("\n");

    const mailtoUrl = `mailto:ohuapayah@autonoma.edu.pe?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    submitButton.classList.add("is-loading");
    submitButton.disabled = true;
    buttonLabel.textContent = "Preparando mensaje...";
    showStatus("Abriendo tu aplicación de correo...");

    window.setTimeout(() => {
      window.location.href = mailtoUrl;
      buttonLabel.textContent = "Mensaje preparado";
      showStatus("Se abrirá tu aplicación de correo para enviar el mensaje.", "success");

      window.setTimeout(() => {
        submitButton.classList.remove("is-loading");
        submitButton.disabled = false;
        buttonLabel.textContent = "Enviar mensaje";
      }, 1800);
    }, 450);
  });
}

initializeCurrentYear();
initializeRevealAnimations();
initializeProfileImage();
initializeHeader();
initializeNavigationMenu();
initializeTheme();
initializeActiveNavigation();
initializeTiltEffect();
initializeCounters();
initializeContactForm();
