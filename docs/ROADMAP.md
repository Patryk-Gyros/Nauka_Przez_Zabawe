# Rafcio — małe etapy rozwoju

To roboczy podział prac do uzgodnienia, oparty na [wymaganiach](REQUIREMENTS.md), [mapie produktu](RAFCIO.md) i [znanych problemach](KNOWN_ISSUES.md). Nie zastępuje pełnego audytu ani nie zatwierdza jego rekomendacji. Pełny raport audytu nie został jeszcze utrwalony w repo; RF-01 ma uzupełnić ten brak bez odtwarzania nieznanych ustaleń z domysłów.

**Obecna zgoda obejmuje wyłącznie RF-00: dokumentację współpracy, ciągłości i planu etapów.** Pozostałe zadania są propozycjami wymagającymi osobnego zatwierdzenia. Zakończenie jednego nie rozpoczyna następnego. Zasady akceptacji i wycofania określa [TEAM_WORKFLOW.md](TEAM_WORKFLOW.md), a bieżący stan i pierwszy krok kolejnej sesji — [SESSION_STATE.md](SESSION_STATE.md).

ID `RF-*` i `AI-MEM-01` są lokalnymi identyfikatorami, nie numerami istniejących Issues. Po upoważnionej publikacji zachowaj ID i zastąp roboczą kartę linkiem do Issue. Wtedy tylko Issue przechowuje aktualny status, właściciela, zgodę i szczegóły etapu; tutaj zostaje kolejność i powiązanie. Nie publikowano tych zadań ani nie zweryfikowano konfliktów z aktualnymi zdalnymi PR.

P0 oznacza potwierdzone ryzyko krytyczne, P1 fundamenty i istotne naprawy, P2 poprawę istniejącego rozwiązania, P3 możliwy rozwój. Na podstawie samego obecnego katalogu nie dopisujemy P0; potwierdzone ustalenia audytu mogą zmienić kolejność po RF-01. Szacunki są orientacyjnym czasem pracy jednej osoby, bez oczekiwania na decyzje. Właściciele RF-01–RF-09 pozostają do uzgodnienia według ról zespołu.

## Kolejność i niezależność

Pierwszy proponowany etap po zaakceptowaniu dokumentacji to RF-01. RF-02 przygotowuje kontrole dla napraw RF-03 i RF-04; te dwie naprawy mogą być wdrażane osobno. RF-05 i RF-06 to niezależne decyzje o historii punktów, bez implementacji. RF-07 uruchamia istniejące kontrole w CI, RF-08 obejmuje jeden mały refaktor, a RF-09 weryfikuje jedną pełną ścieżkę użytkownika. Spełniona zależność nie jest zgodą na rozpoczęcie zadania.

### RF-00 — Dokumentacja współpracy i ciągłości

- **Cel / priorytet / nakład:** odtwarzalna praca obu programistów i agentów; P1, około 0,5–1 dnia. Właściciel: Łukasz. Bieżący handoff w `SESSION_STATE.md`.
- **Zakres:** AGENTS, workflow, decyzje, ta roadmapa, punkt wznowienia, README i szablony Issue/PR. Bez zmian aplikacji, konfiguracji GitHub i narzędzi pamięci.
- **Zależności:** RF-00 wykonane i scalone przez użytkownika w PR #3, commit `14b309f`. Review Patryka przed merge nie zostało odnotowane; szczegóły i punkt wznowienia w `SESSION_STATE.md`. Nie ma oczekującego merge tego etapu.
- **Testy:** sprawdzenie diffu, lokalnych linków, składni i struktury formularzy oraz kompletności kart etapów i handoffu.
- **Akceptacja:** następna sesja odczyta rezultat, decyzje, pliki, testy, ograniczenia i pierwszy krok z repo; każdy etap ma wymagane pola; AI-MEM-01 pozostaje odroczone. Gotowość dokumentacji nie oznacza review ani merge.
- **Wycofanie:** nowy commit odwracający wskazany commit dokumentacyjny, kontrola odnośników i aktualizacja punktu wznowienia; bez resetu historii ani danych aplikacji.
- **Ryzyko:** brak odnotowanego review w PR #3 jest odstępstwem od procesu; przy kolejnych PR obowiązuje review drugiej osoby przed merge. Konfiguracja GitHub pozostaje do uzgodnienia, RF-01 wymaga osobnego zatwierdzenia.

### RF-01 — Utrwalenie dowodów audytu

