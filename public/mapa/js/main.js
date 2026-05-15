console.log("START gry");

// 🔥 DŹWIĘKI (miękkie)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playGoodSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

function playBadSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.18);
}

// ================== ETAPY ==================

let stage = 1;

const stage1 = [
  "Francja","Niemcy","Włochy","Belgia","Holandia","Szwajcaria","Austria"
];

const stage2 = [
  "Polska","Czechy","Słowacja","Słowenia",
  "Chorwacja","Bośnia","Serbia",
  "Czarnogóra","Macedonia Północna","Kosowo",
  "Bułgaria","Ukraina","Białoruś","Rosja"
];
// ===== ETAP 3 =====
const stage3 = [

  {
    name: "Polanie",
    color: "0,152,70",
    overlay: "/mapa/assets/maps/poland/polanie.png",
symbol: "/mapa/assets/maps/poland/polanie-icon.png",

    desc:
      "Polanie mieszkali w Wielkopolsce. To właśnie z tego plemienia wywodziła się dynastia Piastów. Dzięki rozbudowanej sieci grodów Polanie podporządkowali sobie sąsiednie ziemie.",

    cities:
      "Gniezno, Poznań, Ostrów Lednicki"
  },

  {
    name: "Wiślanie",
    color: "255,237,0",
    overlay: "/mapa/assets/maps/poland/wislanie.png",
symbol: "/mapa/assets/maps/poland/wislanie-icon.png",
    desc:
      "Wiślanie mieszkali na dzisiejszej Małopolskce. Byli jednym z najsilniejszych plemion południowej Polski jeszcze przed powstaniem państwa Piastów. Ich najważniejszym ośrodkiem był Kraków.",

    cities:
      "Kraków, Wiślica, Stradów"
  },

  {
    name: "Mazowszanie",
    color: "227,30,36",
    overlay: "/mapa/assets/maps/poland/mazowszanie.png",
 symbol: "/mapa/assets/maps/poland/mazowszanie-icon.png",

    desc:
      "Mazowszanie zamieszkiwali rozległe tereny środkowego biegu Wisły. Ich ziemie były pokryte puszczami i bagnami. Utrzymywali własną odrębność jeszcze długo po powstaniu państwa polskiego.",

    cities:
      "Płock, Czersk, Pułtusk"
  },

  {
    name: "Ślężanie",
    color: "0,141,210",
    overlay: "/mapa/assets/maps/poland/slezanie.png",
symbol: "/mapa/assets/maps/poland/slezanie-icon.png",

   
      desc:
  "Ślężanie zamieszkiwali okolice góry Ślęży na Dolnym Śląsku. Nazwa plemienia pochodzi od góry Ślęży, uznawanej za miejsce kultu religijnego. Przez ich ziemie przebiegał ważny szlak handlowy.",

cities:
      "Wrocław, Niemcza"
  },

  {
    name: "Pomorzanie",
    color: "229,9,127",
    overlay: "/mapa/assets/maps/poland/pomorzanie.png",
symbol: "/mapa/assets/maps/poland/pomorzanie-icon.png",

    desc:  
  "Pomorzanie mieszkali na wybrzeżu Morza Bałtyckiego i utrzymywali kontakty handlowe ze Skandynawią. Zajmowali się handlem morskim i rybołówstwem. Długo pozostawali niezależni od państwa Piastów.",

cities:
      "Gdańsk, Szczecin, Kołobrzeg"
  },

  {
    name: "Lędzianie",
    color: "126,113,177",
    overlay: "/mapa/assets/maps/poland/ledzianie.png",
symbol: "/mapa/assets/maps/poland/ledzianie-icon.png",

    desc:
      "Lędzianie zamieszkiwali południowo-wschodnie obszary dzisiejszej Polski. Ich ziemie znajdowały się na granicy wpływów polskich i ruskich. Plemię było ważnym elementem kontroli szlaków handlowych prowadzących na Ruś.",

    cities:
      "Przemyśl, Czerwień"
  },

  {
    name: "Prusowie",
    color: "239,127,26",
    overlay: "/mapa/assets/maps/poland/prusowie.png",
symbol: "/mapa/assets/maps/poland/prusowie-icon.png",

    desc:
      "Prusowie byli plemionami bałtyckimi zamieszkującymi północno-wschodnie ziemie nad Bałtykiem. Słynęli z wojowniczości i długo opierali się chrystianizacji. Ostatecznie zostali podbici przez zakon krzyżacki.",

    cities:
      "Truso, Bałga"
  }

];
let currentTribe = null;
let tribeRemaining = [];
let correctRegions = stage1;

