import React from "react";

export function LoginPage() {
    return (
        <div>
            <header>
                <h1>Login</h1>
            </header>
            <main>
                <div id={"firebaseui-auth-container"}/>
            </main>
        </div>
    );
}
