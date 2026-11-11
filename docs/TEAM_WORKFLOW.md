# Współpraca Łukasza, Patryka i agentów AI

## Odpowiedzialność i źródła informacji

| Osoba | Domyślna odpowiedzialność |
| --- | --- |
| Łukasz | Architektura, backend, integracje, infrastruktura, bezpieczeństwo, jakość, CI/CD, środowiska i wdrożenia |
| Patryk | Pomysły produktowe, mechaniki, interaktywna gra, propozycje UI/UX oraz implementacja uzgodnionych zadań |

Podział jest elastyczny. Każdy może proponować i wykonywać uzgodnione prace w całym projekcie. Propozycje Patryka i Łukasza analizujemy według tych samych kryteriów. Istotne zmiany produktu, architektury i infrastruktury wymagają uzgodnienia obu programistów; brak odpowiedzi nie jest zgodą.

- [AGENTS.md](../AGENTS.md) jest krótką instrukcją startową dla obu agentów.
- [REQUIREMENTS.md](REQUIREMENTS.md) i [RAFCIO.md](RAFCIO.md) opisują produkt; [KNOWN_ISSUES.md](KNOWN_ISSUES.md) opisuje znane problemy; [RUNBOOK.md](RUNBOOK.md) opisuje uruchomienie.
- [DECISIONS.md](DECISIONS.md) przechowuje zatwierdzone istotne ustalenia i historię ich zastępowania.
- Issue zawiera cel, zakres, właściciela, zależności, kryteria akceptacji i status pracy. PR zawiera zmianę, review oraz handoff. Historia Git wskazuje konkretną wersję kodu.

Niezależne sesje agentów nie mają automatycznie wspólnej pamięci ani kanału komunikacji. Nie wystarczy napisać „drugi agent wie”. Istotną informację należy umieścić w dostępnym dla obu programistów artefakcie. Lokalna pamięć poza repo może pomóc autorowi, ale nie zastępuje Issue, PR ani decyzji w repo.

## Bieżący zakres i audyt

Modernizujemy przede wszystkim Rafcia: aktywny interfejs `public/punktacja/`, jego API i zapis oraz dokumentację i kontrole dotyczące tego modułu.

Pozostałe gry, ich zasoby i narzędzia są zachowywane na potrzeby przyszłej interaktywnej gry. Dotyczy to m.in. `public/kolo-fortuny/`, `public/mapa/`, `public/grunwald/`, `public/gra-rowerowa/` oraz historycznych edytorów i prototypów. Nie usuwamy, nie przenosimy ani nie refaktoryzujemy ich w ramach bieżącej modernizacji.

Wspólne pliki, np. `server.js` i zależności, nie należą wyłącznie do Rafcia. Przed ich zmianą opisz wpływ na pozostałe moduły i uzgodnij ewentualny zakres wspólny. Wykryty problem bezpieczeństwa zgłoś z priorytetem i dowodem; samo znalezienie go nie upoważnia do rozszerzenia zakresu implementacji.

Raport audytu z 11 listopada 2026 pozostaje oceną i propozycją planu, nie zatwierdzeniem wszystkich napraw ani nowej architektury. Nie zmieniamy jego ustaleń technicznych. Nowa granica zakresu oznacza, że także zalecenia dotyczące pozostałych gier i wspólnych usług wymagają osobnego uzgodnienia.

Przy utrwalaniu audytu korzystaj z istniejących dokumentów: problem trafia do `KNOWN_ISSUES.md`, wymaganie do `REQUIREMENTS.md` lub `RAFCIO.md`, a przyjęta istotna decyzja do `DECISIONS.md`. Zadania modernizacji są osobnymi Issues powiązanymi z dowodem. Nie przepisuj całego raportu do każdego Issue i nie oznaczaj rekomendacji jako zatwierdzonej bez decyzji ludzi.

## Od zgłoszenia do implementacji

