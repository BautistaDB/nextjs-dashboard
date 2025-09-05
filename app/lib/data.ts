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

    // Darle el mismo formato que antes
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
        amount: true,
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
      },
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
          // {
          //   amount: {
          //     equals: Number(query),
          //   },
          // },
          {
            status:
              query.toLowerCase() in InvoiceStatus
                ? {
                    equals: query.toLowerCase() as InvoiceStatus,
                  }
                : undefined,
          },
          // {
          //   date: {
          //     gte: new Date(query),
          //   },
          // },
        ],
      },
      orderBy: {
        date: "desc",
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    return invoices.map(({ customer, ...invoice }) => ({
      ...invoice,
      customer: {
        ...customer,
        image_url: customer.image_url ?? "/customers/default.png",
      },
    }));
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

    if (!invoice) return null; // No existe factura con ese ID

    // Convertimos amount de cents a dólares
    const formattedInvoice = {
      ...invoice,
      amount: Number(invoice.amount) / 100, // prisma devuelve un Decimal por eso se convierte a Number
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
    const [customers, invoicesSum] = await Promise.all([
      prisma.customer.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image_url: true,
          _count: {
            select: {
              invoices: true,
            },
          },
        },
        where: {
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
        orderBy: {
          name: "asc",
        },
      }),
      prisma.invoice.groupBy({
        by: ["customer_id", "status"],
        _sum: {
          amount: true,
        },
        where: {
          OR: [
            {
              customer: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
            {
              customer: {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          ],
        },
      }),
      // [
      //  { _sum: number, customer_id: 1, status: "pending"}
      //  { _sum: number, customer_id: 1, status: "paid"}
      //  { _sum: number, customer_id: 2, status: "pending"}
      //  { _sum: number, customer_id: 2, status: "paid"}
      //  { _sum: number, customer_id: 3, status: "paid"}
      //  { _sum: number, customer_id: 4, status: "paid"}
      //  { _sum: number, customer_id: 6, status: "pending"}
      // ]
    ]);
    // const data = await sql<CustomersTableType[]>`
    // SELECT
    //   customers.id,
    //   customers.name,
    //   customers.email,
    //   customers.image_url,
    //   COUNT(invoices.id) AS total_invoices,
    //   SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
    //   SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
    // FROM customers
    // LEFT JOIN invoices ON customers.id = invoices.customer_id
    // WHERE
    //   customers.name ILIKE ${`%${query}%`} OR
    //     customers.email ILIKE ${`%${query}%`}
    // GROUP BY customers.id, customers.name, customers.email, customers.image_url
    // ORDER BY customers.name ASC
    // `;

    type Total = {
      [Status in Invoice["status"]]?: string;
    };

    const totals = invoicesSum.reduce(
      (totals, sum) => ({
        [sum.customer_id]: {
          ...totals[sum.customer_id],
          [sum.status]: formatCurrency(sum._sum.amount ?? 0),
        },
      }),
      {} as { [customer_id: Invoice["customer_id"]]: Total }
    );

    // {
    //  1: {
    //        pending: string,
    //        paid: string,
    //  },
    //  2: {
    //        pending: string,
    //        paid: string,
    //  },
    //  3: {
    //        paid: string,
    //  },
    //  4: {
    //        paid: string,
    //  },
    //  6: {
    //        pending: string,
    //  },
    // }

    return customers.map(({ image_url, ...customer }) => ({
      ...customer,
      image_url: image_url ?? "/customers/default.png",
      total: totals[customer.id],
    }));
    // [
    //  {...customer, total: { pending: string, paid: string }}
    // ]
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
