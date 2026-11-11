#!/usr/bin/env node
// Lokalna procedura odzyskania dostępu. Uruchamiaj przy zatrzymanym serwerze.
const fs = require("fs");
const path = require("path");
const net = require("net");
const { parentPinError, hashParentPin } = require("../utils/parentPin");

const root = path.join(__dirname, "..");
const dataPath = path.join(root, "punktacja-data.json");

function serverIsRunning() {
  return new Promise(resolve => {
    const socket = net.connect({ host: "127.0.0.1", port: 3000 });
    socket.setTimeout(500);
    socket.once("connect", () => { socket.destroy(); resolve(true); });
    socket.once("error", () => resolve(false));
    socket.once("timeout", () => { socket.destroy(); resolve(false); });
  });
}

function readSecret(label) {
  if (!process.stdin.isTTY) throw new Error("Uruchom to polecenie w terminalu interaktywnym.");
  process.stdout.write(label);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = (error) => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      error ? reject(error) : resolve(value);
    };
    const onData = chunk => {
      for (const ch of chunk) {
        if (ch === "\u0003") return finish(new Error("Anulowano."));
        if (ch === "\r" || ch === "\n") return finish();
        if (ch === "\u007f" || ch === "\b") {
          if (value.length) { value = value.slice(0, -1); process.stdout.write("\b \b"); }
        } else if (/^\d$/.test(ch) && value.length < 12) {
          value += ch;
          process.stdout.write("*");
        }
      }
    };
    process.stdin.on("data", onData);
  });
}

async function main() {
  if (await serverIsRunning()) throw new Error("Najpierw zatrzymaj serwer Rafcia na porcie 3000.");
  if (!fs.existsSync(dataPath)) throw new Error("Brak lokalnych danych Rafcia. Ustaw PIN przy pierwszym uruchomieniu aplikacji.");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Nieprawidłowy plik danych Rafcia.");
  const pin = await readSecret("Nowy PIN rodzica (6–12 cyfr): ");
  const error = parentPinError(pin);
  if (error) throw new Error(error);
  const confirm = await readSecret("Powtórz nowy PIN: ");
  if (pin !== confirm) throw new Error("Wpisane PIN-y nie są identyczne.");

  const archiveDir = path.join(root, "punktacja-archive");
  fs.mkdirSync(archiveDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(archiveDir, `pin-reset-backup-${stamp}.json`);
  fs.copyFileSync(dataPath, backupPath, fs.constants.COPYFILE_EXCL);
  fs.chmodSync(backupPath, 0o600);
  data.parentPin = hashParentPin(pin);
  data.pinSet = true;
  const tempPath = path.join(archiveDir, `pin-reset-temp-${process.pid}.json`);
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), { mode: 0o600 });
    fs.renameSync(tempPath, dataPath);
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
  process.stdout.write("PIN zmieniony. Dane gry zostały zachowane. Uruchom ponownie Rafcia.\n");
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
