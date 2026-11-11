# System Rafcia — wskazówki do kodu

System Rafcia obejmuje panel rodzica i dziecka. Gry historyczne i rowerowa są osobnymi modułami. Nie zakładaj, że prototyp jest gotowy do produkcji.

Źródło aktywnego interfejsu: `public/punktacja/`; API i zapis: sekcja `/api/punktacja` w `server.js`.

Dokumenty aplikacji: `docs/REQUIREMENTS.md` opisuje zakres, `docs/RAFCIO.md` zależności modułów, a `docs/RUNBOOK.md` uruchomienie.

Nie commituj `.env`, `node_modules/`, `punktacja-data.json` ani `punktacja-archive/`. Nie testuj mutacji na prawdziwych danych.
