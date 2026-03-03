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

export const PATCH = async (
	req: Request,
	{ params }: { params: Promise<{ id: string; section: string }> }
) =>
	await _try(async () => {
		const { section } = await params;
		const { _id, base64, public_id, display_name } = await req.json();

		if (public_id) await cloudinary.uploader.destroy(public_id);

		const res = await cloudinary.uploader.upload(base64, {
			folder: `${env.CLOUDINARY_WEBSITE_FOLDER}/${section}/${_id}`,
			public_id,
			display_name,
		});

		console.log('res', res);

		return res;
	});
