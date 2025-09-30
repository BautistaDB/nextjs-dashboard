"use client";

import { ProductFormat } from "@/app/lib/definitions";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import PriceInput from "../inputBigint";
import { createProduct } from "@/app/actions/products/createProduct";

export default function Form({ products }: { products: ProductFormat[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<bigint>(BigInt(0));

  const { execute } = useAction(createProduct);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = {
          name,
          description,
          price,
        };
        execute(input);
      }}
    >
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
              onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <label htmlFor="price" className="mb-2 block text-sm font-medium">
            Price Product
          </label>
          <PriceInput value={BigInt(0)} onChange={(val) => setPrice(val)} />
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
