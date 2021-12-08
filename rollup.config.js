import multiInput from "rollup-plugin-multi-input";
import {babel} from "@rollup/plugin-babel";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import prettier from "rollup-plugin-prettier";
import alias from "@rollup/plugin-alias";
import dotenv from "dotenv";


export default async () => {
    const dir = ".";

    let env = {};
    if (process.env.NODE_ENV === "production") {
        env = dotenv.config({
            path: ".env.production",
        });
    } else {
        env = dotenv.config();
    }

    const environmentReplacer = {};
    for (const [key, value] of Object.entries(env.parsed ?? {})) {
        environmentReplacer[`process.env.${key}`] = JSON.stringify(value);
    }


    return [`pages/app-notes/login.ts`, `pages/app-notes/app.ts`].map((input) => ({
            input,
            external: [
                "firebase/compat/auth",
                "firebase/compat/firestore",
            ],
            output: [
                {
                    dir,
                    entryFileNames: `[name].js`,
                    format: `esm`,
                    paths: {
                        "firebase/compat/auth":
                            "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth-compat.js",
                        "firebase/compat/firestore":
                            "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore-compat.js",
                    },
                },
            ],
            preserveModules: false,
            plugins: [
                prettier({
                    parser: "babel",
                }),
                babel({
                    babelHelpers: "bundled",
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                    presets: [
                        "@babel/preset-typescript",
                    ],
                    retainLines: true,
                }),
                alias({
                    entries: [
                        ...Object.entries({
                            firebaseui:
                                "shims/firebaseui.js",
                            "firebase/compat/app":
                                "shims/firebase-compat-app.js",
                            "firebase/compat":
                                "shims/firebase-compat-app.js",

                        }).map(([key, value]) => ({
                            find: key,
                            replacement: value,
                        })),
                    ],
                }),
                nodeResolve({
                    extensions: [".ts", ".tsx", ".esm.js", ".js", ".jsx"],
                }),
                replace({
                    "process.env.NODE_ENV": JSON.stringify(
                        process.env.NODE_ENV
                    ),
                    ...environmentReplacer,
                    preventAssignment: true,
                }),
                multiInput({
                    transformOutputPath: (output, input) => {
                        return input.replace(/\.ts$/, ".js");
                    },
                }),
            ],
        }
    ))

};
// hoist-non-react-statics
