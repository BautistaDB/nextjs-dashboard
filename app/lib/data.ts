import { formatCurrency } from "./utils";
import { type Invoice, InvoiceStatus, PrismaClient } from "generated";
import { type ProductForm, ProductStatus } from "./definitions";

const prisma = new PrismaClient().$extends({
  result: {
    product: {
      status: {
        compute: ({ invoice_id }) =>
          invoice_id === null ? "available" : "sold",
      },
    },
  },
});

/* --------------  DASHBOARD  ---------------- */

export async function fetchRevenue() {
  try {
    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await prisma.revenue.findMany();

    console.log("Data fetch completed after 3 seconds.");
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    // Ya no leemos 'amount' desde invoices; calculamos el total por productos
    const data = await prisma.invoice.findMany({
      take: 5,
      orderBy: { date: "desc" },
      select: {
        id: true,
        customer: {
          select: { name: true, image_url: true, email: true },
        },
        products: { select: { price: true } },
      },
    });

    const latestInvoices = data.map((invoice) => {
      const total =
        invoice.products.reduce(
          (sum, p) => sum + Number(p.price),
          0
        ) ?? 0;

      return {
        id: invoice.id,
        amount: formatCurrency(total), // mantenemos la propiedad para no romper UI
        name: invoice.customer.name,
        image_url: invoice.customer.image_url ?? "/customers/default.png",
        email: invoice.customer.email,
      };
    });

    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    const invoiceCountPromise = prisma.invoice.count();
    const customerCountPromise = prisma.customer.count();

    // En vez de _sum.amount, sumamos precios de productos por estado de la invoice
    const paidInvoicesPromise = prisma.invoice.findMany({
      where: { status: "paid" },
      select: { products: { select: { price: true } } },
    });

    const pendingInvoicesPromise = prisma.invoice.findMany({
      where: { status: "pending" },
      select: { products: { select: { price: true } } },
    });

    const [numberOfInvoices, numberOfCustomers, paidList, pendingList] =
      await Promise.all([
        invoiceCountPromise,
        customerCountPromise,
        paidInvoicesPromise,
        pendingInvoicesPromise,
      ]);

    const sumProducts = (invoices: { products: { price: any }[] }[]) =>
      invoices.reduce(
        (acc, inv) =>
          acc +
          inv.products.reduce((s, p) => s + Number(p.price), 0),
        0
      );

    return {
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices: formatCurrency(sumProducts(paidList)),
      totalPendingInvoices: formatCurrency(sumProducts(pendingList)),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

/* --------------  INVOICES ---------------- */

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
              (query?.toLowerCase?.() ?? "") in InvoiceStatus
                ? { equals: query.toLowerCase() as InvoiceStatus }
                : undefined,
          },
        ],
      },
      orderBy: { date: "desc" },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    // Calculamos total a partir de products.price (no columna amount)
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
        amount, // valor derivado
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
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
          },
          {
            status:
              (query?.toLowerCase?.() ?? "") in InvoiceStatus
                ? { equals: query.toLowerCase() as InvoiceStatus }
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
    // Quitamos 'amount' del select
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        customer_id: true,
        status: true,
        products: { select: { price: true } }, // opcional, por si necesitás el total
      },
    });

    if (!invoice) return null;

    // Si necesitás el total en el form, lo calculás aquí (no es columna)
    const total =
      invoice.products?.reduce((s, p) => s + Number(p.price), 0) ?? 0;

    return {
      id: invoice.id,
      customer_id: invoice.customer_id,
      status: invoice.status,
      total, // derivado; eliminar si no lo usás
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

/* --------------  CUSTOMERS ---------------- */

export async function fetchCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
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
        _count: { select: { invoices: true } },
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
      where: { customer_id: { in: customers.map((c) => c.id) } },
      include: { products: true },
    });

    type Total = { [Status in Invoice["status"]]?: number };
    const totals: Record<string, Total> = {};

    invoices.forEach((invoice) => {
      const amount = invoice.products.reduce(
        (sum, p) => sum + Number(p.price),
        0
      );
      if (!totals[invoice.customer_id]) totals[invoice.customer_id] = {};
      totals[invoice.customer_id][invoice.status] =
        (totals[invoice.customer_id][invoice.status] ?? 0) + amount;
    });

    return customers.map((customer) => ({
      ...customer,
      image_url: customer.image_url ?? "/customers/default.png",
      total: totals[customer.id] ?? {},
    }));
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

export async function fetchCustomerById(id: string) {
  try {
    // Quitamos 'amount' del select
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!customer) return null;

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

/* --------------  PRODUCTS ---------------- */

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: "Available" | "Sold";
};

export async function fetchProducts(): Promise<ProductRow[]> {
  const rows = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      invoice_id: true,
    },
    orderBy: { name: "asc" },
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price:
      typeof p.price === "object" && p.price !== null && "toNumber" in p.price
        ? (p.price as any).toNumber()
        : Number(p.price),
    status: p.invoice_id === null ? "Available" : "Sold",
  }));
}

export async function fetchFilteredProducts(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const prod = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        invoice_id: true,
      },
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    const productsWithPrice = prod.map((product) => ({
      ...product,
      price: Number(product.price),
      status: (product.invoice_id ? "Sold" : "Available") as ProductStatus,
    }));

    return productsWithPrice;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchProductsPages(query: string) {
  try {
    const data = await prisma.product.count({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
    });

    const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchProductById(
  id: string
): Promise<ProductForm | null> {
  const p = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      invoice_id: true,
    },
  });

  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    price: typeof p.price === "number" ? p.price : Number(p.price),
    status: p.invoice_id ? "sold" : "available",
  };
}

export async function fetchProductsAvailable() {
  const available = await prisma.product.findMany({
    where: { invoice_id: null },
    select: { id: true, name: true, price: true },
    orderBy: { name: "asc" },
  });

  return available.map((p) => ({
    id: p.id,
    name: p.name,
    price: typeof p.price === "number" ? p.price : Number(p.price),
  }));
}
