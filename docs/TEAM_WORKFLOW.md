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
- [ROADMAP.md](ROADMAP.md) porządkuje małe etapy i odroczone inicjatywy; [SESSION_STATE.md](SESSION_STATE.md) wskazuje bieżący handoff i punkt rozpoczęcia następnej sesji.
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
2. **Uzgodnienie.** Określ cel, typ A/B/C, zakres i wyłączenia, osobę odpowiedzialną, zależności, testy, kryteria akceptacji, sposób wycofania i wymagane decyzje. Dla B wskaż potwierdzone wymaganie oraz błąd; dla C uzyskaj osobną akceptację. Zgoda dotyczy wskazanego etapu; miejsce w roadmapie nie upoważnia do rozpoczęcia następnego.
3. **Podjęcie pracy.** Sprawdź aktywne zadania i PR dotykające tych samych modułów. Zapisz w Issue właściciela, gałąź i status „w toku”, jeśli publikacja jest upoważniona. Zanim druga osoba rozpocznie nakładające się prace, uzgodnij podział.
4. **Stan kodu.** Sprawdź `git status`, gałąź, bazę i właściwy diff. Przed rozpoczęciem pobierz aktualne referencje ze zdalnego repo, jeśli masz dostęp; sam lokalny `origin/main` nie dowodzi aktualności. Nie wykonuj automatycznego pull na brudnym checkoutcie.
5. **Gałąź.** Utwórz własną gałąź z aktualnego, uzgodnionego `main`, np. `docs/123-team-workflow`, `fix/124-archive-read` lub `feat/125-approved-feature`. Jedna gałąź realizuje jeden spójny zakres. Nie pracuj bezpośrednio na `main`.
6. **Implementacja.** Przy istotnej zmianie przedstaw plan przed edycją. Zabezpiecz zmieniane zachowania odpowiednimi testami, pracuj w małych commitach, aktualizuj dokumentację i nie poszerzaj zakresu samodzielnie.
7. **Publikacja.** Wykonaj push i utwórz PR tylko w zakresie jawnego upoważnienia. Użyj [szablonu PR](../.github/pull_request_template.md), wskaż Issue i poproś drugiego programistę o review. Nie ustawiaj automatycznego merge.
8. **Review i merge.** Przekaż PR do [niezależnego review](#niezależne-code-review-i-warunki-merge) przez drugiego programistę i jego agenta; spełnij opisane tam warunki merge. Zgoda na implementację lub push nie jest zgodą na merge ani wdrożenie.
9. **Zamknięcie.** Po rzeczywistym scaleniu uzupełnij Issue, decyzje i wymagane dalsze działania. Oddziel stan implementacji, akceptacji, merge i wdrożenia. Lokalny commit, otwarty PR lub zielone CI nie oznaczają ukończenia wdrożenia. Zostaw punkt wznowienia i zakończ pracę nad etapem; nie uruchamiaj kolejnego bez osobnego zatwierdzenia.

Agent może przygotować treść Issue, komentarza lub PR lokalnie, ale nie publikuje jej bez upoważnienia. Gdy GitHub jest niedostępny albo publikacja nie jest zatwierdzona, użyj lokalnego ID etapu i utrwal handoff w [SESSION_STATE.md](SESSION_STATE.md), także podając go użytkownikowi. Przy późniejszej publikacji dodaj mapowanie lokalnego ID na Issue, zachowując identyfikator do wyszukiwania w historii Git. Nie udawaj, że zespół widzi jeszcze nieopublikowaną gałąź.

Status zadania zapisujemy w Issue: **do uzgodnienia → gotowe → w toku → do review → zakończone**; **zablokowane** wymaga przyczyny i następnego kroku. „Gotowe” oznacza wystarczająco zatwierdzony zakres, nie sam wpis do backlogu.

## Niezależne code review i warunki merge

Po zakończeniu implementacji i przygotowaniu PR przez agenta Łukasza praca trafia do niezależnego review przez Patryka i jego agenta. Analogicznie PR agenta Patryka trafia do Łukasza i jego agenta. Samokontrola autora nie zastępuje niezależnego review. Agent odbierający wskazuje oczekujący PR użytkownikowi; rozpoczyna jego review lub poprawki oraz publikuje wynik wyłącznie w zakresie udzielonego upoważnienia.

Agent wykonujący review:

1. Czyta opis zadania, wymagania, kryteria akceptacji i właściwe zaakceptowane decyzje.
2. Sprawdza rzeczywisty diff względem bazy PR oraz zmienione pliki i potrzebny kontekst kodu. Zapisuje sprawdzony commit; samo podsumowanie drugiego agenta nie wystarcza.
3. Weryfikuje zgodność z zaakceptowanym zakresem i logikę biznesową, szuka błędów i regresji, a gdy dotyczy — ocenia bezpieczeństwo.
4. Analizuje testy, ich pokrycie zmienianego zachowania i wyniki dla sprawdzonej wersji. Wykonuje potrzebne kontrole w odizolowanym środowisku, podaje wyniki własne i pochodzące od autora oraz testy niewykonane z przyczyną. Dla dokumentacji sprawdza spójność, linki i diff.
5. Zgłasza konkretne uwagi: plik i linię lub zakres diffu, problem, jego skutek oraz dowód lub warunki odtworzenia. Oddziela istotne uwagi blokujące od sugestii.
6. Przedstawia rekomendację: **zaakceptować / poprawić / wstrzymać do wyjaśnienia**, wraz z uzasadnieniem i ograniczeniami weryfikacji. Brak znalezisk nie jest gwarancją braku błędów.

Agent nie zatwierdza pracy w imieniu programisty ani nie wystawia za niego `APPROVE`. Jego rekomendacja jest materiałem do decyzji człowieka; zgoda na publikację komentarza review nie jest zgodą na zatwierdzenie PR.

Merge jest dopuszczalny dopiero po ukończeniu wymaganych testów i kontroli z wynikiem pozwalającym na merge, niezależnym review, rozwiązaniu istotnych uwag oraz zatwierdzeniu aktualnej wersji przez uprawnionego drugiego programistę. Agent dodatkowo potrzebuje jawnego upoważnienia do merge. Jeżeli po review pojawią się istotne zmiany w kodzie, wymagane są ponowne sprawdzenie zmienionego zakresu, właściwe kontrole i potwierdzenie akceptacji aktualnej wersji. Zielone CI ani review wcześniejszego commitu nie zastępują tych warunków.

## Mały etap i warunek przejścia dalej

Etap ma dostarczać jeden sprawdzalny rezultat w jednym PR. Musi dać się go wdrożyć po spełnieniu wskazanych zależności, przetestować, zaakceptować i wycofać bez wdrażania kolejnego etapu. Nie łącz naprawy punktacji, przebudowy logowania i zmiany hostingu w jedną pracę. Jeżeli wycofanie wymaga jeszcze nieuzgodnionej przebudowy danych, najpierw wydziel zadanie decyzyjne.

Karta etapu w Issue zawiera: **ID, cel, zakres i wyłączenia, właściciela, zależności, testy, kryteria akceptacji, sposób wycofania oraz dowód zgody na rozpoczęcie**. Priorytet, ryzyka i szacunek pomagają ustalić kolejność. Niejasną kartę doprecyzuj przed kodowaniem. Szablon [zadania](../.github/ISSUE_TEMPLATE/task.yml) zawiera te pola.

Wycofanie ma opisywać cofany zakres, poprzednią zgodną wersję i kontrolę po cofnięciu. Dla dokumentacji wystarczy nowy commit odwracający konkretną zmianę z ponowną kontrolą linków; nie przepisuj historii. Przy zapisie lub migracji danych samo cofnięcie kodu albo odtworzenie starej kopii może utracić nowsze operacje. Wtedy wymagaj osobno zatwierdzonej i przećwiczonej procedury zachowania tych danych. Wdrożenie bez wykonalnego wycofania jest niedopuszczone w tym procesie.

Na końcu pokaż wynik kryteriów akceptacji oraz pozostałe ograniczenia i wskaż proponowany następny etap. **Akceptacja wyniku bieżącego etapu, merge i zgoda na rozpoczęcie kolejnego są odrębnymi ustaleniami.** Kolejność i strzałki zależności w roadmapie nie stanowią automatycznego zlecenia.

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
- numer i link PR (lub Issue przed utworzeniem PR), gałąź, commit i stan publikacji; brak PR oznacz jawnie;
- wykonane zmiany i ich uzasadnienie, listę zmienionych plików i modułów;
- decyzje, odnośniki do akceptacji i przyjęte założenia;
- wykonane kontrole z wynikiem oraz kontrole niewykonane z powodem;
- znane problemy, ryzyka, zależności i możliwe konflikty;
- co ma sprawdzić drugi agent i kto odbiera review;
- stan przekazania: oczekuje na review / poprawki / merge, pozostałą pracę, następne zadanie, pierwszy krok i stan zgody na nie oraz decyzje wymagane od drugiego programisty. „Oczekuje na merge” nie oznacza zgody na jego wykonanie.

Gdy PR nie jest gotowy, umieść ten sam format w komentarzu do właściwego Issue. Jeżeli nie można jeszcze publikować, zapisz go w istniejącym [SESSION_STATE.md](SESSION_STATE.md), oznaczając gałąź i brak publikacji. Sama odpowiedź w rozmowie nie wystarcza. Nie twórz osobnego pliku Markdown dla każdej drobnej zmiany.

Odbierający agent najpierw odczytuje handoff, Issue, właściwe decyzje i diff wskazanego commitu. Sprawdza nowsze zmiany i stan swojej gałęzi. Nie zakłada, że zapamiętana rozmowa autora zawiera aktualne wymagania.

## Zakończenie sesji i wznowienie pracy

Obaj agenci stosują ten sam standard, także przy nowej rozmowie lub przekazaniu zadania drugiej osobie. Stan musi dać się odtworzyć z repo oraz wskazanych Issues/PR bez dostępu do poprzedniej rozmowy lub jej wewnętrznego podsumowania.

Na koniec istotnej pracy, również przerwanej w połowie etapu:

1. Sprawdź diff i status. Wskaż zrealizowany zakres, pliki oraz prace niezakończone; oznacz niezacommitowane zmiany. Nie deklaruj zakończenia etapu na podstawie samego końca sesji.
2. Utrwal decyzje w `DECISIONS.md`, wymagania i ustalenia w właściwych dokumentach. Zapisz faktycznego zatwierdzającego i zakres upoważnienia; nierozstrzygnięte pomysły pozostają propozycjami. Brak opublikowanego uzgodnienia oznacz jawnie, a jego istotną treść zachowaj w repo.
3. Uzupełnij handoff z szablonu PR, w tym polecenia, środowisko, wersję i wyniki kontroli oraz testy niewykonane z powodem. Logi ogranicz do potrzebnych, zanonimizowanych dowodów. Podaj problemy, ryzyka i zależności.
4. W `SESSION_STATE.md` wskaż aktualny handoff i dokładne miejsce wznowienia: ID, pierwszy krok, brakujące informacje i zgody. Gdy istnieje Issue/PR, odsyłaj do niego zamiast kopiować cały stan. Bez publikacji przechowuj tam pełne bieżące przekazanie; ten sam dokument jest aktualizowany, a poprzednie wersje zachowuje Git.
5. Zapisz dokumentację z pracą w odpowiednim commicie i podaj jego identyfikator w przekazaniu. Plik zawarty w commicie nie wpisuje własnego przyszłego hasha: identyfikuje go historia ścieżki (`git log -1 -- docs/SESSION_STATE.md`). Nie zmieniaj cudzego handoffu; równoległe zadania mają osobne wpisy z właścicielem i gałęzią.
6. Oddziel implementację od review, merge i wdrożenia. Jeśli następny etap nie ma zgody, zakończ na przekazaniu; nie kontynuuj go automatycznie.

Na początku kolejnej sesji:

Stosuj procedurę startową z [AGENTS.md](../AGENTS.md#na-początku-każdej-nowej-sesji-i-przed-zadaniem). Porównaj stan GitHub z datą i commitem ostatniego handoffu, w tym nowe PR, komentarze review i zmiany wymagające uwagi. Przy pierwszej sesji lub braku takiego punktu sprawdź bieżące otwarte zadania i PR bez odtwarzania całej historii. Brak dostępu lub nieopublikowane materiały zaznacz jako ograniczenie, nie zgaduj ich treści. Kod wskazuje zachowanie, zatwierdzone wymagania wskazują cel; sprzeczność zgłoś przed zależną zmianą. Wcześniejsze wyniki kontroli zachowują znaczenie tylko dla wskazanej wersji i środowiska.

`SESSION_STATE.md` jest mapą aktywnych przekazań, nie dziennikiem wszystkich rozmów ani drugim rejestrem decyzji. Po publikacji przenieś szczegóły do właściwego Issue/PR i pozostaw odnośnik; wersja offline zostaje w historii Git. Po merge zaktualizuj punkt wznowienia zgodnie z rzeczywistym stanem, bez zgadywania przyszłych hashy. Nie zapisuj sekretów ani danych dzieci w żadnej warstwie dokumentacji.

## Pomysły i elastyczna roadmapa

GitHub Issues są wspólnym rejestrem pomysłów i zadań; nie tworzymy równoległego `IDEAS.md`. Użyj [szablonu pomysłu](../.github/ISSUE_TEMPLATE/idea.yml): problem, opis, wartość, wpływ na produkt, złożoność i zależności.

Status pomysłu: **propozycja / do analizy / zatwierdzona / odroczona / odrzucona**. Przy decyzji zapisz uzasadnienie, osoby zatwierdzające i odnośnik do ich uzgodnienia. Agent nie może sam zatwierdzić propozycji. „Zatwierdzona” nie oznacza jeszcze zgody na rozpoczęcie dowolnej implementacji: zadanie wykonawcze musi mieć uzgodniony zakres i termin/pierwszeństwo.

Priorytet P0–P3, zależności i kolejność w Issues tworzą roadmapę. [ROADMAP.md](ROADMAP.md) zawiera początkowy podział na etapy oraz inicjatywy jeszcze nieopublikowane. Po utworzeniu Issue zastąp jego roboczą kartę odnośnikiem i zachowaj ID; status i szczegóły aktualizuj w jednym miejscu, w Issue. Nowy pomysł może zmienić kolejność po uzgodnieniu; nie unieważnia automatycznie rozpoczętych zadań. Nie utożsamiaj ważności pomysłu z jego akceptacją. Odroczona inicjatywa pamięci AI pozostaje wyłącznie wpisem na przyszłość.

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

> Jestem Patryk i współtworzę Rafcia z Łukaszem. Przeczytaj AGENTS.md, docs/SESSION_STATE.md, wskazany handoff, docs/TEAM_WORKFLOW.md i właściwe decyzje z docs/DECISIONS.md, a następnie dokumentację produktu potrzebną do bieżącego zadania. Sprawdź status i gałąź repo oraz aktualne Issues i powiązane PR, jeśli masz do nich dostęp. Nie zakładaj dostępu do pamięci agenta Łukasza. Na razie tylko analizuj: podsumuj stan, moje odpowiedzialności i zależności, a następnie pomóż mi wybrać jeden zatwierdzony etap z docs/ROADMAP.md lub Issue albo opisać własny pomysł. Nie zmieniaj kodu, mechanik ani infrastruktury i nie publikuj niczego. Zgłoś brakujące informacje. Przed implementacją uzgodnimy cel, zakres, testy, akceptację i wycofanie. Na koniec utrwal handoff i punkt wznowienia; nie rozpoczynaj kolejnego etapu bez zatwierdzenia.
