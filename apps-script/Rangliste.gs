/**
 * ZWISCHENZEIT – Online-Rangliste (öffentliche Version)
 *
 * Einrichten: Google Sheet > Erweiterungen > Apps Script, Code einfügen,
 * Bereitstellen > Neue Bereitstellung > Web-App (Ausführen als: Ich, Zugriff: Jeder).
 *
 * Schutz gegen Missbrauch:
 *  - Namensfilter (Liste SPERRWOERTER unten, beliebig erweiterbar)
 *  - Plausibilitätsprüfung der Punkte im Verhältnis zum Level
 *  - Pro Name höchstens ein Eintrag alle 30 Sekunden (ein Spiel dauert länger)
 *  - Gesperrte Namen: Tabellenblatt "Gesperrt", ein Name pro Zeile in Spalte A
 * Einträge löschen oder korrigieren: direkt im Tabellenblatt "Rangliste".
 */

const BLATT = 'Rangliste';
const BLATT_GESPERRT = 'Gesperrt';
const SPERRFRIST_S = 30;

// Teilwörter, die in Namen nicht vorkommen dürfen (Kleinschreibung, ohne Leerzeichen)
const SPERRWOERTER = [
  'arsch', 'fick', 'fotze', 'hure', 'nutte', 'schlampe', 'wichser', 'missgeburt', 'spast', 'behindert',
  'schwuchtel', 'neger', 'nazi', 'hitler', 'heil', 'kanake', 'fuck', 'shit', 'bitch', 'cunt', 'dick',
  'pussy', 'fack', 'fck', 'nigg', 'fag', 'slut', 'whore', 'porn', 'sex', 'penis', 'vagina', 'idiot', 'admin'
];

function blatt_(name, kopf) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (kopf) { sh.appendRow(kopf); sh.setFrozenRows(1); }
  }
  return sh;
}

function rangliste_() { return blatt_(BLATT, ['Zeitpunkt', 'Name', 'Punkte', 'Level']); }

// Name vereinheitlichen und Ziffern-Tricks (z. B. 4 statt A) auflösen
function normal_(name) {
  return name.toLowerCase().replace(/[\s.\-]/g, '')
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't')
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');
}

function nameErlaubt_(name) {
  const n = normal_(name);
  for (let i = 0; i < SPERRWOERTER.length; i++) if (n.indexOf(SPERRWOERTER[i]) >= 0) return false;
  const gesperrt = blatt_(BLATT_GESPERRT, ['Gesperrter Name']).getDataRange().getValues().slice(1);
  for (let i = 0; i < gesperrt.length; i++) if (String(gesperrt[i][0]).trim().toUpperCase() === name) return false;
  return true;
}

// Grobe Obergrenze: höchstens 150 Punkte pro erreichtem Level plus Reserve
function plausibel_(punkte, level) { return punkte <= level * 150 + 50; }

function beste_() {
  const werte = rangliste_().getDataRange().getValues().slice(1);
  const best = {};
  werte.forEach(function (z) {
    const name = String(z[1] || '').trim();
    const punkte = Number(z[2]), level = Number(z[3]);
    if (!name || !isFinite(punkte)) return;
    if (!best[name] || punkte > best[name].score) best[name] = { name: name, score: punkte, level: level || 1 };
  });
  return Object.keys(best).map(function (k) { return best[k]; })
    .sort(function (a, b) { return b.score - a.score; });
}

function antwort_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const alle = beste_();
  return antwort_({ ok: true, top: alle.slice(0, 10), total: alle.length });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const name = String(d.name || '').toUpperCase().replace(/[^A-Z0-9ÄÖÜ .\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 12);
    const punkte = Math.floor(Number(d.score));
    const level = Math.floor(Number(d.level));
    if (!name || !(punkte > 0 && punkte <= 100000) || !(level >= 1 && level <= 99)) return antwort_({ ok: false, error: 'ungueltig' });
    if (!nameErlaubt_(name)) return antwort_({ ok: false, error: 'name' });
    if (!plausibel_(punkte, level)) return antwort_({ ok: false, error: 'unplausibel' });

    const cache = CacheService.getScriptCache();
    const key = 'z_' + Utilities.base64EncodeWebSafe(name);
    if (cache.get(key)) return antwort_({ ok: false, error: 'zu_schnell' });
    cache.put(key, '1', SPERRFRIST_S);

    rangliste_().appendRow([new Date(), name, punkte, level]);
    const alle = beste_();
    let rang = 0;
    for (let i = 0; i < alle.length; i++) if (alle[i].name === name) { rang = i + 1; break; }
    return antwort_({ ok: true, top: alle.slice(0, 10), rank: rang, total: alle.length });
  } finally {
    lock.releaseLock();
  }
}
