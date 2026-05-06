import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Uses isomorphic-dompurify for safe usage on both client and server.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", 
      "h1", "h2", "h3", "h4", "h5", "h6", "code", "pre", "blockquote"
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}

/**
 * Hook-friendly or functional way to render sanitized HTML safely.
 * Returns an object compatible with dangerouslySetInnerHTML.
 */
export function getSanitizedConfig(html: string) {
  return {
    __html: sanitizeHtml(html),
  };
}
