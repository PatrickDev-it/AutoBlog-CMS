import db from '@/lib/db';
import _try from '@/utils/_try';
import { Types } from 'mongoose';
import cloudinary from '@/lib/cloudinary';
import { env } from 'node:process';

export const GET = async (
	req: Request,
	{ params }: { params: Promise<{ id: string; section: string }> }
) =>
	await _try(async () => {
		const { id, section } = await params;

		const conn = await db();
		const coll = conn.collection(section);

		const {
			resources: [image],
		} = await cloudinary.search
			.expression(`folder:${env.CLOUDINARY_WEBSITE_FOLDER}/${section}/${id}`)
			.max_results(1)
			// Filtra per cartella
			.execute();
		const post = await coll.findOne({ _id: new Types.ObjectId(id) });

		return { ...post, image };
	});
