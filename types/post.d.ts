import { Types } from 'mongoose';

export type PostBase = {
	_id: string;
	name: string;
	image: { public_id: string; display_name: string };
};

export type Journal = PostBase & {
	title: string;
	description: string;
	state?: string;
	kind?: string;
	date: string;
};

export type Event = PostBase & {
	title: string;
	description: string;
	state?: string;
	kind?: string;
	date: { from: string; to: string };
};

export type Post = {
	_id: string;
	group: { name: string; _id: string };
	sub_group: { name: string; _id: string };
} & (Event | Journal);

export type Post_serverOnly = {
	_id: Types.ObjectId;
	group: { name: string; _id: Types.ObjectId };
	sub_group: { name: string; _id: Types.ObjectId };
} & (Event | Journal);
