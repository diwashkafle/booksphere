import { pgTable, text, timestamp, integer, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
    isEbook: boolean("is_ebook").default(true).notNull(),
    isPhysical: boolean("is_physical").default(false).notNull(),
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

export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    bookId: uuid("book_id").references(() => books.id).notNull(),
    amount: integer("amount").notNull(),
    type: text("type", { enum: ["purchase", "borrow"] }).default("purchase").notNull(),
    format: text("format", { enum: ["ebook", "physical"] }).default("ebook").notNull(),
    shippingAddress: text("shipping_address"),
    contactNumber: text("contact_number"),
    status: text("status", { enum: ["completed", "failed"] }).default("completed").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    lendingRecords: many(lendingRecords),
    orders: many(orders),
}));

export const booksRelations = relations(books, ({ many }) => ({
    lendingRecords: many(lendingRecords),
    orders: many(orders),
}));

export const lendingRecordsRelations = relations(lendingRecords, ({ one }) => ({
    user: one(users, {
        fields: [lendingRecords.userId],
        references: [users.id],
    }),
    book: one(books, {
        fields: [lendingRecords.bookId],
        references: [books.id],
    }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    book: one(books, {
        fields: [orders.bookId],
        references: [books.id],
    }),
}));
