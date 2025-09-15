import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

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

export const generateYAxis = (revenue: Revenue[]) => {
  // Tomar el valor máximo (no el mínimo)
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));

  // Redondear hacia arriba al múltiplo de 10k más cercano
  const topLabel = Math.ceil(highestRecord / 10_000) * 10_000;

  const yAxisLabels: string[] = [];

  // Decrementar en pasos de 10k
  for (let i = topLabel; i >= 0; i -= 10_000) {
    yAxisLabels.push(`$${i / 1_000}K`);
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
