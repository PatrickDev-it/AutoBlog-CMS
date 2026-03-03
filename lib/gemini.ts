import { env } from 'process';
import { GoogleGenerativeAI } from '@google/generative-ai';

import type { GenerativeModel, ModelParams } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const modelsParams: ModelParams[] = [
	{
		model: 'gemini-1.5-flash',
		generationConfig: { temperature: 0.75, maxOutputTokens: 1650 },
	},
	{
		model: 'gemini-1.5-flash-8b',
		generationConfig: { temperature: 0.63, maxOutputTokens: 1380 },
	},
	{ model: 'gemini-1.5-pro', generationConfig: { temperature: 1.1, maxOutputTokens: 1085 } },
	{
		model: 'gemini-2.0-flash',
		generationConfig: { temperature: 0.875, maxOutputTokens: 975 },
	},
];

const models = new Map(
	modelsParams.map(({ model, ...params }, i) => [
		model,
		genAI.getGenerativeModel({
			model,
			...params,
		}),
	])
);

export default (model: string = 'gemini-1.5-flash'): GenerativeModel => models.get(model)!;
