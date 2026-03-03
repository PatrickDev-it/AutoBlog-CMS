import db from '@/lib/db';
import _try from '@/utils/_try';
import { Types } from 'mongoose';
import { sections } from '@/constants/sections';
import postInitTemplate from '@/constants/post-init-template';
import { post as ObjectIdCheck } from '@/utils/objectId_check';

export const POST = async (
	req: Request,
	{ params }: { params: Promise<{ section: string; id: string }> }
) =>
	await _try(async () => {
		const { section } = await params;
		if (!sections.includes(section)) throw new Error('Section not found');
		const { name, group, sub_group } = await req.json();
		console.log('body', { name, group, sub_group });

		const conn = await db();
		const coll = conn.collection(section);
		console.log('group', group, sub_group);
		const template = {
			group: {
				name: group.name || 'Group',
				_id: new Types.ObjectId(group.id),
			},
			sub_group: {
				name: sub_group.name || 'Sub group',
				_id: new Types.ObjectId(sub_group.id),
			},
			...postInitTemplate[section],
			name: name || postInitTemplate[section].name,
		};
		console.log('template', template);

		return await coll.insertOne(ObjectIdCheck(template));
	});

export const PATCH = async (
	req: Request,
	{ params }: { params: Promise<{ section: string; id: string }> }
) =>
	await _try(async () => {
		const { section } = await params;
		if (!sections.includes(section)) throw new Error('Section not found');

		const { id, ...body } = await req.json();
		const conn = await db();
		const coll = conn.collection(section);

		delete body._id;
		return await coll.updateOne(
			{ _id: new Types.ObjectId(id) },
			{ $set: ObjectIdCheck(body) }
		);
	});

export const DELETE = async (
	req: Request,
	{ params }: { params: Promise<{ section: string; id: string }> }
) =>
	await _try(async () => {
		const { section } = await params;
		if (!sections.includes(section)) throw new Error('Section not found');

		const { id } = await req.json();
		if (!id) throw new Error('Invalid id');

		const conn = await db();
		const exercises = conn.collection(section);

		return await exercises.deleteMany({ _id: new Types.ObjectId(id) });
	});
