import firebase from "firebase/compat/app";
import firebaseui from "firebaseui";
import {auth} from "./connect";

export interface LoadAuthUIOpts {
    signInSuccessUrl?: string;
    firstTimeSignInUrl?: string;
}

const ui = new firebaseui.auth.AuthUI(auth);
let isNewUser;
export const loadAuthUI = ({
                               signInSuccessUrl,
                               firstTimeSignInUrl,
                           }: LoadAuthUIOpts = {}) => {
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
                signInSuccessWithAuthResult(authResult: any): boolean {
                    if (
                        firstTimeSignInUrl &&
                        authResult.additionalUserInfo.isNewUser
                    ) {
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
