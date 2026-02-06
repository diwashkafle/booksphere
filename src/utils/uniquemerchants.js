// const fs = require("fs");
// const path = require("path");

// // Read books.json from current working directory
// const filePath = path.join(process.cwd(), "books.json");
// const books = JSON.parse(fs.readFileSync(filePath, "utf-8"));


// // Get unique merchant IDs
// const uniqueMerchantIds = new Set(
//   books.map(book => book.merchantId)
// );

// // Results
// console.log("Total unique merchant IDs:", uniqueMerchantIds.size);
// console.log("Merchant IDs:", [...uniqueMerchantIds]);

const merchantIds = [
  "49cea25f-323a-4451-84cf-ddd7f27bfd4c",
  "cde2dd04-d76e-4057-a6de-16d55f0cfc8c",
  "debc1111-af16-472e-b56b-7d52c039f5f6"
];


const fs = require("fs");
const path = require("path");

const filePath = path.join(process.cwd(), "books.json");
const books = JSON.parse(fs.readFileSync(filePath, "utf-8"));

function getRandomMerchantId() {
  return merchantIds[Math.floor(Math.random() * merchantIds.length)];
}

// Replace merchantId for each book
const updatedBooks = books.map(book => ({
  ...book,
  merchantId: getRandomMerchantId()
}));

// Write back to books.json
fs.writeFileSync(
  filePath,
  JSON.stringify(updatedBooks, null, 2),
  "utf-8"
);

console.log("✅ Merchant IDs updated successfully");
