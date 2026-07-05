import fs from "fs";
import path from "path";

const helpersDir = path.join(process.cwd(), "src/utils/helpers");
for (const f of fs.readdirSync(helpersDir)) {
  const p = path.join(helpersDir, f);
  let c = fs.readFileSync(p, "utf8");
  c = c.replace(/from ['"]\.\.\/models\//g, "from '../../models/");
  c = c.replace(/from ['"]\.\.\/vendor\//g, "from '../../vendor/");
  c = c.replace(/from ['"]\.\.\/config\//g, "from '../../config/");
  c = c.replace(/from ['"]\.\.\/constants\//g, "from '../../constants/");
  fs.writeFileSync(p, c);
}
console.log("Fixed helper import paths");
