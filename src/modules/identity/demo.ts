import type { Role } from '@/src/modules/identity/domain';

export const DEMO_WORKSPACE_ID = 'ws-demo';
export const DEMO_WORKSPACE_SLUG = 'demo';
export const DEMO_PASSWORD = 'AutoBlogDemo!2026';

export const DEMO_IDENTITIES: readonly Readonly<{ id: string; name: string; email: string; role: Role }>[] = [
	{ id: 'demo-owner', name: 'Olivia Owner', email: 'owner@demo.autoblog.local', role: 'Owner' },
	{ id: 'demo-admin', name: 'Amir Admin', email: 'admin@demo.autoblog.local', role: 'Admin' },
	{ id: 'demo-editor', name: 'Elena Editor', email: 'editor@demo.autoblog.local', role: 'Editor' },
	{ id: 'demo-author', name: 'Avery Author', email: 'author@demo.autoblog.local', role: 'Author' },
	{ id: 'demo-reviewer', name: 'Ravi Reviewer', email: 'reviewer@demo.autoblog.local', role: 'Reviewer' },
];
