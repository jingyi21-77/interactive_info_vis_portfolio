let table;
let albums = [];
let panels = [];
let hover = null;

const metrics = [
  { key: "Danceability", label: "Danceability" },
  { key: "Energy", label: "Energy" },
  { key: "Acousticness", label: "Acousticness" },
  { key: "Valence", label: "Valence" }
];

// Instagram-friendly size (portrait)
const CANVAS_W = 1080;
const CANVAS_H = 1350;

// Story callouts (chosen: Reputation, Folklore, Midnights)
const CALLOUTS = [
  {
    album: "Reputation",
    metric: "Energy",
    text: "Reputation: punchier production\nand higher energy.",
    panelKey: "Energy"
  },
  {
    album: "Folklore",
    metric: "Acousticness",
    text: "Folklore: a clear shift toward\nsofter, acoustic textures.",
    panelKey: "Acousticness"
  },
  {
    album: "Midnights",
    metric: "Valence",
    text: "Midnights: a late-night pop polish\nwith more muted emotion.",
    panelKey: "Valence"
  }
];

function preload() {
  table = loadTable(
    "./data/album_summary.csv",
    "csv",
    "header",
    () => console.log("CSV loaded"),
    (err) => console.log("CSV load failed", err)
  );
}

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  textFont("system-ui");

  // Parse rows
  albums = [];
  for (let i = 0; i < table.getRowCount(); i++) {
    const r = table.getRow(i);
    const name = r.get("album_clean");
    const order = Number(r.get("album_order"));
    const vals = {};
    for (const m of metrics) vals[m.key] = Number(r.get(m.key));
    albums.push({ name, order, vals });
  }
  albums.sort((a, b) => a.order - b.order);

  // Layout: Title block (top), 2x2 panels, footer (source)
  const margin = 70;
  const gap = 36;

  const titleH = 170;
  const footerH = 70;

  const plotTop = margin + titleH;
  const plotH = height - plotTop - footerH - margin;
  const plotW = width - margin * 2;

  const pw = (plotW - gap) / 2;
  const ph = (plotH - gap) / 2;

  panels = [
    { x: margin, y: plotTop, w: pw, h: ph, metric: metrics[0] },
    { x: margin + pw + gap, y: plotTop, w: pw, h: ph, metric: metrics[1] },
    { x: margin, y: plotTop + ph + gap, w: pw, h: ph, metric: metrics[2] },
    { x: margin + pw + gap, y: plotTop + ph + gap, w: pw, h: ph, metric: metrics[3] }
  ];

  noLoop();
}

function draw() {
  background(255);

  drawTitleBlock();

  hover = findHover();

  for (let p = 0; p < panels.length; p++) drawPanel(panels[p], p);

  drawCallouts();     // key narrative annotations
  drawFooterSource(); // data source

  if (hover) drawTooltip(hover);
}

function mouseMoved() {
  const prev = hover ? `${hover.panelIndex}-${hover.pointIndex}` : "none";
  const nowHover = findHover();
  const now = nowHover ? `${nowHover.panelIndex}-${nowHover.pointIndex}` : "none";
  if (prev !== now) {
    hover = nowHover;
    redraw();
  }
}

/* -----------------------
   TITLE / FOOTER
------------------------ */

function drawTitleBlock() {
  const x = 70;
  const y = 85;

  fill(0);
  textStyle(BOLD);
  textSize(36);
  text("Taylor Swift’s sound shifts across albums", x, y);

  textStyle(NORMAL);
  textSize(18);
  fill(40);
  text(
    "Each panel shows album-average Spotify audio features (0–1). Read left-to-right by album order.\nHover points to see exact values.",
    x,
    y + 50
  );

  // visual hierarchy cue line
  stroke(0);
  strokeWeight(2);
  line(x, y + 110, x + 240, y + 110);
}

function drawFooterSource() {
  const x = 70;
  const y = height - 45;

  noStroke();
  fill(80);
  textSize(14);
  text(
    "Data: adashofdata / taylor_swift_data (Spotify metadata). Aggregated to album means.",
    x,
    y
  );
}

