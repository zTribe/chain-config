import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const sha = process.env.GITHUB_SHA;
if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("GitHub commit SHA is required for pinned consumer smoke");
const url = "https://codeload.github.com/zTribe/chain-config/tar.gz/" + sha;
const packageName = "@ztribe/chain-config";
const cwd = mkdtempSync(join(tmpdir(), "ztribe-config-consumer-"));
function run(cmd, args) {
  const child = spawnSync(cmd, args, { cwd, encoding: "utf8", timeout: 120000 });
  if (child.error || child.status !== 0) throw new Error(cmd + " " + args.join(" ") + " failed:\n" + (child.stdout ?? "") + "\n" + (child.stderr ?? "") + "\n" + (child.error ?? ""));
}
try {
  writeFileSync(join(cwd, "package.json"), JSON.stringify({
    name: "chain-config-consumer-smoke", private: true, type: "module",
    dependencies: {[packageName]: url}
  }));
  writeFileSync(join(cwd, "package-lock.json"), JSON.stringify({
    name: "chain-config-consumer-smoke", lockfileVersion: 3, requires: true,
    packages: {
      "": {name: "chain-config-consumer-smoke", dependencies: {[packageName]:url}},
      "node_modules/@ztribe/chain-config": {version: "0.3.0", resolved: url, license: "MIT"}
    }
  }));
  run("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
  run("node", ["--input-type=module", "-e", `import {getChainConfig,isDirectPaymentAsset} from "@ztribe/chain-config"; if(getChainConfig(56)?.chainId!==56||!isDirectPaymentAsset(56,"0x55d398326f99059ff775485246999027b3197955")) process.exit(1);`]);
  process.stdout.write("Pinned tarball npm ci consumer smoke passed\n");
} finally {
  rmSync(cwd, {recursive:true,force:true});
}
