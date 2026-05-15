const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

const mapImg = new Image();
const hitmapImg = new Image();

mapImg.src = "/mapa/assets/maps/europe_815.png";
hitmapImg.src = "/mapa/assets/maps/europe_815_hitmap.png";

let currentTarget = "";

// 🔥 widok
let scale = 1;
let offsetX = 0;
let offsetY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

// 🔥 hitmap (RAZ)
const hitCanvas = document.createElement("canvas");
const hitCtx = hitCanvas.getContext("2d");

// 🔥 OGRANICZENIE MAPY (KLUCZ FIXA)
function clampPosition() {
  const drawWidth = mapImg.width * scale;
  const drawHeight = mapImg.height * scale;

  // poziom
  if (drawWidth < canvas.width) {
    offsetX = (canvas.width - drawWidth) / 2;
  } else {
    offsetX = Math.min(0, Math.max(offsetX, canvas.width - drawWidth));
  }

  // pion
  if (drawHeight < canvas.height) {
    offsetY = (canvas.height - drawHeight) / 2;
  } else {
    offsetY = Math.min(0, Math.max(offsetY, canvas.height - drawHeight));
  }
}

// 🔥 init
mapImg.onload = () => {
  canvas.width = 1200;
  canvas.height = 800;

  // 👉 sensowny start (żeby nie było odzoomowane)
  scale = 0.7;
  offsetX = (canvas.width - mapImg.width * scale) / 2;
  offsetY = (canvas.height - mapImg.height * scale) / 2;

  clampPosition();
  redraw();
};

hitmapImg.onload = () => {
  hitCanvas.width = hitmapImg.width;
  hitCanvas.height = hitmapImg.height;
  hitCtx.drawImage(hitmapImg, 0, 0);

  setNewTarget();
};

// 🔥 rysowanie
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const drawWidth = mapImg.width * scale;
  const drawHeight = mapImg.height * scale;

  ctx.drawImage(mapImg, offsetX, offsetY, drawWidth, drawHeight);
}

// 🔥 losowanie
function getRandomRegion() {
  const regions = Object.values(regionNames);
  return regions[Math.floor(Math.random() * regions.length)];
}

function setNewTarget() {
  currentTarget = getRandomRegion();
  document.getElementById("target").innerText = "Kliknij: " + currentTarget;
  document.getElementById("result").innerText = "";
}

// 🔥 klik (działa poprawnie)
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;

  const x = Math.floor((screenX - offsetX) / scale);
  const y = Math.floor((screenY - offsetY) / scale);

  if (x < 0 || y < 0 || x >= hitCanvas.width || y >= hitCanvas.height) return;

  const pixel = hitCtx.getImageData(x, y, 1, 1).data;
  const key = `${pixel[0]},${pixel[1]},${pixel[2]}`;

  const clickedRegion = regionNames[key];

  if (!clickedRegion) return;

  if (clickedRegion === currentTarget) {
    document.getElementById("result").innerText = "OK";
    setTimeout(setNewTarget, 800);
  } else {
    document.getElementById("result").innerText = "BŁĄD";
  }
});

// 🔥 zoom DO KURSORA + LIMITY (NAPRAWA)
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const zoom = e.deltaY < 0 ? 1.1 : 0.9;

  const prevScale = scale;
  scale *= zoom;

  // 👉 LIMIT ZOOM (ważne)
  if (scale < 0.5) scale = 0.5;
  if (scale > 3) scale = 3;

  offsetX = mouseX - ((mouseX - offsetX) * (scale / prevScale));
  offsetY = mouseY - ((mouseY - offsetY) * (scale / prevScale));

  clampPosition();
  redraw();
});

// 🔥 drag
canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  offsetX += dx;
  offsetY += dy;

  startX = e.clientX;
  startY = e.clientY;

  clampPosition();
  redraw();
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
});