export default async ({ kind, tags, paths }: { kind: 'tags' | 'paths'; tags?: string[]; paths?: string[] }) => {
	if (kind === 'tags' && (!tags || !tags.some(tag => tag.trim().length))) return;
	if (kind === 'paths' && (!paths || !paths.some(path => path.trim().length))) return;

	const value = (kind === 'paths' ? paths : tags).filter(path => path.trim().length);

	return {
		success: 1,
		message: `Demo mode: revalidate ${kind} skipped.`,
		data: { [kind]: value },
	};
};
