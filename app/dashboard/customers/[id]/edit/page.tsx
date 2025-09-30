import Form from "@/app/ui/customers/edit-form";
import Breadcrumbs from "@/app/ui/customers/breadcrumbs";
import { notFound } from "next/navigation";
import { fetchCustomerById } from "@/app/actions/customers/queries";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  try {
    const {data, serverError, validationErrors} = await fetchCustomerById(id);
    if(!data) throw validationErrors ?? serverError;
    return (
      <main>
        <Breadcrumbs
          breadcrumbs={[
            { label: "Customers", href: "/dashboard/customers" },
            {
              label: "Edit Customer",
              href: `/dashboard/customers/${id}/edit`,
              active: true,
            },
          ]}
        />
        <Form customer={data} />
      </main>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
