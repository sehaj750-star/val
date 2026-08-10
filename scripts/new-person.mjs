#!/usr/bin/env node
/**
 * Create a personalized date page at /val/<slug>/
 * Usage: node scripts/new-person.mjs Mamta
 *        node scripts/new-person.mjs Mamta --skip-days
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const skipDays = args.includes("--skip-days");
const name = args.find(a => a !== "--skip-days");

if (!name) {
  console.error("Usage: node scripts/new-person.mjs <Name> [--skip-days]");
  process.exit(1);
}

const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const personDir = join(root, slug);

if (existsSync(join(personDir, "index.html"))) {
  console.error(`Page already exists: ${slug}/index.html`);
  process.exit(1);
}

const person = { name: name.trim(), slug };
if (skipDays) person.skipDatePicker = true;

const template = readFileSync(join(root, "assets", "page-template.html"), "utf8");
const html = template.replace("__PERSON_JSON__", JSON.stringify(person));

mkdirSync(personDir, { recursive: true });
writeFileSync(join(personDir, "index.html"), html);

console.log(`Created page for ${name.trim()}`);
if (skipDays) console.log("Yes → skips day picker, goes straight to final page");
console.log(`Local:  ${personDir}/index.html`);
console.log(`Live:   https://sehaj750-star.github.io/val/${slug}/`);
