import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { notFound } from "next/navigation";
import { fetchInvoiceEditData } from "@/app/actions/invoices/queries";
import { fetchCustomers } from "@/app/actions/customers/queries";

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
