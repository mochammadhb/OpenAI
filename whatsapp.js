const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@adiwajshing/baileys");
const fs = require("fs");
const util = require("util");
const { ChatGPTUnofficialProxyAPI } = require("fix-esm").require("chatgpt");
const chalk = require("chalk");
const { Configuration, OpenAIApi } = require("openai");
let setting = require("./key.json");

module.exports = whatsapp = async (client, m, chatUpdate, store) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype == "buttonsResponseMessage"
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype == "listResponseMessage"
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.mtype == "templateButtonReplyMessage"
        ? m.message.templateButtonReplyMessage.selectedId
        : m.mtype === "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
    var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const isCmd2 = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = await client.decodeJid(client.user.id);
    const itsMe = m.sender == botNumber ? true : false;
    let text = (q = args.join(" "));
    const arg = budy.trim().substring(budy.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);

    const from = m.chat;
    const reply = m.reply;
    const sender = m.sender;
    const mek = chatUpdate.messages[0];

    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    // Group
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";

    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

    if (isCmd2 && !m.isGroup) {
      console.log(chalk.black(chalk.bgWhite("[ LOGS ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));
    } else if (isCmd2 && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }

    if (isCmd2) {
      switch (command) {
        case "start":
          m.reply(`*🤖 Whatsapp Bot OpenAI (BETA)*
            
*• OpenAI*
- Command: ${prefix}ai 
  Please ask anything to AI

*• ChatGpt*
- Command: ${prefix}gpt
  Please ask anything to ChatGpt

*• DALL-E*
- Command: ${prefix}img
  Generate an image from text


*• Help Center*
- Command: ${prefix}help`)
          break;
        case "ai": case "openai": 
          try {
            reply("⏳ please wait don't spam chat");
            if (setting.keyopenai === "ISI_APIKEY_OPENAI_DISINI") return reply("Apikey belum diisi\n\nSilahkan isi terlebih dahulu apikeynya di file key.json\n\nApikeynya bisa dibuat di website: https://beta.openai.com/account/api-keys");
            if (!text) return reply(`Chat dengan AI.\n\nContoh:\n${prefix}${command} Indonesia merdeka pada tahun ?`);
            const configuration = new Configuration({
              apiKey: setting.keyopenai,
            });
            const openai = new OpenAIApi(configuration);

            const response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt: text,
              temperature: 0, // Higher values means the model will take more risks.
              max_tokens: 2048, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
              top_p: 1, // alternative to sampling with temperature, called nucleus sampling
              frequency_penalty: 0.3, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
              presence_penalty: 0 // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
          });
            m.reply(`${response.data.choices[0].text}`);
          } catch (error) {
          if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            console.log(`${error.response.status}\n\n${error.response.data}`);
          } else {
            console.log(error);
            m.reply("Maaf, sepertinya ada yang error :"+ error.message);
          }
        }
          break;
        case "img": case "ai-img": case "image": case "images":
          try {
            reply("⏳ please wait don't spam chat");
            if (setting.keyopenai === "ISI_APIKEY_OPENAI_DISINI") return reply("Apikey belum diisi\n\nSilahkan isi terlebih dahulu apikeynya di file key.json\n\nApikeynya bisa dibuat di website: https://beta.openai.com/account/api-keys");
            if (!text) return reply(`Membuat gambar dari AI.\n\nContoh:\n${prefix}${command} Wooden house on snow mountain`);
            const configuration = new Configuration({
              apiKey: setting.keyopenai,
            });
            const openai = new OpenAIApi(configuration);
            const response = await openai.createImage({
              prompt: text,
              n: 1,
              size: "512x512",
            });
            //console.log(response.data.data[0].url)
            client.sendImage(from, response.data.data[0].url, text, mek);
            } catch (error) {
          if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            console.log(`${error.response.status}\n\n${error.response.data}`);
          } else {
            console.log(error);
            m.reply("Maaf, sepertinya ada yang error :"+ error.message);
          }
        }
          break;
        case "gpt":
        try {
          reply("⏳ please wait don't spam chat");
          if (setting.accessToken === "ISI_ACCESS_TOKEN_DISINI") return reply("AccessToken belum diisi\n\nSilahkan isi terlebih dahulu AccessToken di file key.json\n\nAccessToken bisa dibuat di website: https://chat.openai.com/api/auth/session");
          if (!text) return reply(`Chat dengan AI.\n\nContoh:\n${prefix}${command} Buatlah progam kalkulator sederhana dari javascript language`);
          const fetch = new ChatGPTUnofficialProxyAPI({
              accessToken: setting.accessToken,
          });
          const response = await fetch.sendMessage(text)
          m.reply(response.text)
        } catch (error) {
          if(error.response) {
          console.log(error.response)
          }
        }
        break;
        case "help":
        m.reply(`*Apa itu ChatGPT ?*
          
ChatGPT adalah platform chatbot yang menggunakan teknologi GPT-3 (Generative Pre-trained Transformer 3) untuk membantu pengguna menyelesaikan tugas-tugas tertentu. ChatGPT dapat membantu pengguna dengan tugas-tugas seperti menulis teks, membuat desain grafis, membuat presentasi, dan banyak lagi. ChatGPT juga dapat membantu pengguna dengan tugas-tugas yang lebih kompleks seperti menganalisis data, membuat prediksi, dan menyelesaikan tugas-tugas AI.

*Apa itu DALL-E ?*

DALL-E adalah salah satu proyek AI yang dikembangkan oleh OpenAI. Ini adalah sistem generatif yang dapat menghasilkan gambar dari deskripsi teks yang diberikan. Misalnya, jika Anda memberikan deskripsi seperti "seorang anak perempuan berambut pirang dengan topi biru dan sepatu merah", DALL-E akan menghasilkan gambar yang sesuai dengan deskripsi tersebut.`)
        break;
        default: {
          if (isCmd2 && budy.toLowerCase() != undefined) {
            if (m.chat.endsWith("broadcast")) return;
            if (m.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (isCmd2 && !m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            } else if (argsLog || (isCmd2 && m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            }
          }
        }
      }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
