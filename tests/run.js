// node test runner: `node tests/run.js`
const tests = [];
global.test = function (name, fn) { tests.push({ name: name, fn: fn }); };

require("./attacks.test.js");
require("./mutations.test.js");
require("./judge.test.js");
require("./hardening.test.js");
require("./extended.test.js");

var pass = 0, fail = 0;
for (var i = 0; i < tests.length; i++) {
  try {
    tests[i].fn();
    pass++;
    console.log("ok   " + tests[i].name);
  } catch (e) {
    fail++;
    console.log("FAIL " + tests[i].name);
    console.log("     " + (e && e.message ? e.message.split("\n").join("\n     ") : e));
  }
}
console.log("\n" + pass + " passed, " + fail + " failed, " + tests.length + " total");
process.exit(fail ? 1 : 0);
