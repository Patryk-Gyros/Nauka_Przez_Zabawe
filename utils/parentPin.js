const crypto = require("crypto");

function parentPinError(pin) {
  if (!/^\d{6,12}$/.test(pin)) return "PIN powinien zawierać od 6 do 12 cyfr.";
  if (/^(\d)\1+$/.test(pin) || "01234567890123456789".includes(pin) || "98765432109876543210".includes(pin)) {
    return "Wybierz mniej oczywisty PIN — bez powtórzeń i prostych ciągów cyfr.";
  }
  return "";
}

function hashParentPin(pin) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `scrypt:${salt}:${crypto.scryptSync(pin, salt, 32).toString("hex")}`;
}

function verifyParentPin(pin, stored) {
  if (!stored) return false;
  if (!stored.startsWith("scrypt:")) return pin === stored; // zgodność ze starszym zapisem
  const parts = stored.split(":");
  if (parts.length !== 3 || !/^[0-9a-f]{32}$/.test(parts[1]) || !/^[0-9a-f]{64}$/.test(parts[2])) return false;
  const expected = Buffer.from(parts[2], "hex");
  const actual = crypto.scryptSync(pin, parts[1], expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

module.exports = { parentPinError, hashParentPin, verifyParentPin };
