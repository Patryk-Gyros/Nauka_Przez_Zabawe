# Wymagania — System Rafcia

Ten dokument rozdziela obecne zachowanie prototypu od celu pierwszej stabilnej wersji. Nie jest deklaracją, że wszystkie kryteria są już spełnione.

## Cel i granice

Rodzic układa plan obowiązków i nagród; dziecko rozumie, co ma dziś zrobić, i widzi postęp. Pierwszy zakres to jedna rodzina na jednej instancji aplikacji. Mapa, Grunwald, gra rowerowa i Koło Fortuny nie wpływają teraz na punkty Rafcia.

## Obecny prototyp

- Jeden ekran `/punktacja/` zawiera widoki rodzica i dziecka.
- Rodzic ustawia PIN, zadania, misje, nagrody i ocenia wykonanie; dziecko widzi postęp, odpowiada na pytanie dnia i prosi o nagrodę.
- Serwer zapisuje dane w `punktacja-data.json`, a archiwa w `punktacja-archive/`. Brak kont, bazy danych i synchronizacji między serwerami.
- Sesje rodzica są w pamięci procesu. Kod zapisuje nowe PIN-y jako skrót scrypt i nie odsyła pola `parentPin` w API. Zachowanie po tej zmianie wymaga jeszcze testu end to end.

## Kryteria pierwszej stabilnej wersji

1. Czysta instalacja uruchamia Rafcia na `/` bez klucza OpenAI. Brak danych tworzy nowy, pusty stan.
2. Rodzic ustawia PIN, wylogowuje się i loguje ponownie. Błędny PIN nie daje dostępu; odpowiedzi API i eksporty nie zawierają poświadczenia.
3. Rodzic dodaje zadanie i nagrodę, uruchamia grę, ocenia dzień. Dziecko widzi aktualny stan i może poprosić o nagrodę; rodzic zatwierdza lub odrzuca prośbę.
4. Restart serwera zachowuje stan gry, ale wymaga ponownego logowania rodzica. Zapis i odtworzenie archiwum nie zmieniają PIN-u.
5. Testy pracują na osobnej kopii danych. `.env`, lokalne dane i archiwa nie trafiają do Git.
6. Błędy są zrozumiałe dla użytkownika. Nie deklarujemy gotowości, dopóki pełna ścieżka rodzic–dziecko nie przejdzie testu w przeglądarce.

## Później, poza bieżącym zakresem

Wydzielenie modułów gier, zasady przyznawania punktów za gry, konta wielu rodzin, baza danych, kopie zapasowe na serwerze i wdrożenie publiczne. Decyzje o tych elementach wymagają osobnego projektu; obecny JSON wystarcza do lokalnego prototypu, ale nie do współdzielonej usługi.
