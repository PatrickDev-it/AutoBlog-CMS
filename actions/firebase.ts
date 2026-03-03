const app = { mode: 'demo' };
const auth = { mode: 'demo' };

async function signInWithGoogle() {
	return {
		user: {
			uid: 'demo-user',
			email: 'demo.user@example.com',
			displayName: 'Demo User',
		},
		credential: null,
	};
}

export { app, auth, signInWithGoogle };
