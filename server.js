const express = require("express");
const cors = require("cors");
require("dotenv").config();

const multer = require("multer");
const OpenAI = require("openai").default;
const path = require("path");
const fs = require("fs");
const cleanJsonFromAI =
  require("./utils/cleanJsonFromAI");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
    fields: 0,
    parts: 6
  }
}).array("images", 5);

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const app = express();

app.use(cors());
app.use(express.json());

/* ================= STATIC ================= */

app.use(
  express.static(
    path.join(__dirname, "public"),
    { index: false }
  )
);

/* ================= STRONA GŁÓWNA ================= */

app.get("/", (req, res) => {
  res.redirect("/punktacja/");
});

/* ================= KOŁO FORTUNY ================= */

app.get("/kolo", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "kolo-fortuny",
      "index.html"
    )
  );

});

/* ================= MAPA ================= */

app.get("/mapa", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "mapa",
      "index.html"
    )
  );

});

/* ================= MAPA 815 ================= */

app.get("/mapa815", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "mapa",
      "mapa815.html"
    )
  );

});

/* ================= GRUNWALD ================= */

app.get("/grunwald", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "grunwald",
      "intro.html"
    )
  );

});

/* ================= AI ================= */

let generatedQuestions = null;

/* ===== ANALIZA ===== */

app.post(
  "/analizuj",
  (req, res, next) => {
    // Reject before buffering multipart data when the generator is disabled.
    if (!openai) {
      return res.status(503).json({ error: "Generator quizu wymaga OPENAI_API_KEY." });
    }
    upload(req, res, (err) => {
      if (!err) return next();
      if (["LIMIT_FILE_SIZE", "LIMIT_FILE_COUNT", "LIMIT_PART_COUNT"].includes(err.code)) {
        return res.status(413).json({ error: "Możesz przesłać maksymalnie 5 zdjęć, każde do 5 MiB." });
      }
      return res.status(400).json({ error: "Nieprawidłowy formularz zdjęć. Prześlij pliki w polu images, bez dodatkowych pól." });
    });
  },
  async (req, res) => {

    try {

      if (
        !req.files ||
        req.files.length === 0
      ) {

        return res.status(400).json({
          error: "Nie przesłano zdjęć."
        });

      }

      const imageMessages =
        req.files.map(file => ({
          type: "image_url",
          image_url: {
            url:
              `data:${file.mimetype};base64,` +
              file.buffer.toString("base64")
          }
        }));

      const promptText = `
Na podstawie przesłanych materiałów wygeneruj quiz historyczny.

Zwróć WYŁĄCZNIE poprawny JSON.

FORMAT MUSI BYĆ DOKŁADNIE TAKI:

[
  {
    "category": "Nazwa kategorii",
    "questions": [
      {
        "question": "Treść pytania",
        "answers": [
          "Poprawna odpowiedź",
          "Błędna odpowiedź",
          "Błędna odpowiedź"
        ],
        "explanation": "Dokładnie dwa zdania wyjaśnienia."
      }
    ]
  }
]

Wymagania:
- dokładnie 6 kategorii
- każda kategoria dokładnie 3 pytania
- poprawna odpowiedź zawsze jako pierwszy element tablicy answers
- żadnego markdown
- żadnych komentarzy
- wyłącznie czysty JSON
`;

      const response =
        await openai.chat.completions.create({

          model: "gpt-4o",

          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: promptText
                },
                ...imageMessages
              ]
            }
          ],

          temperature: 0.7

        });

      const rawText =
        response.choices[0].message.content;

      generatedQuestions =
        cleanJsonFromAI(rawText);

console.log(
  JSON.stringify(
    generatedQuestions,
    null,
    2
  )
);
      res.json({ status: "ok" });

    } catch (err) {

  console.error("===== BŁĄD ANALIZY =====");

  console.error(err);

  if (err.response) {
    console.error(err.response.data);
  }

  res.status(500).json({
    error: err.message
  });

}

  }
);

/* ===== PYTANIA ===== */

app.get("/pytania", (req, res) => {

  if (!generatedQuestions) {

    return res.status(400).json({
      error: "Brak wygenerowanych pytań"
    });

  }

  res.json(generatedQuestions);

});

/* ================= START ================= */
app.get("/gra-rowerowa", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "gra-rowerowa", "index.html")
  );
});
/* ================= SYSTEM PUNKTACJI – STABILNA WERSJA ================= */

const punktacjaDbPath = path.join(__dirname, "punktacja-data.json");
const punktacjaArchiveDir = path.join(__dirname, "punktacja-archive");
const punktacjaMissionColors = ["#ff4f5e", "#168fe8", "#8b62e8", "#ef9b28", "#d94fc0"];
const crypto = require("crypto");
const { parentPinError, hashParentPin, verifyParentPin } = require("./utils/parentPin");
const parentSessions = new Map();
const parentLoginAttempts = new Map();
const parentSessionLifetimeMs = 12 * 60 * 60 * 1000;
const parentSessionIdleMs = 15 * 60 * 1000;
const parentLoginWindowMs = 15 * 60 * 1000;

function createParentSession() {
  const token = crypto.randomBytes(24).toString("hex");
  const now = Date.now();
  parentSessions.set(token, { createdAt: now, lastUsedAt: now });
  return token;
}

// Panel i API Rafcia działają z tego samego adresu. Odrzucamy żądania z obcych stron.
app.use("/api/punktacja", (req, res, next) => {
  const origin = req.get("origin");
  if (origin && origin !== `${req.protocol}://${req.get("host")}`) {
    return res.status(403).json({ error: "Żądanie pochodzi z innej strony." });
  }
  next();
});

// Żadna odpowiedź API punktacji nie może zawierać poświadczenia rodzica.
app.use("/api/punktacja", (req, res, next) => {
  const sendJson = res.json.bind(res);
  res.json = body => sendJson(JSON.parse(JSON.stringify(body, (key, value) =>
    key === "parentPin" ? undefined : value
  )));
  next();
});

