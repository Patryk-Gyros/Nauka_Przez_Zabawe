# Nauka przez Zabawę — System Rafcia

Repo zawiera prototyp Systemu Rafcia: panel rodzica do planowania i oceniania obowiązków oraz panel dziecka do śledzenia zadań, punktów i nagród. Strona główna `/` prowadzi do Rafcia. Pozostałe gry są obecnie osobnymi modułami i nie przekazują wyników do jego punktacji.

## Szybki start

Wymagania: Node.js 18+ i npm. W katalogu repo:

```sh
npm ci
npm start
```

Otwórz [http://localhost:3000](http://localhost:3000). Serwer przekieruje na `/punktacja/`. Przy pierwszym użyciu rodzic ustawia PIN. Stan zapisuje się lokalnie w `punktacja-data.json`; ten plik nie jest częścią repo.

Klucz OpenAI nie jest potrzebny do Rafcia. Tylko generator quizu pod `/kolo` wymaga pliku `.env` z `OPENAI_API_KEY=...`; wzór jest w `.env.example`.

## Mapa repo

| Ścieżka | Rola |
|---|---|
| `server.js` | Express: trasy modułów, API Rafcia i zapis JSON |
| `public/punktacja/` | Aktywny panel rodzica i dziecka |
| `public/kolo-fortuny/`, `public/mapa/`, `public/grunwald/`, `public/gra-rowerowa/` | Samodzielne gry; integracja z Rafciem później |
| `docs/` | Wymagania, architektura i uruchomienie |

## Status

To prototyp na jedną lokalną instancję. Sesje są w pamięci serwera, a dane w lokalnym JSON; obecna konstrukcja nie obsługuje wielu rodzin ani kilku instancji serwera.

Szczegóły: [wymagania](docs/REQUIREMENTS.md), [uruchomienie](docs/RUNBOOK.md), [mapa Rafcia](docs/RAFCIO.md). Zasady dla agentów: [AGENTS.md](AGENTS.md).
