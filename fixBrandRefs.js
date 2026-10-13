import mongoose from "mongoose";
import loadEnv from "./src/config/loadEnv.js";
import Brand from "./src/models/Brand.js";
import Product from "./src/models/Product.js";

loadEnv();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGO_URI .env file mein nahi mila");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log("✅ Connected to MongoDB");

const brands = await Brand.find().lean();
console.log(`Found ${brands.length} brands`);

const byName = new Map();
const bySlug = new Map();

for (const brand of brands) {
  byName.set(brand.name.toLowerCase().trim(), brand._id);
  bySlug.set(brand.slug.toLowerCase().trim(), brand._id);
}

const allProducts = await Product.collection.find({}).toArray();
console.log(`Found ${allProducts.length} total products`);

let fixed = 0;
let skipped = 0;
let alreadyOk = 0;

for (const product of allProducts) {
  const brandValue = product.brand;

  if (brandValue instanceof mongoose.Types.ObjectId) {
    alreadyOk++;
    continue;
  }

  if (typeof brandValue === "string") {
    const lower = brandValue.toLowerCase().trim();
    const resolvedId = byName.get(lower) || bySlug.get(lower);

    if (resolvedId) {
      await Product.collection.updateOne(
        { _id: product._id },
        { $set: { brand: resolvedId } },
      );
      console.log(
        `✅ Fixed: "${product.title}" — "${brandValue}" → ${resolvedId}`,
      );
      fixed++;
    } else {
      console.warn(
        `⚠ Skipped: "${product.title}" — no brand found for "${brandValue}"`,
      );
      skipped++;
    }
  }
}

console.log("\n── Summary ──");
console.log(`Already OK : ${alreadyOk}`);
console.log(`Fixed      : ${fixed}`);
console.log(`Skipped    : ${skipped}`);

await mongoose.disconnect();
console.log("✅ Done.");
