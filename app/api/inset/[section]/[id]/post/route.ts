import db from '@/lib/db';
import _try from '@/utils/_try';
import { Types } from 'mongoose';
import { post as ObjectIdCheck } from '@/utils/objectId_check';

export const PATCH = async (
	req: Request,
	{ params }: { params: Promise<{ id: string; section: string }> }
) =>
	await _try(async () => {
		const { section } = await params;
		const { _id, ...body } = await req.json();

		const conn = await db();
		const coll = conn.collection(section);

		return await coll.updateOne(
			{ _id: new Types.ObjectId(_id) },
			{ $set: ObjectIdCheck(body) }
		);
	});
