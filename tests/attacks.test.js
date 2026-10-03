var assert = require("assert");
var A = require("../assets/attacks.js");

test("attack library has 36 base attacks", function () {
  assert.strictEqual(A.ATTACKS.length, 36, "expected 36, got " + A.ATTACKS.length);
});

test("six categories, six attacks each", function () {
  assert.strictEqual(A.CATEGORIES.length, 6);
  A.CATEGORIES.forEach(function (c) {
    var n = A.byCategory(c.id).length;
    assert.strictEqual(n, 6, "category " + c.id + " has " + n + ", expected 6");
  });
});

test("attack ids are unique", function () {
  var seen = {};
  A.ATTACKS.forEach(function (a) {
    assert.ok(!seen[a.id], "duplicate id: " + a.id);
    seen[a.id] = true;
  });
});

test("every attack has a complete schema", function () {
  var catIds = A.CATEGORIES.map(function (c) { return c.id; });
  A.ATTACKS.forEach(function (a) {
    assert.ok(a.id && typeof a.id === "string", "missing id");
    assert.ok(catIds.indexOf(a.category) !== -1, a.id + ": bad category " + a.category);
    assert.ok(a.name && a.name.length > 3, a.id + ": bad name");
    assert.ok(a.description && a.description.length > 10, a.id + ": bad description");
    assert.ok(
      typeof a.payload === "string" || (Array.isArray(a.payload) && a.payload.length >= 2),
      a.id + ": payload must be a string or a 2+ message array"
    );
    assert.ok(Array.isArray(a.successMarkers), a.id + ": successMarkers must be an array");
    if (Array.isArray(a.payload)) {
      a.payload.forEach(function (m) { assert.strictEqual(typeof m, "string", a.id + ": turn not a string"); });
    }
  });
});

test("no duplicate payloads among single-turn attacks", function () {
  var seen = {};
  A.ATTACKS.forEach(function (a) {
    if (typeof a.payload !== "string") return;
    assert.ok(!seen[a.payload], "duplicate payload in " + a.id);
    seen[a.payload] = true;
  });
});

test("payloads never contain a literal secret-looking key", function () {
  // {{SECRET}} is the only allowed token; payloads must not embed a real secret.
  A.ATTACKS.forEach(function (a) {
    var texts = Array.isArray(a.payload) ? a.payload : [a.payload];
    texts.forEach(function (t) {
      assert.ok(!/sk-[A-Za-z0-9-]{6,}/.test(t), a.id + ": payload embeds a literal secret-like key");
    });
  });
});

test("multi-turn attacks exist and are well-formed", function () {
  var mt = A.byCategory("multiturn");
  assert.ok(mt.length > 0);
  mt.forEach(function (a) {
    assert.ok(Array.isArray(a.payload) && a.payload.length >= 2, a.id + " should be multi-turn");
  });
});
