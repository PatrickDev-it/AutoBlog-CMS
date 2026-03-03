import db from '@/lib/db';
import _try from '@/utils/_try';
import { Types } from 'mongoose';
import cloudinary from '@/lib/cloudinary';
import { env } from 'node:process';

export const GET = async () =>
	await _try(async () => {
		const conn = await db();
		const doc = await conn.collection('advisory').findOne(
			{},
			{
				projection: {
					_id: 0,
					id: { $toString: '$_id' },
					about: 1,
					services: 1,
				},
			}
		);

		const { resources } = await cloudinary.search
			.expression(`folder:${env.CLOUDINARY_WEBSITE_FOLDER}/advisory`) // Filtra per cartella
			.execute();

		return { ...doc, image: resources[0] };
	});

export const PATCH = async (req: Request) =>
	await _try(async () => {
		const { id, about, services } = await req.json();

		const conn = await db();
		const coll = conn.collection('advisory');
		return await coll.updateOne(
			{ _id: new Types.ObjectId(id) },
			{ $set: { about, services } },
			{ upsert: true }
		);
	});
