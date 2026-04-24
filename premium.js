
//premium.js
import fs from "fs";
import path from "path";

const baseDir = path.resolve("./database");
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const premiumFile = path.join(baseDir, "premium.json");
if (!fs.existsSync(premiumFile)) fs.writeFileSync(premiumFile, "[]");

// --- Vérifie si un numéro est Premium ---
export function isPremium(number) {
  try {
    const data = JSON.parse(fs.readFileSync(premiumFile, "utf-8"));
    const clean = number.replace(/[^0-9]/g, "");
    return data.includes(clean);
  } catch (e) {
    console.error("[PREMIUM] Erreur lecture fichier:", e);
    return false;
  }
}

// --- Ajouter un utilisateur Premium ---
export function addPremium(number) {
  try {
    const data = JSON.parse(fs.readFileSync(premiumFile, "utf-8"));
    const clean = number.replace(/[^0-9]/g, "");
    if (!data.includes(clean)) {
      data.push(clean);
      fs.writeFileSync(premiumFile, JSON.stringify(data, null, 2));
      console.log(`[PREMIUM] ✅ Ajouté: ${clean}`);
    }
  } catch (e) {
    console.error("[PREMIUM] Erreur ajout:", e);
  }
}

// --- Supprimer un utilisateur Premium ---
export function delPremium(number) {
  try {
    let data = JSON.parse(fs.readFileSync(premiumFile, "utf-8"));
    const clean = number.replace(/[^0-9]/g, "");
    data = data.filter(n => n !== clean);
    fs.writeFileSync(premiumFile, JSON.stringify(data, null, 2));
    console.log(`[PREMIUM] ❌ Supprimé: ${clean}`);
  } catch (e) {
    console.error("[PREMIUM] Erreur suppression:", e);
  }
}