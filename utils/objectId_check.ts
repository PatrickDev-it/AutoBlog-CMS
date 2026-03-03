'only server';
import { Post, Post_serverOnly } from '@/types/post';
import { Types } from 'mongoose';

export const post = (post: Post) => {
	delete post._id;
	return {
		...post,
		group: { ...post.group, _id: new Types.ObjectId(post.group._id) },
		sub_group: { ...post.sub_group, _id: new Types.ObjectId(post.sub_group._id) },
	} as Post_serverOnly;
};
