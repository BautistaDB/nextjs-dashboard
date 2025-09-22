import { Customer, Invoice, Product, Revenue, User } from "@/generated";

export type UserTable = Pick<User, "id" | "name" | "email" | "password">

export type CustomerTable = Pick<Customer, "id" | "name" | "email" | "image_url">

export type InvoiceTable = Pick<Invoice, "id" | "customer_id" | "date" | "status">

export type RevenueTable = Pick<Revenue, "month" | "revenue">

export type ProductFormat = Pick<Product, "id" | "name" | "price" | "description" | "invoice_id">

export type ProductStatus = "Available" | "Sold";

export type Status = "pending" | "paid";