- **Cel / priorytet / nakład:** uniezależnić ustalenia techniczne od rozmowy; P1, około 0,5–1 dnia.
- **Zakres:** uzupełnić istniejące `KNOWN_ISSUES.md`, `REQUIREMENTS.md` i `RAFCIO.md` o zweryfikowane ustalenia, wersję kodu, dowody, ryzyka i nierozstrzygnięte pytania; skorygować kolejkę małych zadań. Bez napraw i bez uznawania propozycji architektury za przyjęte.
- **Zależności:** akceptacja RF-00 i osobna zgoda na RF-01; dostęp do pełnego raportu albo wyraźnie uzgodniony zakres ponownej weryfikacji. Brak źródła oznaczyć, nie uzupełniać z pamięci agenta.
- **Testy:** porównać każde przenoszone ustalenie z dokumentacją i wskazaną wersją kodu; sprawdzić linki, zakres diffu i brak danych prywatnych.
- **Akceptacja:** potwierdzone zachowanie, wymagania, rozbieżności i propozycje są rozróżnione; każdy problem ma dowód, priorytet i wpływ; braki jawnie wymienione. Nowe naprawy stają się osobnymi propozycjami.
- **Wycofanie:** odwrócić wyłącznie aktualizację dokumentacji nowym commitem, zachować poprzednie wersje w Git i sprawdzić linki.
- **Ryzyko:** utrwalenie niepełnego raportu jako kompletnego albo nadanie akceptacji samej rekomendacji.

### RF-02 — Odtwarzalne kontrole punktacji na danych syntetycznych

- **Cel / priorytet / nakład:** zabezpieczyć dwa znane rozjazdy opisane w `KNOWN_ISSUES.md`; P1, około 1 dnia; typ A — kontrole bez zmiany zachowania aplikacji.
- **Zakres:** mały zestaw danych i powtarzalne kontrole salda, zatwierdzania nagrody oraz dnia z samym pytaniem; instrukcja uruchomienia w odizolowanej kopii. Nie testować prawdziwego zapisu użytkownika ani przebudowywać środowiska aplikacji.
- **Zależności:** RF-01, osobna zgoda na etap i dostępne działające Node.js/npm. Wybór lub zmiana wersji środowiska wymaga uzgodnienia poza tą kartą, jeśli okaże się potrzebna.
- **Testy:** powtórzyć kontrole na świeżych danych; sprawdzić powtarzalność wyniku i to, że wszystkie zapisy trafiają do izolowanej lokalizacji.
- **Akceptacja:** drugi programista odtwarza obecne zachowanie i rozjazdy jednym opisanym przebiegiem; oczekiwane reguły są oddzielone od testów obecnego błędu. Brak deklaracji, że istniejąca rozbieżność została naprawiona.
- **Wycofanie:** odwrócić commit testów i instrukcji; zakończyć proces testowy, usunąć wyłącznie oznaczone dane syntetyczne. Kod i dane użytkownika nie wymagają odtwarzania.
- **Ryzyko:** test charakteryzujący błąd może zostać mylnie uznany za docelowe wymaganie; dostęp do prawdziwego pliku danych musi być wykluczony.

### RF-03 — Zgodne saldo przy zatwierdzaniu nagrody

- **Cel / priorytet / nakład:** rozwiązać P1 „Ekran i serwer liczą różne saldo” z `KNOWN_ISSUES.md`; P1, około 0,5–1 dnia; proponowany typ B.
- **Zakres:** wyłącznie uwzględnienie zatwierdzonych pytań dnia w saldzie używanym do oceny nagrody, zgodnie z uzgodnioną regułą z `RAFCIO.md`. Bez przebudowy pozostałych mechanik, formatu danych i logowania.
- **Zależności:** RF-02 oraz potwierdzenie reguły i osobna zgoda na naprawę; przed zmianą `server.js` sprawdzić wpływ na wspólne moduły.
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
- **Zależności:** RF-01, osobna zgoda na analizę; rozstrzygnięcie produktowe Łukasza i Patryka.
- **Testy:** przejść przykład zdobycia punktów, usunięcia definicji, ponownego odczytu i odtworzenia archiwum; porównać obecny i proponowany wynik bez mutowania danych użytkownika.
- **Akceptacja:** uzgodniono wynik każdego przykładu, postępowanie ze starymi zapisami i brakującą historią. Dopiero wtedy wydzielić małe zadanie implementacji z własnym testem i bezstratnym wycofaniem; nie rozpoczynać go automatycznie.
- **Wycofanie:** propozycję dokumentacyjną cofnąć commitem; przyjętą decyzję zastąpić nową zatwierdzoną decyzją, zachowując historię. Brak zmian danych do odtwarzania.
- **Ryzyko:** niektórych utraconych informacji nie można odtworzyć z bieżących danych; nie obiecywać ich odzyskania.

### RF-06 — Decyzja o stawce historycznego pytania dnia

