import {session, Telegraf} from 'telegraf';
import {message} from "telegraf/filters";
import {code} from 'telegraf/format'
import config from 'config';
import {ogg} from './ogg.js'
import {openai} from './openai.js'
import {checkVoiceOn, initCommand, processTextToChat, voiceOff, voiceOn} from "./logic.js";
import {removeFile} from "./utils.js";

console.log(config.get('TEST_ENV'))

let INITIAL_SESSION = {
    messages: [],
}
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

const allowIDs = ['131082004', '298691789']
const noAllowError = `У вас нет доступа`

bot.use(session())

bot.command('new', initCommand)

bot.command('start', initCommand)

bot.command('checkVoice', checkVoiceOn)
bot.command('cv', checkVoiceOn)
bot.command('voiceOn', voiceOn)
bot.command('von', voiceOn)
bot.command('voiceOff', voiceOff)
bot.command('voff', voiceOff)


}

function checkAccess(ctx) {

}

bot.on(message('voice'), async ctx => {
    //await ctx.reply(JSON.stringify(ctx.message, null, 2))

    ctx.session ??= INITIAL_SESSION



    try {
        const userId = String(ctx.message.from.id)
        if (!allowIDs.includes(userId)) {
            try {
                await ctx.reply(code(noAllowError))
            } catch (e) {
                const error = `${noAllowError}`
                console.log(error)
                await ctx.reply(error)
            }
            return
        }

        await ctx.reply(code('Сообщение принял. Жду ответ от сервера'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        await removeFile(oggPath)

        const text = await openai.transcription(mp3Path)
        await ctx.reply(code(`Ваш запрос: ${text}`))

        await processTextToChat(ctx, text);

    } catch (e) {
        const error = `Error while voice message ${e.message}`
        console.log(error)
        await ctx.reply(error)
    }
})

bot.on(message('text'), async ctx => {
    ctx.session ??= INITIAL_SESSION




    try {

        const userId = String(ctx.message.from.id)
        if (!allowIDs.includes(userId)) {
            try {
                await ctx.reply(code(noAllowError))
            } catch (e) {
                const error = `${noAllowError}`
                console.log(error)
                await ctx.reply(error)
            }
            return
        }

        await ctx.reply(code(`Сообщение принял. Жду ответ от сервера`))
        await processTextToChat(ctx, ctx.message.text);
    } catch (e) {
        const error = `Error while text message ${e.message}`
        console.log(error)
        await ctx.reply(error)
    }
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