let score = 0;
let found = new Set();
let mistakes = 0;

// ================== HINT BOX ==================

const hintBox = document.createElement("div");

hintBox.style.position = "fixed";

hintBox.style.right = "20px";
hintBox.style.top = "120px";

hintBox.style.padding = "18px 24px";

hintBox.style.background =
  "linear-gradient(135deg,#f59e0b,#facc15)";

hintBox.style.color = "white";

hintBox.style.fontSize = "22px";
hintBox.style.fontWeight = "700";

hintBox.style.borderRadius = "18px";

hintBox.style.boxShadow =
  "0 10px 28px rgba(245,158,11,0.45)";
hintBox.style.opacity = "0";

hintBox.style.transform = "scale(0.85)";

setTimeout(() => {
  hintBox.style.display = "none";
}, 300);

hintBox.style.zIndex = "10000";

hintBox.style.transition =
  "0.3s ease";

hintBox.style.opacity = "0";

hintBox.style.transform = "scale(0.85)";

document.body.appendChild(hintBox);

// ================== PRAWA MAPA ==================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const img = new Image();
const hitmap = new Image();
// ===== ETAP 3 =====

const tribeMap = new Image();
const tribeHitmap = new Image();

tribeMap.src = "/mapa/tribes/mapa.png";
tribeHitmap.src = "/mapa/tribes/hitmap.png";

img.src = "/mapa/assets/maps/europe_now.png";
hitmap.src = "/mapa/assets/maps/europe_now.hitmap.png";

// ===== EFEKT =====
function runClickEffect(x, y) {
  const start = performance.now();
  const duration = 400;

  function frame(time) {
    const t = (time - start) / duration;
    if (t > 1) return;

    draw();

    const r = 10 + t * 40;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${1 - t})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// ===== REGIONY =====
const regions = {
  "255,0,0": "Polska",
  "0,255,0": "Niemcy",
  "0,0,255": "Francja",
  "255,255,0": "Hiszpania",
  "255,0,255": "Włochy",
  "0,255,255": "Ukraina",
  "128,0,0": "Białoruś",
  "0,128,0": "Rosja",
  "0,0,128": "Norwegia",
  "128,128,0": "Szwecja",
  "128,0,128": "Finlandia",
  "0,128,128": "Dania",
  "200,0,0": "Holandia",
  "0,200,0": "Belgia",
  "0,0,200": "Czechy",
  "200,200,0": "Słowacja",
  "200,0,200": "Węgry",
  "0,200,200": "Rumunia",
  "100,50,0": "Bułgaria",
  "0,100,50": "Grecja",
  "50,0,100": "Turcja",
  "100,0,50": "Portugalia",
  "50,100,0": "Szwajcaria",
  "0,50,100": "Austria",
  "30,180,30": "Serbia",
  "180,30,30": "Chorwacja",
  "30,30,180": "Bośnia",
  "180,30,180": "Czarnogóra",
  "30,180,180": "Kosowo",
  "0,90,0": "Macedonia Północna",
  "180,180,30": "Słowenia"
};

let scale = 1;
let minScale = 1;
let offsetX = 0;
let offsetY = 0;

let startOffsetX = 0;
let startOffsetY = 0;

// ===== HITMAP =====

const tempCanvas = document.createElement("canvas");
const tempCtx = tempCanvas.getContext("2d");

// ===== ETAP 3 =====

const tribeCanvas = document.getElementById("tribeCanvas");
const tribeCtx = tribeCanvas.getContext("2d");

const tribeTempCanvas = document.createElement("canvas");
const tribeTempCtx = tribeTempCanvas.getContext("2d");

tribeHitmap.onload = () => {
  tribeTempCanvas.width = tribeHitmap.width;
  tribeTempCanvas.height = tribeHitmap.height;
  tribeTempCtx.drawImage(tribeHitmap, 0, 0);
};
hitmap.onload = () => {
  tempCanvas.width = hitmap.width;
  tempCanvas.height = hitmap.height;
  tempCtx.drawImage(hitmap, 0, 0);
};

img.onload = () => {

  const scaleX = canvas.width / img.width;
  const scaleY = canvas.height / img.height;

  scale = Math.max(scaleX, scaleY);
  minScale = scale;

  offsetX = (canvas.width - img.width * scale) / 2;

  const scaledHeight = img.height * scale;
  offsetY = (canvas.height - scaledHeight) / 2 - 50;

  startOffsetX = offsetX;
  startOffsetY = offsetY;

 draw();

document.getElementById("topbarText").dataset.text =
  "na mapie współczesnej Europy zaznacz kraje, które należały do Imperium Karola Wielkiego";

document.getElementById("topbarText").innerText =
  "na mapie współczesnej Europy zaznacz kraje, które należały do Imperium Karola Wielkiego";
animateStageTexts();
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, offsetX, offsetY, img.width * scale, img.height * scale);
}

