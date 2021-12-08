import {connectAuth} from "./connect-firebase-auth-compat";
import {connectFirestore} from "./connect-firestore-compat";

export const auth = connectAuth();
export const db = connectFirestore();
