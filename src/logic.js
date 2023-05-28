import {openai} from "./openai.js";

export let INITIAL_SESSION = {
    messages: [],
}

export async function initCommand(ctx) {
    INITIAL_SESSION = {
        messages: [],
    }
    ctx.session = { ...INITIAL_SESSION }
    await ctx.reply('Жду вашего голосового или текстового сообщения')
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

        await ctx.reply(answer)

    } catch (e) {
        const error = `Error while text message ${e.message}`
        console.log(error)
        await ctx.reply(error)
    }
}