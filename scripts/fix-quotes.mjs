import fs from "fs";
import path from "path";

function fixFile(filePath) {
  let c = fs.readFileSync(filePath, "utf8");
  c = c.replace(/from '([^'\n]+\.js)"/g, "from '$1'");
  c = c.replace(/from "([^"\n]+\.js)'/g, 'from "$1"');
  fs.writeFileSync(filePath, c);
}

const helpersDir = path.join(process.cwd(), "src/utils/helpers");
for (const f of fs.readdirSync(helpersDir)) {
  fixFile(path.join(helpersDir, f));
}

fixFile(path.join(process.cwd(), "src/dto/responses/index.js"));
fixFile(path.join(process.cwd(), "src/models/Category.js"));

console.log("Fixed mismatched quotes");
