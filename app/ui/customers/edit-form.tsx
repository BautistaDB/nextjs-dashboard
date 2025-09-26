"use client";

import { CustomerTable } from "@/app/lib/definitions";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import { updateCustomer } from "@/app/lib/actions";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { ErrorMessages } from "@/errors";

export default function Form({
  customer,
}: {
  customer: CustomerTable;
}) {
  const [id] = useState(customer.id);
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [image, setImage] = useState<File | null>(null);
  const { execute, result: { validationErrors } } = useAction(updateCustomer);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = {
          id,
          name,
          email,
          image_url: image?.name ?? null,
        };
        execute(input);
      }}
    >
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <input
            type="hidden"
            name="id"
            value={id}
          />

          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Customer Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={customer.name}
              placeholder="Enter customer name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              onChange={(e) => setName(e.target.value)}
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Customer Email */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Customer Email
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={customer.email}
                placeholder="Enter customer email"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <ErrorMessages errors={validationErrors?.email} />
        </div>

        {/* Customer Image */}
        <div className="mb-4">
          <label htmlFor="image" className="mb-2 block text-sm font-medium">
            Customer Image
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="image"
                name="image_url"
                type="file"
                placeholder="input customer Image"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Customer</Button>
      </div>
    </form>
  );
}
