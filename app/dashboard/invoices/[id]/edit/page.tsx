// app/dashboard/invoices/[id]/edit/page.tsx
import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers, fetchInvoiceEditData } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const [editData, customers] = await Promise.all([
    fetchInvoiceEditData(id), 
    fetchCustomers(),
  ]);

  if (!editData) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          { label: "Edit Invoice", href: `/dashboard/invoices/${id}/edit`, active: true },
        ]}
      />
      <Form invoice={editData.invoice} customers={customers} products={editData.products} />
    </main>
  );
}
