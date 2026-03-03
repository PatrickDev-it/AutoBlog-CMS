export default async function Page({ params }: { params: Promise<{ section: string }> }) {
	const { section } = await params;
	return (
		<div className="flex size-full ">
			<h2 className="text-xl font-semibold m-auto">
				Select the {section} you want to edit
			</h2>
		</div>
	);
}
