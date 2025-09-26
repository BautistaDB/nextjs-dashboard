"use client";

import { useEffect, useState } from "react";
import Modal from "../../../Modal";
import { Spinner } from "../spinner";
import { ProductFormat } from "../../lib/definitions";
import { formatPriceFromCents } from "@/app/lib/utils";

export default function ProductModal({
  invoiceId,
  count,
}: {
  invoiceId: string;
  count: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<ProductFormat[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (products !== null) return; 

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/invoices/${invoiceId}/products`);
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();
        setProducts(data.products ?? []);
      } catch (e: any) {
        setError(e.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, invoiceId, products]);

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
          {loading && (
            <div className="py-6 text-center">
              <Spinner />
              <p className="mt-2 text-sm text-gray-500">Cargando productos…</p>
            </div>
          )}

          {!loading && error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {!loading && !error && (
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
                <li className="text-sm text-gray-500">Sin productos.</li>
              )}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}