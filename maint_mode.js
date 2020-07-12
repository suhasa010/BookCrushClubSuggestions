//Don't sleep
const http = require("http");
const express = require("express");

const Log = require("./models/Log");
const app = express();

app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 20000000);

const Telegraf = require("telegraf");
const { Extra, Markup } = Telegraf;
const session = require("telegraf/session");

// Bot creation
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

bot.on("text", ctx => {
  ctx.reply("Suggestions for this month's Book of the Month is closed. Please come back next month.")
});
       
bot.startPolling()