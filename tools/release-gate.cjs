const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.join(__dirname, "..");
const workspaceRoot = path.join(projectRoot, "..");
const packSimulationRuns = process.env.PACK_SIM_RUNS || "100000";
const hostedPreviewOutputDir = path.join("dist", "public-preview-hosted-check");
const hostedPreviewEnv = {
  PUBLIC_PREVIEW_OUTPUT_DIR: hostedPreviewOutputDir,
  PUBLIC_PRIVACY_URL: "https://example.com/gunmojipuzzle/privacy",
  PUBLIC_TERMS_URL: "https://example.com/gunmojipuzzle/terms",
  PUBLIC_COMMERCIAL_URL: "https://example.com/gunmojipuzzle/commercial-transactions",
};

const steps = [
  {
    name: "Syntax: game runtime",
    args: ["--check", path.join(projectRoot, "scripts", "game.js")],
  },
  {
    name: "Syntax: browser smoke",
    args: ["--check", path.join(projectRoot, "tools", "smoke-browser.cjs")],
  },
  {
    name: "Syntax: store asset capture",
    args: ["--check", path.join(projectRoot, "tools", "capture-store-assets.cjs")],
  },
  {
    name: "Syntax: store asset check",
    args: ["--check", path.join(projectRoot, "tools", "check-store-assets.cjs")],
  },
  {
    name: "Syntax: feature graphic generator",
    args: ["--check", path.join(projectRoot, "tools", "generate-feature-graphic.cjs")],
  },
  {
    name: "Syntax: promo asset check",
    args: ["--check", path.join(projectRoot, "tools", "check-promo-assets.cjs")],
  },
  {
    name: "Syntax: sound cues",
    args: ["--check", path.join(projectRoot, "tools", "check-sound-cues.cjs")],
  },
  {
    name: "Syntax: production readiness",
    args: ["--check", path.join(projectRoot, "tools", "check-production-readiness.cjs")],
  },
  {
    name: "Syntax: public preview build",
    args: ["--check", path.join(projectRoot, "tools", "build-public-preview.cjs")],
  },
  {
    name: "Syntax: public preview check",
    args: ["--check", path.join(projectRoot, "tools", "check-public-preview.cjs")],
  },
  {
    name: "Syntax: public preview smoke",
    args: ["--check", path.join(projectRoot, "tools", "smoke-public-preview.cjs")],
  },
  {
    name: "Syntax: Android TWA handoff",
    args: ["--check", path.join(projectRoot, "tools", "check-android-handoff.cjs")],
  },
  {
    name: "Syntax: Android release prep",
    args: ["--check", path.join(projectRoot, "tools", "prepare-android-release.cjs")],
  },
  {
    name: "Syntax: Android release output check",
    args: ["--check", path.join(projectRoot, "tools", "check-android-release-output.cjs")],
  },
  {
    name: "Syntax: data safety",
    args: ["--check", path.join(projectRoot, "tools", "check-data-safety.cjs")],
  },
  {
    name: "Syntax: closed test plan",
    args: ["--check", path.join(projectRoot, "tools", "check-closed-test-plan.cjs")],
  },
  {
    name: "Syntax: Play Console pack",
    args: ["--check", path.join(projectRoot, "tools", "check-play-console-pack.cjs")],
  },
  {
    name: "Syntax: App Store pack",
    args: ["--check", path.join(projectRoot, "tools", "check-app-store-pack.cjs")],
  },
  {
    name: "Syntax: content rating",
    args: ["--check", path.join(projectRoot, "tools", "check-content-rating.cjs")],
  },
  {
    name: "Syntax: build metadata",
    args: ["--check", path.join(projectRoot, "tools", "check-build-metadata.cjs")],
  },
  {
    name: "Generate app icons",
    args: [path.join(projectRoot, "tools", "generate-app-icons.cjs")],
  },
  {
    name: "Store assets",
    args: [path.join(projectRoot, "tools", "check-store-assets.cjs")],
  },
  {
    name: "Generate feature graphic",
    args: [path.join(projectRoot, "tools", "generate-feature-graphic.cjs")],
  },
  {
    name: "Promo assets",
    args: [path.join(projectRoot, "tools", "check-promo-assets.cjs")],
  },
  {
    name: "Sound cues",
    args: [path.join(projectRoot, "tools", "check-sound-cues.cjs")],
  },
  {
    name: "Build public preview",
    args: [path.join(projectRoot, "tools", "build-public-preview.cjs")],
  },
  {
    name: "Public preview",
    args: [path.join(projectRoot, "tools", "check-public-preview.cjs")],
  },
  {
    name: "Public preview smoke",
    args: [path.join(projectRoot, "tools", "smoke-public-preview.cjs")],
  },
  {
    name: "Build hosted public preview guard",
    args: [path.join(projectRoot, "tools", "build-public-preview.cjs")],
    env: hostedPreviewEnv,
  },
  {
    name: "Hosted public preview",
    args: [path.join(projectRoot, "tools", "check-public-preview.cjs"), "--expect-hosted-policies"],
    env: hostedPreviewEnv,
  },
  {
    name: "Hosted public preview production guard",
    args: [
      path.join(projectRoot, "tools", "check-production-readiness.cjs"),
      "--root",
      path.join(projectRoot, hostedPreviewOutputDir),
      "--skip-native",
    ],
  },
  {
    name: "Android TWA handoff",
    args: [path.join(projectRoot, "tools", "check-android-handoff.cjs")],
  },
  {
    name: "Data safety",
    args: [path.join(projectRoot, "tools", "check-data-safety.cjs")],
  },
  {
    name: "Closed test plan",
    args: [path.join(projectRoot, "tools", "check-closed-test-plan.cjs")],
  },
  {
    name: "Play Console pack",
    args: [path.join(projectRoot, "tools", "check-play-console-pack.cjs")],
  },
  {
    name: "App Store pack",
    args: [path.join(projectRoot, "tools", "check-app-store-pack.cjs")],
  },
  {
    name: "Content rating",
    args: [path.join(projectRoot, "tools", "check-content-rating.cjs")],
  },
  {
    name: "Build metadata",
    args: [path.join(projectRoot, "tools", "check-build-metadata.cjs")],
  },
  {
    name: "Release metadata",
    args: [path.join(projectRoot, "tools", "release-check.cjs")],
  },
  {
    name: "Rules",
    args: [path.join(projectRoot, "tools", "check-rules.cjs")],
  },
  {
    name: "Content",
    args: [path.join(projectRoot, "tools", "check-content.cjs")],
  },
  {
    name: "Balance",
    args: [path.join(projectRoot, "tools", "check-balance.cjs")],
  },
  {
    name: `Pack simulation x ${packSimulationRuns}`,
    args: [path.join(projectRoot, "tools", "simulate-pack.cjs"), packSimulationRuns],
  },
  {
    name: "Offline cache",
    args: [path.join(projectRoot, "tools", "check-offline-cache.cjs")],
  },
  {
    name: "PWA offline smoke",
    args: [path.join(projectRoot, "tools", "smoke-offline-pwa.cjs")],
  },
  {
    name: "Mobile browser smoke",
    args: [path.join(projectRoot, "tools", "smoke-browser.cjs")],
  },
];

function runStep(step, index) {
  const startedAt = Date.now();
  console.log(`\n[${index + 1}/${steps.length}] ${step.name}`);
  const result = spawnSync(process.execPath, step.args, {
    cwd: workspaceRoot,
    env: { ...process.env, ...(step.env || {}) },
    stdio: "inherit",
  });
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${step.name} failed after ${elapsed}s with exit code ${result.status}`);
  }
  console.log(`[ok] ${step.name} (${elapsed}s)`);
}

try {
  console.log("Gunmoji Puzzle release gate");
  console.log(`Project: ${projectRoot}`);
  console.log(`Pack simulation runs: ${packSimulationRuns}`);
  steps.forEach(runStep);
  console.log("\nGunmoji Puzzle release gate passed.");
} catch (error) {
  console.error(`\nRelease gate failed: ${error.message}`);
  process.exit(1);
}
