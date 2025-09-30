"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import {
  TagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { ProductFormat } from "@/app/lib/definitions";
import { useAction } from "next-safe-action/hooks";
import PriceInput from "../inputBigint";
import { updateProduct } from "@/app/actions/products/updateProduct";

export default function EditProductForm({
  product,
}: {
  product: ProductFormat;
}) {
  const [id] = useState(product.id);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(product.price);

  const { execute } = useAction(updateProduct);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = {
          id,
          name,
          description,
          price,
        };
        execute(input);
      }}
    >
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nombre */}
        <div className="mb-4">
          <input type="hidden" name="id" value={id} />
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
              onChange={(e) => setName(e.target.value)}
            />
            <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        {/* Precio */}
        <div className="mb-4">
          <label htmlFor="price" className="mb-2 block text-sm font-medium">
            Price
          </label>
          <div>
            <PriceInput
              value={product.price}
              onChange={(bigintVal) => setPrice(bigintVal)}
            />
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
                onChange={(e) => setDescription(e.target.value)}
              />
              <DocumentTextIcon className="pointer-events-none absolute left-3 top-3 h-[18px] w-[18px] text-gray-500" />
            </div>
          </div>
        </div>
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
