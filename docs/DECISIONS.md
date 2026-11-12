# Zatwierdzone decyzje projektu

Ten rejestr przechowuje istotne, zatwierdzone ustalenia. Pomysły i niezatwierdzone alternatywy pozostają w Issues. Znalezienie błędu, rekomendacja audytu ani wpis do backlogu nie są akceptacją rozwiązania.

## Zasady rejestru

- Nowa decyzja otrzymuje stałe ID, datę, kontekst, treść, zakres, konsekwencje i źródło akceptacji.
- Istotne decyzje architektoniczne, produktowe i infrastrukturalne uzgadniają Łukasz i Patryk. Podaj rzeczywiste osoby oraz odnośnik do uzgodnienia; agent nie dopisuje zgody nieobecnej osoby.
- Nie nadpisuj historii. Nowa decyzja wskazuje „zastępuje D-…”. Starszą oznacz jako zastąpioną i dodaj odnośnik, pozostawiając jej treść oraz źródło.
- Korekta literówki lub linku nie zmienia sensu decyzji. Zmiana sensu wymaga nowego wpisu.
- Zgoda na konkretne zadanie nie jest trwałą zgodą na push, merge, wdrożenie ani wydatki.

## Rejestr

Decyzje początkowe D-001–D-003 zapisują zasady przekazane w zleceniu „ROZSZERZENIE ZASAD PROJEKTU — WSPÓŁPRACA DWÓCH PROGRAMISTÓW I AGENTÓW AI” z 2026-11-11. Kolejne wpisy podają własne źródło. Źródłem tych instrukcji jest zleceniodawca; nie jest to twierdzenie o odrębnym review lub akceptacji plików przez Patryka. Repo zawiera treść ustaleń potrzebną do pracy bez dostępu do rozmowy i bez lokalnych ścieżek załączników.

### D-001 — Współpraca przez trwałe artefakty

- **Data / status:** 2026-11-11 / zatwierdzona w instrukcji zleceniodawcy.
- **Kontekst:** dwaj programiści i ich niezależne sesje agentów potrzebują wspólnych zasad i przekazywania stanu.
- **Decyzja:** wspólne AGENTS.md, Issues dla zadań/pomysłów, osobne gałęzie, PR i review drugiego programisty przed merge. Bez bezpośrednich zmian na main i bez automatycznego merge. Handoff domyślnie w PR, wcześniej w Issue; bez założenia automatycznej komunikacji agentów.
- **Odpowiedzialność:** Łukasz — domyślnie technika, infrastruktura, backend i jakość; Patryk — produkt, mechaniki, gra i UI/UX. Podział elastyczny, pomysły równorzędne.
- **Konsekwencje:** lokalna pamięć nie zastępuje wspólnych artefaktów. Konfiguracja GitHub wymaga osobnego potwierdzenia; dokumentacja jej nie włącza.
- **Akceptacja:** zlecenie dokumentacji, punkty 1–4, 8–9. Realizacja: [TEAM_WORKFLOW.md](TEAM_WORKFLOW.md).

### D-002 — Ochrona produktu i pozostałych modułów

- **Data / status:** 2026-11-11 / zatwierdzona w instrukcji zleceniodawcy.
- **Kontekst:** modernizacja dotyczy obecnie głównie Rafcia; pozostałe moduły mają służyć przyszłej grze.
- **Decyzja:** zachować koncepcję produktu i ustalenia audytu. Nie usuwać, nie przenosić ani nie refaktoryzować pozostałych gier w bieżącej modernizacji. Analiza i propozycje są dozwolone; implementacja wymaga uzgodnienia.
- **Konsekwencje:** wspólny kod i zależności wymagają oceny wpływu. Raport audytu pozostaje źródłem ustaleń i propozycji, nie zgodą na refaktor, migrację bazy czy nowy sposób logowania. Siedem Szczytów, punkty i nagrody pozostają fundamentem.
- **Akceptacja:** zlecenie dokumentacji, wstęp oraz punkty 5 i 9; wcześniejsze zlecenie audytu, zasady A/B/C i ochrony koncepcji.

