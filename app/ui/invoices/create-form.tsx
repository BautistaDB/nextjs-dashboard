"use client";

import { CustomerField, ProductField } from "@/app/lib/definitions";
import Link from "next/link";
import { CheckIcon, ClockIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/app/lib/utils";
import { Button } from "@/app/ui/button";
import { createInvoice, InvoicesState } from "@/app/lib/actions";
import { useActionState } from "react";

export default function Form({
  customers,
  products,
}: {
  customers: CustomerField[];
  products: ProductField[];
}) {
  const initialState: InvoicesState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby={state.errors?.customerId ? "customer-error" : undefined}
              aria-invalid={!!state.errors?.customerId}
              required
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {state.errors?.customerId && (
            <p id="customer-error" className="mt-1 text-sm text-red-600">
              {state.errors.customerId}
            </p>
          )}
        </div>

        {/* Products */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Choose products</label>
          <div
            className="space-y-2 rounded-md border border-gray-200 bg-white p-3"
            aria-describedby={state.errors?.productIds ? "products-error" : undefined}
          >
            {products.map((p) => (
              <label key={p.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="productIds"
                  value={p.id}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2"
                />
                <span>
                  {p.name} — {formatCurrency(p.price)}
                </span>
              </label>
            ))}
          </div>
          {state.errors?.productIds && (
            <p id="products-error" className="mt-1 text-sm text-red-600">
              {state.errors.productIds}
            </p>
          )}
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">Set the invoice status</legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  required
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid" 
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {state.errors?.status && (
          <p className="mt-1 text-sm text-red-600" id="status-error">
            {state.errors.status}
          </p>
        )}
        {state.message && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{state.message}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
}
