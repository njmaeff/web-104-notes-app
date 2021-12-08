import {getFirestore} from "firebase-admin/firestore";
import {testEmail} from "./setup";
import {connectFirebaseAdmin, removeUserByEmail} from "./connect-admin";

export async function clearFirestoreData(
    subCollections?: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>[]
) {
    const db = getFirestore();
    const collections = subCollections ?? (await db.listCollections());
    for (const coll of collections) {
        // Get a new write batch
        const batch = db.batch();
        const documents = await coll.listDocuments();

        for (const doc of documents) {
            await clearFirestoreData(await doc.listCollections());
            batch.delete(doc);
        }
        await batch.commit();
    }
    return;
}

export const clean = async () => {
    connectFirebaseAdmin();
    await clearFirestoreData();
    await removeUserByEmail(testEmail);
};

if (require.main) {
    clean().catch((e) => console.error(e));
}
