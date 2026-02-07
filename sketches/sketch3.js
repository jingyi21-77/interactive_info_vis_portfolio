const sketch3 = (p) => {
  const W = 700;
  const H = 700;

  const potCX = W * 0.5;
  const potCY = H * 0.62;

  const potW = W * 0.52;
  const potH = H * 0.3;
  const rimH = potH * 0.22;

  let bubbles = [];
  const MAX_BUBBLES = 14;

  const hourThemes = [
    { soup: [255, 220, 170], bg: [255, 245, 235] },
    { soup: [255, 235, 150], bg: [255, 250, 230] },
    { soup: [220, 245, 190], bg: [245, 255, 240] },
    { soup: [190, 240, 235], bg: [235, 252, 255] },
    { soup: [190, 220, 255], bg: [240, 245, 255] },
    { soup: [215, 190, 255], bg: [248, 240, 255] },
    { soup: [255, 200, 230], bg: [255, 240, 248] },
    { soup: [255, 210, 190], bg: [255, 243, 235] },
    { soup: [245, 230, 190], bg: [255, 250, 240] },
    { soup: [230, 235, 200], bg: [248, 255, 235] },
    { soup: [210, 235, 220], bg: [238, 255, 250] },
    { soup: [235, 220, 210], bg: [255, 248, 240] },
  ];

  p.setup = () => {
    p.createCanvas(W, H);
    p.angleMode(p.RADIANS);
    p.textAlign(p.CENTER, p.CENTER);
    p.noStroke();
  };

  p.draw = () => {
    const hr = p.hour() % 12;
    const mn = p.minute();
    const sc = p.second();
    const ms = p.millis() % 1000;

    const theme = hourThemes[hr];
    p.background(...theme.bg);

    drawCounter();

    drawPotBody();

    drawSoupBase(theme.soup);

    drawIngredients(mn, sc, ms);

    maybeSpawnBubbles(sc, ms);

    drawPotRim();
    drawLid(hr);
    drawBurnerFlame(hr);
    updateAndDrawBubbles();
  };

  function drawCounter() {
    p.noStroke();
    p.fill(250, 240, 230);
    p.rect(0, H * 0.78, W, H * 0.22);

    p.stroke(245, 228, 215);
    for (let x = 0; x <= W; x += 70) p.line(x, H * 0.78, x, H);
    for (let y = H * 0.78; y <= H; y += 55) p.line(0, y, W, y);
    p.noStroke();
  }

  function drawPotBody() {
    p.fill(0, 0, 0, 12);
    p.ellipse(potCX, potCY + potH * 0.62, potW * 0.95, potH * 0.25);

    p.fill(255);
    p.stroke(210);
    p.strokeWeight(3);

    p.rectMode(p.CENTER);
    p.rect(potCX, potCY, potW, potH, 32);

    p.noFill();
    p.stroke(210);
    p.strokeWeight(8);
    const handleY = potCY - potH * 0.08;
    p.arc(potCX - potW * 0.56, handleY, potW * 0.22, potH * 0.4, -p.HALF_PI, p.HALF_PI);
    p.arc(potCX + potW * 0.56, handleY, potW * 0.22, potH * 0.4, p.HALF_PI, p.PI + p.HALF_PI);

    p.noStroke();
  }

  function drawPotRim() {
    p.noFill();
    p.stroke(200);
    p.strokeWeight(4);
    p.ellipse(potCX, potCY - potH * 0.4, potW * 0.92, rimH * 1.25);

    p.stroke(240);
    p.strokeWeight(2);
    p.ellipse(potCX, potCY - potH * 0.4 - 2, potW * 0.94, rimH * 1.3);
    p.noStroke();
  }

  function drawSoupBase(soupRGB) {
    const innerTopY = potCY - potH * 0.4;
    const innerBottomY = potCY + potH * 0.4;

    const surfaceY = p.lerp(innerBottomY, innerTopY, 0.55);

    p.noStroke();
    p.fill(soupRGB[0], soupRGB[1], soupRGB[2], 230);

    const soupW = potW * 0.88;
    const soupH = innerBottomY - surfaceY;
    p.rectMode(p.CENTER);
    p.rect(potCX, (surfaceY + innerBottomY) / 2, soupW, soupH, 26);

    p.stroke(255, 255, 255, 120);
    p.strokeWeight(3);
    const waveAmp = 4;
    const waveFreq = 0.03;
    p.noFill();
    p.beginShape();
    for (let x = potCX - soupW / 2; x <= potCX + soupW / 2; x += 10) {
      const t = p.frameCount * 0.06;
      const y = surfaceY + p.sin(x * waveFreq + t) * waveAmp;
      p.curveVertex(x, y);
    }
    p.endShape();
    p.noStroke();
  }

  function drawIngredients(mn, sc, ms) {
    const innerTopY = potCY - potH * 0.4;
    const innerBottomY = potCY + potH * 0.4;
    const surfaceY = p.lerp(innerBottomY, innerTopY, 0.55);

    const soupW = potW * 0.78;
    const soupH = innerBottomY - surfaceY;

    const count = mn;
    const wobble = 0.6 + (sc / 59) * 0.9;

    for (let i = 0; i < count; i++) {
      const seed = i * 99.7;
      const tx = p.fract(p.sin(seed) * 10000);
      const ty = p.fract(p.sin(seed * 1.37) * 10000);

      const x0 = potCX + (tx - 0.5) * soupW;
      const y0 = surfaceY + 10 + ty * Math.max(20, soupH - 18);

      const t = (p.frameCount * 0.02) + (ms / 1000) * 0.8;
      const x = x0 + p.sin(t + seed) * wobble;
      const y = y0 + p.cos(t * 0.9 + seed) * (wobble * 0.6);

      const kind = i % 3;
      if (kind === 0) drawCarrot(x, y, 10);
      else if (kind === 1) drawPea(x, y, 7);
      else drawMushroom(x, y, 9);
    }
  }

  function drawCarrot(x, y, s) {
    p.noStroke();
    p.fill(255, 170, 120, 220);
    p.ellipse(x, y, s * 1.2, s);
    p.fill(255, 190, 140, 220);
    p.ellipse(x + 2, y - 1, s * 0.6, s * 0.5);
  }

  function drawPea(x, y, s) {
    p.noStroke();
    p.fill(170, 235, 190, 230);
    p.ellipse(x, y, s, s);
    p.fill(200, 255, 215, 200);
    p.ellipse(x - 2, y - 2, s * 0.35, s * 0.35);
  }

  function drawMushroom(x, y, s) {
    p.noStroke();
    p.fill(245, 235, 230, 230);
    p.ellipse(x, y, s * 1.2, s * 0.9);
    p.fill(230, 220, 215, 220);
    p.rectMode(p.CENTER);
    p.rect(x, y + s * 0.35, s * 0.35, s * 0.45, 3);
  }

  function drawLid(hr) {
    const lidY = potCY - potH * 0.58;

    p.fill(255);
    p.stroke(210);
    p.strokeWeight(3);
    p.ellipse(potCX, lidY, potW * 0.7, potH * 0.35);

    p.fill(255);
    p.ellipse(potCX, lidY - potH * 0.16, potW * 0.12, potW * 0.12);
    p.noStroke();

    const r = potW * 0.26;
    for (let i = 0; i < 12; i++) {
      const ang = -p.HALF_PI + i * (p.TWO_PI / 12);
      const sx = potCX + p.cos(ang) * r;
      const sy = lidY + p.sin(ang) * (r * 0.65);

      const isOn = i === hr;
      p.fill(isOn ? 255 : 255, isOn ? 210 : 240, isOn ? 120 : 240, isOn ? 255 : 150);
      p.ellipse(sx, sy, isOn ? 22 : 16, isOn ? 22 : 16);

      p.fill(80, 80, 80, isOn ? 200 : 120);
      p.ellipse(sx - 4, sy - 2, 2.5, 2.5);
      p.ellipse(sx + 4, sy - 2, 2.5, 2.5);
      p.noFill();
      p.stroke(80, 80, 80, isOn ? 200 : 120);
      p.strokeWeight(2);
      p.arc(sx, sy + 2, 8, 6, 0, p.PI);
      p.noStroke();
    }
  }

  function drawBurnerFlame(hr) {
    const burnerY = potCY + potH * 0.58;
    const burnerW = potW * 0.55;

    p.fill(230);
    p.rectMode(p.CENTER);
    p.rect(potCX, burnerY, burnerW, 16, 10);

    const flames = hr + 1;
    for (let i = 0; i < flames; i++) {
      const fx = potCX - burnerW * 0.45 + i * (burnerW * 0.9 / 12);
      const fy = burnerY - 14;
      drawFlame(fx, fy, 14);
    }
  }

  function drawFlame(x, y, s) {
    p.push();
    p.translate(x, y);
    p.noStroke();
    p.fill(255, 170, 90, 220);
    p.beginShape();
    p.vertex(0, -s);
    p.bezierVertex(s * 0.6, -s * 0.3, s * 0.6, s * 0.5, 0, s);
    p.bezierVertex(-s * 0.6, s * 0.5, -s * 0.6, -s * 0.3, 0, -s);
    p.endShape(p.CLOSE);

    p.fill(255, 230, 170, 220);
    p.beginShape();
    p.vertex(0, -s * 0.55);
    p.bezierVertex(s * 0.35, -s * 0.1, s * 0.3, s * 0.35, 0, s * 0.55);
    p.bezierVertex(-s * 0.3, s * 0.35, -s * 0.35, -s * 0.1, 0, -s * 0.55);
    p.endShape(p.CLOSE);
    p.pop();
  }

  function maybeSpawnBubbles(sc, ms) {
    if (ms < 30 && sc % 2 === 0) spawnBubble(true);

    const simmerChance = 0.08 + (sc / 59) * 0.12;
    if (p.random() < simmerChance) spawnBubble(false);

    if (bubbles.length > MAX_BUBBLES) bubbles.splice(0, bubbles.length - MAX_BUBBLES);
  }

  function spawnBubble(isBig) {
    const innerTopY = potCY - potH * 0.4;
    const innerBottomY = potCY + potH * 0.4;
    const surfaceY = p.lerp(innerBottomY, innerTopY, 0.55);

    const soupW = potW * 0.78;

    const x = potCX + p.random(-soupW / 2, soupW / 2);
    const y = innerBottomY - p.random(0, Math.max(20, innerBottomY - surfaceY - 10));
    const r = isBig ? p.random(10, 14) : p.random(4, 8);
    const vy = isBig ? p.random(1.0, 1.6) : p.random(0.5, 1.0);

    bubbles.push({ x, y, r, vy, wobble: p.random(0, p.TWO_PI), alpha: 180 });
  }

  function updateAndDrawBubbles() {
    const innerTopY = potCY - potH * 0.4;
    const innerBottomY = potCY + potH * 0.4;
    const surfaceY = p.lerp(innerBottomY, innerTopY, 0.55);

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.wobble += 0.08;
      b.y -= b.vy;
      b.x += p.sin(b.wobble) * 0.5;
      b.alpha -= 1.0;

      p.noFill();
      p.stroke(255, 255, 255, b.alpha);
      p.strokeWeight(2);
      p.ellipse(b.x, b.y, b.r, b.r);

      if (b.y <= surfaceY + 2 || b.alpha <= 0) bubbles.splice(i, 1);
    }
    p.noStroke();
  }
};

new p5(sketch3);
