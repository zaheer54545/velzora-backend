import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Project root = two levels up from src/config
const ENV_PATH = path.resolve(__dirname, "../../.env");

/**
 * Loads .env from the project root (not from the current working directory).
 * Also handles .env files saved as UTF-16 / with BOM (common on Windows when
 * a file is created with PowerShell `>`), which plain dotenv cannot read.
 */
const loadEnv = () => {
  if (!fs.existsSync(ENV_PATH)) {
    return false;
  }

  const buffer = fs.readFileSync(ENV_PATH);
  let content;

  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    content = buffer.toString("utf16le");
  } else {
    content = buffer.toString("utf8");
  }

  content = content.replace(/^\uFEFF/, "");

  const parsed = dotenv.parse(content);

  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return true;
};

export { ENV_PATH };
export default loadEnv;
