const projectCards = [...document.querySelectorAll(".project-card:not([hidden])")];
const track = document.querySelector(".orbit-track");
const preview = document.querySelector(".project-preview");
const previewLabel = preview.querySelector(".project-preview__label");
const previewCount = preview.querySelector(".project-preview__count");
const previewTitle = preview.querySelector("h2");
const previewDescription = preview.querySelector("p:not(.project-preview__label)");
const intro = document.querySelector(".intro");
const introText = document.querySelector(".intro__text");
const introMessage = "Harmonizing mind, body, and soul.";
const DEFAULT_TRACK_SPEED = 32;
const HOVER_TRACK_SPEED = 16;

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo({ top: 0, left: 0, behavior: "auto" });

const gradientClasses = {
  aurora: "gradient--aurora",
  sunset: "gradient--sunset",
  lagoon: "gradient--lagoon",
  lilac: "gradient--lilac",
};

const projects = projectCards.map((card) => ({
  id: card.id,
  number: card.dataset.number,
  category: card.dataset.category,
  title: card.dataset.title,
  description: card.dataset.description,
  image: card.dataset.image,
  imagePosition: card.dataset.imagePosition,
  gradient: card.dataset.gradient,
}));
const projectTotal = String(projects.length).padStart(2, "0");

const projectNavigator = document.createElement("aside");
projectNavigator.className = "project-navigator is-collapsed";
projectNavigator.setAttribute("aria-label", "Project navigation");

const navigatorToggle = document.createElement("button");
navigatorToggle.className = "project-navigator__toggle";
navigatorToggle.type = "button";
navigatorToggle.dataset.current = "01";
navigatorToggle.setAttribute("aria-expanded", "false");
navigatorToggle.setAttribute("aria-controls", "project-navigator-panel");
navigatorToggle.setAttribute("aria-label", "Open project navigator");
navigatorToggle.innerHTML = `
  <span class="project-navigator__current-number">01</span>
  <span class="project-navigator__toggle-label">Projects</span>
  <span class="project-navigator__chevron" aria-hidden="true">‹</span>
`;

const navigatorPanel = document.createElement("div");
navigatorPanel.className = "project-navigator__panel";
navigatorPanel.id = "project-navigator-panel";
navigatorPanel.innerHTML = `
  <div class="project-navigator__heading">
    <div>
      <p>Project navigator 🚩</p>
      <span>${projectTotal} sections</span>
    </div>
    <button type="button" class="project-navigator__close" aria-label="Close project navigator">×</button>
  </div>
  <div class="project-navigator__status" aria-live="polite">
    <span>Now viewing</span>
    <strong>01 · ${projects[0]?.title || "About Me"}</strong>
  </div>
  <nav aria-label="Jump to a project"><ol></ol></nav>
  <a class="project-navigator__top" href="#top">Back to top <span aria-hidden="true">↑</span></a>
`;

const navigatorList = navigatorPanel.querySelector("ol");
const navigatorStatus = navigatorPanel.querySelector(".project-navigator__status strong");
const navigatorNumber = navigatorToggle.querySelector(".project-navigator__current-number");
const navigatorClose = navigatorPanel.querySelector(".project-navigator__close");
const navigatorTop = navigatorPanel.querySelector(".project-navigator__top");
const navigatorHeaderTrigger = document.querySelector("#project-navigator-trigger");
const navigatorLinks = new Map();

let projectScrollFrame = 0;
let projectScrollRestore = "";

function cancelProjectScroll() {
  if (!projectScrollFrame) return;
  cancelAnimationFrame(projectScrollFrame);
  projectScrollFrame = 0;
  document.documentElement.style.scrollBehavior = projectScrollRestore;
}

function animateProjectScroll(getDestination, onComplete) {
  cancelProjectScroll();

  const root = document.documentElement;
  projectScrollRestore = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";

  const start = window.scrollY;
  const initialDestination = getDestination();
  const distance = initialDestination - start;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reduceMotion
    ? 0
    : Math.min(820, 420 + Math.sqrt(Math.abs(distance)) * 1.8);

  if (!duration || Math.abs(distance) < 2) {
    window.scrollTo(0, getDestination());
    root.style.scrollBehavior = projectScrollRestore;
    onComplete();
    return;
  }

  const startedAt = performance.now();
  const step = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const destination = getDestination();
    window.scrollTo(0, start + (destination - start) * eased);

    if (progress < 1) {
      projectScrollFrame = requestAnimationFrame(step);
      return;
    }

    window.scrollTo(0, getDestination());
    projectScrollFrame = 0;
    root.style.scrollBehavior = projectScrollRestore;
    onComplete();
  };

  projectScrollFrame = requestAnimationFrame(step);
}

