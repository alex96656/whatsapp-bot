import fs from "fs";
import path from "path";

const baseDir = path.resolve("./database");
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const premiumFile = path.join(baseDir, "premium.json");
if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, "[]");

// --- Lire la liste premium ---
function readPremium() {
  try {
    return JSON.parse(fs.readFileSync(premiumFile, "utf-8"));
  } catch {
    return [];
  }
}

// --- Vérifie si un numéro est Premium ---
export function isPremium(number) {
  const clean = number.replace(/[^0-9]/g, "");
  const data = readPremium();
  return data.includes(clean);
}

// --- Ajouter un utilisateur Premium ---
export function addPremium(number) {
  const clean = number.replace(/[^0-9]/g, "");
  const data = readPremium();
  if (!data.includes(clean)) {
    data.push(clean);
    fs.writeFileSync(premiumFile, JSON.stringify(data, null, 2));
    console.log(`[PREMIUM] ✅ Ajouté : ${clean}`);
    return true;
  }
  return false;
}

// --- Supprimer un utilisateur Premium ---
export function delPremium(number) {
  const clean = number.replace(/[^0-9]/g, "");
  const data = readPremium();
  const newData = data.filter(n => n !== clean);
  fs.writeFileSync(premiumFile, JSON.stringify(newData, null, 2));
  console.log(`[PREMIUM] ❌ Supprimé : ${clean}`);
  return data.length !== newData.length;
}

// --- Obtenir tous les Premium ---
export function getAllPremium() {
  return readPremium();
}