import { z } from 'zod';

export const postStateSchema = z.enum(['Draft', 'InReview', 'ChangesRequested', 'Approved', 'Scheduled', 'Published', 'Archived']);
export type PostState = z.infer<typeof postStateSchema>;

const titleSchema = z.string().trim().min(3).max(180);
const excerptSchema = z.string().trim().max(320);
const contentSchema = z.string().max(100_000);

export const createPostSchema = z.object({
	title: titleSchema,
	excerpt: excerptSchema.default(''),
	content: contentSchema.default(''),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const savePostSchema = z.object({
	expectedVersion: z.number().int().positive(),
	title: titleSchema,
	excerpt: excerptSchema,
	content: contentSchema,
});
export type SavePostInput = z.infer<typeof savePostSchema>;

export type PostSummary = Readonly<{
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	state: PostState;
	version: number;
	authorId: string;
	updatedAt: Date;
}>;

export type PostDetail = PostSummary & Readonly<{
	content: string;
	draftRevisionId: string;
	publishedRevisionId: string | null;
	createdAt: Date;
}>;