function defaultPunktacja() {
  return {
    settings: { gameStarted: false, status: "setup", startDate: "", endDate: "", childName: "", questionOfTheDay: "", questionOfTheDayPoints: 10, questionOfTheDayStatus: {} },
    parentPin: "",
    pinSet: false,
    tasks: [],
    extras: [],
    challenges: [],
    rewards: [],
    consequences: [],
    records: {},
    redemptions: []
  };
}

function loadPunktacja() {
  if (!fs.existsSync(punktacjaDbPath)) {
    const data = defaultPunktacja();
    savePunktacja(data);
    return data;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(punktacjaDbPath, "utf8"));
  } catch (err) {
    console.error("Błąd odczytu punktacja-data.json:", err);
    throw new Error("Nie można odczytać punktacja-data.json. Sprawdź, czy plik zawiera poprawny JSON.");
  }

  if (!data || typeof data !== "object") data = defaultPunktacja();
  if (!data.settings || typeof data.settings !== "object") data.settings = {};
  if (!Array.isArray(data.tasks)) data.tasks = [];
  if (!Array.isArray(data.extras)) data.extras = [];
  if (!Array.isArray(data.challenges)) data.challenges = [];
  if (!Array.isArray(data.rewards)) data.rewards = [];
  if (!Array.isArray(data.consequences)) data.consequences = [];
  if (!Array.isArray(data.bonusPoints)) data.bonusPoints = [];
  if (!data.settings.questionOfTheDayAnswers || typeof data.settings.questionOfTheDayAnswers !== "object" || Array.isArray(data.settings.questionOfTheDayAnswers)) data.settings.questionOfTheDayAnswers = {};
  if (!data.records || typeof data.records !== "object") data.records = {};
  if (!Array.isArray(data.redemptions)) data.redemptions = [];
  let changed = false;
  // Trwałe kolory misji – starsze wpisy dostają kolor przy pierwszym odczycie.
  (data.challenges || []).forEach((mission, index) => {
    if (mission && !/^#[0-9a-f]{6}$/i.test(String(mission.color || ""))) {
      mission.color = punktacjaMissionColors[index % punktacjaMissionColors.length];
      changed = true;
    }
  });
  if (data.parentPin === undefined || data.parentPin === null) data.parentPin = "";
  if (data.pinSet === undefined) data.pinSet = String(data.parentPin || "") !== "" && String(data.parentPin) !== "1234";
  if (!data.pinSet) data.parentPin = "";
  if (data.settings.gameStarted === undefined) data.settings.gameStarted = false;
  if (!data.settings.status) data.settings.status = data.settings.gameStarted ? "active" : "setup";
  if (data.settings.startDate === undefined) data.settings.startDate = "";
  if (data.settings.endDate === undefined) data.settings.endDate = "";
  if (typeof data.settings.childName !== "string") { data.settings.childName = ""; changed = true; }
  // Jednorazowa migracja starszego zapisu: pokaż start, jeśli gra jest jeszcze w konfiguracji.
  if (typeof data.settings.firstSetupPending !== "boolean") {
    data.settings.firstSetupPending = data.settings.status === "setup" && !data.settings.gameStarted;
    changed = true;
  }

  // Automatycznie przełącz zaplanowaną grę na aktywną oraz kończ grę po dacie końcowej.
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const st = data.settings;
  if (st.status === "scheduled" && st.startDate && st.startDate <= today) {
    st.status = "active";
    st.gameStarted = true;
    changed = true;
  }
  if (st.status === "active" && st.endDate && today > st.endDate) {
    st.status = "finished";
    st.gameStarted = false;
    changed = true;
  }
  if (changed) savePunktacja(data);

  return data;
}

function savePunktacja(data) {
  fs.writeFileSync(punktacjaDbPath, JSON.stringify(data, null, 2), "utf8");
}

function parentAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  const session = parentSessions.get(token);
  const now = Date.now();
  if (!session || now - session.createdAt > parentSessionLifetimeMs || now - session.lastUsedAt > parentSessionIdleMs) {
    parentSessions.delete(token);
    return res.status(401).json({ error: "Wymagane uprawnienia rodzica." });
  }
  session.lastUsedAt = now;
  req.parentToken = token;
  next();
}

function makePunktacjaId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getPunktacjaRecord(data, date) {
  if (!data.records[date] || typeof data.records[date] !== "object") {
    data.records[date] = { tasks: {}, extras: {}, challenges: {} };
  }
  data.records[date].tasks ||= {};
  data.records[date].extras ||= {};
  data.records[date].challenges ||= {};
  return data.records[date];
}

function calculateAvailablePoints(data) {
  let total = 0;
  for (const r of Object.values(data.records || {})) {
    for (const t of data.tasks || []) {
      if (r.tasks?.[t.id] === true) total += Number(t.points) || 0;
      if (r.tasks?.[t.id] === false) total -= Number(t.points) || 0;
    }
    for (const e of data.extras || []) {
      if (r.extras?.[e.id] === true) total += Number(e.points) || 0;
    }
    for (const c of data.challenges || []) {
      if (r.challenges?.[c.id] === true) total += Number(c.points) || 0;
    }
  }
  // Match the question rate used by the child screen, including older saves.
  const questionRate = Number(data.settings?.questionOfTheDayPoints);
  const questionPoints = Number.isFinite(questionRate) && questionRate >= 0 ? Math.round(questionRate) : 10;
  for (const status of Object.values(data.settings?.questionOfTheDayStatus || {})) {
    if (status === "done") total += questionPoints;
  }
  for (const x of data.redemptions || []) {
    if (x.status === "approved") total -= Number(x.cost) || 0;
  }
  for (const x of data.consequences || []) {
    total -= Number(x.points) || 0;
  }
  for (const x of data.bonusPoints || []) total += Number(x.points) || 0;
  return total;
}

