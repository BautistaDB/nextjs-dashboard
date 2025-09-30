"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Spinner } from "../spinner";
import { ProductClient, } from "../../lib/definitions";
import { formatPriceFromCents } from "@/app/lib/utils";
import { useAction } from "next-safe-action/hooks";
import { getInvoiceProducts } from "@/app/actions/products/viewProduct";

export default function ProductModal({
  id,
  count,
}: {
  id: string;
  count: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<ProductClient[] | null>(null);
  const [error, setError] = useState<string | null>(null);

const { execute, isExecuting } = useAction(getInvoiceProducts, {
    onSuccess: (res) => {
      if (res?.data?.ok) {
        setProducts(res.data.products as ProductClient[]);
        setError(null);
      } else {
        setError("Error al cargar productos");
      }
    },
    onError: (err) => {
      console.error("getInvoiceProducts error:", err);
      setError(err.error?.serverError ?? "Error al cargar productos");
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (products !== null) return;
    setError(null);
    execute({ id });
  }, [isOpen, id, products, execute]);

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded px-2 py-1 border hover:bg-gray-50"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        ►
      </button>
      <span className="text-sm text-gray-500">{count}</span>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)} title="Detalle de Factura">
          {isExecuting && (
            <div className="py-6 text-center">
              <Spinner />
              <p className="mt-2 text-sm text-gray-500">Cargando productos…</p>
            </div>
          )}

          {!isExecuting && error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {!isExecuting && !error && (
            <ul className="space-y-2">
              {products?.length ? (
                products.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between border-b pb-1 text-sm"
                  >
                    <span>{p.name}</span>
                    <span>{formatPriceFromCents(Number(p.price))}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">No hay productos</li>
              )}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}