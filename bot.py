import logging
import random
import requests
import os
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters

# ======================
# ᴹᴿ•ᴀʟᴇx-MD BOT CONFIG
# ======================

TOKEN = os.getenv("BOT_TOKEN")  # Render safe method

logging.basicConfig(level=logging.INFO)

MENU = """
╔═══════════════════════
 ✦ ᴹᴿ•ᴀʟᴇx-MD ✦
╚═══════════════════════

⚡ Commands:
.start
.menu
.ping
.meme
.joke
.quiz
.getpp

━━━━━━━━━━━━━━━━━━━━━━━
"""

# store media
user_media = {}

# ---------------- COMMANDS ----------------

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("👑 ᴹᴿ•ᴀʟᴇx-MD is online ⚡")

async def menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(MENU)

async def ping(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("⚡ Pong! Bot is active")

async def joke(update: Update, context: ContextTypes.DEFAULT_TYPE):
    jokes = [
        "😂 My code works… I just don’t know why.",
        "😂 WiFi stronger than my motivation.",
        "😂 Debugging is like detective work."
    ]
    await update.message.reply_text(random.choice(jokes))

async def meme(update: Update, context: ContextTypes.DEFAULT_TYPE):
    data = requests.get("https://meme-api.com/gimme").json()
    await update.message.reply_photo(data["url"], caption="🤣 ᴹᴿ•ᴀʟᴇx-MD Meme")

async def quiz(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🧠 What is 2 + 2?")

# ---------------- MEDIA SAVE ----------------

async def save_media(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id

    if update.message.photo:
        file_id = update.message.photo[-1].file_id

        if user_id not in user_media:
            user_media[user_id] = []

        user_media[user_id].append(file_id)
        await update.message.reply_text("📥 Media saved to ᴹᴿ•ᴀʟᴇx-MD vault")

# ---------------- GETPP ----------------

async def getpp(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id

    if user_id not in user_media or len(user_media[user_id]) == 0:
        await update.message.reply_text("❌ No saved media found")
        return

    await update.message.reply_photo(
        user_media[user_id][-1],
        caption="👁️ ᴹᴿ•ᴀʟᴇx-MD vault access"
    )

# ---------------- MAIN ----------------

app = ApplicationBuilder().token(TOKEN).build()

app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("menu", menu))
app.add_handler(CommandHandler("ping", ping))
app.add_handler(CommandHandler("joke", joke))
app.add_handler(CommandHandler("meme", meme))
app.add_handler(CommandHandler("quiz", quiz))
app.add_handler(CommandHandler("getpp", getpp))

app.add_handler(MessageHandler(filters.PHOTO, save_media))

print("ᴹᴿ•ᴀʟᴇx-MD running...")
app.run_polling()