1. **Zgłoszenie.** Użyj szablonu [zadania](../.github/ISSUE_TEMPLATE/task.yml) albo [pomysłu](../.github/ISSUE_TEMPLATE/idea.yml). Drobne powiązane poprawki mogą należeć do jednego istniejącego Issue; nie zakładaj nowego dla każdego pliku.
2. **Uzgodnienie.** Określ cel, typ A/B/C, zakres i wyłączenia, osobę odpowiedzialną, zależności, kryteria akceptacji i wymagane decyzje. Dla B wskaż potwierdzone wymaganie oraz błąd; dla C uzyskaj osobną akceptację.
3. **Podjęcie pracy.** Sprawdź aktywne zadania i PR dotykające tych samych modułów. Zapisz w Issue właściciela, gałąź i status „w toku”, jeśli publikacja jest upoważniona. Zanim druga osoba rozpocznie nakładające się prace, uzgodnij podział.
4. **Stan kodu.** Sprawdź `git status`, gałąź, bazę i właściwy diff. Przed rozpoczęciem pobierz aktualne referencje ze zdalnego repo, jeśli masz dostęp; sam lokalny `origin/main` nie dowodzi aktualności. Nie wykonuj automatycznego pull na brudnym checkoutcie.
5. **Gałąź.** Utwórz własną gałąź z aktualnego, uzgodnionego `main`, np. `docs/123-team-workflow`, `fix/124-archive-read` lub `feat/125-approved-feature`. Jedna gałąź realizuje jeden spójny zakres. Nie pracuj bezpośrednio na `main`.
6. **Implementacja.** Przy istotnej zmianie przedstaw plan przed edycją. Zabezpiecz zmieniane zachowania odpowiednimi testami, pracuj w małych commitach, aktualizuj dokumentację i nie poszerzaj zakresu samodzielnie.
7. **Publikacja.** Wykonaj push i utwórz PR tylko w zakresie jawnego upoważnienia. Użyj [szablonu PR](../.github/pull_request_template.md), wskaż Issue i poproś drugiego programistę o review. Nie ustawiaj automatycznego merge.
8. **Review i merge.** Autor poprawia uwagi, a drugi programista zatwierdza aktualny zakres zmian. Istotna zmiana po review wymaga ponownego przeglądu. Merge następuje dopiero po wymaganych kontrolach, review i upoważnieniu do merge. Zgoda na implementację lub push nie jest zgodą na merge ani wdrożenie.
9. **Zamknięcie.** Po rzeczywistym scaleniu uzupełnij Issue, decyzje i wymagane dalsze działania. Lokalny commit, otwarty PR lub zielone CI nie oznaczają ukończenia wdrożenia.

Agent może przygotować treść Issue, komentarza lub PR lokalnie, ale nie publikuje jej bez upoważnienia. Gdy GitHub jest niedostępny albo publikacja nie jest zatwierdzona, użyj tymczasowego ID, np. `LOCAL-20261111-TEAM`, i przekaż handoff użytkownikowi. Przy późniejszej publikacji zastąp lokalne ID odnośnikiem do Issue. Nie udawaj, że zespół widzi jeszcze nieopublikowaną gałąź.

Status zadania zapisujemy w Issue: **do uzgodnienia → gotowe → w toku → do review → zakończone**; **zablokowane** wymaga przyczyny i następnego kroku. „Gotowe” oznacza wystarczająco zatwierdzony zakres, nie sam wpis do backlogu.

## Ochrona równoległej pracy

