'use server';

import gemini from '@/lib/gemini';
import type { Content } from '@google/generative-ai';

let genModel = gemini(),
	chat = genModel.startChat();

export default async (model: string, history: Content[], message: string) => {
	if (genModel.model !== model) {
		const selectedModel = gemini(model);

		genModel = selectedModel;
		chat = selectedModel.startChat({
			history,
		});
	}

	const { response } = await chat.sendMessage(message);

	return response.text();
};
