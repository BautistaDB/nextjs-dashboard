export default function ProductStatus({ status }: { status: "Available" | "Sold" }) {
  const isAvailable = status === "Available";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600",
      ].join(" ")}
    >
      {status}
    </span>
  );
}
