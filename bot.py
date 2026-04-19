import os
import logging
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters
from ai import ai_reply

TOKEN = os.getenv("BOT_TOKEN")

logging.basicConfig(level=logging.INFO)

MENU = """
╔═══════════════════════
 ✦ ᴹᴿ•ᴀʟᴇx-MD PRO AI ✦
╚═══════════════════════

Commands:
.start
.menu
.ping
.ai <text>
.stats

━━━━━━━━━━━━━━━━━━━━━━━
"""

# START
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("👑 ᴹᴿ•ᴀʟᴇx-MD PRO AI ONLINE ⚡")

# MENU
async def menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(MENU)

# PING
async def ping(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("⚡ ᴹᴿ•ᴀʟᴇx-MD is alive")

# AI COMMAND
async def ai(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args)

    if not text:
        await update.message.reply_text("Usage: .ai hello")
        return

    reply = ai_reply(text)
    await update.message.reply_text(f"🧠 AI: {reply}")

# STATS
async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat = update.message.chat
    await update.message.reply_text(
        f"📊 Group Info:\nName: {chat.title}\nID: {chat.id}"
    )

# AUTO REPLY
async def auto_reply(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.lower()

    if "hello" in text:
        await update.message.reply_text("👋 Hello from ᴹᴿ•ᴀʟᴇx-MD")
    elif "hi" in text:
        await update.message.reply_text("⚡ Hi!")

# APP SETUP
app = ApplicationBuilder().token(TOKEN).build()

app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("menu", menu))
app.add_handler(CommandHandler("ping", ping))
app.add_handler(CommandHandler("ai", ai))
app.add_handler(CommandHandler("stats", stats))

app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, auto_reply))

print("ᴹᴿ•ᴀʟᴇx-MD RUNNING...")
app.run_polling()