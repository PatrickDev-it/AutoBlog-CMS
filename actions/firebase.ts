// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyAKjbCJsU_3A7SSIxQSbruZ71n6RK0gGlM',
	authDomain: 'bt-art-advisory.firebaseapp.com',
	projectId: 'bt-art-advisory',
	storageBucket: 'bt-art-advisory.firebasestorage.app',
	messagingSenderId: '865298299217',
	appId: '1:865298299217:web:c832a104bc0593982d3b70',
	measurementId: 'G-7Z9HZ2SSHN',
};

// Initialize Firebase

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// const db = getFirestore();
const provider = new GoogleAuthProvider();

async function signInWithGoogle() {
	try {
		return await signInWithPopup(auth, provider);

		// const result = await signInWithPopup(auth, provider);
		// const googleEmail = result.user.email;

		// // Recupera l'email salvata nel database
		// const userDoc = await getDoc(doc(db, 'users', result.user.uid));

		// if (userDoc.exists()) {
		// 	const registeredEmail = userDoc.data().email;

		// 	if (googleEmail === registeredEmail) {
		// 		console.log('Accesso consentito');
		// 	} else {
		// 		console.error('Email non corrisponde. Accesso negato.');
		// 	}
		// } else {
		// 	console.error('Utente non trovato nel database.');
		// }
	} catch (error) {
		console.error("Errore nell'accesso con Google:", error.message);
	}
}

export { app, auth, signInWithGoogle };
