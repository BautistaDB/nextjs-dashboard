import { Metadata } from "next";
import { fetchFilteredCustomers } from "@/app/lib/data";
import CustomersTable from "@/app/ui/customers/table";
import { Suspense } from "react";
import { CustomersSkeleton } from "@/app/ui/skeletons";
import { lusitana } from "@/app/ui/fonts";
import { CreateCustomer } from "@/app/ui/customers/buttons";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || "";
  const customers = await fetchFilteredCustomers(query);

  return (
    <div className="w-full">
      <Suspense fallback={<CustomersSkeleton />}>
        <CustomersTable customers={customers} />
      </Suspense>
    </div>
  );
}