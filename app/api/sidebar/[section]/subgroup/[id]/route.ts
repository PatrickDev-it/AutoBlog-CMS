import postInitTemplate from '@/constants/post-init-template';
import { sections } from '@/constants/sections';
import db from '@/lib/db';
import _try from '@/utils/_try';
import { Types } from 'mongoose';
import { env } from 'node:process';

export const POST = async (
	req: Request,
	{ params }: { params: Promise<{ id: string; section: string }> }
) =>
	await _try(async () => {
		const { section } = await params;
		if (!sections.includes(section)) throw new Error('Section not found');

		const conn = await db();
		const coll = conn.collection(section);
		const { group, name } = await req.json();

		const template = {
			group: { name: group.name, _id: new Types.ObjectId(group.id) },
			sub_group: {
				name: name ?? postInitTemplate[section].name,
				_id: new Types.ObjectId(),
			},
			...postInitTemplate[section],
		};
		const { insertedId } = await coll.insertOne(template);

		return {
			id: insertedId,
			name: template.sub_group.name,
			items: [{ id: insertedId.toString(), ...postInitTemplate[section] }],
		};
	});

export const PATCH = async (
	req: Request,
	{ params }: { params: Promise<{ id: string; section: string }> }
) =>
	await _try(async () => {
		const { id, section } = await params;
		if (!sections.includes(section)) throw new Error('Section not found');

		const conn = await db();
		const coll = conn.collection(section);
		const { name } = await req.json();

		return await coll.updateMany(
			{ 'sub_group._id': new Types.ObjectId(id) },
			{ $set: { 'sub_group.name': name || '' } }
		);
	});

export const DELETE = async (
	req: Request,
	{ params }: { params: Promise<{ id: string; section: string }> }
) =>
	await _try(async () => {
		const { id, section } = await params;
		if (!sections.includes(section)) throw new Error('Section not found');

		const conn = await db();
		const coll = conn.collection(section);

		const docs = await coll.find({ 'sub_group._id': new Types.ObjectId(id) }).toArray();
		const { folders } = await cloudinary.api.sub_folders(
			`${env.CLOUDINARY_WEBSITE_FOLDER}/journals`
		);

		return await Promise.all(
			docs.map(async ({ _id }) => {
				const postId = _id.toString();
				if (folders.some(({ name }) => name === postId)) {
					await cloudinary.api.delete_resources_by_prefix(
						`${env.CLOUDINARY_WEBSITE_FOLDER}/journals/${postId}/`,
						{
							all: true,
						}
					);
					await cloudinary.api.delete_folder(
						`${env.CLOUDINARY_WEBSITE_FOLDER}/journals/${postId}`
					);
				}
				return await coll.deleteOne({ _id });
			})
		);
	});