/* ================= ODCZYT ================= */

app.get("/api/punktacja", (req, res) => {
  try {
    res.json(loadPunktacja());
  } catch (err) {
    console.error("Punktacja GET:", err);
    res.status(500).json({ error: err.message || "Nie udało się odczytać danych punktacji." });
  }
});

/* ================= LOGOWANIE RODZICA ================= */

app.post("/api/punktacja/parent/login", (req, res) => {
  try {
    const loginKey = req.ip;
    const attempts = parentLoginAttempts.get(loginKey);
    if (attempts && attempts.count >= 5 && Date.now() - attempts.startedAt < parentLoginWindowMs) {
      return res.status(429).json({ error: "Zbyt wiele prób. Spróbuj ponownie za 15 minut." });
    }
    const data = loadPunktacja();
    if (!data.pinSet || !data.parentPin) {
      return res.status(428).json({ error: "PIN rodzica nie został jeszcze ustawiony.", code: "PIN_NOT_SET" });
    }
    const pin = String(req.body?.pin ?? "");
    if (!verifyParentPin(pin, String(data.parentPin))) {
      const current = attempts && Date.now() - attempts.startedAt < parentLoginWindowMs
        ? attempts : { count: 0, startedAt: Date.now() };
      current.count += 1;
      parentLoginAttempts.set(loginKey, current);
      return res.status(401).json({ error: "Nieprawidłowy PIN." });
    }
    parentLoginAttempts.delete(loginKey);
    if (!String(data.parentPin).startsWith("scrypt:")) {
      data.parentPin = hashParentPin(pin);
      savePunktacja(data);
    }
    const token = createParentSession();
    res.json({ token });
  } catch (err) {
    console.error("Punktacja login:", err);
    res.status(500).json({ error: err.message || "Błąd logowania." });
  }
});

/* ================= PIERWSZE USTAWIENIE PINU ================= */
app.post("/api/punktacja/parent/setup-pin", (req, res) => {
  try {
    const data = loadPunktacja();
    if (data.pinSet && data.parentPin) {
      return res.status(409).json({ error: "PIN rodzica jest już ustawiony." });
    }
    const pin = String(req.body?.pin ?? "").trim();
    const pinError = parentPinError(pin);
    if (pinError) return res.status(400).json({ error: pinError });
    data.parentPin = hashParentPin(pin);
    data.pinSet = true;
    savePunktacja(data);
    const token = createParentSession();
    res.json({ ok: true, token, data });
  } catch (err) {
    console.error("Punktacja setup PIN:", err);
    res.status(500).json({ error: err.message || "Nie udało się ustawić PIN-u." });
  }
});

app.get("/api/punktacja/parent/session", parentAuth, (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/punktacja/parent/logout", parentAuth, (req, res) => {
  parentSessions.delete(req.parentToken);
  res.json({ ok: true });
});

app.post("/api/punktacja/parent/change-pin", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    const currentPin = String(req.body?.currentPin ?? "");
    const newPin = String(req.body?.newPin ?? "");
    const pinError = parentPinError(newPin);
    if (pinError) return res.status(400).json({ error: pinError });
    const attemptKey = `change:${req.parentToken}`;
    const attempts = parentLoginAttempts.get(attemptKey);
    if (attempts && attempts.count >= 5 && Date.now() - attempts.startedAt < parentLoginWindowMs) {
      return res.status(429).json({ error: "Zbyt wiele prób. Spróbuj ponownie za 15 minut." });
    }
    if (!verifyParentPin(currentPin, String(data.parentPin || ""))) {
      const current = attempts && Date.now() - attempts.startedAt < parentLoginWindowMs
        ? attempts : { count: 0, startedAt: Date.now() };
      current.count += 1;
      parentLoginAttempts.set(attemptKey, current);
      return res.status(401).json({ error: "Dotychczasowy PIN jest nieprawidłowy." });
    }
    if (verifyParentPin(newPin, String(data.parentPin))) {
      return res.status(400).json({ error: "Nowy PIN musi być inny niż dotychczasowy." });
    }
    data.parentPin = hashParentPin(newPin);
    data.pinSet = true;
    savePunktacja(data);
    parentLoginAttempts.delete(attemptKey);
    parentSessions.clear();
    const token = createParentSession();
    res.json({ ok: true, token, data });
  } catch (err) {
    console.error("Punktacja change PIN:", err);
    res.status(500).json({ error: "Nie udało się zmienić PIN-u." });
  }
});

/* ================= USTAWIENIA ================= */

app.post("/api/punktacja/parent/settings", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    const p = req.body || {};

    // Zmiana PIN-u ma osobny endpoint, który wymaga starego PIN-u.
    if (p.parentPin !== undefined) {
      return res.status(400).json({ error: "Zmień PIN w ustawieniach bezpieczeństwa." });
    }

    // Pytanie dnia: zapisujemy wyłącznie przekazane pola, zachowując pozostałe ustawienia.
    data.settings = data.settings && typeof data.settings === "object" ? data.settings : {};
    if (p.questionOfTheDay !== undefined) {
      const question = String(p.questionOfTheDay).trim();
      if (!question) return res.status(400).json({ error: "Treść pytania nie może być pusta." });
      data.settings.questionOfTheDay = question.slice(0, 500);
    }
    if (p.questionOfTheDayPoints !== undefined) {
      const points = Number(p.questionOfTheDayPoints);
      if (!Number.isFinite(points) || points < 0 || points > 1000) {
        return res.status(400).json({ error: "Punkty za pytanie muszą być liczbą od 0 do 1000." });
      }
      data.settings.questionOfTheDayPoints = Math.round(points);
    }
    if (p.questionOfTheDayAnswers !== undefined) {
      if (!p.questionOfTheDayAnswers || typeof p.questionOfTheDayAnswers !== "object" || Array.isArray(p.questionOfTheDayAnswers)) return res.status(400).json({ error: "Nieprawidłowe odpowiedzi na pytanie dnia." });
      data.settings.questionOfTheDayAnswers = p.questionOfTheDayAnswers;
    }
    if (p.questionOfTheDayStatus !== undefined) {
      if (!p.questionOfTheDayStatus || typeof p.questionOfTheDayStatus !== "object" || Array.isArray(p.questionOfTheDayStatus)) {
        return res.status(400).json({ error: "Nieprawidłowy status pytania dnia." });
      }
      data.settings.questionOfTheDayStatus = p.questionOfTheDayStatus;
    }

    savePunktacja(data);
    res.json(data);
  } catch (err) {
    console.error("Punktacja settings:", err);
    res.status(500).json({ error: err.message || "Nie udało się zapisać ustawień." });
  }
});

