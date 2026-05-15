const tribes = [
  { name: "Polanie", img: "polanie.png", desc: "Polanie zamieszkiwali Wielkopolskę i odegrali kluczową rolę w powstaniu państwa polskiego. Byli dobrze zorganizowanym plemieniem o silnej strukturze władzy. To właśnie z nich wywodziła się dynastia Piastów.", cities: "Gniezno, Poznań", color: [0,128,0] },
  { name: "Mazowszanie", img: "mazowszanie.png", desc: "Mazowszanie żyli na terenach dzisiejszego Mazowsza i zajmowali się głównie rolnictwem. Ich ziemie były często narażone na najazdy. Przez długi czas zachowali swoją odrębność.", cities: "Płock, Czersk", color: [255,0,0] },
  { name: "Ślężanie", img: "slezanie.png", desc: "Ślężanie zamieszkiwali okolice góry Ślęży. Była ona ważnym miejscem kultu religijnego. Region miał znaczenie strategiczne.", cities: "Wrocław", color: [0,128,255] },
  { name: "Wiślanie", img: "wislanie.png", desc: "Wiślanie żyli w dorzeczu Wisły. Byli jednym z silniejszych plemion. Ich centrum stanowił Kraków.", cities: "Kraków", color: [255,255,0] },
  { name: "Lędzianie", img: "ledzianie.png", desc: "Lędzianie zamieszkiwali południowo-wschodnie tereny. Utrzymywali kontakty handlowe z Rusią. Region miał znaczenie komunikacyjne.", cities: "Przemyśl", color: [128,128,255] },
  { name: "Pomorzanie", img: "pomorzanie.png", desc: "Pomorzanie żyli nad Bałtykiem. Zajmowali się handlem i żeglugą. Byli związani z morzem.", cities: "Gdańsk, Szczecin", color: [255,0,128] },
  { name: "Prusowie", img: "prusowie.png", desc: "Prusowie byli plemionami bałtyckimi. Znani z wojowniczości i oporu. Podbici dopiero w średniowieczu.", cities: "Brak", color: [255,128,0] }
];

const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

// 🔊 ciszej
correctSound.volume = 0.3;
wrongSound.volume = 0.3;

const map = document.getElementById("map");
const overlay = document.getElementById("overlay");
const question = document.getElementById("question");
const msg = document.getElementById("msg");
const timerEl = document.getElementById("timer");

const info = document.getElementById("info");
const endScreen = document.getElementById("endScreen");

const tribeName = document.getElementById("tribeName");
const tribeDesc = document.getElementById("tribeDesc");
const tribeCities = document.getElementById("tribeCities");

const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const rankingEl = document.getElementById("ranking");

let score = 0;
let remaining = [];
let total = tribes.length;

let timer = 0;
let interval = null;

const hitmap = new Image();
hitmap.src = "hitmap.png";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

let current = null;
let locked = false;
let ready = false;
let firstClickFix = false;

// 🔥 LOAD HITMAP
hitmap.onload = () => {
  canvas.width = hitmap.width;
  canvas.height = hitmap.height;
  ctx.drawImage(hitmap, 0, 0);

  ready = true;

  // fix pierwszego kliknięcia
  setTimeout(() => {
    firstClickFix = true;
  }, 100);

  startGame();
};

// 🔥 START
function startGame() {
  score = 0;
  remaining = [...tribes];
  endScreen.style.display = "none";
  rankingEl.innerHTML = "";
  next();
}

// 🔥 TIMER
function startTimer() {
  timer = 10;
  clearInterval(interval);

  interval = setInterval(() => {
    timer--;
    timerEl.textContent = "⏱️ Czas: " + timer;

    if (timer <= 0) {
      clearInterval(interval);
      showMsg("⏰ Koniec czasu!", "error");
      next();
    }
  }, 1000);
}

// 🔥 NEXT QUESTION
function next() {
  overlay.style.display = "none";
  info.style.display = "none";
  msg.style.display = "none";
  locked = false;

  if (remaining.length === 0) {
    question.innerText = `Koniec gry! Wynik: ${score}/${total}`;
    saveScore(score);
    showRanking();
    endScreen.style.display = "block";
    clearInterval(interval);
    return;
  }

  const index = Math.floor(Math.random() * remaining.length);
  current = remaining.splice(index, 1)[0];

  question.innerText = `Kliknij plemię: ${current.name} (${score}/${total})`;

  startTimer();
}

// 🔥 PIXEL
function getPixel(x, y) {
  const d = ctx.getImageData(x, y, 1, 1).data;
  return [d[0], d[1], d[2]];
}

// 🔥 KOMUNIKAT
function showMsg(text, type) {
  msg.textContent = text;
  msg.className = "";
  msg.style.display = "block";

  msg.classList.add(type);
  msg.offsetHeight;
  msg.classList.add("show");

  setTimeout(() => {
    msg.classList.remove("show");
    setTimeout(() => msg.style.display = "none", 300);
  }, 2000);
}

// 🔥 KLIK MAPY (FIX!)
map.addEventListener("click", (e) => {
  e.preventDefault();

  if (!ready || locked || !firstClickFix) return;

  const rect = map.getBoundingClientRect();
  const scaleX = hitmap.width / rect.width;
  const scaleY = hitmap.height / rect.height;

  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);

  const pixel = getPixel(x, y);

  let bestMatch = null;
  let bestDistance = Infinity;

  for (let tribe of tribes) {
    const dr = pixel[0] - tribe.color[0];
    const dg = pixel[1] - tribe.color[1];
    const db = pixel[2] - tribe.color[2];
    const distance = dr*dr + dg*dg + db*db;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = tribe;
    }
  }

  if (bestDistance > 8000) {
    wrongSound.play();
    showMsg("Spróbuj jeszcze raz", "error");
    return;
  }

  if (bestMatch.name !== current.name) {
    wrongSound.play();
    showMsg("To inne plemię", "error");
    return;
  }

  locked = true;
  score++;
  correctSound.play();
  clearInterval(interval);

  showMsg("Świetnie! +1 punkt", "success");

  overlay.src = current.img;
  overlay.style.display = "block";

  tribeName.textContent = current.name;
  tribeDesc.textContent = current.desc;
  tribeCities.textContent = current.cities;

  info.style.display = "block";
});

// 🔥 NEXT BTN (FIX!)
nextBtn.addEventListener("click", (e) => {
  e.preventDefault();
  next();
});

// 🔥 RANKING
function saveScore(score) {
  let scores = JSON.parse(localStorage.getItem("scores") || "[]");
  scores.push(score);
  scores.sort((a, b) => b - a);
  scores = scores.slice(0, 5);
  localStorage.setItem("scores", JSON.stringify(scores));
}

function showRanking() {
  let scores = JSON.parse(localStorage.getItem("scores") || "[]");

  rankingEl.innerHTML = "<strong>🏆 Ranking:</strong><br>" +
    scores.map((s, i) => `${i+1}. ${s} pkt`).join("<br>");
}

// 🔥 RESTART
restartBtn.addEventListener("click", () => {
  startGame();
});