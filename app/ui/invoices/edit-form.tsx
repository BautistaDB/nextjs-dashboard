"use client";

import {
  CustomerTable,
  InvoiceTable,
  ProductFormat,
  Status,
} from "@/app/lib/definitions";
import {
  CheckIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/app/ui/button";
import { updateInvoice } from "@/app/actions/invoices/updateInvoice";
import { useAction } from "next-safe-action/hooks";
import { formatPriceFromCents, prodStatus } from "@/app/lib/utils";
import { useState } from "react";

export default function EditInvoiceForm({
  invoice,
  customers,
  products,
}: {
  invoice: InvoiceTable;
  customers: CustomerTable[];
  products: ProductFormat[];
}) {
  const [id] = useState(invoice.id);
  const [customerId, setCustomerId] = useState(invoice.customer_id);
  const [status, setStatus] = useState<Status>(invoice.status);
  const [productIds, setProductIds] = useState<string[]>(
    products.filter((p) => p.invoice_id === invoice.id).map((p) => p.id)
  );
  const { execute, result: {validationErrors} } = useAction(updateInvoice);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = {
          id,
          customerId,
          status,
          productIds,
        };
        execute(input);
      }}
    >
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <input type="hidden" name="id" value={id} />
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={invoice.customer_id}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Choose products
          </label>
          <div
            className="space-y-2 rounded-md border border-gray-200 bg-white p-3"
            aria-describedby={
              validationErrors?.productIds ? "products-error" : undefined
            }
          >
            {products.map((p) => (
              <label
                key={p.id}
                className="flex items-center space-x-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="productIds"
                  value={p.id}
                  defaultChecked={prodStatus(p) === "Sold"}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setProductIds([...productIds, e.target.value]);
                    } else {
                      setProductIds(
                        productIds.filter((id) => id !== e.target.value)
                      );
                    }
                  }}
                />
                <span>
                  {p.name} — {formatPriceFromCents(p.price)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  defaultChecked={invoice.status === "pending"}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  onChange={(e) => setStatus(e.currentTarget.value as Status)}
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
                  defaultChecked={invoice.status === "paid"}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  onChange={(e) => setStatus(e.currentTarget.value as Status)}
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
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Invoice</Button>
      </div>
    </form>
  );
}
