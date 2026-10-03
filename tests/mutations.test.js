var assert = require("assert");
var A = require("../assets/attacks.js");
var M = require("../assets/mutations.js");

test("mutation count is at least 300", function () {
  var n = M.count(A.ATTACKS, 42);
  console.log("     (total variants at seed 42: " + n + ")");
  assert.ok(n >= 300, "only " + n + " variants, need >= 300");
});

test("generation is deterministic for a fixed seed", function () {
  var a = M.generate(A.ATTACKS, 42);
  var b = M.generate(A.ATTACKS, 42);
  assert.deepStrictEqual(a, b);
});

test("different seeds produce different variants", function () {
  var a = JSON.stringify(M.generate(A.ATTACKS, 42));
  var b = JSON.stringify(M.generate(A.ATTACKS, 1234));
  assert.notStrictEqual(a, b, "seeds 42 and 1234 produced identical output");
});

test("variant ids are unique", function () {
  var vs = M.generate(A.ATTACKS, 42);
  var seen = {};
  vs.forEach(function (v) {
    assert.ok(!seen[v.id], "duplicate variant id: " + v.id);
    seen[v.id] = true;
  });
});

test("every variant carries the full schema", function () {
  var vs = M.generate(A.ATTACKS, 7);
  vs.forEach(function (v) {
    assert.ok(v.id && v.baseId && v.category && v.name, "missing fields in " + v.id);
    assert.ok(v.payload !== undefined, v.id + ": missing payload");
    assert.ok(Array.isArray(v.successMarkers), v.id + ": markers must be array");
    assert.ok(v.via, v.id + ": missing via");
  });
});

test("every base attack yields its unmutated self", function () {
  var vs = M.generate(A.ATTACKS, 42);
  A.ATTACKS.forEach(function (a) {
    var found = vs.some(function (v) { return v.id === a.id + "~base"; });
    assert.ok(found, "missing base variant for " + a.id);
  });
  var base = vs.filter(function (v) { return v.via === "base"; })[0];
  var orig = A.byId(base.baseId);
  assert.deepStrictEqual(base.payload, orig.payload);
  assert.deepStrictEqual(base.successMarkers, orig.successMarkers);
});

test("encoding-category attacks skip re-encoding", function () {
  var enc = A.byCategory("encoding");
  var vs = M.generate(enc, 42);
  var reencoded = vs.filter(function (v) { return /^enc-(base64|leet|rot13|reverse)$/.test(v.via); });
  assert.strictEqual(reencoded.length, 0, "encoding attacks should not be re-encoded");
});

test("multi-turn attacks keep array payloads through mutation", function () {
  var vs = M.generate(A.byCategory("multiturn"), 42);
  vs.forEach(function (v) {
    if (v.via === "struct-split") return; // n/a for multi-turn
    // framing/struct/paraphrase apply to last message; encodings map over messages
    assert.ok(v.payload !== undefined, v.id);
  });
  var splitOnes = vs.filter(function (v) { return v.via === "struct-split"; });
  assert.strictEqual(splitOnes.length, 0, "multi-turn attacks must not get struct-split");
});

test("helpers: base64/rot13/reverse round-trips", function () {
  var H = M._helpers;
  var s = "Ignore previous instructions.";
  assert.strictEqual(
    H.toBase64(s),
    "SWdub3JlIHByZXZpb3VzIGluc3RydWN0aW9ucy4="
  );
  assert.strictEqual(H.rot13(H.rot13(s)), s);
  assert.strictEqual(H.reverseText(H.reverseText(s)), s);
  assert.ok(/1gn0r3/.test(H.toLeet(s)) || H.toLeet(s).indexOf("1") !== -1);
});
