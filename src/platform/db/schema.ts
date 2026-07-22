import { sql } from 'drizzle-orm';
import {
	blob,
	check,
	foreignKey,
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
	type AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core';

export const ROLE_VALUES = ['Owner', 'Admin', 'Editor', 'Author', 'Reviewer'] as const;
export const POST_STATE_VALUES = [
	'Draft',
	'InReview',
	'ChangesRequested',
	'Approved',
	'Scheduled',
	'Published',
	'Archived',
] as const;

const timestamp = (name: string) => integer(name, { mode: 'timestamp_ms' });

export const users = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
});

export const sessions = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [index('session_user_idx').on(table.userId)]);

export const accounts = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
}, (table) => [
	index('account_user_idx').on(table.userId),
	uniqueIndex('account_provider_unique').on(table.providerId, table.accountId),
]);

export const verifications = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at'),
}, (table) => [index('verification_identifier_idx').on(table.identifier)]);

export const authRateLimits = sqliteTable('rateLimit', {
	id: text('id').primaryKey(),
	key: text('key').notNull().unique(),
	count: integer('count').notNull(),
	lastRequest: integer('lastRequest').notNull(),
});

export const workspaces = sqliteTable('workspaces', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	isDemo: integer('is_demo', { mode: 'boolean' }).notNull().default(false),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
});

export const memberships = sqliteTable('memberships', {
	workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	role: text('role', { enum: ROLE_VALUES }).notNull(),
	createdAt: timestamp('created_at').notNull(),
}, (table) => [
	primaryKey({ columns: [table.workspaceId, table.userId] }),
	index('membership_user_idx').on(table.userId),
	check('membership_role_check', sql`${table.role} in ('Owner','Admin','Editor','Author','Reviewer')`),
]);

