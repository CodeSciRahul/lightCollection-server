import fs from "fs";
import path from "path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const src = path.join(root, "src");

const dirs = [
  "config",
  "routes",
  "controllers",
  "services",
  "repositories",
  "models/schemas",
  "dto/requests",
  "dto/responses",
  "interfaces",
  "validators",
  "middlewares",
  "cron/jobs",
  "utils/helpers",
  "constants",
  "vendor",
];
dirs.forEach((d) => fs.mkdirSync(path.join(src, d), { recursive: true }));

const helperFiles = new Set([
  "authHelpers.js",
  "categoryHelpers.js",
  "couponHelpers.js",
  "emailValidation.js",
  "orderBuilder.js",
  "orderHelpers.js",
  "otpHelpers.js",
  "paymentHelpers.js",
  "productHelpers.js",
  "storedImageHelpers.js",
  "uploadHelpers.js",
  "userHelpers.js",
]);

const modelFiles = fs
  .readdirSync(path.join(root, "models"))
  .filter((f) => f.endsWith(".model.js"));
const modelMap = Object.fromEntries(
  modelFiles.map((f) => [f, f.replace(".model.js", ".js")])
);

function transformContent(content) {
  let c = content;
  c = c.replace(/from ['"]\.\.\/config\/appConfig\.js['"]/g, "from '../config/index.js'");
  c = c.replace(/from ['"]\.\.\/config\/db\.js['"]/g, "from '../config/database.js'");
  c = c.replace(/from ['"]\.\/appConfig\.js['"]/g, "from './env.js'");
  c = c.replace(/from ['"]\.\/db\.js['"]/g, "from './database.js'");
  c = c.replace(/\/controller\//g, "/controllers/");
  c = c.replace(/from ['"]\.\.\/controller\//g, "from '../controllers/");
  c = c.replace(/\/middleware\//g, "/middlewares/");
  c = c.replace(/from ['"]\.\.\/middleware\//g, "from '../middlewares/");
  c = c.replace(/\/service\//g, "/services/");
  c = c.replace(/from ['"]\.\.\/service\//g, "from '../services/");
  for (const [old, neu] of Object.entries(modelMap)) {
    c = c.replaceAll(`../models/${old}`, `../models/${neu}`);
    c = c.replaceAll(`./models/${old}`, `./models/${neu}`);
  }
  c = c.replace(/from ['"]\.\.\/utils\/apiResponse\.js['"]/g, "from '../utils/response.js'");
  c = c.replace(/from ['"]\.\.\/constants\/departments\.js['"]/g, "from '../constants/enums.js'");
  c = c.replace(/\.route\.js/g, ".routes.js");
  c = c.replace(/flutterWave\.service\.js/g, "flutterwave.service.js");
  c = c.replace(/flutterWave\.vendor\.js/g, "flutterwave.vendor.js");
  // helpers moved to utils/helpers
  for (const h of helperFiles) {
    c = c.replaceAll(`../utils/${h}`, `../utils/helpers/${h}`);
  }
  return c;
}

function copyFile(srcPath, destPath) {
  const content = transformContent(fs.readFileSync(srcPath, "utf8"));
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content);
}

for (const f of modelFiles) {
  copyFile(path.join(root, "models", f), path.join(src, "models", modelMap[f]));
}
copyFile(
  path.join(root, "models/schemas/storedImage.schema.js"),
  path.join(src, "models/schemas/storedImage.schema.js")
);

for (const f of fs.readdirSync(path.join(root, "utils")).filter((f) => f.endsWith(".js"))) {
  const destName = f === "apiResponse.js" ? "response.js" : f;
  const destDir = helperFiles.has(f)
    ? path.join(src, "utils/helpers", destName)
    : path.join(src, "utils", destName);
  copyFile(path.join(root, "utils", f), destDir);
}

copyFile(path.join(root, "constants/departments.js"), path.join(src, "constants/enums.js"));

for (const f of fs.readdirSync(path.join(root, "vendor")).filter((f) => f.endsWith(".js"))) {
  const destName = f === "flutterWave.vendor.js" ? "flutterwave.vendor.js" : f;
  copyFile(path.join(root, "vendor", f), path.join(src, "vendor", destName));
}

for (const f of fs.readdirSync(path.join(root, "middleware")).filter((f) => f.endsWith(".js"))) {
  copyFile(path.join(root, "middleware", f), path.join(src, "middlewares", f));
}

for (const f of fs.readdirSync(path.join(root, "service")).filter((f) => f.endsWith(".js"))) {
  const destName = f === "flutterWave.service.js" ? "flutterwave.service.js" : f;
  copyFile(path.join(root, "service", f), path.join(src, "services", destName));
}

for (const f of fs.readdirSync(path.join(root, "controller")).filter((f) => f.endsWith(".js"))) {
  copyFile(path.join(root, "controller", f), path.join(src, "controllers", f));
}

for (const f of fs.readdirSync(path.join(root, "routes")).filter((f) => f.endsWith(".js"))) {
  copyFile(
    path.join(root, "routes", f),
    path.join(src, "routes", f.replace(".route.js", ".routes.js"))
  );
}

console.log("Migration copy complete");
