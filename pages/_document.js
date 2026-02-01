import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="Yf3dKrXllPL5Q6FOqASeZF8fbW3wSlIhS_cDX6h1RhA" />
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
