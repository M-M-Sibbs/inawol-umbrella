import crypto from "crypto";

const plain = process.argv[2];
if (!plain) {
  console.error("Usage: npm run admin:hash -- 'your-strong-password'");
  process.exit(1);
}
if (plain.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

// Layout (base64-decoded): [1 byte version=1][16 bytes salt][32 bytes key]
// Base64 is used so the value contains no `$` characters — dotenv would
// otherwise treat `$` as variable expansion and truncate the hash.
const salt = crypto.randomBytes(16);
const key = crypto.scryptSync(plain, salt, 32, { N: 16384, r: 8, p: 1 });
const hash = Buffer.concat([Buffer.from([1]), salt, key]).toString("base64");

console.log("\nAdd this line to your .env file:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
console.log("Then restart the dev server.\n");
