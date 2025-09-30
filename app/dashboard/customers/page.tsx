import { Metadata } from "next";
import CustomersTable from "@/app/ui/customers/table";
import { Suspense } from "react";
import { CustomersSkeleton } from "@/app/ui/skeletons";
import { fetchFilteredCustomers } from "@/app/actions/customers/queries";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const {query=""} = await searchParams;
  const customers = await fetchFilteredCustomers(query);


  return (
    <div className="w-full">
      <Suspense fallback={<CustomersSkeleton />}>
        <CustomersTable customers={customers} />
      </Suspense>
    </div>
  );
}