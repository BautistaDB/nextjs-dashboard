import { UpdateProduct, DeleteProduct } from "@/app/ui/products/buttons";
import { formatCurrency } from "@/app/lib/utils";
import { fetchFilteredProducts } from "@/app/lib/data";
import { Product } from "@/app/lib/definitions";
import ProductStatus from "@/app/ui/products/status";

export default async function ProductsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const products: Product[] = await fetchFilteredProducts(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile (cards) */}
          <div className="md:hidden">
            {products.map((p) => (
              <div key={p.id} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-base font-medium">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <ProductStatus status={p.status} />
                    <span className="text-sm font-semibold">
                      ${p.price}
                    </span>
                  </div>
                </div>

                {p.description ? (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                    {p.description}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-gray-400 italic">
                    No description
                  </p>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <UpdateProduct id={p.id} />
                  <DeleteProduct id={p.id} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop (table) */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Product</th>
                <th className="px-3 py-5 font-medium">Description</th>
                <th className="px-3 py-5 font-medium">Price</th>
                <th className="px-3 py-5 font-medium">Status</th>
                <th className="py-3 pl-6 pr-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none
                  [&:first-child>td:first-child]:rounded-tl-lg
                  [&:first-child>td:last-child]:rounded-tr-lg
                  [&:last-child>td:first-child]:rounded-bl-lg
                  [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">{p.name}</td>
                  <td className="px-3 py-3 max-w-[420px] truncate text-gray-600">
                    {p.description ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <ProductStatus status={p.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateProduct id={p.id} />
                      <DeleteProduct id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
