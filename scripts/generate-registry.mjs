import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const folder = join(root, "chains");
const names = readdirSync(folder).filter(name => name.endsWith(".json")).sort();
if (names.length === 0) throw new Error("No chain configuration JSON files");
const chains = names.map(name => {
  const parsed = JSON.parse(readFileSync(join(folder, name), "utf8"));
  if (name !== parsed.slug + ".json") throw new Error("Chain slug mismatch: " + name);
  return parsed;
});
const output = "// AUTO-GENERATED from chains/*.json; edit JSON and run npm run generate.\n" +
  "export default " + JSON.stringify(chains, null, 2) + ";\n";
const target = join(root, "registry.generated.mjs");
if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== output) throw new Error("Outdated registry.generated.mjs; run npm run generate");
} else {
  writeFileSync(target, output);
}
