import { DrizzleEditorialRepository } from '@/src/modules/editorial/drizzle-repository';
import { getDatabase } from '@/src/platform/db/client';

const repository = new DrizzleEditorialRepository(getDatabase());
const result = await repository.runDuePublicationJobs(new Date(), 50);
process.stdout.write(`${JSON.stringify(result)}\n`);
process.exitCode = result.failed > 0 ? 1 : 0;
