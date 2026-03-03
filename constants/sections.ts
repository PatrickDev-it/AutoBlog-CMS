export const sections = ['featured', 'design', 'culture', 'insights', 'resources'] as const;

export const sectionLabels: Record<typeof sections[number], { title: string; description: string }> = {
	featured: {
		title: 'Featured Stories',
		description: 'Curated highlights and trending content',
	},
	design: {
		title: 'Design & Creative',
		description: 'Design trends, visual systems, and creative insights',
	},
	culture: {
		title: 'Culture & Arts',
		description: 'Cultural commentary, exhibitions, and creative discourse',
	},
	insights: {
		title: 'Insights & Analysis',
		description: 'Industry trends, research, and thought leadership',
	},
	resources: {
		title: 'Resources & Guides',
		description: 'Tutorials, guides, and tools for professional growth',
	},
};
