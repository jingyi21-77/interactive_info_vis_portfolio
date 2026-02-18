
let table;

function preload() {
  table = loadTable("./data/album_summary.csv", "csv", "header");
}

function setup() {
  createCanvas(900, 200);
  background(255);

  fill(0);
  textSize(16);
  text("Loaded rows: " + table.getRowCount(), 20, 40);

  if (table.getRowCount() > 0) {
    const r0 = table.getRow(0);
    text("First album: " + r0.get("album_clean"), 20, 70);
    text("Energy: " + r0.get("Energy"), 20, 100);
  }
}

function draw() {}
