const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.join(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const outIndex = process.argv.indexOf("--out");
const outputRoot =
  outIndex >= 0 && process.argv[outIndex + 1]
    ? path.resolve(process.cwd(), process.argv[outIndex + 1])
    : path.join(projectRoot, "dist", "android-release");

const requiredEnv = [
  "PUBLIC_HOST",
  "PUBLIC_PRIVACY_URL",
  "PUBLIC_TERMS_URL",
  "PUBLIC_COMMERCIAL_URL",
  "RELEASE_CERT_SHA256",
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, file), "utf8"));
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function assertHttpsUrl(name, value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid https:// URL.`);
  }
  if (url.protocol !== "https:" || value.includes("TODO_")) {
    throw new Error(`${name} must be a hosted https:// URL.`);
  }
}

function assertPublicHost(value) {
  if (value.includes("://") || value.includes("/") || value.includes("TODO_")) {
    throw new Error("PUBLIC_HOST must be a bare production host, for example example.com.");
  }
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(value)) {
    throw new Error("PUBLIC_HOST must look like a real DNS host.");
  }
}

function assertReleaseFingerprint(value) {
  if (value.includes("TODO_")) {
    throw new Error("RELEASE_CERT_SHA256 must not contain TODO placeholders.");
  }
  const normalized = value.trim().toUpperCase();
  if (!/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(normalized)) {
    throw new Error("RELEASE_CERT_SHA256 must be 32 colon-separated SHA-256 bytes.");
  }
  return normalized;
}

function writeJson(relativePath, value) {
  const target = path.join(outputRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
  return target;
}

function replaceTodos(value) {
  const serialized = JSON.stringify(value);
  if (serialized.includes("TODO_")) {
    throw new Error("Prepared Android release output still contains TODO placeholders.");
  }
}

for (const name of requiredEnv) {
  requireEnv(name);
}

const publicHost = process.env.PUBLIC_HOST.trim();
const privacyUrl = process.env.PUBLIC_PRIVACY_URL.trim();
const termsUrl = process.env.PUBLIC_TERMS_URL.trim();
const commercialUrl = process.env.PUBLIC_COMMERCIAL_URL.trim();
const fingerprint = assertReleaseFingerprint(process.env.RELEASE_CERT_SHA256);

assertPublicHost(publicHost);
assertHttpsUrl("PUBLIC_PRIVACY_URL", privacyUrl);
assertHttpsUrl("PUBLIC_TERMS_URL", termsUrl);
assertHttpsUrl("PUBLIC_COMMERCIAL_URL", commercialUrl);

const twa = readJson("twa-manifest.json");
const assetLinks = readJson(path.join("android", "twa", "assetlinks.template.json"));

twa.host = publicHost;
twa.manifestUrl = `https://${publicHost}/gunmojipuzzle/manifest.webmanifest`;
twa.iconUrl = `https://${publicHost}/gunmojipuzzle/assets/app-icon-512.png`;
twa.maskableIconUrl = `https://${publicHost}/gunmojipuzzle/assets/app-icon-512.png`;
twa.signing.sha256CertFingerprints = [fingerprint];
twa.store.policyUrls.privacy = privacyUrl;
twa.store.policyUrls.terms = termsUrl;
twa.store.policyUrls.commercialTransactions = commercialUrl;
twa.releaseChecklist = [
  "Publish the public preview over HTTPS before wrapper generation.",
  `Use ${publicHost} as the TWA host and web origin.`,
  "Generate the Android wrapper from this prepared manifest.",
  "Publish /.well-known/assetlinks.json on the same host before Play review.",
  "Run check-production-readiness.cjs after production SDK and economy decisions are resolved.",
];

assetLinks[0].target.package_name = twa.packageId;
assetLinks[0].target.sha256_cert_fingerprints = [fingerprint];

replaceTodos(twa);
replaceTodos(assetLinks);

const outputs = [
  path.join(outputRoot, "twa-manifest.json"),
  path.join(outputRoot, ".well-known", "assetlinks.json"),
];

if (!dryRun) {
  outputs[0] = writeJson("twa-manifest.json", twa);
  outputs[1] = writeJson(path.join(".well-known", "assetlinks.json"), assetLinks);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      dryRun,
      outputRoot,
      packageId: twa.packageId,
      host: twa.host,
      manifestUrl: twa.manifestUrl,
      policyUrls: twa.store.policyUrls,
      assetLinksPath: "/.well-known/assetlinks.json",
      outputs,
    },
    null,
    2,
  ),
);
