import {Page} from "./components/page";
import {Link} from "@njmaeff/webpack-static-site/components/link";
import {Comment} from "@njmaeff/webpack-static-site/components/comment";
import React from "react";
import {App} from "./components/app";
import Styles from "./styles.scss";

export default () => {
    return (
        <Page
            title={"Notes | App"}
            extraTags={[
                <Link href={Styles} type={"text/css"} rel="stylesheet"/>,
                <script type={"module"} src={'js/app.js'}/>,
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />,
                <Comment>Connect Google fonts</Comment>,
                <link rel="preconnect" href="https://fonts.googleapis.com"/>,
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin={"anonymous"}
                />,
                <link
                    href="https://fonts.googleapis.com/css2?family=Lobster&display=swap"
                    rel="stylesheet"
                />,
                <link
                    href="https://fonts.googleapis.com/css2?family=Lobster&family=Roboto&display=swap"
                    rel="stylesheet"
                />,
            ]}
        >
            <App/>
        </Page>
    );
};
