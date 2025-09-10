// app/ui/products/edit-form.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import {
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { updateProduct, ProductsState } from "@/app/lib/actions";

export type ProductForm = {
  id: string;
  name: string;
  description: string | null;
  price: number;
};

export default function EditProductForm({ product }: { product: ProductForm }) {
  const initialState: ProductsState = { message: null, errors: {} };
  const updateWithId = updateProduct.bind(null, product.id);
  const [state, formAction] = useActionState(updateWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nombre */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Product name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={product.name}
              placeholder="e.g. Wireless Mouse"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {state.errors?.name && (
            <p className="mt-2 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Precio */}
        <div className="mb-4">
          <label htmlFor="price" className="mb-2 block text-sm font-medium">
            Price
          </label>
          <div className="relative">
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={product.price}
              placeholder="Enter price"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {state.errors?.price && (
            <p className="mt-2 text-sm text-red-600">{state.errors.price[0]}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
          >
            Description
          </label>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product.description ?? ""}
              placeholder="Short product description"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
            <DocumentTextIcon className="pointer-events-none absolute left-3 top-3 h-[18px] w-[18px] text-gray-500" />
          </div>
          {state.errors?.description && (
            <p className="mt-2 text-sm text-red-600">
              {state.errors.description[0]}
            </p>
          )}
        </div>

        {/* Mensaje general de error */}
        {state.message && (
          <p className="mt-2 text-sm text-red-600">{state.message}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/products"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}
