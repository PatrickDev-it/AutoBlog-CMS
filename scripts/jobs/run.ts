import { DrizzleEditorialRepository } from '@/src/modules/editorial/drizzle-repository';
import { MediaCleanupWorker } from '@/src/modules/media/cleanup-worker';
import { DatabaseMediaProvider } from '@/src/modules/media/database-provider';
import { getDatabase } from '@/src/platform/db/client';

const repository = new DrizzleEditorialRepository(getDatabase());
const publication = await repository.runDuePublicationJobs(new Date(), 50);
const media = await new MediaCleanupWorker(getDatabase(), new DatabaseMediaProvider(getDatabase())).run(new Date(), 50);
process.stdout.write(`${JSON.stringify({ publication, media })}\n`);
process.exitCode = publication.failed > 0 || media.failed > 0 ? 1 : 0;
