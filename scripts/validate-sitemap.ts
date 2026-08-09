#!/usr/bin/env bun
/**
 * Sitemap lastmod validation.
 *
 * Fails (exit 1) if any URL is missing lastmod, the value doesn't match
 * YYYY-MM-DD, or the date is in the future. Run with:
 * `bun run scripts/validate-sitemap.ts`
 */
import {
  buildSitemapEntries,
  validateSitemapEntries,
} from "../src/lib/sitemap";

async function main() {
  const entries = await buildSitemapEntries();
  const errors = validateSitemapEntries(entries);

  console.log(`Sitemap: ${entries.length} URL(s) checked`);

  if (errors.length > 0) {
    console.error(`\n✗ ${errors.length} invalid lastmod value(s):`);
    for (const err of errors) {
      console.error(`  - ${err.path}: ${err.reason}${err.value ? ` (got "${err.value}")` : ""}`);
    }
    process.exit(1);
  }

  console.log("✓ All lastmod values are valid ISO YYYY-MM-DD dates and not in the future");
}

main().catch((err) => {
  console.error("Failed to validate sitemap:", err);
  process.exit(1);
});
