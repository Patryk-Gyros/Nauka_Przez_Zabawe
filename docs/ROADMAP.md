# Rafcio — małe etapy rozwoju

To roboczy podział prac do uzgodnienia, oparty na [wymaganiach](REQUIREMENTS.md), [mapie produktu](RAFCIO.md) i [znanych problemach](KNOWN_ISSUES.md). Nie zastępuje pełnego audytu ani nie zatwierdza jego rekomendacji. Pełny raport audytu nie został jeszcze utrwalony w repo; RF-01 ma uzupełnić ten brak bez odtwarzania nieznanych ustaleń z domysłów.

**RF-00 jest wykonane i scalone. Kierunek określa [D-005](DECISIONS.md#d-005--prosty-rozwój-po-rf-00). Zlecenia z 2026-11-12 zatwierdziły osobno małe naprawy F01, F05 i RF-03 z testami, bez push i merge; wyniki poniżej.** Pozostałe zadania są propozycjami wymagającymi osobnego zatwierdzenia. Zakończenie jednego nie rozpoczyna następnego. Zasady akceptacji i wycofania określa [TEAM_WORKFLOW.md](TEAM_WORKFLOW.md), a bieżący stan i pierwszy krok kolejnej sesji — [SESSION_STATE.md](SESSION_STATE.md).

ID `RF-*` i `AI-MEM-01` są lokalnymi identyfikatorami, nie numerami istniejących Issues. Po upoważnionej publikacji zachowaj ID i zastąp roboczą kartę linkiem do Issue. Wtedy tylko Issue przechowuje aktualny status, właściciela, zgodę i szczegóły etapu; tutaj zostaje kolejność i powiązanie. Nie publikowano tych zadań. Kontrola GitHub z 2026-11-12: brak otwartych PR; przed implementacją sprawdzić ponownie.

P0 oznacza potwierdzone ryzyko krytyczne, P1 fundamenty i istotne naprawy, P2 poprawę istniejącego rozwiązania, P3 możliwy rozwój. Na podstawie samego obecnego katalogu nie dopisujemy P0; nowe potwierdzone ustalenia mogą zmienić kolejność niezależnie od ukończenia RF-01. Szacunki są orientacyjnym czasem pracy jednej osoby, bez oczekiwania na decyzje. Właściciele RF-01–RF-10 pozostają do uzgodnienia według ról zespołu.

## Priorytety po RF-00 — 2026-11-12

Najpierw realne problemy i wartość dla użytkownika, później uzasadnione zmiany architektury. Zachowujemy obecny produkt, wygląd i Node.js/Express. Numer etapu nie narzuca kolejności. Poniższa ocena zastępuje poprzednią kolejkę; historyczne karty i ich wcześniejsze priorytety są dostępne w Git.

| Zadanie | Aktualny priorytet i kierunek |
| --- | --- |
| RF-00 | Wykonane i scalone; nie ponawiać merge. |
| F01 | Naprawa uploadu wykonana i przetestowana lokalnie; bez publikacji i merge. |
| F05 | Zgodność nazw archiwów naprawiona i przetestowana lokalnie; bez publikacji i merge. |
| RF-01 | P1 — nieukończone utrwalenie audytu; źródło już odnalezione, pełny raport jeszcze poza repo. Nie blokuje wszystkich znanych napraw. |
| RF-02 + RF-03 | RF-03 wykonane i przetestowane lokalnie; część RF-02 dotycząca salda/nagród wykonana. Odbiór UI i review nadal do wykonania; nie zamyka to całego RF-02 ani RF-09. |
| RF-05 i RF-06 | P1 — ochrona historii punktów i osiągnięć. RF-06 podniesione z P2; obie karty nadal dotyczą decyzji, nie automatycznej migracji danych. |
| RF-09 | P1 — odbiór podstawowej ścieżki rodzic–dziecko, w tym uprawnień i restartu, po naprawie salda. |
| RF-10 | P1 — nowa, wąska weryfikacja lokalnego zapisu i odtwarzania; bez wyboru bazy. |
| RF-04 | P2 — potwierdzony błąd postępu wyprawy, następna niezależna mała naprawa. |
| RF-07 | P2, warunkowe — proste CI dopiero dla użytecznych testów; lokalne kontrole wystarczają do pierwszej naprawy. Wcześniej P1. |
| RF-08 | P2, odroczone — wydzielenie obliczenia tylko gdy obecny kod rzeczywiście utrudnia konkretną zmianę lub test. |
| AI-MEM-01 | P3, odroczone — bez projektowania i instalacji. |

Audyt przekazany później przez użytkownika ujawnił F01 (upload) i F05 (niezgodne nazwy zapisu/odczytu archiwów); oba potwierdzono w aktualnym kodzie. Obie naprawy wykonano w osobnych lokalnych commitach, bez automatycznej realizacji pozostałych zaleceń.

Potwierdzone błędy bezpieczeństwa mają pierwszeństwo stosownie do skutków (P0 dla krytycznych). Katalog `KNOWN_ISSUES.md` nie stanowi pełnego audytu bezpieczeństwa; nie dopisujemy nieudowodnionych luk ani nie uznajemy bezpieczeństwa za potwierdzone. Dla wykrytej luki najpierw dowód, wpływ, mały zakres naprawy i osobna zgoda. Nie trzeba czekać na zakończenie całego RF-01.

RF-02 dostarcza testy potrzebne konkretnej naprawie; nie wymaga budowy pełnej platformy testowej. RF-05 i RF-06 są niezależne, RF-10 nie wymaga RF-03 ani nowej architektury. RF-07 i RF-08 nie blokują napraw ani odbioru. Każdy etap wymaga zgody; pilny nowy dowód może zmienić proponowaną kolejność.

### F01 — Mała naprawa uploadu

- **Cel / zakres / zgoda:** usunięcie podatności Multer i ograniczenie uploadu `/analizuj`; typ B. Zlecenie użytkownika z 2026-11-12: „naprawmy F01”, mała poprawka i testy, bez przebudowy, push i merge. Właściciel: Łukasz.
- **Wynik:** Multer 2.3.0; do 5 plików po 5 MiB, bez pól tekstowych; kontrola klucza przed parserem; błędy JSON i ich wyświetlanie w obu formularzach generatora. Bez zmian punktacji, zapisu gry i innych mechanik.
- **Testy / akceptacja:** 12/12 testów HTTP i formularzy, również po czystej instalacji z lockfile. Poprawny upload działa z atrapą AI, błędne/zbyt duże/przerwane żądania nie zatrzymują procesu. Bez odczytu danych użytkownika. Szczegóły w [handoffie](SESSION_STATE.md) i [runbooku](RUNBOOK.md#kontrola-uploadu-f01).
- **Ryzyko / zależności:** zmiana głównej wersji parsera sprawdzona na obecnym runtime; limity mogą odrzucić dotychczas przyjmowane duże zestawy. Nie wykonywano pełnego E2E z usługą AI ani testu masowego ruchu.
- **Wycofanie:** odwrócenie commitu nie wymaga migracji danych, ale przywraca podatność. Nie uruchamiać starego uploadu po cofnięciu; przy problemie zgodności pozostawić generator wyłączony (bez klucza) z nową bramką przed parserem i przygotować poprawkę. Nie odtwarzać wcześniejszych danych gry.
- **Status:** wykonane lokalnie, do review; bez push/PR/merge. F05 i RF-03 wykonano później na podstawie osobnych zleceń.

### F05 — Zgodność nazw archiwów

- **Cel / zakres / zgoda:** mała naprawa listy i odtwarzania archiwów; typ B, P1, właściciel Łukasz. Zlecenie użytkownika z 2026-11-12: F05 i test zapis → lista → odtworzenie, bez push/merge. Bez zmian formatu danych i migracji plików.
- **Wynik:** jeden wzorzec nazw dla listy i odczytu przyjmuje zapisane przez aplikację 14 cyfr oraz wcześniej akceptowany separator daty/godziny. Zapis pozostaje zgodny z dotychczasowymi plikami.
- **Testy / akceptacja:** przed poprawką 3/5 testów archiwów wykazały problem; po poprawce 5/5 przeszło, wraz z 12/12 testów F01. Rzeczywisty zapis i HTTP na syntetycznych danych; pełny stan gry i aktualny PIN zachowane po odtworzeniu. Oba formaty, obce ścieżki, pliki tymczasowe i brak sesji sprawdzone.
- **Ryzyko / wycofanie:** starsze, dotychczas ukryte archiwa stają się dostępne. Odtworzenie nadal zastępuje bieżącą grę; bez zmian ochrony przed awarią i walidacji importu. Cofnąć wyłącznie commit F05, bez podmieniania danych i bez cofania F01; stare ograniczenie nazw wtedy wróci.
- **Status / zależności:** wykonane lokalnie, do review. Gałąź zawiera wcześniejsze lokalne F01 i dokumentację; szczegóły w [punkcie wznowienia](SESSION_STATE.md). Późniejsze RF-03 wykonano na podstawie osobnego zlecenia; nie upoważnia to do kolejnych etapów.

### RF-00 — Dokumentacja współpracy i ciągłości

- **Cel / priorytet / nakład:** odtwarzalna praca obu programistów i agentów; P1, około 0,5–1 dnia. Właściciel: Łukasz. Bieżący handoff w `SESSION_STATE.md`.
- **Zakres:** AGENTS, workflow, decyzje, ta roadmapa, punkt wznowienia, README i szablony Issue/PR. Bez zmian aplikacji, konfiguracji GitHub i narzędzi pamięci.
- **Zależności:** RF-00 wykonane i scalone przez użytkownika w PR #3, commit `14b309f`. Review Patryka przed merge nie zostało odnotowane; szczegóły i punkt wznowienia w `SESSION_STATE.md`. Nie ma oczekującego merge tego etapu.
- **Testy:** sprawdzenie diffu, lokalnych linków, składni i struktury formularzy oraz kompletności kart etapów i handoffu.
- **Akceptacja:** następna sesja odczyta rezultat, decyzje, pliki, testy, ograniczenia i pierwszy krok z repo; każdy etap ma wymagane pola; AI-MEM-01 pozostaje odroczone. Gotowość dokumentacji nie oznacza review ani merge.
- **Wycofanie:** nowy commit odwracający wskazany commit dokumentacyjny, kontrola odnośników i aktualizacja punktu wznowienia; bez resetu historii ani danych aplikacji.
- **Ryzyko:** brak odnotowanego review w PR #3 jest odstępstwem od procesu; przy kolejnych PR obowiązuje review drugiej osoby przed merge. Konfiguracja GitHub pozostaje do uzgodnienia, RF-01 wymaga osobnego zatwierdzenia.

### RF-01 — Utrwalenie dowodów audytu

**Status na 2026-11-12: nieukończone.** Źródło pełnego audytu zostało odnalezione w archiwum wcześniejszego czatu; użytkownik przekazał jego lokalizację i zestaw ustaleń F01–F16. Nie trzeba odtwarzać raportu z pamięci. Pełny raport nie jest jeszcze zapisany we wspólnym repo; dotychczasowe dokumenty zawierają wybrane problemy, reguły oraz bieżący wynik F01. Naprawa F01 nie oznacza zamknięcia całego RF-01.

- **Cel / priorytet / nakład:** uniezależnić ustalenia techniczne od rozmowy; P1, około 0,5–1 dnia.
- **Zakres:** uzupełnić istniejące `KNOWN_ISSUES.md`, `REQUIREMENTS.md` i `RAFCIO.md` o zweryfikowane ustalenia, wersję kodu, dowody, ryzyka i nierozstrzygnięte pytania; skorygować kolejkę małych zadań. Bez napraw i bez uznawania propozycji architektury za przyjęte.
- **Zależności:** RF-00 zakończone; osobna zgoda na RF-01; dostęp do pełnego raportu albo wyraźnie uzgodniony zakres ponownej weryfikacji. Brak źródła oznaczyć, nie uzupełniać z pamięci agenta.
- **Testy:** porównać każde przenoszone ustalenie z dokumentacją i wskazaną wersją kodu; sprawdzić linki, zakres diffu i brak danych prywatnych.
- **Akceptacja:** potwierdzone zachowanie, wymagania, rozbieżności i propozycje są rozróżnione; każdy problem ma dowód, priorytet i wpływ; braki jawnie wymienione. Nowe naprawy stają się osobnymi propozycjami.
- **Wycofanie:** odwrócić wyłącznie aktualizację dokumentacji nowym commitem, zachować poprzednie wersje w Git i sprawdzić linki.
- **Ryzyko:** utrwalenie niepełnego raportu jako kompletnego albo nadanie akceptacji samej rekomendacji.

### RF-02 — Odtwarzalne kontrole punktacji na danych syntetycznych

- **Cel / priorytet / nakład:** zabezpieczyć dwa znane rozjazdy opisane w `KNOWN_ISSUES.md`; P1, około 1 dnia; typ A — kontrole bez zmiany zachowania aplikacji.
- **Zakres:** mały zestaw danych i powtarzalne kontrole salda, zatwierdzania nagrody oraz dnia z samym pytaniem; instrukcja uruchomienia w odizolowanej kopii. Nie testować prawdziwego zapisu użytkownika ani przebudowywać środowiska aplikacji.
- **Zależności:** dowód i wymaganie dla sprawdzanego problemu (pełne RF-01 nie jest blokadą), osobna zgoda na etap i działające środowisko do uruchomienia testów. Wybór lub zmiana wersji środowiska wymaga uzgodnienia poza tą kartą, jeśli okaże się potrzebna.
- **Testy:** powtórzyć kontrole na świeżych danych; sprawdzić powtarzalność wyniku i to, że wszystkie zapisy trafiają do izolowanej lokalizacji.
- **Akceptacja:** drugi programista odtwarza obecne zachowanie i rozjazdy jednym opisanym przebiegiem; oczekiwane reguły są oddzielone od testów obecnego błędu. Brak deklaracji, że istniejąca rozbieżność została naprawiona.
- **Wycofanie:** odwrócić commit testów i instrukcji; zakończyć proces testowy, usunąć wyłącznie oznaczone dane syntetyczne. Kod i dane użytkownika nie wymagają odtwarzania.
- **Ryzyko:** test charakteryzujący błąd może zostać mylnie uznany za docelowe wymaganie; dostęp do prawdziwego pliku danych musi być wykluczony.

### RF-03 — Zgodne saldo przy zatwierdzaniu nagrody

**Wykonane lokalnie 2026-11-12, bez push/merge; do review i odbioru UI.** Użytkownik zlecił małą poprawkę pomijania pytań dnia i testy syntetyczne. Zmiana obejmuje wyłącznie doliczenie pytań w istniejącej funkcji salda. 20/20 testów salda i 17/17 regresji F01/F05 przeszło; przed poprawką 15/20 testów salda odtworzyło problem. Bez migracji, refaktoru i nowych zależności. Testy porównują obliczenie frontendu z HTTP, obejmują oba endpointy nagród i rzeczywisty restart procesu. Pełnego testu przeglądarkowego nie wykonano. RF-02 wykonane tylko w części salda i nagród.

- **Cel / priorytet / nakład:** rozwiązać P1 „Ekran i serwer liczą różne saldo” z `KNOWN_ISSUES.md`; P1, około 0,5–1 dnia; proponowany typ B.
- **Zakres:** wyłącznie uwzględnienie zatwierdzonych pytań dnia w saldzie używanym do prośby o nagrodę i jej zatwierdzenia, zgodnie z uzgodnioną regułą z `RAFCIO.md`. Bez przebudowy pozostałych mechanik, formatu danych i logowania.
- **Zależności:** kontrole salda i nagród z RF-02 (mogą powstać w tym samym małym pakiecie) oraz potwierdzenie reguły i osobna zgoda na naprawę; przed zmianą `server.js` sprawdzić wpływ na wspólne moduły.
- **Testy:** pytanie zaliczone/niezaliczone, nagroda dokładnie za dostępne saldo i za saldo przekroczone, potrącenie po zatwierdzeniu oraz brak potrącenia przy odrzuceniu.
- **Akceptacja:** ekran i serwer uznają tę samą dostępność nagrody w uzgodnionych przypadkach; test odtwarzający błąd przechodzi po naprawie; inne źródła punktów i format zapisu pozostają zgodne.
- **Wycofanie:** cofnąć commit kodu i jego oczekiwania testowe bez cofania faktycznie zatwierdzonych nagród; sprawdzić odczyt istniejącego zapisu i historię operacji. Powrót starszej reguły przywraca znany rozjazd i musi być jawnie zgłoszony.
- **Ryzyko:** wpływ na dostępność nagród; jeśli naprawa wymaga zmiany formatu danych, zatrzymać etap i uzgodnić osobny zakres z wycofaniem danych.

### RF-04 — Postęp wyprawy za dzień z samym pytaniem

- **Cel / priorytet / nakład:** rozwiązać P2 „Wyprawa pomija niektóre zaliczone pytania” z `KNOWN_ISSUES.md`; P2, około 0,5 dnia; proponowany typ B.
- **Zakres:** wyłącznie dobór dni do obliczania postępu w `public/punktacja/app.js`. Bez zmiany progów Siedmiu Szczytów, zasad ekwipunku i formatu danych.
- **Zależności:** RF-02, potwierdzenie udziału zatwierdzonych pytań w postępie i osobna zgoda; RF-03 nie jest konieczny do wdrożenia tej zmiany.
- **Testy:** dzień z samym zaliczonym pytaniem, pytanie niezaliczone, dzień z pytaniem i obowiązkami bez podwójnego naliczenia; nagrody i konsekwencje nie odejmują postępu wyprawy.
- **Akceptacja:** każdy dzień jest rozliczony raz zgodnie z uzgodnioną regułą; pozostałe progi i serie zachowują dotychczasowe działanie.
- **Wycofanie:** odwrócić commit wyliczania postępu i powiązanych oczekiwań testowych; sprawdzić widok na tych samych danych. Dane nie są migrowane; starszy widok ponownie pomija wskazany przypadek.
- **Ryzyko:** podwójne naliczenie daty występującej w kilku źródłach; wymagana kontrola regresji.

### RF-05 — Decyzja o historii po usunięciu zadania

- **Cel / priorytet / nakład:** rozstrzygnąć oczekiwaną trwałość punktów po usunięciu obowiązku lub misji; P1, około 0,5 dnia analizy; dokumentacja przed zmianą B/C.
- **Zakres:** jeden przypadek z `KNOWN_ISSUES.md`: usunięcie definicji a poprzednie rozliczenia. Uzupełnić wymaganie i decyzję o starych oraz przyszłych zapisach; bez zmiany modelu danych.
- **Zależności:** udokumentowany przypadek z `KNOWN_ISSUES.md` (bez wymagania pełnego RF-01), osobna zgoda na analizę; rozstrzygnięcie produktowe Łukasza i Patryka.
- **Testy:** przejść przykład zdobycia punktów, usunięcia definicji, ponownego odczytu i odtworzenia archiwum; porównać obecny i proponowany wynik bez mutowania danych użytkownika.
- **Akceptacja:** uzgodniono wynik każdego przykładu, postępowanie ze starymi zapisami i brakującą historią. Dopiero wtedy wydzielić małe zadanie implementacji z własnym testem i bezstratnym wycofaniem; nie rozpoczynać go automatycznie.
- **Wycofanie:** propozycję dokumentacyjną cofnąć commitem; przyjętą decyzję zastąpić nową zatwierdzoną decyzją, zachowując historię. Brak zmian danych do odtwarzania.
- **Ryzyko:** niektórych utraconych informacji nie można odtworzyć z bieżących danych; nie obiecywać ich odzyskania.

### RF-06 — Decyzja o stawce historycznego pytania dnia

- **Cel / priorytet / nakład:** ustalić, czy zmiana stawki działa na przeszłość; P1 (wcześniej P2), około 0,5 dnia analizy; dokumentacja przed zmianą B/C.
- **Zakres:** osobna reguła opisana w `KNOWN_ISSUES.md`; wymaganie i decyzja dla istniejących oraz nowych zaliczeń. Bez implementacji i bez wyboru bazy.
- **Zależności:** udokumentowany przypadek z `KNOWN_ISSUES.md` (bez wymagania pełnego RF-01), osobna zgoda na analizę i wspólna decyzja produktowa. RF-05 nie blokuje tego zadania.
- **Testy:** przykład pytania zaliczonego przy 10 pkt, zmiany stawki na 5 pkt, nowego zaliczenia i odczytu starszego archiwum; porównać saldo oraz postęp wyprawy.
- **Akceptacja:** przyjęte przykłady i zasady obsługi starych zapisów są zapisane w wymaganiach i `DECISIONS.md`; osobne zadanie implementacyjne powstaje dopiero po tej decyzji, bez automatycznego rozpoczęcia.
- **Wycofanie:** cofnąć propozycję dokumentacyjną nowym commitem; przyjętą decyzję zastąpić nowym uzgodnieniem z zachowaniem historii. Dane aplikacji pozostają niezmienione.
- **Ryzyko:** dawne stawki mogą nie być zapisane; przyjęcie wartości zastępczej wymaga jawnej decyzji ludzi.

### RF-07 — Jedna kontrola CI dla istniejących testów

- **Cel / priorytet / nakład:** powtarzalna weryfikacja PR; P2, warunkowe (wcześniej P1), około 0,5 dnia; typ A — automatyzacja kontroli.
- **Zakres:** uruchomienie uzgodnionych istniejących testów na danych syntetycznych, bez wdrażania aplikacji, sekretów, automatycznego merge i zmian innych gier.
- **Zależności:** RF-02, osobna zgoda na zmianę CI oraz potwierdzone środowisko, dostęp i limity mieszczące się w budżecie 0 PLN. Zmiana branch protection pozostaje osobną decyzją.
- **Testy:** przebieg poprawnego zestawu oraz kontrolowanego błędu na gałęzi testowej; sprawdzenie logów pod kątem danych prywatnych.
- **Akceptacja:** PR pokazuje wynik tych samych kontroli co lokalnie; błąd testu zatrzymuje kontrolę, brak niezatwierdzonych kosztów i wdrożeń.
- **Wycofanie:** cofnąć tylko konfigurację kontroli; zachować polecenia lokalne. Jeżeli check zostanie później ustawiony jako wymagany, najpierw uzgodnić zmianę tej reguły, aby nie zablokować PR.
- **Ryzyko:** różnice środowisk i limity usługi; nie włączać rozliczeń ani nowych uprawnień bez decyzji.

### RF-08 — Wydzielenie jednego obliczenia salda

- **Cel / priorytet / nakład:** ułatwić testowanie reguły bez HTTP; P2, odroczone do wykazania potrzeby, około 0,5–1 dnia; typ A.
- **Zakres:** wydzielić tylko jedno uzgodnione obliczenie salda Rafcia z `server.js`, zachowując kontrakt i wynik. Bez przebudowy całego serwera, nowego frameworka i zmiany zapisu.
- **Zależności:** RF-02, zaakceptowana RF-03 oraz osobna zgoda na wskazaną funkcję i granicę refaktoru; ocena wspólnych konsumentów.
- **Testy:** porównanie wyniku przed/po na tych samych przypadkach punktacji oraz kontrola zatwierdzania nagrody przez API.
- **Akceptacja:** wyniki i kontrakt są identyczne; regułę można testować bez uruchamiania HTTP; diff nie obejmuje innych modułów.
- **Wycofanie:** odwrócić wyłącznie commit wydzielenia, zachowując naprawę z RF-03; ponowić kontrole punktacji i API. Format danych jest niezmieniony.
- **Ryzyko:** przypadkowa zmiana reguły w czasie przenoszenia kodu; kolejne funkcje wymagają kolejnych uzgodnionych etapów.

### RF-09 — Odbiór jednej ścieżki rodzic–dziecko

- **Cel / priorytet / nakład:** sprawdzić podstawową ścieżkę rodzic–dziecko z kryteriów 2–4 w `REQUIREMENTS.md`; P1, około 0,5 dnia, weryfikacja bez napraw w tym etapie.
- **Zakres:** syntetyczna rodzina, ustawienie PIN-u, obowiązek i nagroda, rozliczenie dnia, prośba dziecka, zatwierdzenie rodzica oraz odczyt po restarcie. Zapisać wynik i odtwarzalne kroki w istniejącej dokumentacji/Issue.
- **Zależności:** RF-02, zaakceptowana RF-03, odizolowane środowisko i osobna zgoda na weryfikację. Nie wymaga wszystkich przyszłych refaktorów ani nowego systemu kont.
- **Testy:** wskazany pełny przebieg, brak dostępu do operacji rodzica po wylogowaniu i ponowne logowanie po restarcie; kontrola salda i trwałości syntetycznego zapisu.
- **Akceptacja:** wszystkie kroki mają wynik, wersję, środowisko i dowód albo odtwarzalne zgłoszenie błędu. Pozostałe przypadki z wymagań, m.in. błędny PIN, eksport i odtworzenie archiwum, są jawnie oznaczone jako niewykonane w tym przebiegu. Niezaliczona ścieżka blokuje deklarację gotowości, nie upoważnia do samodzielnych napraw.
- **Wycofanie:** zakończyć testowy serwer i usunąć wyłącznie oznaczone dane syntetyczne; błędny raport skorygować nowym commitem/komentarzem z zachowaniem historii dowodu.
- **Ryzyko:** przejście jednego scenariusza nie dowodzi bezpieczeństwa i poprawności całego produktu.

### RF-10 — Sprawdzenie lokalnego zapisu i odtwarzania

- **Cel / priorytet / nakład:** ustalić, czy można bezpiecznie odzyskać grę; P1, około 0,5–1 dnia, weryfikacja bez napraw. Właściciel do uzgodnienia.
- **Zakres:** wyłącznie lokalny JSON, istniejący eksport i odtwarzanie archiwum Rafcia. Na syntetycznym stanie porównać punkty, rozliczenia, nagrody i postęp przed restartem oraz po odtworzeniu. Sprawdzić zachowanie przy niepoprawnym archiwum i błędzie zapisu; udokumentować bezpieczną lokalną procedurę kopii/odtworzenia. Bez migracji, chmury i zmian mechanik.
- **Zależności:** osobna zgoda i izolacja całego zapisu, w tym archiwów; ustalenie oczekiwanego wyniku odtworzenia, które zastępuje bieżącą grę. Pełne RF-01 nie jest wymagane.
- **Testy:** zapis–restart–odczyt, eksport–odtworzenie, niepoprawny JSON/format archiwum, wymuszona odmowa zapisu w izolowanym środowisku. Sprawdzić ochronę PIN-u, konieczność logowania po restarcie i brak nadpisania bieżącego stanu przez odrzucone archiwum. Zasymulowana awaria nie dowodzi odporności na wszystkie zaniki zasilania.
- **Akceptacja:** każdy przypadek ma wersję kodu, wynik i dowód; procedura daje odtwarzalny wynik lub jawnie wskazuje brak. Wykryta utrata danych otrzymuje oddzielną propozycję małej naprawy, bez automatycznej implementacji. Bez deklaracji gotowości przy niezaliczonych kryteriach.
- **Wycofanie:** zakończyć środowisko testowe, usunąć wyłącznie oznaczone dane syntetyczne; raport poprawić nowym commitem. Nie odtwarzać starszej kopii na danych użytkownika.
- **Ryzyko:** błędne odtworzenie może zastąpić nowszą historię. Odczyt kodu `savePunktacja` na `529000b` pokazuje bezpośredni `writeFileSync` do głównego pliku; to wskazanie do testu trwałości, nie dowód zaistniałej utraty danych. Nie projektujemy teraz nowego magazynu.

## Pierwszy rekomendowany pakiet — RF-03 z testami salda z RF-02

**Status: implementacja i testy salda wykonane lokalnie po osobnym zleceniu RF-03 z 2026-11-12; poniżej zachowany zakres pakietu. Odbiór UI i review jeszcze niewykonane.** Jeden rezultat i jeden przyszły PR: dziecko może poprosić o nagrodę za punkty widoczne na ekranie. Typ B z niezbędnymi testami regresji; proponowany wykonawca Łukasz, review Patryk, do uzgodnienia. Szacunek 0,5–1 dnia po zapewnieniu izolowanego uruchomienia.

- **Dowód i reguła:** odczyt kodu na `529000b`: `server.js::calculateAvailablePoints` pomija pytania, a oba endpointy nagród korzystają z tej funkcji. `public/punktacja/app.js::dayPoints`, `totalPoints`, `questionDayPoints` uwzględniają daty ze statusem `done`. Źródła wymagań: `RAFCIO.md`, sekcje „Odbiór nagrody” w przebiegu gry i tabela salda; `KNOWN_ISSUES.md`, pierwszy problem. To historyczne potwierdzenie statyczne sprzed naprawy; aktualne testy HTTP i wynik podano przy RF-03 powyżej.
- **Dokładny zakres:** doliczyć po stronie serwera zaliczone pytania dnia do salda używanego przez `/api/punktacja/reward-request` oraz `/api/punktacja/parent/reward`. Zachować semantykę obecnej stawki z `questionDayPoints`: liczba skończona i nieujemna zaokrąglona do całkowitej, w pozostałych przypadkach 10; tylko status `done`, również bez wpisu daty w `records`. Testy i krótka instrukcja uruchomienia oraz aktualizacja opisu naprawionego problemu należą do pakietu.
- **Granice:** bez wydzielania modułów, przebudowy frontendu, zmian HTTP/API, formatu JSON, autoryzacji, innych gier, historii stawek, reguł wyprawy i instalowania zależności. Wspólny `server.js` zmienia tylko obliczenie Rafcia; przed implementacją potwierdzić wszystkich jego konsumentów. RF-04, RF-05, RF-06 i RF-08 pozostają osobnymi zadaniami.
- **Przygotowanie i zależności:** przed zmianą potwierdzić aktualny dowód oraz zgodę na tę regułę; sprawdzić Git/PR. Uruchomić kopię wyłącznie kodu i niezbędnych zasobów z syntetycznymi danymi, bez kopiowania `.env`, prawdziwego JSON i archiwów. Sprawdzić wszystkie ścieżki zapisu przed pierwszym żądaniem. Wykorzystać dostępne narzędzia bez nowych bibliotek; jeśli środowisko wymaga instalacji lub szerszej zmiany, zgłosić ograniczenie. Pełne RF-01 i pełne RF-02 nie blokują tego pakietu.
- **Test odtwarzający błąd:** samo zaliczone pytanie za 10 pkt, brak `records`, nagroda za 10 pkt: ekran pokazuje 10, obecny serwer odrzuca prośbę. Ten sam test ma przejść po naprawie. Oddzielnie sprawdzić istniejącą oczekującą prośbę zatwierdzaną przez rodzica.
- **Testy regresji:** pytanie `done`, niezaliczone i bez statusu; stawki 0, 10, ułamkowa, brak i niepoprawna; dzień z samym pytaniem oraz pytaniem i obowiązkiem bez podwójnego naliczenia. Sprawdzić też obowiązki wykonane/niewykonane, aktywności, misje, bonusy, konsekwencje i już zatwierdzone nagrody.
- **Testy granic nagrody:** koszt równy saldu — sukces; koszt większy o 1 — odmowa; prośba oczekująca nie potrąca punktów, zatwierdzenie potrąca raz, odrzucenie nie potrąca, ponowne zatwierdzenie nie potrąca drugi raz. Zmniejszenie salda pomiędzy prośbą a decyzją blokuje zatwierdzenie. Brak sesji rodzica daje odmowę bez zmiany zapisu. Restart zachowuje zatwierdzoną nagrodę i saldo.
- **Odbiór UI:** krótki przebieg dziecko → prośba → rodzic → zatwierdzenie → dziecko na danych syntetycznych; porównać saldo ekranu z decyzją API przed i po operacji. To część kontroli nagrody, nie zaliczenie całego RF-09.
- **Kryteria akceptacji:** test pierwotnego rozjazdu nie przechodzi na bazie i przechodzi po naprawie; wszystkie powyższe przypadki mają zgodny wynik UI/API tam, gdzie dotyczy, oraz dowód. Druga osoba odtwarza testy według instrukcji. Format danych, pozostałe źródła punktów i kontrakty pozostają zgodne; brak zapisu do danych użytkownika. Diff ograniczony do obliczenia, testów i właściwych dokumentów; brak nowych zależności. Niezaliczone kryterium blokuje uznanie naprawy za gotową.
- **Ryzyko:** mały zakres kodu, umiarkowany wpływ biznesowy — zmienia dostępność nagród. Możliwe podwójne naliczenie, inna wartość domyślna lub potrącenie przy powtórzonej operacji; testy powyżej pokrywają te granice. Zmiana stawki nadal działa wstecz do rozstrzygnięcia RF-06; nie deklarować ochrony całej historii po tym pakiecie.
- **Wycofanie:** nowy commit odwracający wyłącznie naprawę i jej oczekiwania testowe; pozostawić rzeczywiście zatwierdzone nagrody i wszystkie nowsze dane. Powtórzyć odczyt i kontrolę historii operacji. Powrót starego kodu przywróci znany rozjazd — zgłosić to jawnie; nie odtwarzać starszego JSON. Potrzeba migracji oznacza zatrzymanie i osobne uzgodnienie.

Zakres RF-02 wykonany w pakiecie należy oznaczyć jako częściowy; test dnia z samym pytaniem dla wyprawy nadal należy do RF-04. Nie oznaczać RF-01, całego RF-02 ani RF-09 jako ukończonych przy zamykaniu samej naprawy salda.

## Odroczone lub warunkowe kierunki architektoniczne

Wszystkie poniższe możliwości zachowujemy, ale bez dodatkowej zgody nie rozpoczynamy analizy wykonawczej ani wdrożenia:

| Kierunek | Warunek powrotu do rozważenia |
| --- | --- |
| PostgreSQL lub SQLite | Wykazane wymaganie trwałości/skali, którego nie da się rozsądnie spełnić małą poprawką obecnego rozwiązania. |
| Migracja do chmury / hosting | Rzeczywista potrzeba dostępu zdalnego, uzgodnione bezpieczeństwo, koszty, kopie i plan wyjścia. |
| Kompleksowe przepisanie frontendu | Konkretne problemy użytkowe lub utrzymaniowe, których nie rozwiązują lokalne poprawki; zachować charakter wizualny. |
| Całościowa reorganizacja repo / nowe frameworki | Udokumentowana przeszkoda w pracy i przewaga nad mniejszym rozwiązaniem. |
| Rozbudowana infrastruktura DevOps | Realna potrzeba wdrożeń i utrzymania; RF-07 pozostaje jedynie opcją prostej kontroli. |
| Konta wielu rodzin | Zatwierdzona potrzeba produktowa; dziś jedna rodzina na lokalną instancję. |
| Refaktor pozostałych gier | Osobny, uzgodniony zakres wykorzystania danego modułu; nie usuwać istniejących zasobów. |

## Odroczona inicjatywa AI-MEM-01 — System trwałej i warstwowej pamięci agentów AI

- **Status:** odroczona, P3; wyłącznie rejestracja na przyszłość na podstawie instrukcji z 2026-11-11. Nie jest etapem zatwierdzonym do projektowania lub implementacji.
- **Problem i wartość:** ograniczyć zużycie kontekstu, zachować pełną historię istotnych decyzji, przekazywać wiedzę między sesjami i ułatwić współpracę wielu agentów.
- **Do przyszłego rozważenia:** warstwowa organizacja pamięci, automatyczne podsumowania sesji, przechowywanie decyzji i zmian, ładowanie informacji właściwych dla zadania, wykrywanie nieaktualnych dokumentów, handoff między agentami oraz kontrola kosztów i zużycia kontekstu.
- **Wpływ:** przyszłe narzędzie wspierające pracę; nie zmienia mechanik Rafcia. Obecny proces nadal opiera się na repo, Issues i PR.
- **Złożoność i zależności:** nieoszacowane; najpierw doświadczenia z ręcznego standardu, konkretna potrzeba, wspólna decyzja o podjęciu analizy oraz ewentualny budżet. Właściciel do uzgodnienia przez Łukasza i Patryka.
- **Granica obecnego wpisu:** bez architektury, wyboru technologii, projektu magazynu pamięci, instalacji narzędzi, automatyzacji i wydatków. Wznowienie wymaga osobnej zgody; wtedy dopiero powstaną małe zadania z testami, akceptacją i wycofaniem.

Pozostały rozwój produktu, konta, baza, hosting i wykorzystanie innych gier wymagają własnych uzgodnień. Nie są domyślną kontynuacją tej kolejki. Nowe dowody i pomysły mogą zmieniać roadmapę, ale nie zakres już zatwierdzonej pracy bez ponownego uzgodnienia.
