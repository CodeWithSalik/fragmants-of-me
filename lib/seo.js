export const SITE_NAME = "Fragmants of Me";
export const SITE_URL = "https://fragmants-of-me.vercel.app";
export const SITE_DESCRIPTION = "An immersive literary and emotional journaling space for poems, monologues, reflections, and intimate writing.";

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
