import React from "react";
import { Head } from "@njmaeff/webpack-static-site/components/head";
import { WithMdx } from "@njmaeff/webpack-static-site/components/mdx";

export interface PageProps {
    title?: string;
    meta?: {
        description?: string;
        keywords?: string;
        author?: string;
    };
    mdxOverrides?: { [key: string]: React.FC };
    charSet?: string;
    lang?: string;
    extraTags?: (
        | JSX.IntrinsicElements["style"]
        | JSX.IntrinsicElements["meta"]
        | JSX.IntrinsicElements["link"]
    )[];
}

export const Page: React.FC<PageProps> = ({
    children,
    charSet = "UTF-8",
    meta = {},
    extraTags = [],
    mdxOverrides = {},
    lang = "en",
    ...props
}) => {
    const metaTags = [];
    for (const [key, value] of Object.entries(meta)) {
        metaTags.push(<meta name={key} content={value} />);
    }

    return (
        <WithMdx components={mdxOverrides}>
            <Head htmlAttrs={{ lang }}>
                <meta charSet={charSet} />
                <title>{props.title}</title>
                {metaTags}
                {extraTags}
            </Head>
            {children}
        </WithMdx>
    );
};
