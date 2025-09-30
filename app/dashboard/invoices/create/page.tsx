import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/actions/customers/queries';
import { fetchProductsAvailable } from '@/app/actions/products/queries';
 
export default async function Page() {
  const [customers, products] = await Promise.all([
    fetchCustomers(),
    fetchProductsAvailable(),
  ]);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Create Invoice",
            href: "/dashboard/invoices/create",
            active: true,
          },
        ]}
      />
      <Form customers={customers} products={products} />
    </main>
  );
}