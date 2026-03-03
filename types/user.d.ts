export type Role = {
	id: string;
	name: 'admin' | 'cooperator' | 'developer';
};
export type User = {
	id: string;
	username: string;
	email: string;
	password: string;
	role: Role;
};
