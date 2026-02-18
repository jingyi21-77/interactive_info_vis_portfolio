window._sketchRegistry = window._sketchRegistry || {};
window._sketchInstances = window._sketchInstances || {};
window._sketchScriptsLoaded = window._sketchScriptsLoaded || {};

window.registerSketch = function (id, factory) {
  window._sketchRegistry[id] = factory;
};

const SKETCH_SCRIPT_BY_ID = {
  sk2: "sketches/sketch2.js",
  sk3: "sketches/sketch3.js",
  sk4: "sketches/sketch4.js",
};

function loadSketchScriptIfNeeded(sketchId) {
  return new Promise((resolve, reject) => {
    const src = SKETCH_SCRIPT_BY_ID[sketchId];
    if (!src) return reject(new Error("No script configured for " + sketchId));

    if (window._sketchScriptsLoaded[sketchId]) return resolve();

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      window._sketchScriptsLoaded[sketchId] = true;
      return resolve();
    }

    const s = document.createElement("script");
    s.src = src;
    s.onload = () => {
      window._sketchScriptsLoaded[sketchId] = true;
      resolve();
    };
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.body.appendChild(s);
  });
}

function createOrShowSketch(sketchId) {
  const container = document.getElementById("sketch-container-" + sketchId);

  Object.keys(window._sketchInstances).forEach((id) => {
    const inst = window._sketchInstances[id];
    if (inst && inst.canvas) inst.canvas.style.display = id === sketchId ? "" : "none";
  });

  if (window._sketchInstances[sketchId]) {
    const inst = window._sketchInstances[sketchId];
    if (inst && inst.canvas && container) container.appendChild(inst.canvas);
    if (inst && inst.canvas) inst.canvas.style.display = "";
    return;
  }

  const factory = window._sketchRegistry[sketchId];
  if (!factory) return;

  const p5inst = new p5(factory, container);
  window._sketchInstances[sketchId] = p5inst;
}

function getDefaultButton(buttons) {
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get("tab");
  if (tabParam) {
    const byTarget = Array.from(buttons).find((b) => b.dataset.target === tabParam);
    if (byTarget) return byTarget;
    const bySketch = Array.from(buttons).find((b) => b.dataset.sketch === tabParam);
    if (bySketch) return bySketch;
  }
  return buttons[0] || null;
}

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  async function activate(btn) {
    buttons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    contents.forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    const targetId = btn.dataset.target;
    const target = document.getElementById(targetId);
    if (target) target.classList.add("active");

    const sketchId = btn.dataset.sketch;
    if (sketchId) {
      try {
        await loadSketchScriptIfNeeded(sketchId);
        if (window._sketchRegistry[sketchId]) createOrShowSketch(sketchId);
        else setTimeout(() => window._sketchRegistry[sketchId] && createOrShowSketch(sketchId), 60);
      } catch (e) {
        console.error(e);
      }
    } else {
      Object.values(window._sketchInstances).forEach((inst) => {
        if (inst && inst.canvas) inst.canvas.style.display = "none";
      });
    }
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => activate(btn)));

  const first = getDefaultButton(buttons);
  if (first) setTimeout(() => activate(first), 50);
});
