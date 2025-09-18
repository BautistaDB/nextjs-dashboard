"use client";

import { ProductFormat } from "@/app/lib/definitions";
import Link from "next/link";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { createProduct, ProductsState } from "@/app/lib/actions";
import { useActionState } from "react";

export default function Form({ products }: { products: ProductFormat[] }) {
  const initialState: ProductsState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createProduct, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="product" className="mb-2 block text-sm font-medium">
            Name product
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter product Name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
          >
            Description Product
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="description"
                name="description"
                type="text"
                placeholder="Enter product description"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <label htmlFor="price" className="mb-2 block text-sm font-medium">
            Price Product
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="price"
                name="price"
                type="text"
                placeholder="Enter product price"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
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
        <Button type="submit">Create Product</Button>
      </div>
    </form>
  );
}