/* ================= DODAWANIE ================= */

app.post("/api/punktacja/parent/add", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    const body = req.body || {};
    const kind = String(body.kind || "");
    const item = body.item;

    const lists = {
      task: data.tasks,
      extra: data.extras,
      challenge: data.challenges,
      reward: data.rewards
    };
    const prefixes = { task: "t", extra: "e", challenge: "c", reward: "r" };

    if (!lists[kind] || !item || typeof item !== "object") {
      return res.status(400).json({ error: "Nieprawidłowe dane." });
    }

    const name = String(item.name ?? "").trim();
    if (!name) return res.status(400).json({ error: "Podaj nazwę." });

    let obj = {
      id: makePunktacjaId(prefixes[kind]),
      active: true,
      name
    };

    if (kind === "task" || kind === "extra") {
      const points = Number(item.points);
      if (!Number.isFinite(points) || points <= 0) {
        return res.status(400).json({ error: "Punkty muszą być liczbą większą od 0." });
      }
      obj.points = Math.round(points);
      obj.icon = String(item.icon || (kind === "task" ? "⭐" : "🎁"));
    }

    if (kind === "reward") {
      const cost = Number(item.cost);
      if (!Number.isFinite(cost) || cost <= 0) {
        return res.status(400).json({ error: "Próg nagrody musi być liczbą większą od 0." });
      }
      obj.cost = Math.round(cost);
      obj.icon = String(item.icon || "🎁");
    }

    if (kind === "challenge") {
      const localNow = new Date();
      const todayKey = `${localNow.getFullYear()}-${String(localNow.getMonth()+1).padStart(2,"0")}-${String(localNow.getDate()).padStart(2,"0")}`;
      const activeMissions = (data.challenges || []).filter(x => x.active !== false && (!x.end || String(x.end) >= todayKey));
      if (activeMissions.length >= 5) return res.status(400).json({ error: "Można zaplanować maksymalnie 5 misji jednocześnie. Zakończ lub usuń jedną z obecnych misji, aby dodać kolejną." });
      const s = String(item.start || "");
      const e = String(item.end || "");
      const points = Number(item.points);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || !/^\d{4}-\d{2}-\d{2}$/.test(e)) {
        return res.status(400).json({ error: "Wybierz datę początku i końca wyzwania." });
      }
      if (e < s) return res.status(400).json({ error: "Data końca nie może być wcześniejsza." });
      if (!Number.isFinite(points) || points <= 0) {
        return res.status(400).json({ error: "Punkty muszą być liczbą większą od 0." });
      }
      obj.start = s;
      obj.end = e;
      obj.points = Math.round(points);
      const usedColors = new Set(activeMissions.map(x => String(x.color || "").toLowerCase()));
      obj.color = punktacjaMissionColors.find(c => !usedColors.has(c)) || punktacjaMissionColors[activeMissions.length % punktacjaMissionColors.length];
    }

    lists[kind].push(obj);
    savePunktacja(data);
    console.log("PUNKTACJA ADD:", kind, obj.name, obj.id);

    res.json({ ok: true, data });
  } catch (err) {
    console.error("Punktacja ADD:", err);
    res.status(500).json({ error: err.message || "Nie udało się dodać elementu." });
  }
});

/* ================= START / PLANOWANIE GRY ================= */

app.post("/api/punktacja/parent/start", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    const mode = String(req.body?.mode || "immediate");
    const startDate = String(req.body?.startDate || "").trim();
    const endDate = String(req.body?.endDate || "").trim();
    const validDate = s => !s || /^\d{4}-\d{2}-\d{2}$/.test(s);

    if (mode === "immediate") {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
      const configuredStart = String(data.settings.startDate || today);
      const configuredEnd = String(data.settings.endDate || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(configuredStart) || (configuredEnd && (!/^\d{4}-\d{2}-\d{2}$/.test(configuredEnd) || configuredEnd < configuredStart))) return res.status(400).json({error:"Daty gry są nieprawidłowe. Sprawdź początek i koniec gry."});
      const activeNow = configuredStart <= today;
      data.settings = {
        ...data.settings,
        gameStarted: activeNow, status: activeNow ? "active" : "scheduled", startDate: configuredStart, endDate: configuredEnd,
        firstSetupPending: false,
        questionOfTheDay: data.settings.questionOfTheDay || "",
        questionOfTheDayPoints: data.settings.questionOfTheDayPoints ?? 10,
        questionOfTheDayStatus: data.settings.questionOfTheDayStatus || {}
      };
      savePunktacja(data);
      console.log("PUNKTACJA: GRA URUCHOMIONA / ZAPLANOWANA", configuredStart, configuredEnd || "bez końca");
      return res.json({ ok: true, data });
    }

    if (mode !== "scheduled") return res.status(400).json({ error: "Nieprawidłowy tryb uruchomienia gry." });
    if (!validDate(startDate) || !startDate) return res.status(400).json({ error: "Wybierz poprawną datę rozpoczęcia." });
    if (!validDate(endDate)) return res.status(400).json({ error: "Wybierz poprawną datę zakończenia." });

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    if (startDate < today) return res.status(400).json({ error: "Data rozpoczęcia nie może być wcześniejsza niż dzisiaj." });
    if (endDate && endDate < startDate) return res.status(400).json({ error: "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia." });

    const activeNow = startDate <= today;
    data.settings = {
      ...data.settings,
      gameStarted: activeNow,
      status: activeNow ? "active" : "scheduled",
      startDate,
      endDate,
      firstSetupPending: false,
      questionOfTheDay: data.settings.questionOfTheDay || "",
      questionOfTheDayPoints: data.settings.questionOfTheDayPoints ?? 10,
      questionOfTheDayStatus: data.settings.questionOfTheDayStatus || {}
    };
    savePunktacja(data);
    console.log("PUNKTACJA: GRA ZAPLANOWANA", startDate, endDate || "bez końca");
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Punktacja START:", err);
    res.status(500).json({ error: err.message || "Nie udało się uruchomić/zaplanować gry." });
  }
});

