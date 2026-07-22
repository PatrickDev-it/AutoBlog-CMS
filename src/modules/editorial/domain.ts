import { z } from 'zod';
import { transitionActionValues } from '@/src/modules/editorial/workflow';

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

export const transitionPostSchema = z.object({
	expectedVersion: z.number().int().positive(),
	action: z.enum(transitionActionValues),
	scheduledFor: z.iso.datetime().optional(),
	idempotencyKey: z.string().trim().min(8).max(120).optional(),
}).superRefine((input, context) => {
	if (input.action === 'schedule' && !input.scheduledFor) context.addIssue({ code: 'custom', path: ['scheduledFor'], message: 'Scheduling requires a date.' });
	if ((input.action === 'schedule' || input.action === 'publish') && !input.idempotencyKey) context.addIssue({ code: 'custom', path: ['idempotencyKey'], message: 'Publication requires an idempotency key.' });
});
export type TransitionPostInput = z.infer<typeof transitionPostSchema>;

export const restoreRevisionSchema = z.object({
	expectedVersion: z.number().int().positive(),
	revisionId: z.string().min(1).max(120),
});
export type RestoreRevisionInput = z.infer<typeof restoreRevisionSchema>;

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
	scheduledFor: Date | null;
	publishedAt: Date | null;
}>;

export type RevisionDetail = Readonly<{
	id: string;
	postId: string;
	version: number;
	title: string;
	excerpt: string;
	content: string;
	authorId: string;
	restoredFromRevisionId: string | null;
	createdAt: Date;
}>;

export type PublicPost = Readonly<{
	workspaceName: string;
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	revisionId: string;
	publishedAt: Date;
}>;

export type JobRunResult = Readonly<{ claimed: number; completed: number; failed: number }>;
