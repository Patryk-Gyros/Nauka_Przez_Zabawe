# Zatwierdzone decyzje projektu

Ten rejestr przechowuje istotne, zatwierdzone ustalenia. Pomysły i niezatwierdzone alternatywy pozostają w Issues. Znalezienie błędu, rekomendacja audytu ani wpis do backlogu nie są akceptacją rozwiązania.

## Zasady rejestru

- Nowa decyzja otrzymuje stałe ID, datę, kontekst, treść, zakres, konsekwencje i źródło akceptacji.
- Istotne decyzje architektoniczne, produktowe i infrastrukturalne uzgadniają Łukasz i Patryk. Podaj rzeczywiste osoby oraz odnośnik do uzgodnienia; agent nie dopisuje zgody nieobecnej osoby.
- Nie nadpisuj historii. Nowa decyzja wskazuje „zastępuje D-…”. Starszą oznacz jako zastąpioną i dodaj odnośnik, pozostawiając jej treść oraz źródło.
- Korekta literówki lub linku nie zmienia sensu decyzji. Zmiana sensu wymaga nowego wpisu.
- Zgoda na konkretne zadanie nie jest trwałą zgodą na push, merge, wdrożenie ani wydatki.

## Rejestr

Poniższe decyzje początkowe zapisują zasady przekazane w zleceniu „ROZSZERZENIE ZASAD PROJEKTU — WSPÓŁPRACA DWÓCH PROGRAMISTÓW I AGENTÓW AI” z 2026-11-11. Źródłem jest jawna instrukcja zleceniodawcy; nie jest to twierdzenie o odrębnym review lub akceptacji tych plików przez Patryka. Kopia instrukcji pozostaje w rozmowie zlecającej dokumentację; repo zawiera jej ustalenia bez lokalnych ścieżek załączników.

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
