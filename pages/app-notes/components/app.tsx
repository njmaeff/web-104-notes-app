import React from "react";

export const App = () => {
    return (
        <>
            <header>
                <h1>Note App</h1>
                <button id={'logout-button'}>Logout</button>
            </header>
            <main>
                <section className="note">
                    <div id={"todo"} className={"note-column"}>
                        <h2>Todo</h2>
                        <div className="noteInput">
                            <textarea id="noteContent"></textarea>
                            <button id={"post-button"}>Post</button>
                        </div>
                    </div>
                    <div id={"in-progress"} className={"note-column"}>
                        <h2>In Progress</h2>
                    </div>
                    <div id={"complete"} className={"note-column"}>
                        <h2>Complete</h2>
                    </div>
                </section>
            </main>
        </>
    );
};
