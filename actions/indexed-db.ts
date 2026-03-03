'use client';

export const openDatabase = (dbName: string, storeName: string, version = 1): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		if (typeof window === 'undefined') {
			reject('IndexedDB non è supportato lato server.');
			return;
		}

		const request = indexedDB.open(dbName, version);

		request.onupgradeneeded = event => {
			if (!event.target) return;
			// @ts-ignore
			const db = (event.target as IDBOpenDBRequest).result;

			// Crea un oggetto di memorizzazione (store) se non esiste
			if (!db.objectStoreNames.contains(storeName)) {
				db.createObjectStore(storeName, { autoIncrement: true });
			}
		};

		request.onsuccess = event => {
			if (!event.target) return;
			resolve((event.target as IDBOpenDBRequest).result);
		};

		request.onerror = event => {
			// @ts-ignore
			reject(`Errore nell'apertura del database: ${event.target.error}`);
		};
	});
};

export const putItem = async (dbName: string, storeName: string, key: string, item: any) => {
	const db = await openDatabase(dbName, storeName);

	const transaction = db.transaction(storeName, 'readwrite');
	const store = transaction.objectStore(storeName);

	const request = store.put(item, key);

	request.onsuccess = event => {
		if (!event.target) return;
		return (event.target as IDBRequest).result;
	};

	request.onerror = event => {
		// @ts-ignore
		throw new Error(`Errore nell'aggiunta dell'elemento: ${event.target.error}`);
	};
};

export const getItem = async (dbName: string, storeName: string, itemKey: string) => {
	const db = await openDatabase(dbName, storeName);

	return await new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, 'readonly');
		const store = transaction.objectStore(storeName);

		const request = store.get(itemKey);

		request.onsuccess = event => {
			if (!event.target) return;
			resolve((event.target as IDBRequest).result);
		};

		request.onerror = event => {
			// @ts-ignore
			reject(`Errore nel recupero degli elementi: ${event.target.error}`);
		};
	});
};

export const deleteItem = async (dbName: string, storeName: string, itemKey: string) => {
	const db = await openDatabase(dbName, storeName);

	return await new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, 'readwrite');
		const store = transaction.objectStore(storeName);

		const request = store.delete(itemKey);

		request.onsuccess = event => {
			if (!event.target) return;
			resolve((event.target as IDBRequest).result);
		};

		request.onerror = event => {
			// @ts-ignore
			reject(`Errore nel recupero degli elementi: ${event.target.error}`);
		};
	});
};
