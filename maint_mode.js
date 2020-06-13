
const Telegraf = require("telegraf");
const { Extra, Markup } = Telegraf;
const session = require("telegraf/session");

// Bot creation
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

bot.on("text", ctx => {
  ctx.reply("Bot taken down for maintenance! Please try again in 10 minutes. Thanks for the cooperation.")
});
       
bot.startPolling()