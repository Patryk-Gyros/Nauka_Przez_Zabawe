# NpZ — Nauka przez Zabawę

Interaktywna platforma edukacyjna dla szkół podstawowych i średnich. Nauczyciel fotografuje strony podręcznika, AI generuje quiz historyczny, uczniowie grają — na żywo lub z pobranego pliku offline.

---

## Moduły

| Moduł | Adres | Opis |
|---|---|---|
| **Generator quizów AI** | `/kolo` | Wgraj zdjęcia podręcznika → GPT-4o tworzy pytania → edytujesz → pobierasz grę jako `.html` |
| **Koło Fortuny** | pobrany `.html` | Standalone gra offline — 6 kategorii × 3 pytania, losowanie kołem |
| **Mapa Historyczna** | `/mapa` | 3-etapowa gra: Imperium Karola Wielkiego → Europa Wschodnia → Plemiona Polskie |
| **Mapa 815 n.e.** | `/mapa815` | Uproszczona, samodzielna wersja mapy historycznej z opcją powiększenia |

---

## Jak to działa — user flow

### Ścieżka A: AI → Koło Fortuny

```
1. Otwórz http://localhost:3000/kolo
2. Wgraj zdjęcia stron podręcznika (np. rozdział z podręcznika historii)
3. Kliknij "Analizuj materiał"
   → GPT-4o analizuje obrazy i generuje 6 kategorii × 3 pytania z wyjaśnieniami
4. W edytorze: popraw treść pytań, zmień poprawną odpowiedź (kliknij wybraną)
5. Kliknij "Zapisz wersję offline" → pobiera się gotowy plik .html z grą
6. Otwórz pobrany plik w przeglądarce — gra działa bez dostępu do internetu
```

### Ścieżka B: Mapa Historyczna

```
1. Otwórz http://localhost:3000/mapa
2. Etap 1 — Imperium Karola Wielkiego (rok 815):
   Kliknij 7 krajów na współczesnej mapie Europy, które wchodziły w skład imperium.
   Porównanie: mapa historyczna (lewa) vs. współczesna (prawa).
3. Etap 2 — Europa Wschodnia:
   Kliknij 14 krajów Europy Wschodniej.
4. Etap 3 — Plemiona Polskie:
   Kliknij terytoria 7 plemion na mapie Polski.
   Panel boczny pokazuje nazwę, opis historyczny, symbol plemienny i ważne miasta.
5. Wynik końcowy: max 28 punktów (7 + 14 + 7).
```

---

## Architektura projektu

```
NpZ/
├── server.js                      ← Express server, routes, integracja OpenAI
├── .env                           ← klucz API (nie commitować!)
├── .env.example                   ← szablon zmiennych środowiskowych
├── package.json
├── utils/
│   └── cleanJsonFromAI.js         ← czyści odpowiedź GPT z markdown/szumu
└── public/
    ├── kolo-fortuny/
    │   ├── index.html             ← ekran uploadu zdjęć
    │   ├── edytor.html            ← edycja pytań + generacja pliku offline
    │   └── gra-szablon.html       ← szablon HTML standalone gry
    └── mapa/
        ├── index.html             ← 3-etapowa gra mapowa
        ├── mapa815.html           ← uproszczona mapa 815 n.e.
        ├── auto_mapper.html       ← narzędzie dev: mapowanie kolorów hitmaps
        ├── style.css
        ├── js/
        │   ├── main.js            ← główna logika gry (etapy, HUD, score)
        │   ├── tribesGame.js      ← logika etapu plemion
        │   ├── europe815Game.js   ← logika mapy 815 n.e.
        │   ├── europeGame.js      ← logika mapy współczesnej
        │   ├── regions815.js      ← mapowanie kolor RGB → kraj (815 n.e.)
        │   ├── regionsNow.js      ← mapowanie kolor RGB → kraj (współczesność)
        │   └── historicalMapping.js ← które kraje = Imperium Karola Wielkiego
        ├── assets/
        │   └── maps/
        │       ├── europe_815.png         ← mapa historyczna (wyświetlana)
        │       ├── europe_815_hitmap.png  ← niewidoczna mapa kolorów (detekcja kliknięć)
        │       ├── europe_now.png         ← mapa współczesna
        │       ├── europe_now.hitmap.png  ← hitmap współczesna
        │       └── poland/                ← obrazy i ikony 7 plemion polskich
        └── tribes/
            ├── mapa.png           ← mapa terytoriów plemiennych
            ├── hitmap.png         ← hitmap plemienna
            ├── game.js            ← logika gry plemiennej (standalone)
            └── [obrazy i ikony 7 plemion]
```

### System hitmaps

Każda mapa interaktywna ma niewidoczny odpowiednik (hitmap), w którym każdy region ma unikalny kolor RGB. Gdy użytkownik kliknie canvas, aplikacja odczytuje wartość piksela z hitmapa i mapuje kolor na nazwę kraju lub plemienia. Dzięki temu detekcja kliknięć jest szybka i nie wymaga SVG ani zewnętrznych bibliotek.

---

## Wymagania

- **Node.js** ≥ 18
- **Klucz API OpenAI** z dostępem do modelu `gpt-4o` (vision)

---

## Instalacja i uruchomienie

```bash
# 1. Zainstaluj zależności
npm install

# 2. Skonfiguruj zmienne środowiskowe
cp .env.example .env
# Otwórz .env i wpisz swój klucz OpenAI

# 3. Uruchom serwer
node server.js
```

Aplikacja dostępna na:
- `http://localhost:3000` — Mapa Historyczna (domyślna strona)
- `http://localhost:3000/kolo` — Generator quizów AI
- `http://localhost:3000/mapa815` — Mapa 815 n.e. (uproszczona)

---

## Zmienne środowiskowe

| Zmienna | Opis | Wymagana |
|---|---|---|
| `OPENAI_API_KEY` | Klucz API OpenAI (model `gpt-4o`) | Tak |

---

## Format danych quizu

GPT-4o zwraca (i `cleanJsonFromAI.js` waliduje) następującą strukturę:

```json
[
  {
    "category": "Nazwa kategorii",
    "questions": [
      {
        "question": "Treść pytania",
        "answers": [
          "Poprawna odpowiedź",
          "Błędna odpowiedź 1",
          "Błędna odpowiedź 2"
        ],
        "explanation": "Dokładnie dwa zdania wyjaśnienia."
      }
    ]
  }
]
```

Wymagania struktury: dokładnie 6 kategorii, każda z dokładnie 3 pytaniami. Poprawna odpowiedź zawsze jako pierwszy element tablicy `answers` (edytor pozwala to zmienić przed eksportem).

---

## Ograniczenia

- **Jeden użytkownik naraz** — wygenerowane pytania są przechowywane w pamięci RAM serwera jako jedna globalna zmienna. Przy dwóch równoległych sesjach dane nadpisują się nawzajem.
- **Dokładnie 6 kategorii** — edytor narzuca ten limit przy eksporcie pliku offline.
- **Standalone game** — pobrany plik `.html` działa w pełni bez internetu (dane quizu są wbudowane w plik).

---

## Narzędzia deweloperskie

### `auto_mapper.html`

Narzędzie do tworzenia nowych hitmaps. Umożliwia wczytanie mapy i odpowiadającego jej hitmapa, a następnie interaktywne przypisanie nazw regionów do kolorów RGB. Eksportuje gotowy obiekt JavaScript do wklejenia w plik `regions*.js`.

Dostępne pod: `http://localhost:3000/mapa/auto_mapper.html`
