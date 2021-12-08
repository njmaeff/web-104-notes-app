import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export class FirestoreProvider<
    Doc extends firebase.firestore.DocumentData,
    QueryTypes = string
> {
    async write(
        document: Partial<Doc>
    ): Promise<firebase.firestore.DocumentReference<Doc>> {
        const docRef = this.collection.doc(this.id?.() ?? document.id);
        await docRef.set(document, { merge: true });
        return docRef as firebase.firestore.DocumentReference<Doc>;
    }

    async read(id = this.id?.()): Promise<Doc> {
        const ref = await this.collection.doc(id).get();
        return this.process(ref);
    }

    deleteDoc(id = this.id?.()) {
        return this.collection.doc(id).delete();
    }

    async readFromCollection(): Promise<Doc[]> {
        const result = await this.collection.get();
        return result.docs.map((doc) => this.process(doc));
    }

    async query<Result extends Doc>(
        ...queries: [string, firebase.firestore.WhereFilterOp, any][]
    ): Promise<Result[]> {
        const result = queries.reduce((acc, query) => {
            return acc.where(...query);
        }, this.collection);
        const snapShot = await result.get();
        return snapShot.docs.map((doc) => this.process(doc));
    }

    queryType<Result extends Doc>(
        type: QueryTypes,
        ...queries: [string, firebase.firestore.WhereFilterOp, any][]
    ): Promise<Result[]> {
        return this.query(["type", "==", type], ...queries);
    }

    /**
     * Helper to turn firestore timestamps into date objects and merge the id
     * with the document
     * @param doc
     * @private
     */
    private process(doc: firebase.firestore.DocumentSnapshot<Doc>): any {
        return { ...doc.data(), id: doc.id };
    }

    constructor(
        protected db: firebase.firestore.Firestore,
        protected paths?: () => string[],
        protected id?: () => string
    ) {}

    get collection(): firebase.firestore.CollectionReference<Doc> {
        return this.db.collection(
            this.paths().join("/")
        ) as firebase.firestore.CollectionReference<Doc>;
    }
}
