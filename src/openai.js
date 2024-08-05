import OpenAI from "openai";
import config from 'config';
import {createReadStream} from 'fs'
import {removeFile} from "./utils.js";


class OpenAILocal {
    openai = null;

    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system',
    }

    constructor(apiKey) {

        this.openai = new OpenAI({
            apiKey
        });

    }

    async chat(messages) {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages,
            })
            return response?.choices[0]?.message ? response?.choices[0]?.message : 'ошибка :('
        } catch (e) {
            const error = `Error while GPT chat ${e.message}`
            console.log(error)
            return error
        }
    }

    async transcription(filePath) {
        try {
            const response = await this.openai.audio.transcriptions.create(
                {
                    model: "whisper-1",
                    file: createReadStream(filePath),
                    response_format: "text",
                }
            )
            await removeFile(filePath)
            return response.data.text
        } catch (e) {
            const error = `Error while voice to text ${e.message}`
            console.log(error)
            return error
        }
    }
}

export const openai = new OpenAILocal(config.get('OPENAI_KEY'))