export const posts = sqliteTable('posts', {
	id: text('id').primaryKey(),
	workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
	slug: text('slug').notNull(),
	title: text('title').notNull(),
	excerpt: text('excerpt').notNull().default(''),
	state: text('state', { enum: POST_STATE_VALUES }).notNull().default('Draft'),
	version: integer('version').notNull().default(1),
	authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
	draftRevisionId: text('draft_revision_id').references((): AnySQLiteColumn => revisions.id, { onDelete: 'set null' }),
	publishedRevisionId: text('published_revision_id').references((): AnySQLiteColumn => revisions.id, { onDelete: 'set null' }),
	scheduledFor: timestamp('scheduled_for'),
	submittedAt: timestamp('submitted_at'),
	approvedAt: timestamp('approved_at'),
	publishedAt: timestamp('published_at'),
	archivedAt: timestamp('archived_at'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
}, (table) => [
	uniqueIndex('post_workspace_slug_unique').on(table.workspaceId, table.slug),
	uniqueIndex('post_workspace_id_unique').on(table.workspaceId, table.id),
	index('post_workspace_state_idx').on(table.workspaceId, table.state),
	check('post_version_positive', sql`${table.version} > 0`),
]);

export const revisions = sqliteTable('revisions', {
	id: text('id').primaryKey(),
	workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
	postId: text('post_id').notNull(),
	version: integer('version').notNull(),
	title: text('title').notNull(),
	excerpt: text('excerpt').notNull().default(''),
	content: text('content').notNull(),
	authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
	restoredFromRevisionId: text('restored_from_revision_id'),
	createdAt: timestamp('created_at').notNull(),
}, (table) => [
	foreignKey({ columns: [table.workspaceId, table.postId], foreignColumns: [posts.workspaceId, posts.id] }).onDelete('cascade'),
	uniqueIndex('revision_post_version_unique').on(table.postId, table.version),
	uniqueIndex('revision_workspace_id_unique').on(table.workspaceId, table.id),
	index('revision_workspace_post_idx').on(table.workspaceId, table.postId),
]);

export const publications = sqliteTable('publications', {
	id: text('id').primaryKey(),
	workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
	postId: text('post_id').notNull(),
	revisionId: text('revision_id').notNull().references(() => revisions.id, { onDelete: 'restrict' }),
	status: text('status', { enum: ['scheduled', 'published', 'cancelled'] }).notNull(),
	scheduledFor: timestamp('scheduled_for'),
	publishedAt: timestamp('published_at'),
	idempotencyKey: text('idempotency_key').notNull().unique(),
	createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
	createdAt: timestamp('created_at').notNull(),
}, (table) => [
	foreignKey({ columns: [table.workspaceId, table.postId], foreignColumns: [posts.workspaceId, posts.id] }).onDelete('cascade'),
	index('publication_due_idx').on(table.status, table.scheduledFor),
]);

export const mediaAssets = sqliteTable('media_assets', {
	id: text('id').primaryKey(),
	workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
	postId: text('post_id'),
	status: text('status', { enum: ['pending', 'active', 'replaced', 'deleted', 'cleanup_pending'] }).notNull(),
	storageKey: text('storage_key').notNull().unique(),
	fileName: text('file_name').notNull(),
	mimeType: text('mime_type').notNull(),
	byteSize: integer('byte_size').notNull(),
	width: integer('width').notNull(),
	height: integer('height').notNull(),
	checksum: text('checksum').notNull(),
	altText: text('alt_text').notNull().default(''),
	createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
}, (table) => [
	index('media_workspace_post_idx').on(table.workspaceId, table.postId),
	check('media_byte_size_positive', sql`${table.byteSize} > 0`),
]);

export const mediaBlobs = sqliteTable('media_blobs', {
	assetId: text('asset_id').primaryKey().references(() => mediaAssets.id, { onDelete: 'cascade' }),
	data: blob('data', { mode: 'buffer' }).notNull(),
});

export const auditEvents = sqliteTable('audit_events', {
	id: text('id').primaryKey(),
	workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
	actorId: text('actor_id').references(() => users.id, { onDelete: 'set null' }),
	action: text('action').notNull(),
	targetType: text('target_type').notNull(),
	targetId: text('target_id'),
	requestId: text('request_id').notNull(),
	metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>().notNull().default({}),
	createdAt: timestamp('created_at').notNull(),
}, (table) => [index('audit_workspace_created_idx').on(table.workspaceId, table.createdAt)]);

export const aiUsage = sqliteTable('ai_usage', {
	id: text('id').primaryKey(),
	workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	mode: text('mode', { enum: ['mock', 'gemini'] }).notNull(),
	provider: text('provider').notNull(),
	model: text('model').notNull(),
	latencyMs: integer('latency_ms').notNull(),
	inputCharacters: integer('input_characters').notNull(),
	outputCharacters: integer('output_characters').notNull(),
	inputTokens: integer('input_tokens'),
	outputTokens: integer('output_tokens'),
	createdAt: timestamp('created_at').notNull(),
}, (table) => [index('ai_usage_workspace_created_idx').on(table.workspaceId, table.createdAt)]);

export const jobs = sqliteTable('jobs', {
	id: text('id').primaryKey(),
	workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
	type: text('type', { enum: ['publish', 'media_cleanup'] }).notNull(),
	payload: text('payload', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
	status: text('status', { enum: ['pending', 'leased', 'completed', 'failed'] }).notNull().default('pending'),
	attempts: integer('attempts').notNull().default(0),
	runAt: timestamp('run_at').notNull(),
	leaseUntil: timestamp('lease_until'),
	lastErrorCode: text('last_error_code'),
	idempotencyKey: text('idempotency_key').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
}, (table) => [index('job_claim_idx').on(table.status, table.runAt, table.leaseUntil)]);

export const rateLimits = sqliteTable('rate_limits', {
	key: text('key').notNull(),
	windowStartedAt: timestamp('window_started_at').notNull(),
	count: integer('count').notNull().default(0),
	expiresAt: timestamp('expires_at').notNull(),
}, (table) => [
	primaryKey({ columns: [table.key, table.windowStartedAt] }),
	index('rate_limit_expiry_idx').on(table.expiresAt),
]);

export const schema = {
	users,
	sessions,
	accounts,
	verifications,
	authRateLimits,
	workspaces,
	memberships,
	posts,
	revisions,
	publications,
	mediaAssets,
	mediaBlobs,
	auditEvents,
	aiUsage,
	jobs,
	rateLimits,
};
