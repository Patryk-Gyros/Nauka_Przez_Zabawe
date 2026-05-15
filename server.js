const express = require("express");
const cors = require("cors");
require("dotenv").config();

const multer = require("multer");
const OpenAI = require("openai").default;
const path = require("path");

const cleanJsonFromAI =
  require("./utils/cleanJsonFromAI");

const upload =
  multer({ storage: multer.memoryStorage() });

const openai =
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

const app = express();

app.use(cors());
app.use(express.json());

/* ================= STATIC ================= */

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

/* ================= STRONA GŁÓWNA ================= */

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "mapa",
      "index.html"
    )
  );

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

/* ================= AI ================= */

let generatedQuestions = null;

/* ===== ANALIZA ===== */

app.post(
  "/analizuj",
  upload.array("images"),
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

app.listen(3000, () => {

  console.log(
    "🚀 Serwer działa:"
  );

  console.log(
    "Mapa: http://localhost:3000/mapa"
  );

  console.log(
    "Koło fortuny: http://localhost:3000/kolo"
  );

});