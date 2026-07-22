import { getEditorialService } from '@/src/modules/editorial/service';
import { MediaCleanupWorker } from '@/src/modules/media/cleanup-worker';
import { DatabaseMediaProvider } from '@/src/modules/media/database-provider';
import { authorizeJobRunner } from '@/src/platform/auth/job-runner';
import { dataResponse, withApi } from '@/src/platform/observability/api';
import { getDatabase } from '@/src/platform/db/client';

export async function POST(request: Request): Promise<Response> {
	return withApi(async () => {
		await authorizeJobRunner(request);
		const publication = await getEditorialService().runDueJobs();
		const database = getDatabase();
		const media = await new MediaCleanupWorker(database, new DatabaseMediaProvider(database)).run();
		return dataResponse({ publication, media });
	})(request);
}
