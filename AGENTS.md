# Rafcio — wspólne zasady dla programistów i agentów

Rafcio jest aplikacją dla wszystkich dzieci, również dzieci o różnych potrzebach rozwojowych. To prototyp obejmujący panel rodzica i dziecka; nie deklaruj gotowości produkcyjnej.

## Przed zadaniem

1. Przeczytaj ten plik oraz dokumentację dotyczącą zmienianego modułu. Nie czytaj całego repo przy drobnej operacji.
2. Sprawdź zatwierdzone [decyzje](docs/DECISIONS.md), właściwe Issue, zależności i powiązane PR. Gdy nie masz dostępu do GitHub, zaznacz brak weryfikacji i poproś o aktualne informacje potrzebne do pracy.
3. Sprawdź gałąź, status Git i odpowiednie zmiany względem uzgodnionej bazy. Lokalny `origin/main` może być nieaktualny. Nie nadpisuj cudzych ani niezidentyfikowanych zmian.
4. Określ zakres i typ zmiany: **A** — refaktor bez zmiany zachowania; **B** — naprawa względem potwierdzonego wymagania; **C** — rozwój produktu wymagający osobnej zgody. Dla istotnej zmiany przedstaw plan i uzgodnij brakujące decyzje przed implementacją.

## Źródła i granice

- [REQUIREMENTS.md](docs/REQUIREMENTS.md): zakres i kryteria; [RAFCIO.md](docs/RAFCIO.md): mechaniki i moduły; [KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md): potwierdzone ograniczenia; [RUNBOOK.md](docs/RUNBOOK.md): uruchomienie.
- Aktywny interfejs: `public/punktacja/`; API i zapis: sekcja `/api/punktacja` w `server.js`.
- Zachowuj punkty, wymianę na nagrody, obowiązki, Siedem Szczytów i ekwipunek. Rozbieżność dokumentacja–kod zgłoś; nie rozstrzygaj jej samodzielnie. Wpis w backlogu lub rekomendacja audytu nie oznacza zgody na wdrożenie.
- Pozostałe gry, ich zasoby i narzędzia pozostają nietknięte w bieżącej modernizacji: nie usuwaj, nie przenoś i nie refaktoryzuj ich. Zmiana wspólnego serwera lub zależności wpływająca na te moduły wymaga uzgodnienia zakresu; szczegóły w [workflow](docs/TEAM_WORKFLOW.md).

## Współpraca

- Łukasz odpowiada domyślnie za architekturę, backend, integracje, infrastrukturę, bezpieczeństwo, jakość, CI/CD, środowiska i wdrożenia. Patryk za kierunek produktu, mechaniki, grę, propozycje UI/UX i implementację uzgodnionych zadań. Podział jest elastyczny; propozycje obu osób są równorzędne.
- Istotne decyzje architektoniczne, produktowe i infrastrukturalne uzgadniają obaj programiści. Agent nie zatwierdza decyzji w ich imieniu.
- Pracuj na osobnej gałęzi i w niezależnym checkoutcie przy równoległej pracy. Bez bezpośrednich zmian na `main`, nadpisywania cudzej gałęzi i automatycznego merge. Push i merge wykonuj tylko w zakresie jawnego upoważnienia; merge wymaga review i zatwierdzenia drugiego programisty.
- Niezależne sesje agentów nie komunikują się automatycznie. Przekazuj stan przez Issue, PR, komentarze i dokumenty. Stosuj [TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md) oraz [szablon PR / handoff](.github/pull_request_template.md).

## Jakość, dane i koszty

- Pracuj małymi krokami. Oddzielaj reguły biznesowe od HTTP, DOM i zapisu; waliduj wejście na serwerze. Nie dodawaj zależności bez uzasadnienia ani własnej kryptografii.
- Przed większym refaktorem zabezpiecz zmieniane reguły testami opisującymi ich dotychczasowe zachowanie. Weryfikuj regresję proporcjonalnie do zmiany; przy dokumentacji sprawdź linki, spójność i diff. Nie deklaruj niewykonanych testów.
- Nie testuj mutacji na prawdziwych danych. Nawet odczyt API może zapisać migrację. Używaj danych syntetycznych i odizolowanego zapisu.
- Nie commituj ani nie ujawniaj `.env`, poświadczeń, danych dzieci, `node_modules/`, `punktacja-data.json` i `punktacja-archive/`.
- Budżet wynosi obecnie **0 PLN/mies.**; **100–200 PLN/mies.** jest przyszłym wariantem, nie przyznanym budżetem. Płatne usługi wymagają osobnej decyzji oraz zweryfikowanych cen, limitów, ryzyk i planu wyjścia.
- Aktualizuj właściwe istniejące dokumenty. Zatwierdzone istotne decyzje zapisuj w `docs/DECISIONS.md`; nie usuwaj historii decyzji zastąpionych.

## Zakończenie

Sprawdź zakres diffu, wyniki wymaganych kontroli i brak danych prywatnych. Zostaw handoff z commitami, decyzjami, testami wykonanymi i niewykonanymi, ryzykami oraz dalszymi krokami. Brak zgody na push oznacza lokalny commit i przekazanie jego identyfikatora, nie publikację.
