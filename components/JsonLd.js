import { jsonLd } from "@/lib/seo";

// Server component — injects structured data into the page head/body.
export default function JsonLd({ schema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={jsonLd(schema)}
    />
  );
}
