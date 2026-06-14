import { useEffect, isValidElement, Children, type ReactNode } from "react";

/**
 * Minimal head manager used in place of react-helmet-async, which does not
 * inject anything into <head> under React 19. React 19's native metadata
 * hoisting can't be used directly here because the existing pages render
 * interpolated titles (`<title>{name} ...</title>`, multiple children) and
 * several <Helmet> blocks per page — both unsupported by native hoisting.
 *
 * This imperatively syncs <title>, <meta>, <link> and JSON-LD <script> tags
 * declared as children into document.head, so all existing <Helmet> usage
 * keeps working unchanged. JSON-LD scripts are removed on unmount so structured
 * data does not accumulate across client-side route changes.
 */

export function HelmetProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function textOf(children: unknown): string {
  if (children == null || children === false) return "";
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) return children.map(textOf).join("");
  return "";
}

export function Helmet({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Nodes this instance created — removed on unmount/re-run.
    const created: HTMLElement[] = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const type = child.type as string;
      const props = child.props as Record<string, unknown>;

      if (type === "title") {
        document.title = textOf(props.children);
        return;
      }

      if (type === "meta") {
        const selector = props.name
          ? `meta[name="${props.name}"]`
          : props.property
            ? `meta[property="${props.property}"]`
            : null;
        let tag = selector
          ? (document.head.querySelector(selector) as HTMLMetaElement | null)
          : null;
        if (!tag) {
          tag = document.createElement("meta");
          if (props.name) tag.setAttribute("name", String(props.name));
          if (props.property) tag.setAttribute("property", String(props.property));
          document.head.appendChild(tag);
          created.push(tag);
        }
        if (props.content != null) tag.setAttribute("content", String(props.content));
        return;
      }

      if (type === "link") {
        const rel = props.rel ? String(props.rel) : "";
        const selector =
          rel === "canonical"
            ? 'link[rel="canonical"]'
            : `link[rel="${rel}"][href="${props.href}"]`;
        let tag = document.head.querySelector(selector) as HTMLLinkElement | null;
        if (!tag) {
          tag = document.createElement("link");
          tag.setAttribute("rel", rel);
          document.head.appendChild(tag);
          created.push(tag);
        }
        if (props.href != null) tag.setAttribute("href", String(props.href));
        return;
      }

      if (type === "script") {
        const tag = document.createElement("script");
        if (props.type) tag.setAttribute("type", String(props.type));
        tag.textContent = textOf(props.children);
        document.head.appendChild(tag);
        created.push(tag);
      }
    });

    return () => {
      created.forEach((node) => node.remove());
    };
  });

  return null;
}
