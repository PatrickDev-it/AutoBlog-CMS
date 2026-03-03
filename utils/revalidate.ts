export default async ({
	kind,
	tags,
	paths,
}: {
	kind: 'tags' | 'paths';
	tags?: string[];
	paths?: string[];
}) => {
	if (kind === 'tags' && (!tags || !tags.some(tag => tag.trim().length))) return;
	if (kind === 'paths' && (!paths || !paths.some(path => path.trim().length))) return;

	let value = (kind === 'paths' ? paths : tags).filter(path => path.trim().length);

	if (kind === 'paths')
		value = value.map(path => {
			if (path.startsWith('/')) path = path.slice(1);
			return path;
		});

	return await fetch(`https://beatricetullii.com/api/revalidate/${kind}`, {
		method: 'PATCH',
		body: JSON.stringify({ [kind]: value }),
	});
};
