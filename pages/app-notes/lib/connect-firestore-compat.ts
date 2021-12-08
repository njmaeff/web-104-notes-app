import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export const connectFirestore = ({
                                     apiKey = process.env.FIREBASE_API_KEY,
                                     projectId = process.env.FIREBASE_PROJECT_ID,
                                     authDomain = process.env.FIREBASE_AUTH_DOMAIN,
                                     emulatorHost = process.env.FIRESTORE_EMULATOR_HOST,
                                 } = {}) => {
    if (!firebase.apps.length) {
        firebase.initializeApp({
            apiKey,
            authDomain,
            projectId,
        });
    }

    const firestore = firebase.firestore();
    if (!!emulatorHost) {
        const url = new URL(`http://${emulatorHost}`);
        firestore.useEmulator(url.hostname, parseInt(url.port));
    }
    return firestore;
};
