import { Product } from "@/app/lib/definitions";

export default function ProductsTable({ products }: { products: Product[] }) {
  return (
    <table className="w-full table-auto border-collapse border border-gray-200">
      <thead>
        <tr>
          <th className="border px-4 py-2">Nombre</th>
          <th className="border px-4 py-2">Precio</th>
          <th className="border px-4 py-2">Estado</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td className="border px-4 py-2">{p.name}</td>
            <td className="border px-4 py-2">${p.price}</td>
            <td className="border px-4 py-2">{p.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
