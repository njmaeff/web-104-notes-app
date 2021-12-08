import { MovableElement, MovableElementOpts } from "./movableElement";

export interface NoteDocument {
    id?: string;
    noteContent: string;
    timestamp: number;
    status: NoteStatus;
}

export type NoteEventHandler = (note: NoteDocument) => Promise<any>;

export interface NoteOpts {
    id?: number;
    status?: NoteStatus;
    moveOpts?: MovableElementOpts;
}

export type NoteStatus = "todo" | "in-progress" | "complete";

export class Note extends MovableElement implements NoteDocument {
    Render(handler: { onEdit: NoteEventHandler; onDelete: NoteEventHandler }) {
        // create content element
        const noteContent = document.createElement("P") as HTMLParagraphElement;
        noteContent.innerText = this.noteContent;

        // create a general blocker event for mousedown inside the note. Needed
        // for the content and buttons to prevent moving when clicked
        const moveBlocker = (e) => {
            e.stopPropagation();
        };

        // create an edit / save toggle button
        const editButton = document.createElement("BUTTON");
        editButton.addEventListener("mousedown", moveBlocker);
        editButton.innerText = "Edit";
        editButton.addEventListener("click", () => {
            // we use an arrow function so we can access the 'this' reference
            // on our class and save on edit.
            if (!this.isInEdit) {
                noteContent.contentEditable = "true";
                editButton.innerText = "Save";
                this.isInEdit = true;
                noteContent.focus();
                noteContent.addEventListener("mousedown", moveBlocker);
            } else {
                noteContent.contentEditable = "false";
                editButton.innerText = "Edit";
                this.isInEdit = false;
                this.noteContent = noteContent.innerText;
                noteContent.removeEventListener("mousedown", moveBlocker);
                handler
                    .onEdit(this.toDocument())
                    .catch((e) => console.error(e));
            }
        });

        // create a delete button
        const deleteButton = document.createElement("BUTTON");
        deleteButton.addEventListener("mousedown", moveBlocker);
        deleteButton.innerText = "Delete";
        deleteButton.addEventListener("click", () => {
            handler
                .onDelete(this.toDocument())
                .then(() => this.dispose())
                .catch((e) => console.error(e));
        });

        // add wrapper for control buttons
        const controlButtonsWrapper = document.createElement("DIV");
        controlButtonsWrapper.className = "note-control-buttons";
        controlButtonsWrapper.append(editButton, deleteButton);

        // add content to draggable article
        this.container.append(noteContent, controlButtonsWrapper);
        this.noteElement = noteContent;
        return this.container;
    }

    toDocument(): NoteDocument {
        return {
            noteContent: this.noteContent,
            timestamp: this.timestamp,
            id: this.id,
            status: this.status,
        };
    }

    constructor(
        public noteContent: string,
        { id, moveOpts, status = "todo" }: NoteOpts = { id: null }
    ) {
        super(document.createElement("ARTICLE"), moveOpts);

        if (!id) {
            // we generate a timestamp as the id to not conflict with other
            // saved posts. we would ideally use crypto.randomUUID() but this
            // method is not widely supported yet.
            this.timestamp = new Date().getTime();
        } else {
            this.timestamp = id;
        }
        this.id = this.timestamp.toString();
        this.status = status;
    }

    id: string;
    timestamp: number;
    status: NoteStatus;
    noteElement: HTMLParagraphElement;
    private isInEdit = false;
}
