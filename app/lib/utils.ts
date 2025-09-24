import { Product } from '@/generated';
import { RevenueTable, ProductStatus } from './definitions';

export function formatPriceFromCents(cents: bigint | number): string {
  if (cents === null || cents === undefined) return "$0,00";
  const s = typeof cents === "bigint" ? cents.toString() : Math.trunc(cents).toString();
  const entero = s.length > 2 ? s.slice(0, -2) : "0";
  const dec = s.slice(-2).padStart(2, "0");
  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");// Separador de miles
  return `$${miles},${dec}`;
}

export function formatDateToLocal(
  date: Date,
  locale?: string,
): string;
export function formatDateToLocal(
  dateStr: string,
  locale?: string,
): string;
export function formatDateToLocal(
  dateOrStr: string | Date,
  locale: string = 'en-US',
) {
  const date = dateOrStr instanceof Date ? dateOrStr: new Date(dateOrStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: RevenueTable[]) => {
  // Tomar el valor máximo
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));

  // Redondear hacia arriba al múltiplo de 1M más cercano
  const topLabel = Math.ceil(highestRecord / 1_000_000) * 1_000_000;

  const yAxisLabels: string[] = [];

  // Decrementar en pasos de 1M
  for (let i = topLabel; i >= 0; i -= 5_000_000) {
    yAxisLabels.push(`$${i / 5_000_000}M`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

export function prodStatus({ invoice_id }: Pick<Product, "invoice_id">): ProductStatus{
  return invoice_id === null ? "Available" : "Sold";
}