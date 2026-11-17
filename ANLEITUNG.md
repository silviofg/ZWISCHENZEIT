# ZWISCHENZEIT veröffentlichen – GitHub + Vercel

Gleicher Ablauf wie bei Capillio:

```
Ordner in VS Code  →  git push  →  GitHub (silviofg/zwischenzeit)  →  Vercel  →  öffentlicher Link
```

Danach geht jede Änderung mit einem `git push` automatisch online.
Kosten: keine. Aufwand beim ersten Mal: ca. 30 Minuten.

---

## 1. Ordner vorbereiten

1. Die ZIP-Datei entpacken nach `C:\Users\silvi\zwischenzeit`.
2. Den Ordner in VS Code öffnen (Datei → Ordner öffnen).

## 2. Rangliste einrichten (Google Sheet)

> Hast du die Rangliste für die Kollegen schon eingerichtet? Dann nur den Code im Apps-Script-Editor durch
> `apps-script/Rangliste.gs` ersetzen und neu bereitstellen: **Bereitstellen → Bereitstellungen verwalten →
> Bearbeiten (Stift) → Version: Neue Version**. Die URL bleibt gleich, weiter mit Schritt 3.

1. Neues Google Sheet erstellen (**sheets.new**) mit einem **privaten** Google-Konto.
2. **Erweiterungen → Apps Script**, vorhandenen Code löschen, Inhalt von `apps-script/Rangliste.gs` einfügen, speichern.
3. **Bereitstellen → Neue Bereitstellung** → Zahnrad bei „Typ auswählen“ → **Web-App**
   - Ausführen als: **Ich**
   - Zugriff: **Jeder**
4. Berechtigungen bestätigen. Bei „Google hat diese App nicht überprüft“: **Erweitert → Weiter zu … (unsicher)**.
5. Die **Web-App-URL** (endet auf `/exec`) kopieren.
   Test: URL im Browser öffnen, es erscheint `{"ok":true,"top":[],"total":0}`.

Die öffentliche Version des Skripts schützt die Rangliste: Namensfilter, Plausibilitätsprüfung der Punkte
und höchstens ein Eintrag pro Name alle 30 Sekunden. Einzelne Namen sperrst du im Tabellenblatt **Gesperrt**
(ein Name pro Zeile, wird beim ersten Aufruf automatisch angelegt).

## 3. Zwei Dateien anpassen

- **`config.js`**: Die Web-App-URL einsetzen:
  `window.RANGLISTE_URL = 'https://script.google.com/macros/s/…/exec';`
- **`datenschutz.html`**: Die zwei gelb markierten Platzhalter `[Vorname Nachname]` und `[E-Mail-Adresse]` ersetzen.
  Für eine öffentliche Seite mit Rangliste braucht es eine Kontaktmöglichkeit.

## 4. GitHub-Repository anlegen und hochladen

1. Auf **github.com** → **New repository**
   - Name: `zwischenzeit`
   - Sichtbarkeit: **Private** (wie Capillio) oder **Public**, falls der Code sichtbar sein darf.
     Vercel funktioniert mit beiden.
   - **Wichtig:** Kein README, keine .gitignore und keine Lizenz anhaken.
     Sonst kommt beim ersten Push der Fehler „fetch first“ wie damals bei Capillio.
2. Im Terminal von VS Code:

```bash
cd C:\Users\silvi\zwischenzeit
git init
git branch -M main
git add .
git commit -m "ZWISCHENZEIT: erste öffentliche Version"
git remote add origin https://github.com/silviofg/zwischenzeit.git
git push -u origin main
```

## 5. Mit Vercel veröffentlichen

1. **vercel.com** → einloggen (mit GitHub).
2. **Add New… → Project** → Repository `silviofg/zwischenzeit` → **Import**.
3. Einstellungen:
   - Framework Preset: **Other**
   - Build Command und Output Directory: **leer lassen** (das Spiel braucht keinen Build-Schritt)
   - Keine Environment Variables nötig
4. **Deploy**. Nach kurzer Zeit erhältst du die URL, im Idealfall `https://zwischenzeit.vercel.app`.

**Andere URL erhalten?** (z. B. wenn `zwischenzeit` schon vergeben ist) Dann in VS Code mit **Ctrl+Shift+H**
`zwischenzeit.vercel.app` durch deine Adresse ersetzen. Betrifft `index.html`, `robots.txt`, `sitemap.xml`
und `README.md`. Danach committen und pushen (siehe Schritt 7).

## 6. Bei Google auffindbar machen

Google findet neue Seiten von selbst, das kann aber Wochen dauern. Schneller geht es so:

1. **search.google.com/search-console** öffnen → **Property hinzufügen** → **URL-Präfix** → deine Vercel-URL.
2. Bestätigungsmethode **HTML-Tag** wählen und den angezeigten `<meta name="google-site-verification" …>`-Tag
   kopieren.
3. In `index.html` direkt unter der `<title>`-Zeile einfügen, committen und pushen.
   Warten, bis Vercel die neue Version zeigt (ca. 1 Minute), dann in der Search Console **Bestätigen**.
4. Links **Sitemaps** → `sitemap.xml` eingeben → **Senden**.
5. Oben in der Suchleiste die Startseite eingeben → **Indexierung beantragen**.

Realistische Erwartung: Unter dem Wort „Zwischenzeit“ allein konkurrierst du mit Skirennen und Sportzeitmessung.
Gut gefunden wirst du mit Suchen wie „Zwischenzeit Verkehrsspiel“ oder „Ampel Spiel Kreuzung“.
Jeder Link von anderen Seiten (z. B. LinkedIn-Beitrag, Firmen-Intranet) hilft zusätzlich.

## 7. Änderungen veröffentlichen

```bash
git add .
git commit -m "Kurze Beschreibung der Änderung"
git push
```

Vercel veröffentlicht automatisch. Bei Änderungen am Spiel zusätzlich in `sw.js` die Versionsnummer erhöhen
(`zwischenzeit-v7` → `v8`), damit installierte Apps die neue Version laden.

## Gut zu wissen

- **Rangliste pflegen:** Einträge direkt im Google Sheet löschen oder korrigieren.
  Die Sicherungen machen Fälschungen schwerer, aber nicht unmöglich.
- **Link-Vorschau:** Beim Teilen in WhatsApp, Teams oder LinkedIn erscheint automatisch das Vorschaubild `og-image.png`.
- **Vercel Hobby** (kostenlos) ist für private, nicht kommerzielle Projekte gedacht. Das passt für dieses Spiel.
- `apps-script/`, `README.md` und `ANLEITUNG.md` liegen nur im Repository und werden nicht veröffentlicht (`.vercelignore`).