function navigateToProject(target) {
  if (!target) return;

  history.replaceState(null, "", `#${target.id}`);
  animateProjectScroll(
    () => Math.max(0, window.scrollY + target.getBoundingClientRect().top - 12),
    () => {
      target.focus({ preventScroll: true });
      target.classList.add("is-targeted");
      window.setTimeout(() => target.classList.remove("is-targeted"), 1200);
      updateNavigatorPosition();
    },
  );
}

window.addEventListener("wheel", cancelProjectScroll, { passive: true });
window.addEventListener("touchstart", cancelProjectScroll, { passive: true });

projects.forEach((project) => {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = `#${project.id}`;
  link.innerHTML = `<span>${project.number}</span><strong>${project.title}</strong>`;
  link.setAttribute("aria-label", `Go to ${project.number}. ${project.title}`);
  item.append(link);
  navigatorList.append(item);
  navigatorLinks.set(project.id, link);

  link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.getElementById(project.id);
    if (!target) return;

    navigateToProject(target);

    if (window.matchMedia("(max-width: 760px)").matches) {
      setNavigatorOpen(false);
    }
  });
});

projectNavigator.append(navigatorToggle, navigatorPanel);
document.body.append(projectNavigator);

function setNavigatorOpen(isOpen) {
  projectNavigator.classList.toggle("is-collapsed", !isOpen);
  navigatorToggle.setAttribute("aria-expanded", String(isOpen));
  navigatorHeaderTrigger?.setAttribute("aria-expanded", String(isOpen));
  navigatorToggle.setAttribute(
    "aria-label",
    isOpen ? "Close project navigator" : "Open project navigator",
  );
}

let navigatorCollapseTimer = 0;
let suppressNavigatorFocusOpen = false;

function clearNavigatorCollapseTimer() {
  window.clearTimeout(navigatorCollapseTimer);
  navigatorCollapseTimer = 0;
}

function scheduleNavigatorCollapse() {
  clearNavigatorCollapseTimer();
  navigatorCollapseTimer = window.setTimeout(() => {
    setNavigatorOpen(false);
  }, 500);
}

projectNavigator.addEventListener("mouseenter", () => {
  clearNavigatorCollapseTimer();
  setNavigatorOpen(true);
});

projectNavigator.addEventListener("mouseleave", scheduleNavigatorCollapse);

projectNavigator.addEventListener(
  "pointermove",
  (event) => {
    const bounds = projectNavigator.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    projectNavigator.style.setProperty("--navigator-mist-x", `${x.toFixed(1)}%`);
    projectNavigator.style.setProperty("--navigator-mist-y", `${y.toFixed(1)}%`);
  },
  { passive: true },
);

projectNavigator.addEventListener("focusin", () => {
  if (suppressNavigatorFocusOpen) return;
  clearNavigatorCollapseTimer();
  setNavigatorOpen(true);
});

projectNavigator.addEventListener("focusout", (event) => {
  if (!projectNavigator.contains(event.relatedTarget)) scheduleNavigatorCollapse();
});

navigatorToggle.addEventListener("click", () => {
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
    setNavigatorOpen(navigatorToggle.getAttribute("aria-expanded") !== "true");
  } else {
    setNavigatorOpen(true);
  }
});

if (navigatorHeaderTrigger) {
  const openNavigatorFromHeader = () => {
    clearNavigatorCollapseTimer();
    setNavigatorOpen(true);
  };

  navigatorHeaderTrigger.addEventListener("mouseenter", openNavigatorFromHeader);
  navigatorHeaderTrigger.addEventListener("focus", openNavigatorFromHeader);
  navigatorHeaderTrigger.addEventListener("mouseleave", scheduleNavigatorCollapse);
  navigatorHeaderTrigger.addEventListener("blur", scheduleNavigatorCollapse);
  navigatorHeaderTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    openNavigatorFromHeader();
  });
}

navigatorClose.addEventListener("click", () => {
  clearNavigatorCollapseTimer();
  setNavigatorOpen(false);
  suppressNavigatorFocusOpen = true;
  navigatorToggle.focus();
  requestAnimationFrame(() => {
    suppressNavigatorFocusOpen = false;
  });
});

