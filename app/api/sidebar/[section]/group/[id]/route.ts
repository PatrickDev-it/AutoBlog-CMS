import { env } from 'node:process';

import db from '@/lib/db';
import _try from '@/utils/_try';
import { Types } from 'mongoose';
import cloudinary from '@/lib/cloudinary';
import { sections } from '@/constants/sections';
import postInitTemplate from '@/constants/post-init-template';
import { post as ObjectIdCheck } from '@/utils/objectId_check';

export const POST = async (req: Request, { params }: { params: Promise<{ section: string }> }) =>
	await _try(async () => {
		const { section } = await params;
		if (!sections.includes(section)) throw new Error('Section not found');

		const { name } = await req.json();

		const conn = await db();
		const coll = conn.collection(section);

		const template = {
			group: {
				name: name || 'Group',
				_id: new Types.ObjectId(),
			},
			sub_group: {
				name: 'Sub group',
				_id: new Types.ObjectId(),
			},
			...postInitTemplate[section],
		};

		return await coll.insertOne(ObjectIdCheck(template));
	});

export const PATCH = async (
	req: Request,
	{ params }: { params: Promise<{ id: string; section: string }> }
) =>
	await _try(async () => {
		const { section } = await params;
		if (!sections.includes(section)) throw new Error('Section not found');
		const { id, name } = await req.json();

		const conn = await db();
		const coll = conn.collection(section);

		return await coll.updateMany(
			{ 'group._id': new Types.ObjectId(id) },
			{ $set: { 'group.name': name || '' } }
		);
	});

export const DELETE = async (
	req: Request,
	{ params }: { params: Promise<{ id: string; section: string }> }
) =>
	await _try(async () => {
		const { section } = await params;
		if (!sections.includes(section)) throw new Error('Section not found');

		const { id } = await req.json();
		if (!id) throw new Error('Invalid id');

		const conn = await db();
		const coll = conn.collection(section);
		const docs = await coll.find({ 'group._id': new Types.ObjectId(id) }).toArray();

		const { folders } = await cloudinary.api.sub_folders(
			`${env.CLOUDINARY_WEBSITE_FOLDER}/${section}`
		);

		return await Promise.all(
			docs.map(async ({ _id }) => {
				const postId = _id.toString();
				if (folders.some(({ name }) => name === postId)) {
					await cloudinary.api.delete_resources_by_prefix(
						`${env.CLOUDINARY_WEBSITE_FOLDER}/${section}/${postId}/`,
						{
							all: true,
						}
					);
					await cloudinary.api.delete_folder(
						`${env.CLOUDINARY_WEBSITE_FOLDER}/${section}/${postId}`
					);
				}
				return await coll.deleteOne({ _id });
			})
		);
	});
