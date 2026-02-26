const revealTargets = Array.from(document.querySelectorAll(".reveal"));
const navLinks = Array.from(document.querySelectorAll(".topnav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealTargets.forEach((target) => revealObserver.observe(target));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === id);
      });
    });
  },
  { threshold: 0.45 }
);

sections.forEach((section) => sectionObserver.observe(section));

const editorDemo = document.querySelector(".editor-demo");
const editorSection = document.querySelector("#editor");
const editorFeatures = Array.from(document.querySelectorAll(".editor-feature"));
const editorModes = ["crop", "multi"];
let editorTimer = null;
let editorIndex = 0;

function setEditorFocus(mode) {
  if (!editorDemo) return;
  editorDemo.dataset.focus = mode;
  editorFeatures.forEach((feature) => {
    feature.classList.toggle("active", feature.dataset.focus === mode);
  });
}

function stopEditorCycle() {
  if (editorTimer) {
    clearInterval(editorTimer);
    editorTimer = null;
  }
}

function startEditorCycle() {
  if (!editorDemo || editorTimer) return;
  editorTimer = setInterval(() => {
    editorIndex = (editorIndex + 1) % editorModes.length;
    setEditorFocus(editorModes[editorIndex]);
  }, 2400);
}

if (editorDemo && editorSection) {
  setEditorFocus(editorModes[editorIndex]);

  const editorObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startEditorCycle();
        } else {
          stopEditorCycle();
        }
      });
    },
    { threshold: 0.35 }
  );
  editorObserver.observe(editorSection);

  editorFeatures.forEach((feature) => {
    const mode = feature.dataset.focus;
    feature.addEventListener("mouseenter", () => {
      stopEditorCycle();
      editorIndex = Math.max(0, editorModes.indexOf(mode));
      setEditorFocus(mode);
    });

    feature.addEventListener("focusin", () => {
      stopEditorCycle();
      editorIndex = Math.max(0, editorModes.indexOf(mode));
      setEditorFocus(mode);
    });

    feature.addEventListener("mouseleave", startEditorCycle);
    feature.addEventListener("focusout", startEditorCycle);
  });
}
