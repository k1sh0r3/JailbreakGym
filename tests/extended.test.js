var assert = require("assert");
var E = require("../assets/extended.js");
var A = require("../assets/attacks.js");

test("extended pack has two datasets with verified permissive licenses", function () {
  assert.strictEqual(E.DATASETS.length, 2);
  var byName = {};
  E.DATASETS.forEach(function (d) {
    byName[d.name] = d;
    assert.ok(d.url, "missing url for " + d.name);
    assert.ok(d.note && d.note.length > 10, "missing note for " + d.name);
  });
  assert.strictEqual(byName["garak (NVIDIA)"].license, "Apache-2.0");
  assert.strictEqual(byName["promptfoo"].license, "MIT");
});

test("extended pack adds 13 cases (10 garak + 3 promptfoo)", function () {
  assert.strictEqual(E.ATTACKS.length, 13);
  assert.strictEqual(E.DATASETS[0].count, 10);
  assert.strictEqual(E.DATASETS[1].count, 3);
});

test("extended ids are unique and never collide with the curated set", function () {
  var curated = {};
  A.ATTACKS.forEach(function (a) { curated[a.id] = true; });
  var seen = {};
  E.ATTACKS.forEach(function (a) {
    assert.ok(!seen[a.id], "duplicate extended id: " + a.id);
    assert.ok(!curated[a.id], "collision with curated id: " + a.id);
    seen[a.id] = true;
  });
});

test("every extended attack carries source + license attribution", function () {
  E.ATTACKS.forEach(function (a) {
    assert.ok(a.source && a.source.dataset, a.id + ": missing source.dataset");
    assert.ok(a.source.license, a.id + ": missing source.license");
    assert.ok(a.source.url, a.id + ": missing source.url");
  });
});

test("marker-less attacks are flagged for refusal/leak-only judging", function () {
  var flagged = E.ATTACKS.filter(function (a) { return a.derivedMarkers === false; });
  assert.ok(flagged.length >= 3, "expected at least 3 marker-less prompts, got " + flagged.length);
  flagged.forEach(function (a) {
    assert.deepStrictEqual(a.successMarkers, [], a.id + ": marker-less attack must have empty markers");
  });
});

test("garak hijack prompts use a neutral canary, not hostile rogue strings", function () {
  var hijack = E.ATTACKS.filter(function (a) {
    return /^garak-0[1-5]$/.test(a.id);
  });
  assert.strictEqual(hijack.length, 5);
  hijack.forEach(function (a) {
    assert.ok(a.payload.indexOf("JG-CANARY-9X4Q") !== -1, a.id + ": missing neutral canary");
    assert.ok(a.payload.toLowerCase().indexOf("i hate humans") === -1, a.id + ": hostile rogue string leaked in");
    assert.ok(a.successMarkers.indexOf("JG-CANARY-9X4Q") !== -1, a.id + ": canary must be a success marker");
  });
});

test("garak prompts map to sensible categories", function () {
  var catIds = A.CATEGORIES.map(function (c) { return c.id; });
  E.ATTACKS.forEach(function (a) {
    assert.ok(catIds.indexOf(a.category) !== -1, a.id + ": bad category " + a.category);
  });
});
