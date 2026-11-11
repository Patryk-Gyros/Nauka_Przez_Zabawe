# Uruchomienie i diagnostyka

Polecenia wykonuj z katalogu `ai-gra-historia`, w którym leżą `package.json` i `server.js`.

## Lokalny start

1. Zainstaluj Node.js 18+ i kompatybilne npm. Sprawdź `node --version` i `npm --version`.
2. Uruchom `npm ci` w katalogu repo; użyje wersji zapisanych w `package-lock.json`.
3. Uruchom `npm start`. Serwer nasłuchuje na porcie 3000.
4. Otwórz `http://localhost:3000/`; adres przekierowuje na `/punktacja/`.

Na czystej instalacji `punktacja-data.json` powstanie przy pierwszym odczycie API. Jeśli istnieje lokalny plik danych, aplikacja użyje go bez resetowania. Nie podmieniaj go przykładowymi danymi ani nie wpisuj PIN-u w dokumentacji.

Przy pierwszej grze rodzic ustawia własny PIN długości 6–12 cyfr i wpisuje imię dziecka. Proste kody, takie jak `111111` lub `123456`, są odrzucane. Starszy PIN 4-cyfrowy nadal działa przy logowaniu; po zmianie nowy PIN musi spełniać aktualne zasady. Panel dziecka nie wymaga PIN-u. Po przejściu do panelu dziecka lub ekranu startowego sesja rodzica jest zamykana; w panelu rodzica wygasa też po 15 minutach bezczynności.

Jeśli rodzic zapomni PIN-u: zatrzymaj serwer, uruchom `npm run reset:pin` w terminalu i wpisz nowy PIN dwa razy. Polecenie zachowuje dane gry i tworzy lokalną kopię w ignorowanym katalogu `punktacja-archive/`. Po resecie uruchom `npm start` i zaloguj się nowym PIN-em.

Generator quizów jest oddzielny: aby działał endpoint `/analizuj`, skopiuj `.env.example` do `.env` i ustaw `OPENAI_API_KEY`. Rafcio tego klucza nie wymaga. Nie commituj `.env`.

## Szybka kontrola

- `node --check server.js` i `node --check public/punktacja/app.js` sprawdzają składnię.
- `curl -I http://localhost:3000/` powinien pokazać przekierowanie do `/punktacja/`.
- `curl -I http://localhost:3000/punktacja/` powinien zwrócić stronę HTML.
- W przeglądarce sprawdź osobno pierwszy PIN, ponowne logowanie, panel dziecka i zapis po restarcie. Do testów zapisujących używaj odizolowanej kopii projektu i danych.

## Znane ograniczenia

Port 3000 jest obecnie wpisany na stałe w `server.js`. Jeśli jest zajęty, zakończ wcześniejszy proces albo zmień port w kodzie. Serwer nasłuchuje tylko na tym komputerze (`127.0.0.1`). Dane JSON są lokalne i zapisywane synchronicznie; nie uruchamiaj kilku serwerów na jednym pliku. Sesje rodzica znikają po restarcie.

Gdy coś nie działa, sprawdź najpierw terminal z serwerem oraz konsolę przeglądarki.
