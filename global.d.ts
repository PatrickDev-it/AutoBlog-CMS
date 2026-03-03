import { Connection, Mongoose } from 'mongoose';
import { v2 as Cloudinary } from 'cloudinary';
import type { Env } from './env';

declare global {
	// process.env
	namespace NodeJS {
		interface ProcessEnv {
			MONGODB_URI: string;
			DBNAME: string;
		}
	}

	var db: (args?: {
		MONGODB_URI: string;
		DBNAME: string;
		newConnection?: boolean;
	}) => Promise<Connection>;
	var mongoose: Mongoose;
	var connection: Connection;

	var cloudinary: typeof Cloudinary;
}

export {};
