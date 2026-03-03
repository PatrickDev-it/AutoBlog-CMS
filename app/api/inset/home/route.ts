import _try from '@/utils/_try';
import cloudinary from '@/lib/cloudinary';
import { sections } from '@/constants/sections';
import { env } from 'node:process';

export const GET = async () =>
	await _try(async () => {
		return await Promise.all(
			sections.map(async section => {
				const {
					resources: [image],
				} = await cloudinary.search
					.expression(
						`folder:${env.CLOUDINARY_WEBSITE_FOLDER}/home/${section}`
					)
					.max_results(1) // Filtra per cartella
					.execute();

				return { section, ...image };
			})
		);
	});
