'use server';

import mongoose from 'mongoose';
import { env } from 'process';

globalThis.db = async (
	{
		MONGODB_URI,
		DBNAME,
		newConnection,
	}: { MONGODB_URI: string; DBNAME: string; newConnection?: boolean } = {
		MONGODB_URI: env.MONGODB_URI!,
		DBNAME: env.DBNAME!,
		newConnection: false,
	}
) => {
	if (newConnection) return (await mongoose.connect(MONGODB_URI)).connection.useDb(DBNAME!);

	if (!globalThis.connection) {
		// Create connection
		globalThis.mongoose = await mongoose.connect(MONGODB_URI);
		globalThis.connection = globalThis.mongoose.connection.useDb(DBNAME!);

		return globalThis.connection;
	}
	if ([0, 3, 99].some(state => state === globalThis.connection.readyState)) {
		// First close all connections
		await Promise.all(
			globalThis.mongoose.connections.map(
				async connection => await connection.close(true)
			)
		);
		await globalThis.mongoose.disconnect();

		// Then redefine the connection
		globalThis.mongoose = await mongoose.connect(MONGODB_URI);
		globalThis.connection = globalThis.mongoose.connection.useDb(DBNAME!);

		return globalThis.connection;
	}
	return globalThis.connection;
};

export default async (DBNAME?: string) =>
	await db({
		MONGODB_URI: env.MONGODB_URI!,
		DBNAME: DBNAME ?? env.DBNAME!,
		newConnection: DBNAME !== undefined,
	});