// ===== ZOOM =====

canvas.addEventListener("wheel", function(e) {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  let newScale = scale * zoom;

  if (newScale < minScale) {
    scale = minScale;
    offsetX = startOffsetX;
    offsetY = startOffsetY;
    draw();
    return;
  }

  if (newScale > minScale * 3) return;

  const prev = scale;
  scale = newScale;

  offsetX = mx - ((mx - offsetX) * (scale / prev));
  offsetY = my - ((my - offsetY) * (scale / prev));

  draw();
}, { passive: false });

// ===== CLICK =====

canvas.onclick = function (e) {

  const rect = canvas.getBoundingClientRect();

  const x = Math.floor((e.clientX - rect.left - offsetX) / scale);
  const y = Math.floor((e.clientY - rect.top - offsetY) / scale);

  if (x < 0 || y < 0 || x >= tempCanvas.width || y >= tempCanvas.height) return;

  const pixel = tempCtx.getImageData(x, y, 1, 1).data;
  const key = `${pixel[0]},${pixel[1]},${pixel[2]}`;

  const country = regions[key] || "Nieznany kraj";

  const resultEl = document.getElementById("result");

  resultEl.classList.remove("good-anim", "bad-anim");

  if (correctRegions.includes(country)) {

    playGoodSound();

  if (found.has(country)) {

  mistakes++;

  resultEl.innerText =
    "⚠️ Już zaznaczone: " + country;

  resultEl.style.color = "orange";

  if (mistakes >= 3) {

    const missing =
      correctRegions.filter(c => !found.has(c));

    if (missing.length > 0) {

      const hint =
        missing[Math.floor(Math.random() * missing.length)];

      hintBox.innerText =
        "💡 Spróbuj: " + hint;

      hintBox.style.display = "block";
hintBox.style.opacity = "1";

hintBox.style.transform = "scale(1)";
hintBox.style.opacity = "1";

hintBox.style.transform =
  "translateX(-50%) scale(1)";
hintBox.style.opacity = "1";

hintBox.style.transform =
  "translateX(-50%) scale(1)";

      setTimeout(() => {
        hintBox.style.opacity = "0";

hintBox.style.transform =
  "translateX(-50%) scale(0.8)";

setTimeout(() => {
  hintBox.style.opacity = "0";

hintBox.style.transform = "scale(0.85)";

setTimeout(() => {
  hintBox.style.display = "none";
}, 300);
}, 300);
      }, 3000);
    }

    mistakes = 0;
  }

} else {
      found.add(country);
      score++;

      resultEl.innerText = "✅ DOBRZE: " + country;

      void resultEl.offsetWidth;
      resultEl.classList.add("good-anim");

      runClickEffect(e.clientX - rect.left, e.clientY - rect.top);
    }

  } else {

    playBadSound();

    mistakes++;

    resultEl.innerText = "❌ ŹLE: " + country;

    void resultEl.offsetWidth;
    resultEl.classList.add("bad-anim");

    if (mistakes >= 3) {
      const missing = correctRegions.filter(c => !found.has(c));
      if (missing.length > 0) {
        const hint = missing[Math.floor(Math.random() * missing.length)];
        hintBox.innerText = "💡 Spróbuj: " + hint;
       hintBox.style.display = "block";

hintBox.style.opacity = "1";

hintBox.style.transform = "scale(1)";

setTimeout(() => {

  hintBox.style.opacity = "0";

  hintBox.style.transform = "scale(0.85)";

  setTimeout(() => {
    hintBox.style.display = "none";
  }, 300);

}, 3000);
      }
      mistakes = 0;
    }
  }

document.getElementById("score").innerText = score;

  const remaining = correctRegions.length - found.size;
  document.getElementById("remaining").innerText = remaining;

const progress =
  ((correctRegions.length - remaining)
  / correctRegions.length) * 100;

document.getElementById("progressFill").style.width =
  progress + "%";

  if (remaining === 0) {

  resultEl.innerText = "🎉 BRAWO! Znalazłeś wszystkie!";
  resultEl.style.color = "gold";

  if (stage === 1) {
    showStageOverlay();
  }

  else if (stage === 2) {

  const overlay = document.createElement("div");

  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backdropFilter = "blur(6px)";
  overlay.style.background = "rgba(0,0,0,0.45)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  overlay.innerHTML = `
    <div class="stage-overlay-card">

      <div class="stage-overlay-title">
        🛡️ ETAP 2 UKOŃCZONY
      </div>

      <div class="stage-overlay-text">
        Doskonale!<br>
        Rozpoznałeś wszystkie państwa słowiańskie.<br><br>

        Czas na najtrudniejszy etap —
        plemiona słowiańskie 🙂
      </div>

      <button
        id="startStage3Btn"
        class="stage-overlay-btn">

        Rozpocznij etap 3 →
      </button>

    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("startStage3Btn").onclick = () => {

    overlay.remove();

    document.getElementById("maps").style.display =
      "none";

    document.getElementById("tribeStage").style.display =
      "flex";

    document.getElementById("title").innerText =
      "Etap trzeci - Plemiona słowiańskie na terytorium obecnej Polski";

document.getElementById("topbarText").dataset.text =
  "Kliknij na mapie terytorium plemienia";

document.getElementById("topbarText").innerText =
  "Kliknij na mapie terytorium plemienia";

    document.getElementById("result").innerText = "";

   

    tribeRemaining = [...stage3];

document.getElementById("remaining").innerText =
  stage3.length;

document.getElementById("progressFill").style.width =
  "0%";
    nextTribe();

    if (tribeMap.complete) {
  drawTribeStage();
}

  };
}
}
};