- Każdy programista/agent używa własnego checkoutu lub worktree oraz własnych danych testowych. Dwie aktywne sesje nie przełączają gałęzi w tym samym katalogu.
- Przed edycją sprawdź niezacommitowane zmiany. Nie używaj resetu, czyszczenia katalogu ani podmiany plików do usuwania cudzej pracy.
- Przy nakładających się zadaniach wskaż konflikt w obu Issues/PR i ustal kolejność lub podział plików. Zależny PR wskazuje bazowy PR i nie jest scalany przed nim.
- Nie przepisuj opublikowanej historii współdzielonej gałęzi. Force push i rebase cudzej pracy nie są rutynowym sposobem rozwiązywania konfliktów.
- Konflikt rozstrzygaj według zatwierdzonych wymagań, nie przez automatyczny wybór całego „ours” lub „theirs”. Po rozwiązaniu pokaż zmianę reviewerowi i powtórz właściwe kontrole.
- Zmiana wspólnego kontraktu API/danych wymaga wskazania konsumentów, zgodności i kolejności wdrożenia. Nie twórz konkurencyjnej architektury bez decyzji.

## Agent Handoff

Domyślnym miejscem przekazania jest opis PR zgodny z [szablonem](../.github/pull_request_template.md). Zaktualizuj go do finalnego zakresu zamiast pozostawiać chronologię rozmowy. Commit wskazuje dokładny stan, którego dotyczą testy; po kolejnych zmianach zaznacz potrzebę ich ponowienia.

Przekazanie obejmuje:

- ID i cel zadania oraz właściciela;
- gałąź, commit lub PR i stan publikacji;
- wykonane zmiany i zmienione moduły;
- decyzje, odnośniki do akceptacji i przyjęte założenia;
- wykonane kontrole z wynikiem oraz kontrole niewykonane z powodem;
- znane problemy, ryzyka, zależności i możliwe konflikty;
- dalsze działania oraz decyzje wymagane od drugiego programisty.

Gdy PR nie jest gotowy, umieść ten sam format w komentarzu do właściwego Issue. Jeżeli nie można jeszcze publikować, przygotuj handoff w odpowiedzi użytkownikowi lub uzgodnionym, wyraźnie oznaczonym dokumencie roboczym. Nie twórz osobnego pliku Markdown dla każdej drobnej zmiany.

Odbierający agent najpierw odczytuje handoff, Issue, właściwe decyzje i diff wskazanego commitu. Sprawdza nowsze zmiany i stan swojej gałęzi. Nie zakłada, że zapamiętana rozmowa autora zawiera aktualne wymagania.

## Pomysły i elastyczna roadmapa

GitHub Issues są wspólnym rejestrem pomysłów i zadań; nie tworzymy równoległego `IDEAS.md`. Użyj [szablonu pomysłu](../.github/ISSUE_TEMPLATE/idea.yml): problem, opis, wartość, wpływ na produkt, złożoność i zależności.

Status pomysłu: **propozycja / do analizy / zatwierdzona / odroczona / odrzucona**. Przy decyzji zapisz uzasadnienie, osoby zatwierdzające i odnośnik do ich uzgodnienia. Agent nie może sam zatwierdzić propozycji. „Zatwierdzona” nie oznacza jeszcze zgody na rozpoczęcie dowolnej implementacji: zadanie wykonawcze musi mieć uzgodniony zakres i termin/pierwszeństwo.

Priorytet P0–P3, zależności i kolejność w Issues tworzą roadmapę. Nowy pomysł może zmienić kolejność po uzgodnieniu; nie unieważnia automatycznie rozpoczętych zadań. Nie utożsamiaj ważności pomysłu z jego akceptacją. Jeśli w przyszłości powstanie osobny widok roadmapy, ma odsyłać do Issues, a nie kopiować ich statusy.

## Decyzje i budżet

Przed większą zmianą sprawdź [DECISIONS.md](DECISIONS.md). Jeśli proponujesz odejście od obecnego rozwiązania, przedstaw w Issue: obecne podejście, alternatywę, korzyści, koszty, ryzyka, wpływ na kod i rekomendację. Zaczekaj na uzgodnienie obu programistów. Decyzję zapisz z datą i dowodem akceptacji; decyzja późniejsza zastępuje wcześniejszą przez odnośnik, nie przez usunięcie historii.

