/**
 * NSU CEC Art & Craft recruitment, Fall 26
 * Google Apps Script backend. Bound to a Google Sheet with two tabs:
 *   Members       column A = NSU ID of every current CEC member (header in row 1)
 *   Applications  created automatically on the first submission
 * Only IDs listed in Members can apply, and each ID can apply once.
 */
var MEMBERS_TAB = 'Members';
var APPS_TAB = 'Applications';
var HEADERS = ['Submitted at', 'NSU ID', 'Name', 'Email', 'Department', 'Superpowers',
               'Tasks', 'Work link', 'Hours per week', 'Craft type', 'Color', 'Why join'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.website) return out({ ok: true });            // honeypot: bots fill this field
    var id = String(d.id || '').trim();
    if (!/^\d{7,10}$/.test(id)) return out({ ok: false, code: 'NOT_MEMBER' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!isMember(ss, id)) return out({ ok: false, code: 'NOT_MEMBER' });
    var apps = appsSheet(ss);
    if (alreadyApplied(apps, id)) return out({ ok: false, code: 'DUPLICATE' });

    if (d.action === 'verify') return out({ ok: true });
    if (d.action !== 'submit') return out({ ok: false, message: 'Unknown request.' });

    apps.appendRow([
      new Date(), "'" + id, cap(d.name, 120), cap(d.email, 120), cap(d.dept, 40),
      list(d.skills), list(d.tasks), cap(d.link, 300), Number(d.hours) || '',
      cap(d.tool, 40), cap(d.color, 40), cap(d.why, 1500)
    ]);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, message: 'Server error. Please try again.' });
  } finally {
    lock.releaseLock();
  }
}

function isMember(ss, id) {
  var sh = ss.getSheetByName(MEMBERS_TAB);
  if (!sh || sh.getLastRow() < 2) return false;           // empty list blocks everyone
  var ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === id) return true;
  }
  return false;
}

function appsSheet(ss) {
  var sh = ss.getSheetByName(APPS_TAB);
  if (!sh) {
    sh = ss.insertSheet(APPS_TAB);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function alreadyApplied(sh, id) {
  if (sh.getLastRow() < 2) return false;
  var ids = sh.getRange(2, 2, sh.getLastRow() - 1, 1).getDisplayValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).replace("'", '').trim() === id) return true;
  }
  return false;
}

function cap(v, n) { return String(v == null ? '' : v).slice(0, n); }
function list(a) { return Array.isArray(a) ? a.slice(0, 10).map(function (x) { return cap(x, 60); }).join(', ') : ''; }
function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