app.post("/api/punktacja/parent/stop", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    data.settings.gameStarted = false;
    data.settings.status = "setup";
    data.settings.startDate = "";
    data.settings.endDate = "";
    savePunktacja(data);
    console.log("PUNKTACJA: GRA ZATRZYMANA");
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Punktacja STOP:", err);
    res.status(500).json({ error: err.message || "Nie udało się zatrzymać gry." });
  }
});

/* ================= BONUSOWE PUNKTY OD RODZICA ================= */
app.post("/api/punktacja/parent/bonus", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    const points = Number(req.body?.points);
    const note = String(req.body?.note || "").trim().slice(0, 300);
    if (!Number.isInteger(points) || points <= 0 || points > 100000) return res.status(400).json({ error: "Podaj liczbę punktów od 1 do 100000." });
    const item = { id: makePunktacjaId("bp"), points, note, createdAt: new Date().toISOString() };
    data.bonusPoints ||= []; data.bonusPoints.push(item); savePunktacja(data);
    console.log("PUNKTACJA: BONUS", points, note || "(bez opisu)");
    res.json({ ok: true, data });
  } catch (err) { console.error("Punktacja BONUS:", err); res.status(500).json({ error: err.message || "Nie udało się dodać punktów." }); }
});

/* ================= ODPOWIEDŹ DZIECKA NA PYTANIE DNIA ================= */
app.post("/api/punktacja/question-answer", (req, res) => {
  try {
    const data = loadPunktacja();
    const date = String(req.body?.date || "");
    const answer = String(req.body?.answer || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "Nieprawidłowa data odpowiedzi." });
    if (!answer) return res.status(400).json({ error: "Odpowiedź nie może być pusta." });
    if (answer.length > 1000) return res.status(400).json({ error: "Odpowiedź jest za długa (maks. 1000 znaków)." });
    data.settings ||= {}; data.settings.questionOfTheDayAnswers ||= {};
    if (data.settings.questionOfTheDayAnswers[date]?.answer) return res.status(409).json({ error: "Odpowiedź na to pytanie została już wysłana." });
    data.settings.questionOfTheDayAnswers[date] = { answer, submittedAt: new Date().toISOString() };
    savePunktacja(data); res.json({ ok: true, data });
  } catch (err) { console.error("Punktacja QUESTION ANSWER:", err); res.status(500).json({ error: err.message || "Nie udało się zapisać odpowiedzi." }); }
});

/* ================= KONSEKWENCJE KARNE ================= */

app.post("/api/punktacja/parent/consequence", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    const reason = String(req.body?.reason || "").trim();
    const points = Number(req.body?.points);

    if (!reason) return res.status(400).json({ error: "Wpisz, za co zostają odjęte punkty." });
    if (reason.length > 240) return res.status(400).json({ error: "Opis konsekwencji jest za długi (maks. 240 znaków)." });
    if (!Number.isFinite(points) || points <= 0 || points > 100000) {
      return res.status(400).json({ error: "Liczba odejmowanych punktów musi być większa od 0." });
    }

    const item = {
      id: makePunktacjaId("k"),
      reason,
      points: Math.round(points),
      createdAt: new Date().toISOString()
    };

    data.consequences ||= [];
    data.consequences.push(item);
    savePunktacja(data);
    console.log("PUNKTACJA: KONSEKWENCJA", item.points, item.reason);
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Punktacja CONSEQUENCE:", err);
    res.status(500).json({ error: err.message || "Nie udało się zapisać konsekwencji." });
  }
});

/* ================= EDYCJA ZAPISANEJ KONSEKWENCJI ================= */
app.post("/api/punktacja/parent/consequence/edit", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    const { id, reason, points } = req.body || {};
    const item = (data.consequences || []).find(x => String(x.id) === String(id));

    if (!item) {
      return res.status(404).json({ error: "Nie znaleziono konsekwencji." });
    }

    const cleanReason = String(reason || "").trim();
    const amount = Number(points);

    if (!cleanReason) {
      return res.status(400).json({ error: "Opis konsekwencji nie może być pusty." });
    }
    if (cleanReason.length > 240) {
      return res.status(400).json({ error: "Opis konsekwencji może mieć maksymalnie 240 znaków." });
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
      return res.status(400).json({ error: "Liczba odejmowanych punktów musi być większa od 0 i nie większa niż 100000." });
    }

    item.reason = cleanReason;
    item.points = Math.round(amount);
    item.updatedAt = new Date().toISOString();

    savePunktacja(data);
    console.log("PUNKTACJA: EDYCJA KONSEKWENCJI", item.id, item.points, item.reason);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("Punktacja CONSEQUENCE EDIT:", err);
    return res.status(500).json({ error: err.message || "Nie udało się edytować konsekwencji." });
  }
});