navigatorTop.addEventListener("click", (event) => {
  event.preventDefault();
  history.replaceState(null, "", "#top");
  document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (window.matchMedia("(max-width: 760px)").matches) setNavigatorOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigatorToggle.getAttribute("aria-expanded") === "true") {
    clearNavigatorCollapseTimer();
    setNavigatorOpen(false);
    suppressNavigatorFocusOpen = true;
    navigatorToggle.focus();
    requestAnimationFrame(() => {
      suppressNavigatorFocusOpen = false;
    });
  }
});

let activeNavigatorProject = "";
let navigatorScrollFrame = 0;

function updateNavigatorPosition() {
  navigatorScrollFrame = 0;
  const marker = Math.min(window.innerHeight * 0.34, 320);
  let currentCard = projectCards.find((card) => {
    const rect = card.getBoundingClientRect();
    return rect.top <= marker && rect.bottom > marker;
  });

  if (!currentCard) {
    currentCard = projectCards.reduce((closest, card) => {
      const distance = Math.abs(card.getBoundingClientRect().top - marker);
      return !closest || distance < closest.distance ? { card, distance } : closest;
    }, null)?.card;
  }

  if (!currentCard || currentCard.id === activeNavigatorProject) return;
  activeNavigatorProject = currentCard.id;
  const project = projects.find((entry) => entry.id === currentCard.id);
  if (!project) return;

  navigatorNumber.textContent = project.number;
  navigatorToggle.dataset.current = project.number;
  navigatorStatus.textContent = `${project.number} · ${project.title}`;
  navigatorLinks.forEach((link, id) => {
    const isActive = id === project.id;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
      link.scrollIntoView({ block: "nearest" });
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

window.addEventListener(
  "scroll",
  () => {
    if (!navigatorScrollFrame) {
      navigatorScrollFrame = requestAnimationFrame(updateNavigatorPosition);
    }
  },
  { passive: true },
);
window.addEventListener("resize", updateNavigatorPosition);
updateNavigatorPosition();

function createCoverCard(project, isDuplicate = false) {
  const link = document.createElement("a");
  link.className = "cover-card";
  link.href = `#${project.id}`;
  link.setAttribute("role", "listitem");
  link.setAttribute("aria-label", `${project.number}. ${project.title}`);

  if (isDuplicate) {
    link.setAttribute("aria-hidden", "true");
    link.tabIndex = -1;
  }

  if (project.image) {
    const image = document.createElement("img");
    image.src = project.image;
    image.alt = "";
    image.loading = "eager";
    if (project.imagePosition) {
      image.style.objectPosition = project.imagePosition;
    }
    link.append(image);
  } else {
    const visual = document.createElement("div");
    visual.className = `cover-card__gradient ${gradientClasses[project.gradient]}`;
    link.append(visual);
  }

  const title = document.createElement("span");
  title.className = "cover-card__title";
  title.textContent = project.title;

  const number = document.createElement("span");
  number.className = "cover-card__number";
  number.textContent = project.number;

  link.append(title, number);

  const showProject = () => {
    targetSpeed = HOVER_TRACK_SPEED;
    preview.classList.add("is-active");
    previewLabel.textContent = project.category;
    previewCount.textContent = `${project.number} / ${projectTotal}`;
    previewTitle.textContent = project.title;
    previewDescription.textContent = project.description;
  };

  const hideProject = () => {
    targetSpeed = DEFAULT_TRACK_SPEED;
    preview.classList.remove("is-active");
  };

  link.addEventListener("mouseenter", showProject);
  link.addEventListener("mouseleave", hideProject);
  link.addEventListener("focus", showProject);
  link.addEventListener("blur", hideProject);
  link.addEventListener("click", (event) => {
    event.preventDefault();
    hideProject();
    const target = document.getElementById(project.id);
    navigateToProject(target);
  });

  return link;
}

const firstGroup = document.createElement("div");
firstGroup.className = "orbit-group";
firstGroup.style.display = "flex";
firstGroup.style.gap = "26px";
firstGroup.style.paddingRight = "26px";

const secondGroup = firstGroup.cloneNode(false);
projects.forEach((project) => {
  firstGroup.append(createCoverCard(project));
  secondGroup.append(createCoverCard(project, true));
});
track.append(firstGroup, secondGroup);

document.querySelectorAll('a[href^="#project-"]:not(.cover-card)').forEach((link) => {
  if (link.closest(".project-navigator")) return;

  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    navigateToProject(target);
  });
});

let offset = 0;
let lastTime = performance.now();
let currentSpeed = DEFAULT_TRACK_SPEED;
let targetSpeed = DEFAULT_TRACK_SPEED;
let groupWidth = 0;
let isHeroVisible = true;
let hasSetInitialOrbitPosition = false;
const INITIAL_ORBIT_PROJECT_ID = "project-8";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function measureTrack() {
  groupWidth = firstGroup.getBoundingClientRect().width;
  if (groupWidth > 0) {
    offset %= groupWidth;
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }
}

function setInitialOrbitPosition(force = false) {
  if ((!force && hasSetInitialOrbitPosition) || groupWidth <= 0) return;

  const initialCard = firstGroup.querySelector(
    `.cover-card[href="#${INITIAL_ORBIT_PROJECT_ID}"]`,
  );
  const orbit = track.closest(".orbit");
  const stage = track.closest(".cover-stage");
  if (!initialCard || !orbit || !stage) return;

  const orbitTransform = new DOMMatrixReadOnly(getComputedStyle(orbit).transform);
  const projectedHorizontalScale = Math.abs(orbitTransform.a) || 1;
  const cardLeft = initialCard.getBoundingClientRect().left;
  const stageLeft = stage.getBoundingClientRect().left;

  offset = (offset + (cardLeft - stageLeft) / projectedHorizontalScale) % groupWidth;
  track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  hasSetInitialOrbitPosition = true;
}

function animateTrack(time) {
  const elapsed = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  currentSpeed += (targetSpeed - currentSpeed) * Math.min(elapsed * 5, 1);

  if (
    !reduceMotion.matches &&
    groupWidth > 0 &&
    isHeroVisible &&
    !document.body.classList.contains("is-intro")
  ) {
    offset = (offset + currentSpeed * elapsed) % groupWidth;
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }

  requestAnimationFrame(animateTrack);
}

track.addEventListener("mouseenter", () => {
  targetSpeed = HOVER_TRACK_SPEED;
});
track.addEventListener("mouseleave", () => {
  targetSpeed = DEFAULT_TRACK_SPEED;
  preview.classList.remove("is-active");
});
track.addEventListener("focusin", () => {
  targetSpeed = HOVER_TRACK_SPEED;
});
track.addEventListener("focusout", (event) => {
  if (!track.contains(event.relatedTarget)) {
    targetSpeed = DEFAULT_TRACK_SPEED;
    preview.classList.remove("is-active");
  }
});

const heroObserver = new IntersectionObserver(
  ([entry]) => {
    isHeroVisible = entry.isIntersecting;
    lastTime = performance.now();
    if (isHeroVisible) {
      measureTrack();
      preview.classList.remove("is-active");
    }
  },
  { threshold: 0.01 },
);
heroObserver.observe(document.querySelector(".hero"));

const profileBlocks = [...document.querySelectorAll(".profile-block")];
if (!reduceMotion.matches && "IntersectionObserver" in window) {
  document.documentElement.classList.add("profile-motion-ready");
  const profileObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  profileBlocks.forEach((block) => profileObserver.observe(block));
} else {
  profileBlocks.forEach((block) => block.classList.add("is-visible"));
}

const academicTabs = [...document.querySelectorAll("[data-academic-target]")];
const academicPanels = [...document.querySelectorAll(".academic-panel")];

function activateAcademicPanel(panelId, { updateHash = false, scroll = false } = {}) {
  const selectedPanel = document.getElementById(panelId);
  if (!selectedPanel || !academicPanels.includes(selectedPanel)) return;

  academicPanels.forEach((panel) => {
    const isActive = panel === selectedPanel;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });

  academicTabs.forEach((tab) => {
    const isActive = tab.dataset.academicTarget === panelId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  if (updateHash) {
    history.replaceState(null, "", `#${panelId}`);
  }

  if (scroll) {
    selectedPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

academicTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    activateAcademicPanel(tab.dataset.academicTarget, {
      updateHash: true,
      scroll: true,
    });
  });

  tab.addEventListener("keydown", (event) => {
    const keyDirections = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };

    let nextIndex = index;
    if (event.key in keyDirections) {
      nextIndex = (index + keyDirections[event.key] + academicTabs.length) % academicTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = academicTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = academicTabs[nextIndex];
    nextTab.focus();
    activateAcademicPanel(nextTab.dataset.academicTarget, {
      updateHash: true,
      scroll: true,
    });
  });
});

const initialAcademicPanel = window.location.hash.slice(1);
if (academicPanels.some((panel) => panel.id === initialAcademicPanel)) {
  activateAcademicPanel(initialAcademicPanel);
}

const literacyTabs = [...document.querySelectorAll("[data-literacy-target]")];
const literacyPanels = [...document.querySelectorAll(".literacy-panel")];

function activateLiteracyPanel(panelId, { updateHash = false, scroll = false } = {}) {
  const selectedPanel = document.getElementById(panelId);
  if (!selectedPanel || !literacyPanels.includes(selectedPanel)) return;

  literacyPanels.forEach((panel) => {
    const isActive = panel === selectedPanel;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });

  literacyTabs.forEach((tab) => {
    const isActive = tab.dataset.literacyTarget === panelId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  if (updateHash) {
    history.replaceState(null, "", `#${panelId}`);
  }

  if (scroll) {
    selectedPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

literacyTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    activateLiteracyPanel(tab.dataset.literacyTarget, {
      updateHash: true,
      scroll: true,
    });
  });

  tab.addEventListener("keydown", (event) => {
    const keyDirections = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };

    let nextIndex = index;
    if (event.key in keyDirections) {
      nextIndex = (index + keyDirections[event.key] + literacyTabs.length) % literacyTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = literacyTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = literacyTabs[nextIndex];
    nextTab.focus();
    activateLiteracyPanel(nextTab.dataset.literacyTarget, {
      updateHash: true,
      scroll: true,
    });
  });
});

const initialLiteracyPanel = window.location.hash.slice(1);
const defaultLiteracyPanel = literacyPanels.find((panel) => !panel.hidden)?.id;
if (literacyPanels.some((panel) => panel.id === initialLiteracyPanel)) {
  activateLiteracyPanel(initialLiteracyPanel);
} else if (defaultLiteracyPanel) {
  activateLiteracyPanel(defaultLiteracyPanel);
}

document.addEventListener("visibilitychange", () => {
  lastTime = performance.now();
  if (!document.hidden) {
    measureTrack();
  }
});

window.addEventListener("resize", measureTrack);
window.addEventListener("load", () => {
  measureTrack();
  setInitialOrbitPosition();
});
measureTrack();
requestAnimationFrame(() => requestAnimationFrame(setInitialOrbitPosition));
requestAnimationFrame(animateTrack);

function finishIntro() {
  intro.classList.add("is-exiting");
  measureTrack();
  setInitialOrbitPosition(true);
  document.body.classList.remove("is-intro");
  window.setTimeout(() => intro.classList.add("is-hidden"), 720);
}

function playIntro() {
  if (reduceMotion.matches) {
    introText.textContent = introMessage;
    window.setTimeout(finishIntro, 180);
    return;
  }

  let character = 0;
  const typeNextCharacter = () => {
    introText.textContent = introMessage.slice(0, character + 1);
    character += 1;

    if (character < introMessage.length) {
      window.setTimeout(typeNextCharacter, 42);
    } else {
      window.setTimeout(finishIntro, 340);
    }
  };

  window.setTimeout(typeNextCharacter, 180);
}

playIntro();

const curiositySection = document.querySelector(".curiosity");
if (curiositySection) {
  const curiosityText = curiositySection.querySelector(".curiosity__typed");
  const curiosityMessage = curiosityText.textContent;
  const curiosityBubbles = curiositySection.querySelectorAll(".curiosity__bubble");
  let curiosityStarted = false;

  const startCuriosity = () => {
    if (curiosityStarted) return;
    curiosityStarted = true;
    curiositySection.classList.add("is-visible");
    window.setTimeout(() => curiositySection.classList.add("has-entered"), 1350);

    if (reduceMotion.matches) return;
    curiositySection.classList.add("is-typing");
    let character = 0;
    const typeNext = () => {
      curiosityText.textContent = curiosityMessage.slice(0, character + 1);
      character += 1;
      if (character < curiosityMessage.length) {
        window.setTimeout(typeNext, 82);
      } else {
        window.setTimeout(() => curiositySection.classList.remove("is-typing"), 850);
      }
    };
    window.setTimeout(typeNext, 200);
  };

  if (!reduceMotion.matches) {
    curiositySection.classList.add("is-enhanced");
    curiosityText.textContent = "";
  }

  if ("IntersectionObserver" in window) {
    const curiosityObserver = new IntersectionObserver((entries, observer) => {
      if (!entries[0]?.isIntersecting) return;
      startCuriosity();
      observer.disconnect();
    }, { threshold: 0.18 });
    curiosityObserver.observe(curiositySection);
  } else {
    startCuriosity();
  }

  curiosityBubbles.forEach((bubble) => {
    bubble.addEventListener("pointermove", (event) => {
      if (reduceMotion.matches) return;
      const bounds = bubble.getBoundingClientRect();
      bubble.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
      bubble.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
    });
    bubble.addEventListener("pointerleave", () => {
      bubble.style.removeProperty("--pointer-x");
      bubble.style.removeProperty("--pointer-y");
    });
  });
}
