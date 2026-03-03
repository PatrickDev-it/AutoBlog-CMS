import _try from '@/utils/_try';
import cloudinary from '@/lib/cloudinary';
import { env } from 'node:process';

export const PATCH = async (
	req: Request,
	{ params }: { params: Promise<{ id: string; section: string }> }
) =>
	await _try(async () => {
		const { section } = await params;
		const { base64, public_id, display_name } = await req.json();

		if (public_id) await cloudinary.uploader.destroy(public_id);

		return await cloudinary.uploader.upload(base64, {
			folder: `${env.CLOUDINARY_WEBSITE_FOLDER}/home/${section}`,
			public_id,
			display_name: display_name ?? 'main',
		});
	});