/* ================= NOWA GRA I ARCHIWUM ================= */
// Accept names produced by the writer and the previously supported date-time separator.
const punktacjaArchiveNamePattern = /^rafcia-\d{8}-?\d{6}-[a-z0-9]+\.json$/i;

function rafciaConfigLibraryFrom(data) {
  const old = data.configLibrary && typeof data.configLibrary === "object" ? data.configLibrary : {};
  const copy = (kind, list, key) => {
    const byName = new Map();
    for (const x of [...(old[kind] || []), ...(list || [])]) {
      if (!x || !String(x.name || "").trim()) continue;
      const item = { name: String(x.name).trim(), icon: String(x.icon || "⭐") };
      if (kind === "reward") item.cost = Math.max(1, Number(x.cost) || 1);
      else item.points = Math.max(1, Number(x.points) || 1);
      if (kind === "challenge") { item.start = String(x.start || ""); item.end = String(x.end || ""); }
      byName.set(item.name.toLocaleLowerCase("pl-PL"), item);
    }
    return [...byName.values()];
  };
  return {
    task: copy("task", data.tasks), extra: copy("extra", data.extras),
    challenge: copy("challenge", data.challenges), reward: copy("reward", data.rewards),
    consequence: [...(old.consequence || []), ...(data.consequences || [])].filter(x => x && x.reason).reduce((a,x)=>{if(!a.some(y=>y.reason===x.reason&&Number(y.points)===Number(x.points)))a.push({reason:String(x.reason),points:Number(x.points)||0});return a;},[]),
    question: [...new Set([...(old.question || []), String(data.settings?.questionOfTheDay || "")].filter(Boolean))]
  };
}
function rafciaArchiveLabel(data) {
  const s = data.settings || {};
  return `${s.childName ? "Gra " + s.childName + " • " : "Gra "}${s.startDate || "bez daty"}${s.endDate ? " – " + s.endDate : ""}`;
}
app.get("/api/punktacja/parent/archives", parentAuth, (req, res) => {
  try {
    fs.mkdirSync(punktacjaArchiveDir, { recursive: true });
    const archives = fs.readdirSync(punktacjaArchiveDir).filter(n => punktacjaArchiveNamePattern.test(n)).map(id => {
      try { const d=JSON.parse(fs.readFileSync(path.join(punktacjaArchiveDir,id),"utf8")); return {id,label:d.label||"Gra archiwalna",savedAtLabel:d.savedAt?new Date(d.savedAt).toLocaleString("pl-PL"):"",savedAt:d.savedAt}; } catch (_) { return null; }
    }).filter(Boolean).sort((a,b)=>String(b.savedAt).localeCompare(String(a.savedAt)));
    res.json({ok:true,archives});
  } catch (err) { res.status(500).json({error:err.message||"Nie udało się odczytać archiwum."}); }
});

app.post("/api/punktacja/parent/first-game", (req, res) => {
  try {
    const current = loadPunktacja();
    if (current.pinSet && current.parentPin) return res.status(409).json({error:"Pierwsza gra została już utworzona. Podaj dotychczasowy PIN rodzica."});
    if (current.settings?.gameStarted || current.settings?.childName ||
        ["tasks", "extras", "challenges", "rewards", "bonusPoints", "redemptions", "consequences"].some(key => current[key]?.length) ||
        Object.keys(current.records || {}).length) {
      return res.status(409).json({error:"Istnieją już dane gry. Ustaw PIN w panelu rodzica, aby je zachować."});
    }
    const pin = String(req.body?.pin || "").trim();
    const childName = String(req.body?.childName || "").trim();
    const startDate = String(req.body?.startDate || "");
    const endDate = String(req.body?.endDate || "");
    const pinError = parentPinError(pin);
    if (pinError) return res.status(400).json({error:pinError});
    if (!childName || childName.length > 40) return res.status(400).json({error:"Wpisz imię podróżnika (maksymalnie 40 znaków)."});
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate < startDate) return res.status(400).json({error:"Wybierz poprawne daty początku i końca gry."});
    const fresh = defaultPunktacja();
    fresh.parentPin = hashParentPin(pin); fresh.pinSet = true;
    fresh.configLibrary = rafciaConfigLibraryFrom(current);
    fresh.settings.startDate = startDate; fresh.settings.endDate = endDate; fresh.settings.childName = childName;
    fresh.settings.status = "setup"; fresh.settings.gameStarted = false;
    fresh.settings.firstSetupPending = true;
    savePunktacja(fresh);
    const token = createParentSession();
    console.log("PUNKTACJA: PIERWSZA GRA", childName, startDate, endDate);
    return res.json({ok:true,token,data:fresh});
  } catch (err) {
    console.error("Punktacja FIRST GAME:", err);
    return res.status(500).json({error:err.message||"Nie udało się utworzyć pierwszej gry."});
  }
});

