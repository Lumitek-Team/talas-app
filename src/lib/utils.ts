import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function retryConnect(fn, retries = 3) {
	try {
		return await fn();
	} catch (err) {
		if (retries <= 0) throw err;
		console.log("Retrying DB connection...", err);
		await new Promise((res) => setTimeout(res, 1000));
		return retryConnect(fn, retries - 1);
	}
}

export function getInitials(name: string) {
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase();
}