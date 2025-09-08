'use client';

import { useState } from "react";
import Modal from "./Modal";

export default function ProductModal({ products }: { products: { id: string; name: string; price: number; }[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>►</button>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)} title="Detalle de Factura">
          <ul>
            {products.map(product => (
              <li key={product.id}>
                {product.name} - ${product.price}
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}