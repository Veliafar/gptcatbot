import {openai} from "./openai.js";
import {dirname} from 'path'
import {fileURLToPath} from "url";
import {ttsConverter} from "./tts.js"
import {checkAccess} from './access.js'
const __dirname = dirname(fileURLToPath(import.meta.url))

export let INITIAL_SESSION = {
    messages: [],
}

export let isVoiceOn = false;

export async function initCommand(ctx) {
    INITIAL_SESSION = {
        messages: [],
    }
    const userId = String(ctx.message.from.id)

    try {
        checkAccess(userId)
    } catch (e) {
        const error = `Error message ${e.message}`
        console.log(error)
        await ctx.reply(error)
    }


    ctx.session = {...INITIAL_SESSION}
    await ctx.reply('Жду вашего голосового или текстового сообщения')
}

export async function voiceOn(ctx) {
    isVoiceOn = true;
    await ctx.reply('Ответ аудиосообщением - включен!')
}

export async function voiceOff(ctx) {
    isVoiceOn = false;
    await ctx.reply('Ответ аудиосообщением - выключен!')
}

export async function checkVoiceOn(ctx) {
    await ctx.reply(`Ответ аудиосообщением - ${isVoiceOn ? 'влючен!' : 'выключен!'}`)
}


export async function processTextToChat(ctx, content) {
    try {
        ctx.session.messages.push({
            role: openai.roles.USER,
            content: content
        })

        const response = await openai.chat(ctx.session.messages)

        const answer = response?.content ? response?.content : response.toString()

        ctx.session.messages.push({
            role: openai.roles.ASSISTANT,
            content: answer
        })

        if (!isVoiceOn) {
            await ctx.reply(answer)
        } else {
            const source = await ttsConverter.textToSpeech(answer)

            await ctx.sendAudio(
                {source},
                {title: 'Ответ от ассистента', performer: 'ChatGPT'}
            )
        }

    } catch (e) {
        const error = `Error while text message ${e.message}`
        console.log(error)
        await ctx.reply(error)
    }
}