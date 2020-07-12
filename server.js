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
}, 200000);


//var logger = require('logger').createLogger(); // logs to STDOUT
var logger = require("logger").createLogger("suggestions.log"); // logs to a file

//custom date for logging
let options = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Kolkata",
  timeZoneName: "short"
};
logger.format = function(level, date, message) {
  return [
    level,
    " [",
    new Date().toLocaleString("en-IN", options),
    "] ",
    message
  ].join("");
};

const Telegraf = require("telegraf");
const { Extra, Markup } = Telegraf;
const session = require("telegraf/session");
var remaining;

// Bot creation
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

bot.help(ctx => {
  logger.info(ctx.message.chat.first_name+ ": /help")
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `<b>Welcome to BookCrushClub Suggestions.</b> 

We are collecting suggestions for the Book of the Month event in the specified genre.
This month's Genre: <b>Thriller</b>

Suggestion Format:

<b>Book name
Author
Subgenre(s)</b>

You can suggest one book a month. Send /reset to discard your suggestion and submit fresh one.

Thank you,
<i>BookCrush Team</i>

<i>P.S: Visit bit.ly/BCCBot if the bot is down.</i>
`,
    { parse_mode: "HTML" }
  );
});

bot.start(ctx => {
  logger.info(ctx.message.chat.first_name+ ": /start")
  //remaining = 2
  ctx.session.remaining = 1; //remaining
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `<b>Welcome to BookCrushClub Suggestions.</b> 

We are collecting suggestions for the Book of the Month event in the specified genre.
This month's Genre: <b>Thriller</b>

Suggestion Format:

<b>Book name
Author
Subgenre(s)</b>

You can suggest one book a month. Send /reset to discard your suggestion and submit fresh one.

Thank you,
<i>BookCrush Team</i>

<i>P.S: Visit bit.ly/BCCBot if the bot is down.</i>
`,
    { parse_mode: "HTML" }
  );
});

bot.command("/reset", ctx => {
  //remaining = 2;
  ctx.session.remaining = 1;
  ctx.reply("Limit has been reset. Please send your suggestion again.")
  logger.info(ctx.message.chat.first_name+ ": /reset")
});

+
  
//do this every month to reset it back to 2
//remaining = 2
        
bot.on("text", ctx => {
  //remaining--
  ctx.session.remaining--;
  if (ctx.session.remaining == -1) {
    logger.info(ctx.message.chat.first_name + " has exceeded the limit");
    return ctx.telegram.sendMessage(
      ctx.chat.id,
      '<i>ERROR: Sorry, you are only allowed to suggest one book for "Book of the Month". Please try again next month.\nSend /reset to discard your previous suggestion and submit fresh one.</i>',
      { parse_mode: "HTML", reply_to_message_id: `${ctx.message.message_id}` }
    );
  } else if (ctx.session.remaining > -1) {
    ctx.telegram.sendMessage(
      ctx.chat.id,
      `Your suggestion:

<i>${ctx.message.text}</i>
`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Confirm", callback_data: "confirm" },
              { text: "🔴 Cancel", callback_data: "cancel" }
            ]
          ]
        },
        reply_to_message_id: `${ctx.message.message_id}`
      }
    );
    logger.info(ctx.message.chat.first_name + ": " + ctx.message.text);
  } else {
    logger.info(ctx.message.chat.first_name + " has exceeded the limit");
    return ctx.telegram.sendMessage(
      ctx.chat.id,
      '<i>ERROR: Sorry, you are only allowed to suggest one book for "Book of the Month". Please try again next month.\nSend /reset to discard your previous suggestion and submit fresh one.</i>',
      { parse_mode: "HTML", reply_to_message_id: `${ctx.message.message_id}` }
    );
  }
});

bot.action("confirm", ctx => {
  ctx.answerCbQuery("✅ Submitted successfully");
  //ctx.session.remaining--
  ctx.editMessageText(`Thank you for your participation! 
`);
  logger.info("last submission was confirmed");
});

bot.action("cancel", ctx => {
  ctx.answerCbQuery("🔴 Cancelled submission");
  ctx.session.remaining++;
  //remaining++;
  ctx.editMessageText(`Cancelled the submission. Please resend the updated one again.
`);
  logger.info("last submission was cancelled");
});

bot.startPolling();
