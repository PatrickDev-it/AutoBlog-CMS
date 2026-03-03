export default async function _try<R extends () => any>(
	action: R,
	on = {
		success: (data: Awaited<ReturnType<R>>): any => Response.json({ success: 1, data }),
		error: ({ cause, message, stack }: Error) => {
			console.error(
				`| Cause => ${cause}\n| Error message in MIDDLE handlers => ${message}\n`,
				`\n| Stack => ${stack}`
			);

			return Response.json({ success: 0, message });
		},
	}
) {
	try {
		return on.success(await action());
	} catch (error) {
		return on.error(error as Error);
	}
}
