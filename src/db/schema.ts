import { pgTable, text, timestamp, integer, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "merchant", "admin"]);
export const bookStatusEnum = pgEnum("book_status", ["pending", "published", "unpublished"]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: userRoleEnum("role").default("user").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const merchants = pgTable("merchants", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull().unique(),
    storeName: text("store_name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const books = pgTable("books", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    description: text("description"),
    price: integer("price").notNull(), // Smallest unit (cents)
    stock: integer("stock").default(0).notNull(),
    category: text("category"),
    imageUrl: text("image_url"),
    merchantId: uuid("merchant_id").references(() => merchants.id).notNull(),
    status: bookStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lendingRecords = pgTable("lending_records", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    bookId: uuid("book_id").references(() => books.id).notNull(),
    borrowDate: timestamp("borrow_date").defaultNow().notNull(),
    expiryDate: timestamp("expiry_date").notNull(),
    status: text("status", { enum: ["active", "returned", "expired"] }).default("active").notNull(),
});
