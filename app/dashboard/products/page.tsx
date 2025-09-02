import { Metadata } from "next";
import { fetchProducts } from "@/app/lib/data";
import { Product } from "@/app/lib/definitions";
import ProductsTable from "@/app/ui/products/table";


export const metadata: Metadata = {
  title: "Products",
};

export default async function Page() {
  const products: Product[] = await fetchProducts();

  return (
    <div className="w-full">
        <ProductsTable products={products} />
    </div>
  );
}