import {Configuration, OpenAIApi} from 'openai'
import config from 'config';
import {createReadStream} from 'fs'
import {removeFile} from "./utils.js";

class OpenAI {
    openai = null;

    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system',
    }

    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey,
        });
        this.openai = new OpenAIApi(configuration);
    }

    async chat(messages) {
        try {
            const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages,
            })
            return response.data.choices[0].message
        } catch (e) {
            console.log(`Error while GPT chat`, e.message)
        }
    }

    async transcription(filePath) {
        try {
            const response = await this.openai.createTranscription(
                createReadStream(filePath),
                'whisper-1'
            )
            removeFile(filePath)
            return response.data.text
        } catch (e) {
            console.log(`Error while voice to text`, e.message)
        }
    }
}

export const openai = new OpenAI(config.get('OPENAI_KEY'))