// ================= OVERLAY =================

function showStageOverlay() {

  const overlay = document.createElement("div");

  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backdropFilter = "blur(6px)";
  overlay.style.background = "rgba(0,0,0,0.4)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  overlay.innerHTML = `
  <div class="stage-overlay-card">

    <div class="stage-overlay-title">
      ⭐ ETAP UKOŃCZONY
    </div>

    <div class="stage-overlay-text">
      Świetna robota!<br>
      Ukończyłeś pierwszy etap gry.<br><br>

      Przed Tobą kolejny poziom 🙂
    </div>

    <button
      id="nextStageBtn"
      class="stage-overlay-btn">

      Przejdź dalej →
    </button>

  </div>
`;

  document.body.appendChild(overlay);

  document.getElementById("nextStageBtn").onclick = () => {

    overlay.remove();

    stage = 2;
    correctRegions = stage2;
    found.clear();
    score = 0;

    document.getElementById("title").innerText =
      "Etap drugi - Państwa Słowiańskie";

   document.getElementById("topbarText").dataset.text =
  "na mapie współczesnej Europy zaznacz kraje, które zostały utworzone przez plemiona słowiańskie";

document.getElementById("topbarText").innerText =
  "na mapie współczesnej Europy zaznacz kraje, które zostały utworzone przez plemiona słowiańskie";

 document.getElementById("score").innerText = 0;

document.getElementById("progressFill").style.width =
  "0%";
    document.getElementById("result").innerText = "";
animateStageTexts();
  };
}

// ================== LEWA MAPA ==================

const hCanvas = document.getElementById("historyCanvas");
const hCtx = hCanvas.getContext("2d");

const hImg = new Image();
hImg.src = "/mapa/assets/maps/europe_815.png";

let hScale = 1;
let hMinScale = 1;
let hOffsetX = 0;
let hOffsetY = 0;

let hStartOffsetX = 0;
let hStartOffsetY = 0;

hImg.onload = () => {

  const scaleX = hCanvas.width / hImg.width;
  const scaleY = hCanvas.height / hImg.height;

  hScale = Math.max(scaleX, scaleY);
  hMinScale = hScale;

  hOffsetX = (hCanvas.width - hImg.width * hScale) / 2;

  const scaledHeight = hImg.height * hScale;
  hOffsetY = (hCanvas.height - scaledHeight) / 2;

  hStartOffsetX = hOffsetX;
  hStartOffsetY = hOffsetY;

  drawHistory();
};

function drawHistory() {
  hCtx.clearRect(0, 0, hCanvas.width, hCanvas.height);
  hCtx.drawImage(hImg, hOffsetX, hOffsetY, hImg.width * hScale, hImg.height * hScale);
}

hCanvas.addEventListener("wheel", function(e) {
  e.preventDefault();

  const rect = hCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  let newScale = hScale * zoom;

  if (newScale < hMinScale) {
    hScale = hMinScale;
    hOffsetX = hStartOffsetX;
    hOffsetY = hStartOffsetY;
    drawHistory();
    return;
  }

  if (newScale > hMinScale * 3) return;

  const prev = hScale;
  hScale = newScale;

  hOffsetX = mx - ((mx - hOffsetX) * (hScale / prev));
  hOffsetY = my - ((my - hOffsetY) * (hScale / prev));

  drawHistory();

}, { passive: false });
// ================= PAN (PRZESUWANIE MAPY) =================

// ===== PRAWA MAPA =====
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 1) { // środkowy przycisk
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    canvas.style.cursor = "grabbing";
  }
});

window.addEventListener("mouseup", () => {
  isDragging = false;
  canvas.style.cursor = "default";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  offsetX += dx;
  offsetY += dy;

  dragStartX = e.clientX;
  dragStartY = e.clientY;

  draw();
});

// ===== LEWA MAPA =====
let isDraggingH = false;
let dragStartHX = 0;
let dragStartHY = 0;

hCanvas.addEventListener("mousedown", (e) => {
  if (e.button === 1) {
    isDraggingH = true;
    dragStartHX = e.clientX;
    dragStartHY = e.clientY;
    hCanvas.style.cursor = "grabbing";
  }
});

window.addEventListener("mouseup", () => {
  isDraggingH = false;
  hCanvas.style.cursor = "default";
});

window.addEventListener("mousemove", (e) => {
  if (!isDraggingH) return;

  const dx = e.clientX - dragStartHX;
  const dy = e.clientY - dragStartHY;

  hOffsetX += dx;
  hOffsetY += dy;

  dragStartHX = e.clientX;
  dragStartHY = e.clientY;

  drawHistory();
});// ================== ETAP 3 ==================

function drawTribeStage() {

  tribeCtx.clearRect(0, 0, tribeCanvas.width, tribeCanvas.height);

  tribeCtx.drawImage(
    tribeMap,
    0,
    0,
    tribeCanvas.width,
    tribeCanvas.height
  );
}

function nextTribe() {

  if (tribeRemaining.length === 0) {

    document.getElementById("result").innerText =
      "🎉 KONIEC ETAPU 3";

    return;
  }

  document.getElementById("tribeImage").style.display = "none";

  const i = Math.floor(Math.random() * tribeRemaining.length);

  currentTribe = tribeRemaining.splice(i, 1)[0];
document.getElementById("tribeTitle").innerText =
  currentTribe.name;

document.getElementById("tribeDesc").innerText =
  currentTribe.desc;

document.getElementById("tribeCities").innerText =
  "Grody: " + currentTribe.cities;
const tribeFill =
  document.getElementById("tribeTitleFill");

tribeFill.style.background =
  `rgb(${currentTribe.color})`;

tribeFill.style.width = "0%";

setTimeout(() => {
  tribeFill.style.width = "100%";
}, 80);
document.getElementById("topbarFill").style.width =
  "0%";

document.getElementById("topbarText").dataset.text =
  "Kliknij na mapie terytorium plemienia: " +
  currentTribe.name;

document.getElementById("topbarText").innerText =
  "Kliknij na mapie terytorium plemienia: " +
  currentTribe.name;
animateStageTexts();
const symbol =
  document.getElementById("tribeSymbol");

symbol.classList.remove("show");

symbol.src = currentTribe.symbol;

setTimeout(() => {
  symbol.classList.add("show");
}, 120);
}

tribeCanvas.onclick = function(e) {

  const rect = tribeCanvas.getBoundingClientRect();

  const x = Math.floor(
    (e.clientX - rect.left) *
    (tribeHitmap.width / rect.width)
  );

  const y = Math.floor(
    (e.clientY - rect.top) *
    (tribeHitmap.height / rect.height)
  );

  const pixel =
    tribeTempCtx.getImageData(x, y, 1, 1).data;

  const key = `${pixel[0]},${pixel[1]},${pixel[2]}`;

  if (key === currentTribe.color) {

    playGoodSound();

    const resultEl = document.getElementById("result");

    resultEl.innerText =
      "✅ DOBRZE: " + currentTribe.name;

    resultEl.classList.remove("bad-anim");
    void resultEl.offsetWidth;
    resultEl.classList.add("good-anim");

const overlay = new Image();

overlay.onload = () => {

  tribeCtx.drawImage(
    overlay,
    0,
    0,
    tribeCanvas.width,
    tribeCanvas.height
  );
};

overlay.src = currentTribe.overlay;

    document.getElementById("tribeTitle").innerText =
      currentTribe.name;

    document.getElementById("tribeDesc").innerText =
      currentTribe.desc;

    document.getElementById("tribeCities").innerText =
      currentTribe.cities;
const remaining = tribeRemaining.length;

document.getElementById("remaining").innerText =
  remaining;

const progress =
  ((stage3.length - remaining)
  / stage3.length) * 100;

document.getElementById("progressFill").style.width =
  progress + "%";

    setTimeout(() => {

  resultEl.innerText = "";

  nextTribe();

}, 1200);

  } else {

    playBadSound();

    const resultEl = document.getElementById("result");

    resultEl.innerText = "❌ ŹLE";

setTimeout(() => {
  resultEl.innerText = "";
}, 900);
    resultEl.classList.remove("good-anim");
    void resultEl.offsetWidth;
    resultEl.classList.add("bad-anim");
  }
};

tribeMap.onload = drawTribeStage;
function animateStageTexts() {

  const title =
    document.getElementById("title");

  const topbarText =
    document.getElementById("topbarText");

  const topbarFill =
    document.getElementById("topbarFill");

  title.classList.remove("stage-anim");

  void title.offsetWidth;

  title.classList.add("stage-anim");

  const fullText =
  topbarText.dataset.text || topbarText.innerText;

  topbarText.innerText = "";

  topbarFill.style.width = "0%";

  let i = 0;

  const speed = 16;

  const typing = setInterval(() => {

    topbarText.innerText =
      fullText.substring(0, i + 1);

   const progress =
 ((i + 6) / fullText.length) * 100;

    topbarFill.style.width =
      progress + "%";

    i++;

    if (i >= fullText.length) {
      clearInterval(typing);
    }

  }, speed);
}
 