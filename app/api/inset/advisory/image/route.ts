import _try from '@/utils/_try';
import cloudinary from '@/lib/cloudinary';
import { env } from 'node:process';

// export const POST = async (req: Request) =>
// 	await _try(async () => {
// 		const doc = await req.json();
// 		const conn = await db();
// 		const coll = conn.collection(section);
// 		return await coll.insertOne(doc);
// 	});

export const PATCH = async (req: Request) =>
	await _try(async () => {
		const { base64, public_id, display_name } = await req.json();

		if (public_id) await cloudinary.uploader.destroy(public_id);

		return await cloudinary.uploader.upload(base64, {
			folder: `${env.CLOUDINARY_WEBSITE_FOLDER}/advisory`,
			public_id,
			display_name: display_name ?? 'main',
		});
	});
