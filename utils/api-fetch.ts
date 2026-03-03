let idCounter = 1000;
const createId = () => `${Date.now()}-${++idCounter}`;

const createDemoPost = (section: string, overrides: Record<string, any> = {}): Record<string, any> => {
	const id = overrides.id ?? createId();
	return {
		id,
		_id: id,
		name: overrides.name ?? `Demo ${section} entry`,
		title: overrides.title ?? 'Demo Title',
		description: overrides.description ?? 'Demo content for presentation purposes.',
		state: overrides.state ?? 'Draft',
		kind: overrides.kind ?? 'General',
		date: overrides.date ?? new Date().toISOString(),
		image:
			overrides.image ??
			({
				public_id: 'sample',
				display_name: 'demo-image',
			} as const),
		group: overrides.group ?? ({ _id: 'group-demo', name: 'Demo Group' } as const),
		sub_group: overrides.sub_group ?? ({ _id: 'subgroup-demo', name: 'Demo Subgroup' } as const),
		...overrides,
	};
};

const demoStore = {
	sidebar: {
		featured: [
			{
				id: 'grp-featured-2025',
				name: '2025 Highlights',
				sub_groups: [
					{
						id: 'sg-featured-january',
						name: 'January',
						items: [
							createDemoPost('featured', {
								id: 'post-digital-revolution',
								name: 'The Digital Revolution',
								title: 'Embracing Digital Transformation in Modern Business',
								description:
									'Explore how digital technologies are reshaping industries and creating new opportunities for growth and innovation.',
								kind: 'Featured',
								state: 'Published',
								image: { public_id: '/demo/digital-innovation-01.webp', display_name: 'Digital Innovation' },
								date: new Date('2025-01-15').toISOString(),
							}),
							createDemoPost('featured', {
								id: 'post-sustainable-design',
								name: 'Sustainable Design',
								title: 'Building a Sustainable Future Through Thoughtful Design',
								description:
									'How designers and architects are integrating sustainability into their creative processes.',
								kind: 'Featured',
								state: 'Published',
								image: { public_id: '/demo/architecture-design-01.jpg', display_name: 'Sustainable Architecture' },
								date: new Date('2025-01-10').toISOString(),
							}),
						],
					},
					{
						id: 'sg-featured-february',
						name: 'February',
						items: [
							createDemoPost('featured', {
								id: 'post-community-impact',
								name: 'Community Impact',
								title: 'Creating Meaningful Impact Through Community Engagement',
								description: 'Case studies of organizations making real differences in their local communities.',
								kind: 'Featured',
								state: 'Published',
								image: { public_id: '/demo/community-engagement-01.jpg', display_name: 'Community Engagement' },
								date: new Date('2025-02-05').toISOString(),
							}),
						],
					},
				],
			},
		],
		design: [
			{
				id: 'grp-design-digital',
				name: 'Digital Design',
				sub_groups: [
					{
						id: 'sg-design-ui-ux',
						name: 'UI/UX Trends',
						items: [
							createDemoPost('design', {
								id: 'post-ux-2025',
								name: 'UX Trends 2025',
								title: 'User Experience Trends Defining Digital Design in 2025',
								description:
									'From adaptive interfaces to AI-driven personalization, discover the UX innovations shaping the digital landscape.',
								kind: 'Tutorial',
								state: 'Published',
								image: { public_id: '/demo/digital-interface-01.png', display_name: 'Digital Interface' },
								date: new Date('2025-01-20').toISOString(),
							}),
							createDemoPost('design', {
								id: 'post-accessibility',
								name: 'Accessible Design',
								title: 'Building Inclusive Digital Experiences for Everyone',
								description:
									'Technical guide on implementing WCAG standards and creating truly accessible interfaces.',
								kind: 'Guide',
								state: 'Published',
								image: { public_id: '/demo/digital-interface-02.png', display_name: 'Accessibility Design' },
								date: new Date('2025-01-28').toISOString(),
							}),
						],
					},
					{
						id: 'sg-design-visual',
						name: 'Visual Systems',
						items: [
							createDemoPost('design', {
								id: 'post-color-psychology',
								name: 'Color Psychology',
								title: 'The Psychology Behind Color Choices in Design',
								description: 'Understanding how colors influence user perception and behavior in digital products.',
								kind: 'Analysis',
								state: 'Published',
								image: { public_id: '/demo/board-culture.jpg', display_name: 'Color Theory' },
								date: new Date('2025-02-01').toISOString(),
							}),
							createDemoPost('design', {
								id: 'post-typography',
								name: 'Typography Mastery',
								title: 'Font Selection and Typography That Elevates Your Design',
								description:
									'Deep dive into choosing and pairing typefaces for optimal readability and aesthetic impact.',
								kind: 'Guide',
								state: 'Draft',
								image: { public_id: '/demo/digital-interface-01.png', display_name: 'Typography' },
								date: new Date('2025-02-10').toISOString(),
							}),
						],
					},
				],
			},
			{
				id: 'grp-design-print',
				name: 'Print & Branding',
				sub_groups: [
					{
						id: 'sg-design-branding',
						name: 'Brand Strategy',
						items: [
							createDemoPost('design', {
								id: 'post-brand-identity',
								name: 'Brand Identity Development',
								title: 'Creating a Cohesive Brand Identity Across All Touchpoints',
								description: 'Strategic framework for building recognizable and memorable brands.',
								kind: 'Case Study',
								state: 'Published',
								image: { public_id: '/demo/fashion-exhibition-01.jpg', display_name: 'Brand Identity' },
								date: new Date('2025-01-25').toISOString(),
							}),
						],
					},
				],
			},
		],
		culture: [
			{
				id: 'grp-culture-exhibitions',
				name: 'Exhibitions & Events',
				sub_groups: [
					{
						id: 'sg-culture-current',
						name: 'Current Shows',
						items: [
							createDemoPost('culture', {
								id: 'post-installation-art',
								name: 'Installation Art Showcase',
								title: 'Immersive Installations Pushing Artistic Boundaries',
								description:
									'Curated collection of contemporary installations exploring space, light, and viewer interaction.',
								kind: 'Exhibition',
								state: 'Published',
								image: { public_id: '/demo/installation-art-01.jpg', display_name: 'Installation Art' },
								date: new Date('2025-02-15').toISOString(),
							}),
							createDemoPost('culture', {
								id: 'post-fashion-week',
								name: 'Fashion Week Coverage',
								title: "This Season's Fashion: Innovation Meets Tradition",
								description: 'Comprehensive coverage of emerging designers and trendsetting collections.',
								kind: 'Exhibition',
								state: 'Published',
								image: { public_id: '/demo/fashion-exhibition-01.jpg', display_name: 'Fashion Exhibition' },
								date: new Date('2025-02-12').toISOString(),
							}),
						],
					},
					{
						id: 'sg-culture-past',
						name: 'Past Exhibitions',
						items: [
							createDemoPost('culture', {
								id: 'post-retrospective',
								name: 'Annual Retrospective 2024',
								title: 'Reflecting on Cultural Highlights from 2024',
								description: 'A look back at the most significant cultural moments and exhibitions of the past year.',
								kind: 'Feature',
								state: 'Published',
								image: { public_id: '/demo/installation-art-01.jpg', display_name: 'Retrospective' },
								date: new Date('2025-01-05').toISOString(),
							}),
						],
					},
				],
			},
			{
				id: 'grp-culture-interviews',
				name: 'Interviews & Profiles',
				sub_groups: [
					{
						id: 'sg-culture-artists',
						name: 'Artist Profiles',
						items: [
							createDemoPost('culture', {
								id: 'post-artist-interview',
								name: 'In Conversation: Contemporary Artists',
								title: 'Dialogue with Leading Voices in Contemporary Art',
								description: 'Exclusive interviews with artists discussing their practice, inspiration, and vision.',
								kind: 'Interview',
								state: 'Published',
								image: { public_id: '/demo/digital-innovation-01.webp', display_name: 'Artist Profile' },
								date: new Date('2025-02-08').toISOString(),
							}),
						],
					},
				],
			},
		],
		insights: [
			{
				id: 'grp-insights-analysis',
				name: 'Trend Analysis',
				sub_groups: [
					{
						id: 'sg-insights-industry',
						name: 'Industry Reports',
						items: [
							createDemoPost('insights', {
								id: 'post-market-analysis',
								name: 'Q1 2025 Market Analysis',
								title: 'Key Insights: Market Trends and Economic Indicators',
								description:
									'Detailed analysis of emerging market trends, consumer behavior shifts, and economic forecasts.',
								kind: 'Analysis',
								state: 'Published',
								image: { public_id: '/demo/digital-interface-01.png', display_name: 'Market Analysis' },
								date: new Date('2025-02-03').toISOString(),
							}),
							createDemoPost('insights', {
								id: 'post-tech-forecast',
								name: 'Technology Forecast',
								title: "What's Next: Technology Predictions for 2025",
								description:
									'Expert perspective on AI, quantum computing, renewable energy, and emerging technologies.',
								kind: 'Forecast',
								state: 'Published',
								image: { public_id: '/demo/digital-innovation-01.webp', display_name: 'Tech Forecast' },
								date: new Date('2025-01-30').toISOString(),
							}),
						],
					},
					{
						id: 'sg-insights-thought',
						name: 'Thought Leadership',
						items: [
							createDemoPost('insights', {
								id: 'post-future-work',
								name: 'The Future of Work',
								title: 'Reimagining Work: Remote, Hybrid, and Beyond',
								description:
									'Exploring organizational transformation, employee wellbeing, and the evolving workplace.',
								kind: 'Opinion',
								state: 'Published',
								image: { public_id: '/demo/digital-interface-02.png', display_name: 'Future of Work' },
								date: new Date('2025-02-06').toISOString(),
							}),
						],
					},
				],
			},
		],
		resources: [
			{
				id: 'grp-resources-guides',
				name: 'Guides & Tutorials',
				sub_groups: [
					{
						id: 'sg-resources-technical',
						name: 'Technical Guides',
						items: [
							createDemoPost('resources', {
								id: 'post-web-performance',
								name: 'Web Performance Optimization',
								title: 'Complete Guide to Building Fast, Responsive Websites',
								description:
									'Technical deep-dive on optimization techniques, Core Web Vitals, and performance metrics.',
								kind: 'Technical',
								state: 'Published',
								image: { public_id: '/demo/digital-interface-01.png', display_name: 'Performance Guide' },
								date: new Date('2025-01-18').toISOString(),
							}),
							createDemoPost('resources', {
								id: 'post-security-best',
								name: 'Security Best Practices',
								title: 'Securing Your Digital Assets: A Comprehensive Checklist',
								description: 'Essential security practices for protecting data, systems, and user information.',
								kind: 'Guide',
								state: 'Published',
								image: { public_id: '/demo/digital-interface-02.png', display_name: 'Security Guide' },
								date: new Date('2025-02-02').toISOString(),
							}),
						],
					},
					{
						id: 'sg-resources-tools',
						name: 'Tools & Resources',
						items: [
							createDemoPost('resources', {
								id: 'post-design-tools',
								name: "Designer's Toolkit 2025",
								title: 'Essential Tools and Resources for Modern Designers',
								description: 'Curated collection of software, plugins, and assets to enhance your design workflow.',
								kind: 'Resource',
								state: 'Draft',
								image: { public_id: '/demo/board-culture.jpg', display_name: 'Design Tools' },
								date: new Date('2025-02-11').toISOString(),
							}),
						],
					},
				],
			},
		],
	} as Record<string, any[]>,
	home: [
		{ section: 'hero', public_id: '/demo/digital-innovation-01.webp', display_name: 'Hero - Digital Innovation' },
		{ section: 'featured', public_id: '/demo/architecture-design-01.jpg', display_name: 'Featured Stories' },
		{ section: 'insights', public_id: '/demo/installation-art-01.jpg', display_name: 'Latest Insights' },
		{ section: 'contact', public_id: '/demo/board-culture.jpg', display_name: 'Get In Touch' },
	],
	advisory: {
		id: 'advisory-demo',
		about: 'Our editorial advisory brings together industry leaders, researchers, and practitioners to guide content quality and ensure relevance.',
		services: 'Content Strategy\nEditorial Services\nThought Leadership Program',
		image: { public_id: '/demo/board-culture.jpg', display_name: 'Editorial Advisory Board' },
	},
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const findPostInSidebar = (id: string) => {
	for (const groups of Object.values(demoStore.sidebar)) {
		for (const group of groups) {
			for (const subGroup of group.sub_groups) {
				const post = subGroup.items.find((item: any) => item.id === id || item._id === id);
				if (post) return post;
			}
		}
	}

	return null;
};

export default async (path: string, options?: Omit<RequestInit, 'body'> & { body?: any }) => {
	const method = (options?.method ?? 'GET').toUpperCase();
	const body = options?.body ?? {};

	const sidebarGetMatch = path.match(/^\/sidebar\/([^/]+)$/);
	if (method === 'GET' && sidebarGetMatch) {
		const section = sidebarGetMatch[1];
		return {
			success: 1,
			data: clone(demoStore.sidebar[section] ?? []),
			message: 'Demo mode: sidebar groups loaded.',
		} as ApiRes;
	}

	const sidebarCreateGroupMatch = path.match(/^\/sidebar\/([^/]+)\/group\/id$/);
	if (method === 'POST' && sidebarCreateGroupMatch) {
		const section = sidebarCreateGroupMatch[1];
		const group = { id: createId(), name: body.name ?? 'New Group', sub_groups: [] };
		demoStore.sidebar[section] ??= [];
		demoStore.sidebar[section].push(group);
		return { success: 1, data: clone(group), message: 'Demo mode: group created.' } as ApiRes;
	}

	const sidebarCreateSubGroupMatch = path.match(/^\/sidebar\/([^/]+)\/subgroup\/id$/);
	if (method === 'POST' && sidebarCreateSubGroupMatch) {
		const section = sidebarCreateSubGroupMatch[1];
		const groups = demoStore.sidebar[section] ?? [];
		const group = groups.find((g: any) => g.id === body.group?.id);
		if (!group) return { success: 0, data: null, message: 'Group not found.' } as ApiRes;
		const subGroup = { id: createId(), name: body.name ?? 'New Subgroup', items: [] };
		group.sub_groups.push(subGroup);
		return { success: 1, data: clone(subGroup), message: 'Demo mode: subgroup created.' } as ApiRes;
	}

	const sidebarCreatePostMatch = path.match(/^\/sidebar\/([^/]+)\/id$/);
	if (method === 'POST' && sidebarCreatePostMatch) {
		const section = sidebarCreatePostMatch[1];
		const groups = demoStore.sidebar[section] ?? [];
		const group = groups.find((g: any) => g.id === body.group?.id);
		const subGroup = group?.sub_groups.find((s: any) => s.id === body.sub_group?.id);
		if (!subGroup) return { success: 0, data: null, message: 'Subgroup not found.' } as ApiRes;
		const post = createDemoPost(section, {
			name: body.name,
			group: { _id: group.id, name: group.name },
			sub_group: { _id: subGroup.id, name: subGroup.name },
		});
		subGroup.items.push(post);
		return { success: 1, data: clone(post), message: 'Demo mode: post created.' } as ApiRes;
	}

	const sidebarRenameGroupMatch = path.match(/^\/sidebar\/([^/]+)\/group\/([^/]+)$/);
	if (method === 'PATCH' && sidebarRenameGroupMatch) {
		const section = sidebarRenameGroupMatch[1];
		const groupId = sidebarRenameGroupMatch[2];
		const group = (demoStore.sidebar[section] ?? []).find((g: any) => g.id === groupId);
		if (group) group.name = body.name ?? group.name;
		return { success: 1, data: clone(group), message: 'Demo mode: group updated.' } as ApiRes;
	}

	const sidebarRenameSubGroupMatch = path.match(/^\/sidebar\/([^/]+)\/subgroup\/([^/]+)$/);
	if (method === 'PATCH' && sidebarRenameSubGroupMatch) {
		const section = sidebarRenameSubGroupMatch[1];
		const subGroupId = sidebarRenameSubGroupMatch[2];
		for (const group of demoStore.sidebar[section] ?? []) {
			const subGroup = group.sub_groups.find((s: any) => s.id === subGroupId);
			if (subGroup) {
				subGroup.name = body.name ?? subGroup.name;
				return {
					success: 1,
					data: clone(subGroup),
					message: 'Demo mode: subgroup updated.',
				} as ApiRes;
			}
		}
	}

	const sidebarRenamePostMatch = path.match(/^\/sidebar\/([^/]+)\/([^/]+)$/);
	if (method === 'PATCH' && sidebarRenamePostMatch) {
		const postId = sidebarRenamePostMatch[2];
		const post = findPostInSidebar(postId);
		if (post) post.name = body.name ?? post.name;
		return { success: 1, data: clone(post), message: 'Demo mode: post updated.' } as ApiRes;
	}

	const sidebarDeleteGroupMatch = path.match(/^\/sidebar\/([^/]+)\/group\/([^/]+)$/);
	if (method === 'DELETE' && sidebarDeleteGroupMatch) {
		const section = sidebarDeleteGroupMatch[1];
		const groupId = sidebarDeleteGroupMatch[2];
		demoStore.sidebar[section] = (demoStore.sidebar[section] ?? []).filter((group: any) => group.id !== groupId);
		return { success: 1, data: null, message: 'Demo mode: group deleted.' } as ApiRes;
	}

	const sidebarDeleteSubGroupMatch = path.match(/^\/sidebar\/([^/]+)\/subgroup\/([^/]+)$/);
	if (method === 'DELETE' && sidebarDeleteSubGroupMatch) {
		const section = sidebarDeleteSubGroupMatch[1];
		const subGroupId = sidebarDeleteSubGroupMatch[2];
		for (const group of demoStore.sidebar[section] ?? []) {
			group.sub_groups = group.sub_groups.filter((subGroup: any) => subGroup.id !== subGroupId);
		}
		return { success: 1, data: null, message: 'Demo mode: subgroup deleted.' } as ApiRes;
	}

	const sidebarDeletePostMatch = path.match(/^\/sidebar\/([^/]+)\/([^/]+)$/);
	if (method === 'DELETE' && sidebarDeletePostMatch) {
		const section = sidebarDeletePostMatch[1];
		const postId = sidebarDeletePostMatch[2];
		for (const group of demoStore.sidebar[section] ?? []) {
			for (const subGroup of group.sub_groups) {
				subGroup.items = subGroup.items.filter((item: any) => item.id !== postId && item._id !== postId);
			}
		}
		return { success: 1, data: null, message: 'Demo mode: post deleted.' } as ApiRes;
	}

	const insetGetPostMatch = path.match(/^\/inset\/([^/]+)\/([^/]+)$/);
	if (method === 'GET' && insetGetPostMatch) {
		const section = insetGetPostMatch[1];
		const postId = insetGetPostMatch[2];
		const existing = findPostInSidebar(postId);
		const post =
			existing ??
			createDemoPost(section, {
				id: postId,
				_id: postId,
				name: `Demo ${section} post`,
			});
		return {
			success: 1,
			data: clone(post),
			message: 'Demo mode: post loaded.',
		} as ApiRes;
	}

	const insetUpdateImageMatch = path.match(/^\/inset\/([^/]+)\/([^/]+)\/image$/);
	if (method === 'PATCH' && insetUpdateImageMatch) {
		const postId = insetUpdateImageMatch[2];
		const post = findPostInSidebar(postId);
		const updatedImage = {
			public_id: `demo-image-${postId}`,
			display_name: body.display_name ?? 'demo-image',
		};
		if (post) post.image = updatedImage;
		return {
			success: 1,
			data: clone(updatedImage),
			message: 'Demo mode: image updated.',
		} as ApiRes;
	}

	const insetUpdatePostMatch = path.match(/^\/inset\/([^/]+)\/([^/]+)\/post$/);
	if (method === 'PATCH' && insetUpdatePostMatch) {
		const postId = insetUpdatePostMatch[2];
		const post = findPostInSidebar(postId);
		if (post) Object.assign(post, body);
		return {
			success: 1,
			data: clone(post ?? body),
			message: 'Demo mode: post updated.',
		} as ApiRes;
	}

	if (method === 'GET' && path === '/inset/home') {
		return { success: 1, data: clone(demoStore.home), message: 'Demo mode: home images loaded.' } as ApiRes;
	}

	const homeImageMatch = path.match(/^\/inset\/home\/([^/]+)\/image$/);
	if (method === 'PATCH' && homeImageMatch) {
		const section = homeImageMatch[1];
		const current = demoStore.home.find(item => item.section === section);
		const updated = {
			section,
			public_id: current?.public_id ?? 'sample',
			display_name: body.display_name ?? current?.display_name ?? `${section}-image`,
		};
		demoStore.home = demoStore.home.map(item => (item.section === section ? updated : item));
		return { success: 1, data: clone(updated), message: 'Demo mode: home image updated.' } as ApiRes;
	}

	if (method === 'GET' && path === '/inset/advisory') {
		return {
			success: 1,
			data: clone(demoStore.advisory),
			message: 'Demo mode: advisory data loaded.',
		} as ApiRes;
	}

	if (method === 'PATCH' && path === '/inset/advisory') {
		demoStore.advisory = {
			...demoStore.advisory,
			...body,
		};
		return { success: 1, data: clone(demoStore.advisory), message: 'Demo mode: advisory updated.' } as ApiRes;
	}

	if (method === 'PATCH' && path === '/inset/advisory/image') {
		demoStore.advisory.image = {
			public_id: body.public_id ?? demoStore.advisory.image.public_id,
			display_name: body.display_name ?? demoStore.advisory.image.display_name,
		};
		return {
			success: 1,
			data: clone(demoStore.advisory.image),
			message: 'Demo mode: advisory image updated.',
		} as ApiRes;
	}

	if (method === 'POST' && path === '/auth/admin') {
		const isValid = !!body?.username?.trim?.() && !!body?.secretToken?.trim?.();
		return {
			success: isValid ? 1 : 0,
			data: { authorized: isValid },
			message: isValid ? 'Demo mode: access granted.' : 'Demo mode: missing credentials.',
		} as ApiRes;
	}

	return {
		success: 1,
		data: clone(body ?? null),
		message: `Demo mode: ${method} ${path} simulated locally.`,
	} as ApiRes;
};

export type ApiRes<T = any> = { success: 0 | 1; data: T; message: string };
