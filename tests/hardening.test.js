var assert = require("assert");
var A = require("../assets/attacks.js");
var H = require("../assets/hardening.js");

test("every attack category has hardening advice", function () {
  A.CATEGORIES.forEach(function (c) {
    var adv = H.adviceFor(c.id);
    assert.ok(adv, "no advice for " + c.id);
    assert.ok(adv.title && adv.title.length > 5, c.id + ": empty title");
    assert.ok(Array.isArray(adv.tips) && adv.tips.length >= 3, c.id + ": fewer than 3 tips");
    adv.tips.forEach(function (t) {
      assert.ok(typeof t === "string" && t.length > 20, c.id + ": thin tip");
    });
  });
});

test("advice tips are concrete, not filler", function () {
  A.CATEGORIES.forEach(function (c) {
    H.adviceFor(c.id).tips.forEach(function (t) {
      assert.ok(!/^lorem/i.test(t), c.id + ": placeholder tip");
    });
  });
});

test("unknown category falls back to generic advice", function () {
  var adv = H.adviceFor("nope");
  assert.ok(adv.title === "General hardening");
});

test("buildHardenPrompt assembles a complete meta-prompt", function () {
  var out = H.buildHardenPrompt("You are a bot.", [
    { attackName: "Ignore and obey", category: "override", detail: "marker-hit" }
  ]);
  assert.ok(out.indexOf("You are a bot.") !== -1, "must include the original prompt");
  assert.ok(out.indexOf("Ignore and obey") !== -1, "must name the failure");
  assert.ok(out.indexOf("override") !== -1, "must include the category");
  assert.ok(out.indexOf("SYSTEM PROMPT") !== -1 || out.indexOf("prompt") !== -1);
});
