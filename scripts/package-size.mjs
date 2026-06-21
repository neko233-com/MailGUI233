import { gzipSync } from "node:zlib";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const limits = {
  cssGzipKb: Number(process.env.MAILGUI233_CSS_GZIP_KB ?? 30),
  exeMb: Number(process.env.MAILGUI233_EXE_MB ?? 25),
  installerMb: Number(process.env.MAILGUI233_INSTALLER_MB ?? 30),
  jsGzipKb: Number(process.env.MAILGUI233_JS_GZIP_KB ?? 260)
};

function walk(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    return entry.isDirectory() ? walk(path) : [path];
  });
}

function size(path) {
  return statSync(path).size;
}

function mb(bytes) {
  return bytes / 1024 / 1024;
}

function kb(bytes) {
  return bytes / 1024;
}

function assertBelow(label, actual, limit, unit) {
  if (actual > limit) {
    throw new Error(`${label} is ${actual.toFixed(2)} ${unit}, above ${limit} ${unit}`);
  }
}

const distFiles = walk(join(root, "dist"));
const jsFiles = distFiles.filter((file) => file.endsWith(".js"));
const cssFiles = distFiles.filter((file) => file.endsWith(".css"));
const exePath = join(root, "src-tauri", "target", "release", "mailgui233.exe");
const bundleFiles = walk(join(root, "src-tauri", "target", "release", "bundle"));
const releaseFiles = walk(join(root, "release"));
const installerFiles = [...bundleFiles, ...releaseFiles].filter((file) =>
  /\.(exe|msi|dmg|appimage|deb|rpm)$/i.test(file)
);

const report = [];

for (const file of jsFiles) {
  const gzipKb = kb(gzipSync(readFileSync(file)).length);
  assertBelow(relative(root, file), gzipKb, limits.jsGzipKb, "KB gzip");
  report.push({ kind: "renderer-js", path: relative(root, file), gzipKb: Number(gzipKb.toFixed(2)) });
}

for (const file of cssFiles) {
  const gzipKb = kb(gzipSync(readFileSync(file)).length);
  assertBelow(relative(root, file), gzipKb, limits.cssGzipKb, "KB gzip");
  report.push({ kind: "renderer-css", path: relative(root, file), gzipKb: Number(gzipKb.toFixed(2)) });
}

if (existsSync(exePath)) {
  const exeMb = mb(size(exePath));
  assertBelow(relative(root, exePath), exeMb, limits.exeMb, "MB");
  report.push({ kind: "tauri-exe", path: relative(root, exePath), mb: Number(exeMb.toFixed(2)) });
}

for (const file of installerFiles) {
  const installerMb = mb(size(file));
  assertBelow(relative(root, file), installerMb, limits.installerMb, "MB");
  report.push({ kind: "installer", path: relative(root, file), mb: Number(installerMb.toFixed(2)) });
}

if (report.length === 0) {
  throw new Error("No built package files found. Run npm run build or npm run package:smoke first.");
}

console.table(report);
