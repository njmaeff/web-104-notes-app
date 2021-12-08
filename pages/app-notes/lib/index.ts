import {Note, NoteDocument, NoteStatus} from "./note";
import {auth, db} from "./connect";
import {FirestoreProvider} from "./firestore-provider-compat";

export class NoteApp {
    static attachToDom() {
        const app = new NoteApp();

        document.getElementById("post-button").addEventListener("click", () => {
            // render and save the note on button click
            app.addNote().catch((e) => console.error(e));
        });

        document.getElementById('logout-button').addEventListener("click", () => {
            signOutUser();
        });

        // load saved blogs
        window.addEventListener("load", () => {

            auth.onAuthStateChanged(user => {
                if (user) {
                    app.loadSavedNotes().catch((e) => console.error(e));
                } else {
                    signOutUser()
                }
            });
        });
    }

    async addNote() {
        const note = this.createNoteFromInputs();
        // render and save the note on button click
        note.Render({
            onEdit: (note) => this.saveNote(note),
            onDelete: (note) => this.deleteNote(note),
        });

        await this.saveNote(note.toDocument());
    }

    async loadSavedNotes() {
        const docs = await this.db.readFromCollection();
        docs.forEach((doc) => {
            const storedNote = doc;
            const note = new Note(storedNote.noteContent, {
                id: parseInt(storedNote.id),
                status: storedNote.status,
                moveOpts: {
                    onMouseUp: this.onNoteMoveComplete,
                },
            });
            note.Render({
                onEdit: (note) => this.saveNote(note),
                onDelete: (note) => this.deleteNote(note),
            });

            this.getLaneForStatus(note).appendChild(note.container);
        });
    }

    private async saveNote(note: NoteDocument) {
        return this.db.write(note);
    }

    private createNoteFromInputs() {
        const content = this.contentElement.value;

        // clear inputs
        this.contentElement.value = "";

        const note = new Note(content, {
            moveOpts: {
                onMouseUp: this.onNoteMoveComplete,
            },
        });

        this.getLaneForStatus(note).appendChild(note.container);
        return note;
    }

    private async deleteNote(note: NoteDocument) {
        return this.db.deleteDoc(note.id);
    }

    /**
     * callback for when a note move is complete. We will calculate the
     * position of the note relative to the note lanes and update the
     * positioning and styles of the target
     * @param e
     * @param note - the current note being moved
     */
    private onNoteMoveComplete = (e: MouseEvent, note: Note) => {
        // get geometry of lanes and note
        const todoRightBoundary = this.todoLane.getBoundingClientRect().right;
        const inProgressRightBoundary =
            this.inProgressLane.getBoundingClientRect().right;
        const noteRect = note.container.getBoundingClientRect();

        const noteCenterLine =
            (noteRect.right - noteRect.left) / 2 + noteRect.left;

        // if left of in-progress
        if (noteCenterLine < todoRightBoundary && note.status !== "todo") {
            this.changeNoteLane(note, "todo");
        }
        // if within in-progress
        else if (
            noteCenterLine > todoRightBoundary &&
            noteCenterLine < inProgressRightBoundary &&
            note.status !== "in-progress"
        ) {
            this.changeNoteLane(note, "in-progress");
        }
        // if right of in-progress
        else if (
            noteCenterLine > inProgressRightBoundary &&
            note.status !== "complete"
        ) {
            this.changeNoteLane(note, "complete");
        }

        // reset note positioning so it works with the flex box
        note.updatePosition({
            position: "static",
            height: "auto",
            width: "100%",
            top: "auto",
            left: "auto",
        });
    };

    private changeNoteLane(note: Note, newStatus: NoteStatus) {
        // remove note from current lane
        const currentLane = this.getLaneForStatus(note);
        currentLane.removeChild(note.container);

        // update status and add note to new lane
        note.status = newStatus;
        const nextLane = this.getLaneForStatus(note);
        nextLane.appendChild(note.container);

        // focus on the note content in case in edit mode
        note.noteElement.focus();

        // save back to the database with updated status
        this.saveNote(note.toDocument()).catch((e) => console.error(e));
    }

    private getLaneForStatus(note: Note) {
        switch (note.status) {
            case "todo":
                return this.todoLane;
            case "in-progress":
                return this.inProgressLane;
            case "complete":
                return this.completeLane;
        }
    }

    constructor() {
        this.db = new FirestoreProvider(db, () => ['users', auth.currentUser.uid, 'notes']);
    }

    // our reference to the firebase api
    private readonly db: FirestoreProvider<NoteDocument>;

    // this is our content input
    private readonly contentElement: HTMLInputElement =
        document.querySelector("#noteContent");

    // references to the lanes
    private readonly todoLane: HTMLDivElement = document.querySelector("#todo");
    private readonly inProgressLane: HTMLDivElement =
        document.querySelector("#in-progress");
    private readonly completeLane: HTMLDivElement =
        document.querySelector("#complete");
}

const signOutUser = () => auth.signOut()
    .then(() => window.location.href = 'index.html')
    .catch((e) => console.error(e))
