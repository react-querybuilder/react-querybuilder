import { $, file } from "bun";

$.cwd(import.meta.dir);

const pkgJson = await file("./package.json").json();

const rqbDeps = Object.keys(pkgJson.dependencies)
  .filter((d) => /react-querybuilder/.test(d))
  .map((d) => d.replace("@", "").replace("/", "-"));

const packs = await $`ls ../packs`.text();
console.log(
  packs
    .split("\n")
    .filter((p) =>
      new RegExp(`(${rqbDeps.join("|")})-\\d+\\.\\d+\\.\\d.*\\.tgz`).test(p)
    )
    .map((p) => `../../packs/${p}`)
    .sort((a, b) => a.length - b.length)
    .join("\n")
);
