import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Baskerville&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-parchment text-ink font-serif text-[16px]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
