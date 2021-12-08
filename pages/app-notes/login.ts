import {loadAuthUI} from "./lib/firebase-ui";

export const init = () => {
    loadAuthUI({
        signInSuccessUrl: "app.html",
        firstTimeSignInUrl: "app.html",
    });
};
window.addEventListener("load", () => {
    init();
});
