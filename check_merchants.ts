import { db } from "./src/db";
import { merchants } from "./src/db/schema";

async function main() {
    const allMerchants = await db.query.merchants.findMany();
    console.log(JSON.stringify(allMerchants, null, 2));
}

main().catch(console.error);
