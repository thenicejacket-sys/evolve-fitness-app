/**
 * Evolve — Export bilan vers Google Sheets.
 * Reçoit le bilan de l'app (POST JSON) et crée un Google Sheet dans le Drive
 * du compte qui a déployé ce script. Renvoie {ok:true, url}.
 *
 * Déploiement : voir README.md dans ce dossier.
 * Sécurité : script déployé « Tout le monde » — mets un TOKEN non vide et configure
 * l'app avec l'URL .../exec?token=TON_TOKEN pour bloquer les inconnus.
 */

var TOKEN = "";                    // optionnel — si non vide, exige ?token=... dans l'URL
var FOLDER_NAME = "Evolve Bilans"; // dossier de rangement (créé à la racine du Drive si absent)

function doPost(e) {
  try {
    if (TOKEN && (!e || !e.parameter || e.parameter.token !== TOKEN)) {
      return _json({ ok: false, error: "unauthorized" });
    }
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.create(String(data.name || "Evolve bilan"));
    var sheets = data.sheets || [];
    for (var i = 0; i < sheets.length; i++) {
      var sh = sheets[i];
      var s = (i === 0) ? ss.getSheets()[0].setName(sh.name) : ss.insertSheet(sh.name);
      var rows = sh.rows || [];
      if (rows.length) {
        var w = 0;
        for (var r = 0; r < rows.length; r++) if (rows[r].length > w) w = rows[r].length;
        var norm = rows.map(function (row) {
          var a = row.slice();
          while (a.length < w) a.push("");
          return a;
        });
        s.getRange(1, 1, norm.length, w).setValues(norm);
        s.setFrozenRows(1);
      }
    }
    var it = DriveApp.getFoldersByName(FOLDER_NAME);
    var folder = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
    DriveApp.getFileById(ss.getId()).moveTo(folder);
    return _json({ ok: true, url: ss.getUrl() });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function _json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
