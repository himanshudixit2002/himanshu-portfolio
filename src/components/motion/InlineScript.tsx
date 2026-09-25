/**
 * A script that runs synchronously during HTML parsing on hard navigations.
 * On the client it renders as inert text/plain so React does not warn about
 * rendering a <script>. Pattern from the Next.js "preventing flash" guide.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
