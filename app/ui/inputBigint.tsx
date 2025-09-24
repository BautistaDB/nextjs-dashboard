"use client";

import { useState, useEffect } from "react";
import { PriceInputProps } from "../lib/definitions";

// Formatea bigint en centavos a string con puntos y coma
function formatBigint(value?: bigint): string {
  if (value === undefined) return "";

  const s = value.toString();
  const entero = s.length > 2 ? s.slice(0, -2) : "0";
  const decimales = s.slice(-2).padStart(2, "0");

  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Agregar puntos de miles

  return `${miles},${decimales}`;
}

// Convierte string (con puntos de miles y coma decimal) a bigint en centavos
function parseToBigint(val: string): bigint {
  if (!val) return BigInt(0);

  val = val.replace(/\./g, ""); // Quitar puntos de miles

  let [entero, decimales = ""] = val.split(","); // Separa coma

  decimales = (decimales + "00").slice(0, 2); // Normaliza decimales a 2 dígitos

  const all = entero + decimales;
  return BigInt(all);
}

export default function PriceInput({ value, onChange }: PriceInputProps) {
  const [inputValue, setInputValue] = useState(() => formatBigint(value));

  useEffect(() => {
    setInputValue(formatBigint(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Solo números, puntos y comas
    val = val.replace(/[^0-9.,]/g, "");

    setInputValue(val);

    const bigintVal = parseToBigint(val);
    onChange?.(bigintVal);
  };

  const handleBlur = () => {
    // Al salir del input → formatear bonito con miles y coma
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