/* -----------------------
   PANEL DRAWING
------------------------ */

function drawPanel(panel, panelIndex) {
  const { x, y, w, h, metric } = panel;

  // frame
  noFill();
  stroke(220);
  strokeWeight(1);
  rect(x, y, w, h, 12);

  // title
  noStroke();
  fill(0);
  textStyle(BOLD);
  textSize(18);
  text(metric.label, x + 16, y + 30);
  textStyle(NORMAL);

  // inner area
  const padL = 60, padR = 18, padT = 44, padB = 48;
  const ix = x + padL;
  const iy = y + padT;
  const iw = w - padL - padR;
  const ih = h - padT - padB;

  const yMin = 0, yMax = 1;

  // gridlines + y labels
  stroke(235);
  for (const gv of [0, 0.5, 1]) {
    const gy = map(gv, yMin, yMax, iy + ih, iy);
    line(ix, gy, ix + iw, gy);
    noStroke();
    fill(120);
    textSize(12);
    text(nf(gv, 1, 1), x + 18, gy + 5);
    stroke(235);
  }

  // x ticks: show 1, 5, 10
  noStroke();
  fill(120);
  textSize(12);
  for (let i = 0; i < albums.length; i++) {
    if (i === 0 || i === albums.length - 1 || i === 4) {
      const ax = map(i, 0, albums.length - 1, ix, ix + iw);
      text(String(albums[i].order), ax - 4, iy + ih + 24);
    }
  }
  fill(130);
  text("Album order", ix, iy + ih + 42);

  // line
  stroke(0);
  strokeWeight(3);
  noFill();
  beginShape();
  for (let i = 0; i < albums.length; i++) {
    const v = albums[i].vals[metric.key];
    const px = map(i, 0, albums.length - 1, ix, ix + iw);
    const py = map(v, yMin, yMax, iy + ih, iy);
    vertex(px, py);
  }
  endShape();

  // points
  for (let i = 0; i < albums.length; i++) {
    const v = albums[i].vals[metric.key];
    const px = map(i, 0, albums.length - 1, ix, ix + iw);
    const py = map(v, yMin, yMax, iy + ih, iy);

    const isHover = hover && hover.panelIndex === panelIndex && hover.pointIndex === i;
    const isCalloutPoint = isCallout(albumNameNorm(albums[i].name), metric.key);

    noStroke();
    fill(isHover || isCalloutPoint ? 0 : 90);
    circle(px, py, isHover ? 14 : isCalloutPoint ? 12 : 8);

    // subtle direct label for callout points (small, not clutter)
    if (isCalloutPoint) {
      fill(0);
      textSize(12);
      textStyle(BOLD);
      text(albums[i].name, px + 10, py - 10);
      textStyle(NORMAL);
    }
  }
}

/* -----------------------
   HOVER TOOLTIP
------------------------ */

function findHover() {
  const threshold = 14;

  for (let p = 0; p < panels.length; p++) {
    const panel = panels[p];
    const { x, y, w, h, metric } = panel;

    const padL = 60, padR = 18, padT = 44, padB = 48;
    const ix = x + padL;
    const iy = y + padT;
    const iw = w - padL - padR;
    const ih = h - padT - padB;

    for (let i = 0; i < albums.length; i++) {
      const v = albums[i].vals[metric.key];
      const px = map(i, 0, albums.length - 1, ix, ix + iw);
      const py = map(v, 0, 1, iy + ih, iy);

      if (dist(mouseX, mouseY, px, py) <= threshold) {
        return { panelIndex: p, pointIndex: i, px, py };
      }
    }
  }
  return null;
}

