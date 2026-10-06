export enum Language {
  ENGLISH = 'en',
  FRENCH = 'fr',
}

// Letters of any alphabet (accents included). `@` and other characters may
// arrive percent-encoded when the address was part of a URL.
// The part before the `@` is limited to 64 characters (the maximum of a real
// address): without a limit, a very long text without `@` takes a time that
// grows with the square of its length, and blocks the server meanwhile.
const EMAIL_PATTERN =
  /[\p{L}\p{N}._%+-]{1,64}(?:@|%40)[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/giu;

export const maskEmails = (text: string): string =>
  text.replace(EMAIL_PATTERN, '[e-mail]');

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