Obecny budżet infrastruktury to **0 PLN miesięcznie**. Wariant **100–200 PLN miesięcznie** jest możliwy w przyszłości, ale nie jest zatwierdzonym wydatkiem. Wybieraj rozwiązania z realną możliwością eksportu danych i migracji; nie buduj teraz zbędnych abstrakcji pod wszystkie potencjalne usługi.

Każda propozycja kosztowa musi zawierać:

| Pole | Wymagana informacja |
| --- | --- |
| Koszt | Szacunek miesięczny w PLN, waluta usługi, przyjęty kurs/podatki i osobno koszty jednorazowe |
| Limity | Istotne limity darmowego i proponowanego płatnego planu, usypianie, backup i retencja |
| Weryfikacja | Linki do aktualnych źródeł i data sprawdzenia bezpośrednio przed decyzją |
| Ryzyko | Sposób naliczania nadwyżek, limity wydatków lub brak takich limitów, reakcja po przekroczeniu budżetu |
| Obsługa | Osoba odpowiedzialna, szacowany nakład utrzymania, monitorowanie i odtwarzanie |
| Migracja i wyjście | Eksport, format danych, zależności od dostawcy, przejście do innej usługi i rezygnacja |
| Plan awaryjny | Zachowanie po awarii/wyczerpaniu limitu, kopia niezależna i sposób przywrócenia |

Nie zakładaj bezpłatności na zawsze ani nie uruchamiaj płatnej usługi, planu czy automatycznego rozliczania bez osobnej decyzji. Niniejszy dokument nie wybiera dostawcy ani nie zmienia infrastruktury.

## Konfiguracja GitHub do wspólnej decyzji

To lista do uzgodnienia, nie opis już włączonych ustawień:

- konta GitHub Łukasza i Patryka, uprawnienia do repo i osoba zarządzająca ustawieniami;
- ochrona `main`: obowiązkowy PR, review drugiego programisty, rozstrzygnięte uwagi, blokada force push/usuwania i zasady wyjątków administratora;
- wymagane checks dopiero po ich wdrożeniu; do tego czasu jawne wyniki kontroli ręcznych;
- unieważnianie review po istotnej zmianie oraz brak automatycznego merge;
- metoda merge, usuwanie scalonych gałęzi i zasady wydawania wersji;
- ewentualny `CODEOWNERS` po ustaleniu kont; nie zastępuje uzgodnienia istotnych decyzji;
- etykiety typu zmiany, priorytetu i obszaru oraz ewentualne milestones/Projects;
- dostępność egzekwowania reguł w planie i widoczności tego repo; bez założenia, że wymaga to zakupu;
- kto i w jakim zakresie upoważnia agentów do publikowania Issues, komentarzy i PR.

Szablony nie tworzą etykiet, nie konfigurują branch protection i nie zapewniają same w sobie review. Dopóki ustawienia nie zostaną potwierdzone, stosujemy opisany proces ręcznie.

## Pierwsza sesja Patryka

Przykładowy prompt, po udostępnieniu wspólnej dokumentacji w jego checkoutcie:

> Jestem Patryk i współtworzę Rafcia z Łukaszem. Przeczytaj AGENTS.md, docs/TEAM_WORKFLOW.md i docs/DECISIONS.md, a następnie dokumentację produktu potrzebną do rozpoznania bieżącego zakresu. Sprawdź status i gałąź repo oraz aktualne Issues, decyzje i powiązane PR, jeśli masz do nich dostęp. Nie zakładaj dostępu do pamięci agenta Łukasza. Na razie tylko analizuj: podsumuj produkt, moje domyślne odpowiedzialności i aktywne zależności, a następnie pomóż mi wybrać uzgodnione zadanie lub opisać własny pomysł według szablonu Issue. Nie zmieniaj kodu, mechanik ani infrastruktury, nie publikuj niczego i nie ruszaj pozostałych gier. Zgłoś brakujące informacje zamiast zgadywać. Przed późniejszą implementacją uzgodnimy zakres i utworzymy osobną gałąź; na koniec zostawisz handoff zgodny z szablonem PR.