app.post("/api/punktacja/parent/new-game", parentAuth, (req, res) => {
  try {
    const current = loadPunktacja();
    const startDate = String(req.body?.startDate || "");
    const endDate = String(req.body?.endDate || "");
    const childName = String(req.body?.childName || "").trim();
    if (!childName || childName.length > 40) return res.status(400).json({error:"Wpisz imię dziecka (maksymalnie 40 znaków)."});
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return res.status(400).json({error:"Wybierz poprawną datę rozpoczęcia nowej gry."});
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate < startDate) return res.status(400).json({error:"Wybierz poprawną datę zakończenia nowej gry."});
    const library = rafciaConfigLibraryFrom(current);
    let archiveName = null;
    if (req.body?.saveCurrent === true) {
      fs.mkdirSync(punktacjaArchiveDir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0,14);
      archiveName = `rafcia-${stamp}-${crypto.randomBytes(3).toString("hex")}.json`;
      const snapshot = JSON.parse(JSON.stringify(current));
      delete snapshot.parentPin; delete snapshot.pinSet;
      const archive = {format:"system-rafcia-archive",version:1,savedAt:new Date().toISOString(),label:rafciaArchiveLabel(current),data:snapshot};
      const target = path.join(punktacjaArchiveDir, archiveName);
      const temp = target + ".tmp";
      fs.writeFileSync(temp, JSON.stringify(archive,null,2), "utf8");
      fs.renameSync(temp,target);
    }
    const fresh = defaultPunktacja();
    fresh.parentPin = current.parentPin || ""; fresh.pinSet = !!current.pinSet;
    fresh.configLibrary = library;
    fresh.settings.startDate = startDate;
    fresh.settings.endDate = endDate;
    fresh.settings.childName = childName;
    fresh.settings.status = "setup";
    fresh.settings.gameStarted = false;
    fresh.settings.firstSetupPending = false;
    savePunktacja(fresh);
    console.log("PUNKTACJA: NOWA GRA", startDate, archiveName || "bez archiwum");
    res.json({ok:true,data:fresh,archiveId:archiveName});
  } catch (err) {
    console.error("Punktacja NEW GAME:",err);
    res.status(500).json({error:err.message||"Nie udało się utworzyć nowej gry."});
  }
});
app.post("/api/punktacja/parent/archive/load", parentAuth, (req, res) => {
  try {
    const id = String(req.body?.id || "");
    if (!punktacjaArchiveNamePattern.test(id)) return res.status(400).json({error:"Nieprawidłowy identyfikator archiwum."});
    const file = path.join(punktacjaArchiveDir,id);
    if (!fs.existsSync(file)) return res.status(404).json({error:"Nie znaleziono zapisu w archiwum."});
    const archive = JSON.parse(fs.readFileSync(file,"utf8"));
    const incoming = archive?.data;
    if (!incoming || !Array.isArray(incoming.tasks) || !Array.isArray(incoming.extras) || !Array.isArray(incoming.challenges) || !Array.isArray(incoming.rewards) || !incoming.records || typeof incoming.records !== "object") return res.status(400).json({error:"Archiwum ma nieprawidłowy format."});
    const current = loadPunktacja();
    incoming.parentPin = current.parentPin || ""; incoming.pinSet = !!current.pinSet;
    savePunktacja(incoming);
    res.json({ok:true,data:incoming});
  } catch (err) { console.error("Punktacja ARCHIVE LOAD:",err); res.status(500).json({error:err.message||"Nie udało się przywrócić archiwum."}); }
});

/* ================= RESET GRY ================= */

app.post("/api/punktacja/parent/reset", parentAuth, (req, res) => {
  try {
    const current = loadPunktacja();
    const data = defaultPunktacja();
    // Resetuje grę i wszystkie jej dane, ale pozostawia aktualny PIN rodzica.
    data.parentPin = current.parentPin || "";
    data.pinSet = !!current.pinSet;
    savePunktacja(data);
    console.log("PUNKTACJA: PEŁNY RESET GRY");
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Punktacja RESET:", err);
    res.status(500).json({ error: err.message || "Nie udało się zresetować gry." });
  }
});

/* ================= WCZYTYWANIE ZAPISU ================= */

app.post("/api/punktacja/parent/load", parentAuth, (req, res) => {
  try {
    const incoming = req.body?.data;
    if (!incoming || typeof incoming !== "object") {
      return res.status(400).json({ error: "Brak danych zapisu." });
    }

    if (!Array.isArray(incoming.tasks) || !Array.isArray(incoming.extras) ||
        !Array.isArray(incoming.challenges) || !Array.isArray(incoming.rewards) ||
        (incoming.consequences !== undefined && !Array.isArray(incoming.consequences)) ||
        !incoming.records || typeof incoming.records !== "object" ||
        !Array.isArray(incoming.redemptions)) {
      return res.status(400).json({ error: "Nieprawidłowy format zapisu Systemu Rafcia." });
    }

    const data = {
      settings: incoming.settings && typeof incoming.settings === "object"
        ? {
            gameStarted: !!incoming.settings.gameStarted,
            status: ["setup","scheduled","active","finished"].includes(incoming.settings.status)
              ? incoming.settings.status
              : (incoming.settings.gameStarted ? "active" : "setup"),
            startDate: typeof incoming.settings.startDate === "string" ? incoming.settings.startDate : "",
            endDate: typeof incoming.settings.endDate === "string" ? incoming.settings.endDate : "",
            questionOfTheDay: typeof incoming.settings.questionOfTheDay === "string" ? incoming.settings.questionOfTheDay : "",
            questionOfTheDayPoints: Number.isFinite(Number(incoming.settings.questionOfTheDayPoints)) ? Math.max(0, Math.min(1000, Math.round(Number(incoming.settings.questionOfTheDayPoints)))) : 10,
            questionOfTheDayStatus: incoming.settings.questionOfTheDayStatus && typeof incoming.settings.questionOfTheDayStatus === "object" && !Array.isArray(incoming.settings.questionOfTheDayStatus) ? incoming.settings.questionOfTheDayStatus : {},
            questionOfTheDayAnswers: incoming.settings.questionOfTheDayAnswers && typeof incoming.settings.questionOfTheDayAnswers === "object" && !Array.isArray(incoming.settings.questionOfTheDayAnswers) ? incoming.settings.questionOfTheDayAnswers : {},
            childName: typeof incoming.settings.childName === "string" ? incoming.settings.childName.trim().slice(0,40) : ""
          }
        : { gameStarted: false, status: "setup", startDate: "", endDate: "" },
      // PIN jest poświadczeniem dostępu i nie jest zmieniany przez plik save.
      parentPin: loadPunktacja().parentPin || "",
      pinSet: !!loadPunktacja().pinSet,
      tasks: incoming.tasks,
      extras: incoming.extras,
      challenges: incoming.challenges,
      rewards: incoming.rewards,
      consequences: incoming.consequences || [],
      records: incoming.records,
      redemptions: incoming.redemptions,
      bonusPoints: Array.isArray(incoming.bonusPoints) ? incoming.bonusPoints : [],
      configLibrary: incoming.configLibrary && typeof incoming.configLibrary === "object" ? incoming.configLibrary : {}
    };

    // Nie pozwalamy plikowi zapisu zmienić innych danych serwera.
    savePunktacja(data);
    console.log("PUNKTACJA: WCZYTANO ZAPIS");
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Punktacja LOAD:", err);
    res.status(500).json({ error: err.message || "Nie udało się wczytać zapisu." });
  }
});

