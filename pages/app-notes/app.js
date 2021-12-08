import "https://www.gstatic.com/firebasejs/9.4.0/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore-compat.js";

/**
 * Modified from https://stackoverflow.com/a/47596086/15809514
 */
class MovableElement {
  startDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    const rect = this.makeAbsolutePosition();

    this.xOffset = e.clientX - rect.left;
    this.yOffset = e.clientY - rect.top;
    window.addEventListener("mousemove", this.onDrag);
  }

  dragObject(e) {
    e.preventDefault();
    e.stopPropagation();

    this.container.style.left = toPX(e.clientX - this.xOffset);
    this.container.style.top = toPX(e.clientY - this.yOffset);
  }

  updatePosition(position) {
    Object.assign(this.container.style, position);
  }

  makeAbsolutePosition() {
    const rect = this.container.getBoundingClientRect();
    Object.assign(this.container.style, {
      position: "absolute",
      width: toPX(rect.width),
      height: toPX(rect.height),
      top: toPX(rect.top),
      left: toPX(rect.left),
    });

    return rect;
  }

  constructor(container, opts) {
    this.container = container;
    const onDragStart = (e) => this.startDrag(e);
    container.addEventListener("mousedown", onDragStart);

    const onDrag = (e) => {
      this.dragObject(e);
      // we provide an optional callback so we can manipulate the dom
      // from the calling class if needed.
      opts?.onDrag?.(e, this);
    };

    // End dragging
    const mouseMove = (e) => {
      window.removeEventListener("mousemove", onDrag);

      // optional callback when mouse is released and dragging is over.
      opts?.onMouseUp?.(e, this);
    };
    document.addEventListener("mouseup", mouseMove);

    this.onDrag = onDrag;
    this.dispose = () => {
      container.removeEventListener("mousedown", onDragStart);
      document.removeEventListener("mouseup", mouseMove);
      container.remove();
    };
  }

  xOffset = 0;
  yOffset = 0;
}

const toPX = (value) =>
  typeof value === "string" ? value + "px" : value.toString() + "px";

class Note extends MovableElement {
  Render(handler) {
    // create content element
    const noteContent = document.createElement("P");
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
        handler.onEdit(this.toDocument()).catch((e) => console.error(e));
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

  toDocument() {
    return {
      noteContent: this.noteContent,
      timestamp: this.timestamp,
      id: this.id,
      status: this.status,
    };
  }

  constructor(noteContent, { id, moveOpts, status = "todo" } = { id: null }) {
    super(document.createElement("ARTICLE"), moveOpts);
    this.noteContent = noteContent;

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

  isInEdit = false;
}

var firebase = window.firebase;

const connectAuth = ({
  apiKey = "AIzaSyCNZCrE_u2UAi7pelmN5tbXuc7wDkzib-Q",
  projectId = "web-104-app-notes-gh",
  authDomain = "web-104-app-notes-gh.firebaseapp.com",
  emulatorHost = "",
} = {}) => {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey,
      authDomain,
      projectId,
    });
  }

  const auth = firebase.auth();
  if (!!emulatorHost) {
    auth.useEmulator(`http://${emulatorHost}`);
  }
  return auth;
};

const connectFirestore = ({
  apiKey = "AIzaSyCNZCrE_u2UAi7pelmN5tbXuc7wDkzib-Q",
  projectId = "web-104-app-notes-gh",
  authDomain = "web-104-app-notes-gh.firebaseapp.com",
  emulatorHost = "",
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

const auth = connectAuth();
const db = connectFirestore();

class FirestoreProvider {
  async write(document) {
    const docRef = this.collection.doc(this.id?.() ?? document.id);
    await docRef.set(document, { merge: true });
    return docRef;
  }

  async read(id = this.id?.()) {
    const ref = await this.collection.doc(id).get();
    return this.process(ref);
  }

  deleteDoc(id = this.id?.()) {
    return this.collection.doc(id).delete();
  }

  async readFromCollection() {
    const result = await this.collection.get();
    return result.docs.map((doc) => this.process(doc));
  }

  async query(...queries) {
    const result = queries.reduce((acc, query) => {
      return acc.where(...query);
    }, this.collection);
    const snapShot = await result.get();
    return snapShot.docs.map((doc) => this.process(doc));
  }

  queryType(type, ...queries) {
    return this.query(["type", "==", type], ...queries);
  }

  /**
   * Helper to turn firestore timestamps into date objects and merge the id
   * with the document
   * @param doc
   * @private
   */
  process(doc) {
    return { ...doc.data(), id: doc.id };
  }

  constructor(db, paths, id) {
    this.db = db;
    this.paths = paths;
    this.id = id;
  }

  get collection() {
    return this.db.collection(this.paths().join("/"));
  }
}

class NoteApp {
  static attachToDom() {
    const app = new NoteApp();

    document.getElementById("post-button").addEventListener("click", () => {
      // render and save the note on button click
      app.addNote().catch((e) => console.error(e));
    });

    document.getElementById("logout-button").addEventListener("click", () => {
      signOutUser();
    });

    // load saved blogs
    window.addEventListener("load", () => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          app.loadSavedNotes().catch((e) => console.error(e));
        } else {
          signOutUser();
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

  async saveNote(note) {
    return this.db.write(note);
  }

  createNoteFromInputs() {
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

  async deleteNote(note) {
    return this.db.deleteDoc(note.id);
  }

  /**
   * callback for when a note move is complete. We will calculate the
   * position of the note relative to the note lanes and update the
   * positioning and styles of the target
   * @param e
   * @param note - the current note being moved
   */
  onNoteMoveComplete = (e, note) => {
    // get geometry of lanes and note
    const todoRightBoundary = this.todoLane.getBoundingClientRect().right;
    const inProgressRightBoundary =
      this.inProgressLane.getBoundingClientRect().right;
    const noteRect = note.container.getBoundingClientRect();

    const noteCenterLine = (noteRect.right - noteRect.left) / 2 + noteRect.left;

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

  changeNoteLane(note, newStatus) {
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

  getLaneForStatus(note) {
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
    this.db = new FirestoreProvider(db, () => [
      "users",
      auth.currentUser.uid,
      "notes",
    ]);
  }

  // our reference to the firebase api

  // this is our content input
  contentElement = document.querySelector("#noteContent");

  // references to the lanes
  todoLane = document.querySelector("#todo");
  inProgressLane = document.querySelector("#in-progress");
  completeLane = document.querySelector("#complete");
}

const signOutUser = () =>
  auth
    .signOut()
    .then(() => (window.location.href = "index.html"))
    .catch((e) => console.error(e));

NoteApp.attachToDom();
