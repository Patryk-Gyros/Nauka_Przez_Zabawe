# Znane problemy punktacji

- **P1 — Ekran i serwer liczą różne saldo.** [Ekran uwzględnia punkty za pytanie dnia](../public/punktacja/app.js), a [serwer pomija je przy sprawdzaniu nagrody](../server.js). Przycisk może więc pokazać dostępną nagrodę, którą serwer odrzuci. Saldo do wyświetlania i zatwierdzania powinno pochodzić z jednej reguły.
- **P1 — Usunięcie pozycji zmienia wynik za poprzednie dni.** [Usuwanie usuwa definicję](../server.js), a rozliczenie dnia zachowuje tylko identyfikator i ocenę. Jeśli dziecko zdobyło punkty za obowiązek lub misję, ich usunięcie z konfiguracji usuwa też te punkty z wyniku. Warto rozdzielić wycofanie pozycji z konfiguracji od rozliczonej historii.
- **P2 — Zmiana stawki pytania działa wstecz.** [Ustawienia przechowują jedną stawkę](../server.js), którą ekran stosuje do wszystkich zaliczonych dat. Zmiana z 10 na 5 pkt zmniejsza wynik za każde wcześniej zaliczone pytanie. Jeśli rozliczenia mają być trwałe, trzeba zapisać przyznaną wartość przy dacie.
- **P2 — Wyprawa pomija niektóre zaliczone pytania.** [Suma wyprawy przechodzi tylko po dniach z rozliczeniem obowiązków, aktywności lub misji](../public/punktacja/app.js). Samo zaliczenie pytania nie tworzy takiego rozliczenia, więc może zwiększyć saldo, ale nie postęp do szczytu.

## F01 — Upload generatora (naprawione lokalnie 2026-11-12)

Multer `1.4.5-lts.2` był objęty [GHSA-wc9g-mqfw-jrwm](https://github.com/expressjs/multer/security/advisories/GHSA-wc9g-mqfw-jrwm), a upload nie miał limitów. Naprawa: Multer `2.3.0`, ograniczenia plików/części i brak pól tekstowych, sprawdzenie konfiguracji generatora przed parserem oraz kontrolowane błędy JSON. Formularze pokazują odmowę zamiast przechodzić do edytora. Zakres: wspólny serwer, zależność i obsługa odpowiedzi uploadu; bez zmian Rafcia i mechanik pozostałych gier. Nie sprawdzano dostępności serwera z internetu.

12 testów przeszło na Node 18.18.0, także po czystym `npm ci --ignore-scripts`; [uruchomienie i limity](RUNBOOK.md#kontrola-uploadu-f01). Status publikacji i ograniczenia w [punkcie wznowienia](SESSION_STATE.md). Pozostałych ustaleń audytu nie uznajemy za naprawione.

## F05 — Niezgodne nazwy archiwów (naprawione lokalnie 2026-11-12)

Zapis tworzył `rafcia-YYYYMMDDHHmmss-losowy.json`, a lista i odczyt wymagały `rafcia-YYYYMMDD-HHmmss-losowy.json`. Wspólny wzorzec odczytu akceptuje teraz oba formaty. Nie zmieniono zapisu ani nazw istniejących plików. Test HTTP zapis → lista → odtworzenie potwierdza zachowanie historii gry i aktualnego PIN-u; dodatkowo sprawdzono oba formaty, odrzucanie obcych ścieżek i wymóg sesji rodzica. [Uruchomienie testów](RUNBOOK.md#kontrola-archiwów-f05). Ta naprawa nie obejmuje odporności zapisu na awarie ani walidacji zawartości importu (F06/F07).
