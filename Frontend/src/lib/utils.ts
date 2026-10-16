import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  } else {
    const s = Math.floor(value).toString();
    let res = '';
    let count = 0;
    for (let i = s.length - 1; i >= 0; i--) {
        res = s[i] + res;
        count++;
        if (count === 3 && i !== 0) {
            res = ',' + res;
        } else if (count > 3 && (count - 3) % 2 === 0 && i !== 0) {
            res = ',' + res;
        }
    }
    return `₹${res}`;
  }
}