function drawTooltip(h) {
  const panel = panels[h.panelIndex];
  const metricKey = panel.metric.key;
  const a = albums[h.pointIndex];

  const lines = [
    a.name,
    `Order: ${a.order}`,
    `${metricKey}: ${nf(a.vals[metricKey], 1, 3)}`
  ];

  textSize(14);
  const padding = 14;
  const boxW = 290;
  const boxH = 90;

  let tx = mouseX + 14;
  let ty = mouseY + 14;
  if (tx + boxW > width - 14) tx = mouseX - boxW - 14;
  if (ty + boxH > height - 14) ty = mouseY - boxH - 14;

  noStroke();
  fill(255);
  rect(tx, ty, boxW, boxH, 12);

  stroke(0);
  noFill();
  rect(tx, ty, boxW, boxH, 12);

  noStroke();
  fill(0);
  textStyle(BOLD);
  text(lines[0], tx + padding, ty + 30);

  textStyle(NORMAL);
  text(lines[1], tx + padding, ty + 54);
  text(lines[2], tx + padding, ty + 76);
}

/* -----------------------
   CALLOUTS (ANNOTATIONS)
------------------------ */

function drawCallouts() {
  // Place annotations near the target points
  for (const c of CALLOUTS) {
    const pt = getPointFor(c.album, c.metric);
    if (!pt) continue;

    // Decide annotation box position per callout for clean hierarchy
    // You can tweak these offsets if needed.
    let bx = pt.x + 30;
    let by = pt.y - 90;

    if (c.album === "Folklore") { bx = pt.x - 360; by = pt.y - 90; }
    if (c.album === "Midnights") { bx = pt.x - 360; by = pt.y + 30; }

    drawAnnotationBox(bx, by, 340, 86, c.text, pt.x, pt.y);
  }
}

function drawAnnotationBox(x, y, w, h, textStr, targetX, targetY) {
  // box
  noStroke();
  fill(255);
  rect(x, y, w, h, 14);

  stroke(0);
  strokeWeight(2);
  noFill();
  rect(x, y, w, h, 14);

  // text
  noStroke();
  fill(0);
  textSize(16);
  textStyle(BOLD);
  text("Key shift", x + 16, y + 28);
  textStyle(NORMAL);
  textSize(15);
  fill(30);
  text(textStr, x + 16, y + 52);

  // arrow from box to point
  stroke(0);
  strokeWeight(2);
  const ax1 = x + w * 0.8;
  const ay1 = y + h;
  line(ax1, ay1, targetX, targetY);

  // arrow head
  drawArrowHead(ax1, ay1, targetX, targetY);
}

function drawArrowHead(x1, y1, x2, y2) {
  const ang = atan2(y2 - y1, x2 - x1);
  const len = 12;
  const a1 = ang + radians(155);
  const a2 = ang - radians(155);
  line(x2, y2, x2 + cos(a1) * len, y2 + sin(a1) * len);
  line(x2, y2, x2 + cos(a2) * len, y2 + sin(a2) * len);
}

/* -----------------------
   HELPERS
------------------------ */

function albumNameNorm(s) {
  return String(s).trim();
}

function isCallout(albumName, metricKey) {
  for (const c of CALLOUTS) {
    if (c.album === albumName && c.metric === metricKey) return true;
  }
  return false;
}

function getPointFor(albumName, metricKey) {
  // find which panel contains metricKey
  let panelIndex = -1;
  for (let p = 0; p < panels.length; p++) {
    if (panels[p].metric.key === metricKey) panelIndex = p;
  }
  if (panelIndex < 0) return null;

  const panel = panels[panelIndex];
  const { x, y, w, h } = panel;

  const padL = 60, padR = 18, padT = 44, padB = 48;
  const ix = x + padL;
  const iy = y + padT;
  const iw = w - padL - padR;
  const ih = h - padT - padB;

  // find album index
  let idx = -1;
  for (let i = 0; i < albums.length; i++) {
    if (albumNameNorm(albums[i].name) === albumNameNorm(albumName)) idx = i;
  }
  if (idx < 0) return null;

  const v = albums[idx].vals[metricKey];
  const px = map(idx, 0, albums.length - 1, ix, ix + iw);
  const py = map(v, 0, 1, iy + ih, iy);

  return { x: px, y: py, panelIndex, idx, v };
}
