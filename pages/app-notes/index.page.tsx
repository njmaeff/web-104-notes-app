import React from "react";
import {LoginPage} from "./components/login";
import {Page} from "./components/page";
import {Link} from "@njmaeff/webpack-static-site/components/link";
import Styles from "./styles.scss";
import {Comment} from "@njmaeff/webpack-static-site/components/comment";

export default () => {
    return (
        <Page
            title={"Notes | Login"}

            extraTags={[
                <Link href={Styles} type={"text/css"} rel="stylesheet"/>,
                <link
                    type="text/css"
                    rel="stylesheet"
                    href="https://www.gstatic.com/firebasejs/ui/6.0.0/firebase-ui-auth.css"
                />,
                <script type={"module"} src={'js/login.js'}/>,
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
            <LoginPage/>
        </Page>
    );
};