### D-003 — Budżet obecny i możliwość rozwoju

- **Data / status:** 2026-11-11 / zatwierdzona w instrukcji zleceniodawcy.
- **Kontekst:** dziś brak budżetu abonamentowego; później możliwe finansowanie infrastruktury.
- **Decyzja:** obecny limit wynosi 0 PLN/mies. Wariant 100–200 PLN/mies. pozostaje możliwością wymagającą osobnego zatwierdzenia. Nie wybieramy teraz płatnej usługi ani nowej architektury.
- **Konsekwencje:** propozycja kosztowa musi określać aktualne ceny i limity, koszt obsługi, ryzyko nadwyżek, migrację, backup i plan rezygnacji. Bez blokowania przyszłego rozwoju przez założenie, że budżet zawsze będzie zerowy.
- **Akceptacja:** zlecenie dokumentacji, punkty 7 i 9; format oceny w [TEAM_WORKFLOW.md](TEAM_WORKFLOW.md).

### D-004 — Etapowa realizacja i odtwarzalność między sesjami

Bieżący zakres zgody z tego historycznego wpisu został zastąpiony przez [D-005](#d-005--prosty-rozwój-po-rf-00). Zasady małych etapów i trwałego przekazania pozostają w mocy.

- **Data / status:** 2026-11-11 / zatwierdzona w instrukcji zleceniodawcy. Uzupełnia D-001 i D-002, nie zastępuje wcześniejszych ustaleń.
- **Kontekst:** wielomiesięczny rozwój wymaga wznowienia pracy przez dowolnego z obu agentów bez dostępu do poprzedniej rozmowy lub wewnętrznej kompresji kontekstu.
- **Decyzja:** każdy mały etap ma cel, zakres, zależności, testy, kryteria akceptacji i sposób wycofania. Zakończenie, review lub merge etapu nie upoważnia do rozpoczęcia kolejnego; potrzebne jest osobne zatwierdzenie.
- **Ciągłość:** po istotnej pracy utrwalić rezultat, decyzje, pliki, wersję, wyniki i braki testów, problemy, ryzyka, pozostałe działania oraz dokładne zadanie i pierwszy krok następnej sesji. Użyć repo/Issue/PR; `SESSION_STATE.md` wskazuje handoff, a przed publikacją zawiera jego bieżącą treść. Poprzednie wersje pozostają w Git. Obaj agenci zaczynają od sprawdzenia repo, wspólnych zasad, aktualnego handoffu, właściwej dokumentacji i otwartych zadań.
- **Zakres bieżącej zgody:** tylko dokumentacja RF-00, na osobnej gałęzi i w lokalnym commicie; brak push, merge, zmian aplikacji i automatycznego rozpoczęcia RF-01. Karty pozostałych etapów są propozycjami, nie przyjętymi rozwiązaniami.
- **Akceptacja:** instrukcja zleceniodawcy „Dodatkowe wymagania: ciągłość pracy i etapowa realizacja”, punkty 1–5, z 2026-11-11. Nie stwierdzamy odrębnej akceptacji Patryka. Realizacja: [workflow](TEAM_WORKFLOW.md), [roadmapa](ROADMAP.md), [punkt wznowienia](SESSION_STATE.md).

### D-005 — Prosty rozwój po RF-00

- **Data / status:** 2026-11-12 / kierunek zatwierdzony w instrukcji zleceniodawcy „RAFCIO — Aktualizacja strategii rozwoju po RF-00”.
- **Kontekst i alternatywy:** RF-00 jest wykonane i scalone. Po przeglądzie rekomendacji zleceniodawca przekazał wspólną decyzję o rezygnacji z kompleksowej przebudowy na rzecz małych zmian rozwiązujących realne problemy. Roadmapa jest zbiorem priorytetów i możliwości, nie obowiązkowym planem przebudowy.
- **Decyzja:** najpierw wartość dla dziecka, stabilność, bezpieczeństwo i użyteczność; zmiany architektury dopiero przy wykazanej potrzebie. Zachowujemy Node.js/Express, istniejącą logikę biznesową, obowiązki, punkty i wymianę na nagrody, Siedem Szczytów, ekwipunek, charakter wizualny, pozostałe moduły oraz dokumentację. Potwierdzone błędy naprawiamy małymi, przetestowanymi zmianami.
- **Priorytety:** potwierdzone błędy bezpieczeństwa; bezpieczny zapis i odtwarzanie danych; poprawne punkty; ochrona historii i osiągnięć dziecka; testy głównych funkcji; istniejące błędy użytkowe. Istotność ustalamy na podstawie dowodów i skutków, nie wielkości planowanej przebudowy.
- **Odroczenia:** PostgreSQL/SQLite, migracja do chmury, całościowe przepisanie frontendu, reorganizacja repo, nowe frameworki, rozbudowany DevOps, konta wielu rodzin i refaktor pozostałych gier wymagają osobnej zgody oraz konkretnego uzasadnienia. Pomysły pozostają w roadmapie.
- **Audyt:** zachowujemy ustalenia i ich historię; rekomendacje nie są obowiązkiem wdrożenia. RF-01 nie jest ukończone: w sprawdzonym repo nie ma pełnego raportu. Utrwalenie brakujących źródeł pozostaje ważne, ale pełny audyt nie blokuje osobno zatwierdzonej naprawy problemu, którego wymaganie i dowód są już dostępne. Nowej weryfikacji nie nazywamy oryginalnym pełnym audytem.
- **Zakres bieżącej zgody:** wyłącznie ocena stanu, aktualizacja strategii i dokumentów oraz propozycja pakietu technicznego. Bez zmian aplikacji, instalacji zależności, refaktoru, migracji, push i merge. RF-03 z testami z RF-02 jest rekomendacją, nie zgodą na implementację; pozostałe etapy również wymagają osobnego zlecenia.
- **Wpływ i ryzyka:** brak zmiany kodu, danych, mechanik, wyglądu i kosztów; budżet D-003 pozostaje w mocy. Niepełny audyt oznacza nieznane ryzyka, a przejście pojedynczego testu nie dowodzi gotowości produkcyjnej. Potwierdzone pilne zagrożenie może zmienić kolejność po uzgodnieniu zakresu naprawy.
- **Zastępuje / uzupełnia:** zastępuje wyłącznie historyczny „Zakres bieżącej zgody” D-004; zachowuje jego pozostałe zasady oraz D-001–D-003. Aktualizuje kolejność i zależności w roadmapie; poprzednia wersja pozostaje w historii Git.
- **Akceptacja / publikacja:** źródłem jest powyższe zlecenie użytkownika z 2026-11-12, punkty 1–6; jego treść merytoryczna jest zapisana tutaj. Nie ma odnośnika do opublikowanego uzgodnienia ani odrębnego review Patryka dla tej zmiany. Agent nie przypisuje mu dodatkowej akceptacji. Zmiana lokalna, bez nowego Issue/PR; [punkt wznowienia](SESSION_STATE.md).
- **Wycofanie:** korektę dokumentacyjną odwrócić nowym commitem; zmianę przyjętego kierunku zapisać jako kolejną decyzję, zachowując D-005. Bez cofania danych lub historii Git.

## Format przyszłego wpisu

```text
D-NNN — Tytuł
Data / status: zatwierdzona lub zastąpiona przez D-NNN
Kontekst i dotychczasowe podejście:
Rozważone alternatywy i rekomendacja:
Decyzja i zakres:
Wpływ na produkt, kod, dane, koszty i utrzymanie:
Ryzyka, zależności, migracja / wycofanie:
Akceptacja: Łukasz — odnośnik; Patryk — odnośnik
Issue / PR:
Zastępuje: ID albo nie dotyczy
```

Wybór bazy, kont rodzinnych, hostingu, zmian logowania i szczegółowych zasad trwałości punktów/osiągnięć nie jest zatwierdzony przez ten rejestr.
