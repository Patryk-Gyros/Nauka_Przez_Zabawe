## Zadanie i cel

- Issue / lokalne ID:
- ID etapu z roadmapy i odnośnik do zgody na rozpoczęcie:
- Osoba odpowiedzialna: Łukasz / Patryk
- Typ: A — refaktor / B — naprawa / C — zatwierdzony rozwój
- Problem i wynik zmiany:
- Kryteria akceptacji:

## Zakres

- Wykonane zmiany, lista zmienionych plików i modułów:
- Wpływ na istniejące zachowanie; dla B wymaganie i przykład przed/po:
- Wpływ na pozostałe gry lub wspólne kontrakty; uzgodnienie, jeśli dotyczy:
- Sposób wycofania tego etapu, zgodna wersja i kontrola po cofnięciu (także dla dokumentacji):
- Wpływ na dane i zachowanie operacji wykonanych po wdrożeniu; migracja, jeśli dotyczy:

## Decyzje i założenia

- Zatwierdzone decyzje: ID z docs/DECISIONS.md lub odnośniki do uzgodnień:
- Przyjęte założenia i kwestie nadal otwarte:
- Zaktualizowana dokumentacja:

## Weryfikacja

- Wersja sprawdzona: commit (albo jednoznacznie opisany stan roboczy):
- Środowisko i dane testowe, bez danych prywatnych:
- Wykonane testy / kontrole, polecenia i wyniki:
- Testy niewykonane i powód:
- Kontrola regresji mechanik i UI, jeśli dotyczy:

<!-- Nie wpisuj „wszystko działa” bez dowodu. Przy zmianie tylko dokumentacji wystarczą właściwe kontrole dokumentów. Bez danych prywatnych, tokenów i prawdziwych zapisów gry. -->

## Agent Handoff

- Gałąź:
- Commit przekazania:
- Numer i link PR (przed publikacją: Issue lub „PR nieutworzony”):
- Stan publikacji / review / merge (oczekuje na review / poprawki / merge):
- Znane problemy i ryzyka:
- Zależności i potencjalne konflikty z innymi zadaniami / PR:
- Dalsze wymagane działania:
- Następna sesja: ID zadania, pierwszy krok i stan zgody (kontynuacja / oczekuje na zatwierdzenie):
- Punkt wznowienia w docs/SESSION_STATE.md i niezacommitowane zmiany, jeśli zostały:
- Odbiorca niezależnego review: Patryk i jego agent / Łukasz i jego agent:
- Co powinien sprawdzić drugi agent:
- Decyzja lub działanie wymagane od drugiego programisty:

## Gotowość do review

- [ ] Zakres odpowiada uzgodnionemu zadaniu; zmiany C mają osobną akceptację.
- [ ] Diff sprawdzony; bez cudzych zmian, sekretów i danych dzieci.
- [ ] Wyniki kontroli i ich ograniczenia opisane powyżej.
- [ ] Istotne decyzje i właściwa dokumentacja są aktualne.
- [ ] Handoff i punkt wznowienia są zapisane; kolejny etap nie został rozpoczęty bez zatwierdzenia.

## Review i gotowość do merge

- Sprawdzony commit i odnośnik do niezależnego review:
- Rekomendacja agenta: zaakceptować / poprawić / wstrzymać do wyjaśnienia; uzasadnienie, uwagi z lokalizacją oraz testy niewykonane:
- Zatwierdzenie aktualnej wersji przez uprawnionego drugiego programistę (osoba / odnośnik; do czasu decyzji: oczekuje):
- [ ] Wymagane testy i kontrole ukończone z wynikiem pozwalającym na merge.
- [ ] Niezależne review wykonane, istotne uwagi rozwiązane; istotne zmiany po review ponownie sprawdzone.
- [ ] Drugi programista zatwierdził aktualną wersję; upoważnienie do merge jest udokumentowane.

<!-- Zasady review: docs/TEAM_WORKFLOW.md, sekcja „Niezależne code review i warunki merge”. Agent przedstawia rekomendację, nie zatwierdza PR w imieniu człowieka. Zaznaczaj wyłącznie potwierdzone warunki. Bez automatycznego merge. Gdy PR nie jest gotowy, użyj tego samego formatu w Issue lub nieopublikowanym handoffie dla użytkownika. -->
