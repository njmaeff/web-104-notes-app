import {addUserByEmail, connectFirebaseAdmin,} from "./connect-admin";
import {
    CollectionReference,
    DocumentReference,
    getFirestore,
} from "firebase-admin/firestore";
import {testEmail, testPassword} from "./setup";
import type {NoteDocument} from "../pages/app-notes/lib/note";
import faker from "faker"

faker.seed(19);

const seed = async () => {
    connectFirebaseAdmin();
    try {
        const user = await addUserByEmail(testEmail, testPassword, {
            displayName: "Test User",
        });
        const db = getFirestore();
        const userCollection = db.collection(`users`);

        const getTimestamp = () => faker.date.recent(30).getTime()
        // create employers
        const notes: NoteDocument[] = [
            {
                noteContent: "do the laundry",
                status: "todo",
                timestamp: getTimestamp()
            },
            {
                noteContent: "buy groceries",
                status: "todo",
                timestamp: getTimestamp()
            },
            {
                noteContent: "cut the grass",
                status: "complete",
                timestamp: getTimestamp()
            },
            {
                noteContent: "organize photos",
                status: "in-progress",
                timestamp: getTimestamp()
            }

        ]

        const userPath = userCollection.doc(user.uid);
        const notesPath = userPath.collection("notes");

        await createDocsFromData(notesPath, notes);

    } catch (e) {
        console.error(e);
    }
};

if (require.main) {
    seed().catch((e) => console.error(e));
}

export const createDocsFromData = <T extends any[]>(
    collection: CollectionReference,
    docs: T
): Promise<DocumentReference[]> => {
    return Promise.all(
        docs.map(async (doc) => {
            const docRef = collection.doc();
            await docRef.create(doc);
            return docRef;
        })
    );
};

export const mapEachDoc = async (
    docs: DocumentReference[],
    fn: (docRef: DocumentReference) => Promise<DocumentReference[]>
) => {
    return (await Promise.all(docs.map((doc) => fn(doc))))[0];
};
