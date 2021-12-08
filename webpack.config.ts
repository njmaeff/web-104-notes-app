import path from "path";
import {makeConfig} from "@njmaeff/webpack-static-site/make-config";

const conf = makeConfig(({webpack}) => {
    return webpack({
        root: path.join(__dirname, "pages", "app-notes"),
        pageExtension: ".page.tsx",
        outputPath: path.resolve(__dirname, "dist"),
        copy: {
            patterns: [
                {
                    from: "*.js",
                    to: "js/[name][ext]",
                    noErrorOnMissing: true,
                    info: {
                        minimized: true,
                    },
                },
            ],
        },
    });
});

export default conf;
