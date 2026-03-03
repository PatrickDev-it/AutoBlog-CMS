import db from '@/lib/db';
import _try from '@/utils/_try';
import { Types } from 'mongoose';
import { sections } from '@/constants/sections';

export const GET = async (req: Request, { params }: { params: Promise<{ section: string }> }) =>
	await _try(async () => {
		const { section } = await params;
		console.log('from server api section', section);
		if (!sections.includes(section)) return;

		const conn = await db();
		const coll = conn.collection(section);

		const groups = coll.aggregate([
			{
				$group: {
					_id: {
						group: '$group._id',
						sub_group: '$sub_group._id',
					}, // Raggruppa per group e sub_group
					group: { $first: '$group' },
					sub_group: { $first: '$sub_group' }, // Usa il valore di sub_group come titolo
					items: {
						$push: '$$ROOT',
					},
				},
			},
			{
				$group: {
					_id: '$_id.group', // Raggruppa per group
					id: { $first: '$group._id' },
					name: { $first: '$group.name' },
					sub_groups: {
						$push: {
							id: '$sub_group._id',
							name: '$sub_group.name',
							items: {
								$map: {
									input: '$items',
									as: 'item',
									in: {
										$mergeObjects: [
											{
												id: {
													$toString: '$$item._id',
												},
											},
											{
												$arrayToObject:
													{
														$objectToArray:
															'$$item',
													},
											},
										],
									},
								},
							},
						},
					},
				},
			},
			{
				// Aggiungi la fase di ordinamento per sub_groups
				$addFields: {
					sub_groups: {
						$sortArray: {
							input: '$sub_groups',
							sortBy: { id: 1 }, // Ordina per id (o _id) in ordine crescente
						},
					},
				},
			},
			{
				$project: {
					_id: 0, // Esclude _id
				},
			},
		]);
		if (!groups) throw new Error('No groups found');
		return await groups.toArray();
	});

export const PATCH = async (req: Request, { params }: { params: Promise<{ section: string }> }) =>
	await _try(async () => {
		const { section } = await params;
		if (!sections.includes(section)) throw new Error('Section not found');

		const conn = await db();
		const coll = conn.collection(section);

		const { id, ...body } = await req.json();

		return await coll.updateMany(
			{ _id: new Types.ObjectId(body.id) },
			{ $set: body },
			{ upsert: true }
		);
	});
