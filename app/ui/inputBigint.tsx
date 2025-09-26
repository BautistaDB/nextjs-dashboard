"use client";

import { useState, useEffect } from "react";

type PriceInputProps = {
  value?: bigint; //
  onChange?: (value: bigint) => void;
};

// Formatea bigint en centavos a string con puntos y coma
function formatBigint(value?: bigint): string {
  if (value === undefined) return "";
  const s = value.toString();
  const entero = s.length > 2 ? s.slice(0, -2) : "0";
  const decimales = s.slice(-2).padStart(2, "0");
  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // agrega puntos cada 3 digitios
  return `${miles},${decimales}`;
}

// Convierte string a bigint en centavos
function parseToBigint(val: string): bigint {
  // Si no hay coma y hay punto
  if (!val.includes(",") && val.includes(".")) {
    const i = val.lastIndexOf("."); //se usa el ultimo punto para decimal
    val = val.slice(0, i) + "," + val.slice(i + 1);
  }
  val = val.replace(/\./g, "");  // saca los puntos
  let [entero, decimales = ""] = val.split(",");  // separa con coma
  decimales = (decimales + "00").slice(0, 2);  // decimal con 2 digitos
  const num = (entero || "0") + decimales;
  return BigInt(num);
}

export default function PriceInput({ value, onChange }: PriceInputProps) {
  const [inputValue, setInputValue] = useState(() => formatBigint(value));

  useEffect(() => {
    setInputValue(formatBigint(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/[^0-9.,]/g, ""); // solo números, puntos y coma
    setInputValue(val);
    const bigintVal = parseToBigint(val);
    onChange?.(bigintVal);
  };

  const handleBlur = () => { // sale del input y formatea
    const bigintVal = parseToBigint(inputValue); 
    setInputValue(formatBigint(bigintVal));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="Enter price"
      className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
    />
  );
}