- **Cel / priorytet / nakład:** ustalić, czy zmiana stawki działa na przeszłość; P2, około 0,5 dnia analizy; dokumentacja przed zmianą B/C.
- **Zakres:** osobna reguła opisana w `KNOWN_ISSUES.md`; wymaganie i decyzja dla istniejących oraz nowych zaliczeń. Bez implementacji i bez wyboru bazy.
- **Zależności:** RF-01, osobna zgoda na analizę i wspólna decyzja produktowa. RF-05 nie blokuje tego zadania.
- **Testy:** przykład pytania zaliczonego przy 10 pkt, zmiany stawki na 5 pkt, nowego zaliczenia i odczytu starszego archiwum; porównać saldo oraz postęp wyprawy.
- **Akceptacja:** przyjęte przykłady i zasady obsługi starych zapisów są zapisane w wymaganiach i `DECISIONS.md`; osobne zadanie implementacyjne powstaje dopiero po tej decyzji, bez automatycznego rozpoczęcia.
- **Wycofanie:** cofnąć propozycję dokumentacyjną nowym commitem; przyjętą decyzję zastąpić nowym uzgodnieniem z zachowaniem historii. Dane aplikacji pozostają niezmienione.
- **Ryzyko:** dawne stawki mogą nie być zapisane; przyjęcie wartości zastępczej wymaga jawnej decyzji ludzi.

### RF-07 — Jedna kontrola CI dla istniejących testów

- **Cel / priorytet / nakład:** powtarzalna weryfikacja PR; P1, około 0,5 dnia; typ A — automatyzacja kontroli.
- **Zakres:** uruchomienie uzgodnionych istniejących testów na danych syntetycznych, bez wdrażania aplikacji, sekretów, automatycznego merge i zmian innych gier.
- **Zależności:** RF-02, osobna zgoda na zmianę CI oraz potwierdzone środowisko, dostęp i limity mieszczące się w budżecie 0 PLN. Zmiana branch protection pozostaje osobną decyzją.
- **Testy:** przebieg poprawnego zestawu oraz kontrolowanego błędu na gałęzi testowej; sprawdzenie logów pod kątem danych prywatnych.
- **Akceptacja:** PR pokazuje wynik tych samych kontroli co lokalnie; błąd testu zatrzymuje kontrolę, brak niezatwierdzonych kosztów i wdrożeń.
- **Wycofanie:** cofnąć tylko konfigurację kontroli; zachować polecenia lokalne. Jeżeli check zostanie później ustawiony jako wymagany, najpierw uzgodnić zmianę tej reguły, aby nie zablokować PR.
- **Ryzyko:** różnice środowisk i limity usługi; nie włączać rozliczeń ani nowych uprawnień bez decyzji.

### RF-08 — Wydzielenie jednego obliczenia salda

- **Cel / priorytet / nakład:** ułatwić testowanie reguły bez HTTP; P2, około 0,5–1 dnia; typ A.
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

## Odroczona inicjatywa AI-MEM-01 — System trwałej i warstwowej pamięci agentów AI

- **Status:** odroczona, P3; wyłącznie rejestracja na przyszłość na podstawie instrukcji z 2026-11-11. Nie jest etapem zatwierdzonym do projektowania lub implementacji.
- **Problem i wartość:** ograniczyć zużycie kontekstu, zachować pełną historię istotnych decyzji, przekazywać wiedzę między sesjami i ułatwić współpracę wielu agentów.
- **Do przyszłego rozważenia:** warstwowa organizacja pamięci, automatyczne podsumowania sesji, przechowywanie decyzji i zmian, ładowanie informacji właściwych dla zadania, wykrywanie nieaktualnych dokumentów, handoff między agentami oraz kontrola kosztów i zużycia kontekstu.
- **Wpływ:** przyszłe narzędzie wspierające pracę; nie zmienia mechanik Rafcia. Obecny proces nadal opiera się na repo, Issues i PR.
- **Złożoność i zależności:** nieoszacowane; najpierw doświadczenia z ręcznego standardu, konkretna potrzeba, wspólna decyzja o podjęciu analizy oraz ewentualny budżet. Właściciel do uzgodnienia przez Łukasza i Patryka.
- **Granica obecnego wpisu:** bez architektury, wyboru technologii, projektu magazynu pamięci, instalacji narzędzi, automatyzacji i wydatków. Wznowienie wymaga osobnej zgody; wtedy dopiero powstaną małe zadania z testami, akceptacją i wycofaniem.

Pozostały rozwój produktu, konta, baza, hosting i wykorzystanie innych gier wymagają własnych uzgodnień. Nie są domyślną kontynuacją tej kolejki. Nowe dowody i pomysły mogą zmieniać roadmapę, ale nie zakres już zatwierdzonej pracy bez ponownego uzgodnienia.
