import postgres from "postgres";
import { Revenue } from "./definitions";
import { formatCurrency } from "./utils";
import { type Invoice, InvoiceStatus, PrismaClient } from "generated";

const prisma = new PrismaClient();

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    console.log("Data fetch completed after 3 seconds.");

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      take: 5,
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        amount: true,
        customer: {
          select: {
            name: true,
            image_url: true,
            email: true,
          },
        },
      },
    });

    const latestInvoices = data.map((invoice) => ({
      id: invoice.id,
      amount: formatCurrency(invoice.amount),
      name: invoice.customer.name,
      image_url: invoice.customer.image_url,
      email: invoice.customer.email,
    }));

    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = await prisma.invoice.count();
    const customerCountPromise = await prisma.customer.count();
    const paidInvoicesPromise = await prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "paid",
      },
    });

    const pendingInvoicesPromise = await prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "pending",
      },
    });

    const [numberOfInvoices, numberOfCustomers, paidResult, pendingResult] =
      await Promise.all([
        invoiceCountPromise,
        customerCountPromise,
        paidInvoicesPromise,
        pendingInvoicesPromise,
      ]);

    return {
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices: formatCurrency(paidResult._sum.amount ?? 0),
      totalPendingInvoices: formatCurrency(pendingResult._sum.amount ?? 0),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        date: true,
        status: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            image_url: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
      },
      where: {
        OR: [
          {
            customer: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
          },
          {
            status:
              query.toLowerCase() in InvoiceStatus
                ? { equals: query.toLowerCase() as InvoiceStatus }
                : undefined,
          },
        ],
      },
      orderBy: { date: "desc" },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    const invoicesWithAmount = invoices.map((invoice) => {
      const products = invoice.products.map((product) => ({
        ...product,
        price: Number(product.price),
      }));

      const amount = products.reduce((sum, product) => sum + product.price, 0);

      return {
        ...invoice,
        customer: {
          ...invoice.customer,
          image_url: invoice.customer.image_url ?? "/customers/default.png",
        },
        products,
        amount,   
      };
    });

    return invoicesWithAmount;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}


export async function fetchInvoicesPages(query: string) {
  try {
    const data = await prisma.invoice.count({
      where: {
        OR: [
          {
            customer: {
              OR: [
                {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
          {
            status:
              query.toLowerCase() in InvoiceStatus
                ? {
                    equals: query.toLowerCase() as InvoiceStatus,
                  }
                : undefined,
          },
        ],
      },
    });

    const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        customer_id: true,
        amount: true,
        status: true,
      },
    });

    if (!invoice) return null; 

    const formattedInvoice = {
      ...invoice,
      amount: Number(invoice.amount) / 100,
    };

    console.log(formattedInvoice);
    return formattedInvoice;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image_url: true,
        _count: { select: { invoices: true } }
      },
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
    });

    const invoices = await prisma.invoice.findMany({
      where: {
        customer_id: { in: customers.map(c => c.id) },
      },
      include: {
        products: true, 
      },
    });

    type Total = { [Status in Invoice["status"]]?: number };

    const totals: Record<string, Total> = {};

    invoices.forEach(invoice => {
      const amount = invoice.products.reduce((sum, p) => sum + Number(p.price), 0);
      if (!totals[invoice.customer_id]) totals[invoice.customer_id] = {};
      totals[invoice.customer_id][invoice.status] = (totals[invoice.customer_id][invoice.status] ?? 0) + amount;
    });

    return customers.map(customer => ({
      ...customer,
      image_url: customer.image_url ?? "/customers/default.png",
      total: totals[customer.id] ?? {}, 
    }));
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}


export async function fetchProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        invoice_id: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    const productsWithStatus = products.map((product) => ({
      ...product,
      status: product.invoice_id ? "Sold" : "Available",
    }));

    return productsWithStatus;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch products table.");
  }
}
