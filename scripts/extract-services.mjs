import fs from "fs";
import path from "path";

const root = process.cwd();
const controllersDir = path.join(root, "src/controllers");
const servicesDir = path.join(root, "src/services");

const serviceMap = {
  "address.controller.js": "address.service.js",
  "admin.controller.js": "admin.service.js",
  "announcement.controller.js": "announcement.service.js",
  "banner.controller.js": "banner.service.js",
  "cart.controller.js": "cart.service.js",
  "category.controller.js": "category.service.js",
  "coupon.controller.js": "coupon.service.js",
  "order.controller.js": "order.service.js",
  "payment.controller.js": "payment.service.js",
  "product.controller.js": "product.service.js",
  "review.controller.js": "review.service.js",
  "seller.controller.js": "seller.service.js",
};

function extractExportNames(content) {
  const names = [];
  const re = /export const (\w+) = asyncHandler/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    names.push(m[1]);
  }
  return names;
}

function buildThinController(serviceImportPath, exportNames) {
  const lines = [
    `import { asyncHandler } from "../utils/asyncHandler.js";`,
    `import * as Service from "${serviceImportPath}";`,
    "",
  ];
  for (const name of exportNames) {
    lines.push(
      `export const ${name} = asyncHandler((req, res) => Service.${name}(req, res));`
    );
  }
  lines.push("");
  return lines.join("\n");
}

// Auth: merge user + otp controllers into auth.service.js
const userContent = fs.readFileSync(path.join(controllersDir, "user.controller.js"), "utf8");
const otpContent = fs.readFileSync(path.join(controllersDir, "otp.controller.js"), "utf8");
const authServiceContent = `${userContent}\n${otpContent.replace(/^import[\s\S]*?from ['"][^'"]+['"];\n/gm, "")}`;
fs.writeFileSync(path.join(servicesDir, "auth.service.js"), authServiceContent);

const authExports = [
  ...extractExportNames(userContent),
  ...extractExportNames(otpContent),
];
fs.writeFileSync(
  path.join(controllersDir, "user.controller.js"),
  buildThinController("../services/auth.service.js", extractExportNames(userContent))
);
fs.writeFileSync(
  path.join(controllersDir, "otp.controller.js"),
  buildThinController("../services/auth.service.js", extractExportNames(otpContent))
);
console.log(`auth.service.js (${authExports.length} exports)`);

for (const [controllerFile, serviceFile] of Object.entries(serviceMap)) {
  const controllerPath = path.join(controllersDir, controllerFile);
  const content = fs.readFileSync(controllerPath, "utf8");
  const exportNames = extractExportNames(content);

  fs.writeFileSync(path.join(servicesDir, serviceFile), content);
  fs.writeFileSync(
    controllerPath,
    buildThinController(`../services/${serviceFile}`, exportNames)
  );
  console.log(`${controllerFile} -> ${serviceFile} (${exportNames.length} exports)`);
}

console.log("Service extraction complete");
