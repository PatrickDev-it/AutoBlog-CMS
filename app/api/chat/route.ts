import { GoogleGenerativeAI } from '@google/generative-ai';
import _try from '@/utils/_try';

export const POST = async (req: Request) =>
	await _try(async () => {
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

		const { prompt } = await req.json();

		const result = await model.generateContent(prompt);
		return result.response.text();
	});
