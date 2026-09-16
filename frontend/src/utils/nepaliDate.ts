import NepaliDate from "nepali-date-converter";

/**
 * NEITS RMS - Central Nepali Date/Time Utility
 *
 * Database dates remain AD/Gregorian.
 * All dates shown in the frontend are converted to BS.
 *
 * Nepal timezone: Asia/Kathmandu
 */

function toDate(value: string | Date | number): Date | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getNepalDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

/**
 * Convert AD/Gregorian date to BS.
 */
export function adToBsDate(
  value: string | Date | number
): {
  year: number;
  month: number;
  day: number;
} | null {
  const date = toDate(value);

  if (!date) return null;

  const parts = getNepalDateParts(date);

  try {
    const nepaliDate = new NepaliDate(
      parts.year,
      parts.month,
      parts.day
    );

    return {
      year: nepaliDate.getYear(),
      month: nepaliDate.getMonth(),
      day: nepaliDate.getDate(),
    };
  } catch (error) {
    console.error("BS DATE CONVERSION ERROR:", error);
    return null;
  }
}

/**
 * BS date:
 * 2083-04-24 BS
 */
export function formatNepaliDate(
  value: string | Date | number
): string {
  const bs = adToBsDate(value);

  if (!bs) return "-";

  return `${bs.year}-${String(bs.month).padStart(
    2,
    "0"
  )}-${String(bs.day).padStart(2, "0")} BS`;
}

/**
 * Nepal local time:
 * 03:45 PM
 */
export function formatNepaliTime(
  value: string | Date | number
): string {
  const date = toDate(value);

  if (!date) return "-";

  const parts = getNepalDateParts(date);

  const period = parts.hour >= 12 ? "PM" : "AM";

  let hour12 = parts.hour % 12;

  if (hour12 === 0) {
    hour12 = 12;
  }

  return `${String(hour12).padStart(2, "0")}:${String(
    parts.minute
  ).padStart(2, "0")} ${period}`;
}

/**
 * BS date + Nepal time:
 * 2083-04-24 BS, 03:45 PM
 */
export function formatNepaliDateTime(
  value: string | Date | number
): string {
  const date = toDate(value);

  if (!date) return "-";

  return `${formatNepaliDate(date)}, ${formatNepaliTime(
    date
  )}`;
}

/**
 * BS date + Nepal time + seconds:
 * 2083-04-24 BS, 03:45:32 PM
 */
export function formatNepaliDateTimeWithSeconds(
  value: string | Date | number
): string {
  const date = toDate(value);

  if (!date) return "-";

  const parts = getNepalDateParts(date);

  const period = parts.hour >= 12 ? "PM" : "AM";

  let hour12 = parts.hour % 12;

  if (hour12 === 0) {
    hour12 = 12;
  }

  return `${formatNepaliDate(date)}, ${String(
    hour12
  ).padStart(2, "0")}:${String(parts.minute).padStart(
    2,
    "0"
  )}:${String(parts.second).padStart(2, "0")} ${period}`;
}

/**
 * Nepali month names.
 */
export const nepaliMonthNames = [
  "",
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

/**
 * Long BS date:
 * 24 Shrawan 2083 BS
 */
export function formatNepaliDateLong(
  value: string | Date | number
): string {
  const bs = adToBsDate(value);

  if (!bs) return "-";

  const monthName =
    nepaliMonthNames[bs.month] || `Month ${bs.month}`;

  return `${bs.day} ${monthName} ${bs.year} BS`;
}

/**
 * Long BS date + time:
 * 24 Shrawan 2083 BS, 03:45 PM
 */
export function formatNepaliDateTimeLong(
  value: string | Date | number
): string {
  const date = toDate(value);

  if (!date) return "-";

  return `${formatNepaliDateLong(date)}, ${formatNepaliTime(
    date
  )}`;
}