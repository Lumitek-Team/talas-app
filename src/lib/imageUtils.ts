import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

export async function uploadImage(file: File, folder: string): Promise<string> {
	try {
		// Convert the file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Extract file extension
		const fileExt = file.name.split(".").pop();

		// Generate unique file name
		const uniqueId = randomUUID();
		const fileName = `${Date.now()}-${uniqueId}.${fileExt}`;

		// Create the full path
		const storageDir = path.join(process.cwd(), "public", "storage", folder);
		const filePath = path.join(storageDir, fileName);

		// Ensure the folder exists
		try {
			await fs.access(storageDir);
		} catch {
			await fs.mkdir(storageDir, { recursive: true });
		}

		// Write the file to the local path
		await fs.writeFile(filePath, buffer);

		// Return the public path
		return `/storage/${folder}/${fileName}`;
	} catch (error) {
		console.error("Error uploading image:", error);
		throw new Error("Failed to upload image");
	}
}

export async function deleteImages(imagePaths: string[]): Promise<void> {
	for (const imageUrlOrPath of imagePaths) {
		try {
			// Jika path adalah URL, ambil hanya pathname-nya
			let pathname = imageUrlOrPath;
			if (imageUrlOrPath.startsWith("http")) {
				pathname = new URL(imageUrlOrPath).pathname;
			}

			// Hapus leading slash agar join aman
			const normalizedPath = pathname.replace(/^\/+/, "");
			const fullPath = path.join(process.cwd(), "public", normalizedPath);

			console.log("Deleting file at:", fullPath);

			await fs.access(fullPath); // Pastikan file ada
			await fs.unlink(fullPath); // Hapus file
		} catch (err: any) {
			if (err.code === "ENOENT") {
				console.warn("File not found:", imageUrlOrPath);
			} else {
				console.error("Error deleting image:", err);
				throw new Error(`Failed to delete image: ${imageUrlOrPath}`);
			}
		}
	}
}