/* ================= ROZLICZANIE DNIA ================= */

app.post("/api/punktacja/parent/day", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    const { date, kind, id, status } = req.body || {};

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) {
      return res.status(400).json({ error: "Nieprawidłowa data." });
    }

    const map = { task: "tasks", extra: "extras", challenge: "challenges" };
    if (!map[kind]) return res.status(400).json({ error: "Nieprawidłowy rodzaj." });

    const item = (data[map[kind]] || []).find(x => x.id === id && x.active !== false);
    if (!item) return res.status(404).json({ error: "Nie znaleziono elementu." });

    const r = getPunktacjaRecord(data, date);

    if (kind === "task") {
      if (!["done", "missed", "pending"].includes(status)) {
        return res.status(400).json({ error: "Nieprawidłowy status obowiązku." });
      }
      if (status === "done") r.tasks[id] = true;
      else if (status === "missed") r.tasks[id] = false;
      else delete r.tasks[id];
    }

    if (kind === "extra") {
      if (!["done", "off"].includes(status)) {
        return res.status(400).json({ error: "Nieprawidłowy status ekstra." });
      }
      if (status === "done") r.extras[id] = true;
      else delete r.extras[id];
    }

    if (kind === "challenge") {
      if (status !== "done") return res.status(400).json({ error: "Nieprawidłowy status wyzwania." });
      const already = Object.values(data.records).some(x => x.challenges?.[id] === true);
      if (already && r.challenges?.[id] !== true) {
        return res.status(400).json({ error: "To wyzwanie jest już zaliczone." });
      }
      r.challenges[id] = true;
    }

    savePunktacja(data);
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Punktacja DAY:", err);
    res.status(500).json({ error: err.message || "Nie udało się zapisać rozliczenia dnia." });
  }
});

/* ================= USUWANIE ================= */

app.post("/api/punktacja/parent/delete", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    const { kind, id } = req.body || {};
    const map = { task: "tasks", extra: "extras", challenge: "challenges", reward: "rewards", consequence: "consequences" };
    if (!map[kind]) return res.status(400).json({ error: "Nieprawidłowy rodzaj." });
    data[map[kind]] = data[map[kind]].filter(x => x.id !== id);
    savePunktacja(data);
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Punktacja DELETE:", err);
    res.status(500).json({ error: err.message || "Nie udało się usunąć elementu." });
  }
});

/* ================= PROŚBA O NAGRODĘ ================= */

app.post("/api/punktacja/reward-request", (req, res) => {
  try {
    const data = loadPunktacja();
    const reward = data.rewards.find(x => x.id === req.body?.rewardId && x.active !== false);
    if (!reward) return res.status(404).json({ error: "Nie znaleziono nagrody." });

    const available = calculateAvailablePoints(data);
    if (available < Number(reward.cost)) return res.status(400).json({ error: "Za mało punktów." });

    const already = data.redemptions.find(x => x.rewardId === reward.id && x.status === "pending");
    if (already) return res.status(400).json({ error: "Ta nagroda już oczekuje na zatwierdzenie." });

    data.redemptions.push({
      id: makePunktacjaId("rr"),
      rewardId: reward.id,
      rewardName: reward.name,
      cost: Number(reward.cost),
      status: "pending",
      requestedAt: new Date().toISOString()
    });

    savePunktacja(data);
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Reward request:", err);
    res.status(500).json({ error: err.message || "Nie udało się wysłać prośby." });
  }
});

/* ================= ZATWIERDZANIE NAGRODY ================= */

app.post("/api/punktacja/parent/reward", parentAuth, (req, res) => {
  try {
    const data = loadPunktacja();
    const { id, action } = req.body || {};
    const item = data.redemptions.find(x => x.id === id);

    if (!item || item.status !== "pending") {
      return res.status(404).json({ error: "Nie znaleziono oczekującej nagrody." });
    }
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Nieprawidłowa decyzja." });
    }

    if (action === "approve") {
      const available = calculateAvailablePoints(data);
      if (available < item.cost) {
        return res.status(400).json({ error: "Punktów jest już za mało, aby zatwierdzić nagrodę." });
      }
      item.status = "approved";
      item.approvedAt = new Date().toISOString();
    } else {
      item.status = "rejected";
      item.rejectedAt = new Date().toISOString();
    }

    savePunktacja(data);
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Punktacja REWARD:", err);
    res.status(500).json({ error: err.message || "Nie udało się obsłużyć nagrody." });
  }
});

/* ================= STRONA PUNKTACJI ================= */

app.get("/punktacja", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "punktacja", "index.html"));
});

/* ================= KONIEC SYSTEMU PUNKTACJI ================= */

if (require.main === module) app.listen(3000, "127.0.0.1", () => {

  console.log(
    "🚀 Serwer działa:"
  );

  console.log("System Rafcia: http://localhost:3000/");
  console.log("Mapa: http://localhost:3000/mapa");

  console.log(
    "Koło fortuny: http://localhost:3000/kolo"
  );

console.log(
  "Grunwald: http://localhost:3000/grunwald"
);
});

module.exports = app;
