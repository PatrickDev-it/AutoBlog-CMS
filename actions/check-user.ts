"use server";

import apiFetch from "@/utils/api-fetch";

export default async (username: string, secretToken: string) =>
	await apiFetch("/auth/admin", {
		method: "POST",
		body: { username, secretToken },
	});
