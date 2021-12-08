import "https://www.gstatic.com/firebasejs/9.4.0/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/ui/6.0.0/firebase-ui-auth.js";
import "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore-compat.js";

var firebase = window.firebase;

var firebaseui = window.firebaseui;

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
connectFirestore();

const ui = new firebaseui.auth.AuthUI(auth);
let isNewUser;
const loadAuthUI = ({ signInSuccessUrl, firstTimeSignInUrl } = {}) => {
  auth.onAuthStateChanged(
    (user) => {
      if (user) {
        setTimeout(() => {
          if (isNewUser) {
            window.location.href = firstTimeSignInUrl;
          } else {
            window.location.href = signInSuccessUrl;
          }
        }, 0);
      }
    },
    (error) => {
      console.error(error);
    }
  );

  if (!ui.isPendingRedirect()) {
    ui.start("#firebaseui-auth-container", {
      callbacks: {
        signInSuccessWithAuthResult(authResult) {
          if (firstTimeSignInUrl && authResult.additionalUserInfo.isNewUser) {
            isNewUser = true;
          }

          return false;
        },
      },

      signInOptions: [
        // Leave the lines as is for the providers you want to offer
        // your users.
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],

      signInFlow: "popup",
    });
  }
};

const init = () => {
  loadAuthUI({
    signInSuccessUrl: "app.html",
    firstTimeSignInUrl: "app.html",
  });
};
window.addEventListener("load", () => {
  init();
});

export { init };
