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
/*
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 240000);
*/

const isOwner = (req, res, next) => {
  const secret = req.query.secret;
  
  if (secret === process.env.SECRET) {
    return next();
  }
  
  return res.status(401).send('you don\'t have permission');
}

app.use('/static', isOwner, express.static(__dirname));

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
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `<b>Welcome to BookCrush Suggestions.</b> 

We are collecting suggestions for the Book of the Month event.

Usage:

<b>Book name
Author
Genre(s)</b>

Thank you,
<i>BookCrush Team</i>
`,
    { parse_mode: "HTML" }
  );
});

bot.start(ctx => {
  //remaining = 2
  ctx.session.remaining = remaining; //remaining
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `<b>Welcome to BookCrushClub Suggestions.</b> 

We are collecting suggestions for the Book of the Month event.

Suggestion Format:

<b>Book name
Author
Genre(s)</b>

Thank you,
<i>BookCrush Team</i>
`,
    { parse_mode: "HTML" }
  );
});

bot.command("/reset", ctx => {
  //remaining = 2;
  ctx.session.remaining = 2;
});

//do this every month to reset it back to 2
//remaining = 2
bot.command("/mreset", ctx => {
  remaining = 2;
  ctx.session.remaining = 2;
});

        
bot.on("text", ctx => {
  remaining--
  ctx.session.remaining--;
  if (ctx.session.remaining == -1) {
    logger.info(ctx.message.chat.first_name + " has exceeded the limit");
    return ctx.telegram.sendMessage(
      ctx.chat.id,
      '<i>ERROR: Sorry, you are only allowed to suggest two books for "Book of the Month". Please try again next month.</i>',
      { parse_mode: "HTML", reply_to_message_id: `${ctx.message.message_id}` }
    );
  } else if (ctx.session.remaining > -1) {
    ctx.telegram.sendMessage(
      ctx.chat.id,
      `Your suggestion:

<i>${ctx.message.text}</i>

(remaining submissions: ${ctx.session.remaining})`,
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
      '<i>ERROR: Sorry, you are only allowed to suggest two books for "Book of the Month". Please try again next month.</i>',
      { parse_mode: "HTML", reply_to_message_id: `${ctx.message.message_id}` }
    );
  }
});

bot.action("confirm", ctx => {
  ctx.answerCbQuery("✅ Submitted successfully");
  ctx.editMessageText(`Thank you for your participation! 

(remaining submissions: ${ctx.session.remaining})`);
  logger.info("last submission was confirmed");
});

bot.action("cancel", ctx => {
  ctx.answerCbQuery("🔴 Cancelled submission");
  ctx.session.remaining++;
  remaining++;
  ctx.editMessageText(`Cancelled the submission. Please resend the updated one again.

(remaining submissions: ${ctx.session.remaining})`);
  logger.info("last submission was cancelled");
});

bot.startPolling();
