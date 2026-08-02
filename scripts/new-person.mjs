#!/usr/bin/env node
/**
 * Create a personalized date page at /val/<slug>/
 * Usage: node scripts/new-person.mjs Oish
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const name = process.argv[2];
if (!name) {
  console.error("Usage: node scripts/new-person.mjs <Name>");
  process.exit(1);
}

const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const personDir = join(root, slug);

if (existsSync(join(personDir, "index.html"))) {
  console.error(`Page already exists: ${slug}/index.html`);
  process.exit(1);
}

const template = readFileSync(join(root, "assets", "page-template.html"), "utf8");
const html = template
  .replace("__NAME__", name.trim())
  .replace("__SLUG__", slug);

mkdirSync(personDir, { recursive: true });
writeFileSync(join(personDir, "index.html"), html);

console.log(`Created page for ${name.trim()}`);
console.log(`Local:  ${personDir}/index.html`);
console.log(`Live:   https://sehaj750-star.github.io/val/${slug}/`);
