import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import imageCompression from "browser-image-compression";
import { supabase } from "./supabase/client";
import prisma from "./prisma";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function retryConnect(fn: () => Promise<any>, retries = 3) {
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

export function convertOembedToIframe(html: string) {
	const div = document.createElement("div");
	div.innerHTML = html;

	div.querySelectorAll("oembed[url]").forEach((element) => {
		const url = element.getAttribute("url");
		if (url && url.includes("youtube.com")) {
			const videoId = new URL(url).searchParams.get("v");
			if (videoId) {
				const iframe = document.createElement("iframe");

				iframe.className = "mx-auto mt-2 w-3/4 aspect-video";

				iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}`);
				iframe.setAttribute("frameborder", "0");
				iframe.setAttribute(
					"allow",
					"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				);
				iframe.setAttribute("allowfullscreen", "true");
				element.replaceWith(iframe);
			}
		}
	});

	return div.innerHTML;
}

export function convertIframeToOembed(html: string): string {
	if (typeof document === "undefined") {
		console.error(
			"convertIframeToOembed can only be run in a browser environment."
		);
		return html; // Return the original HTML if not in a browser
	}

	const div = document.createElement("div");
	div.innerHTML = html;

	div.querySelectorAll("iframe").forEach((iframe) => {
		const src = iframe.getAttribute("src");

		if (src && src.includes("youtube.com/embed/")) {
			const videoId = src.split("/embed/")[1]?.split("?")[0];
			if (videoId) {
				const oembed = document.createElement("oembed");
				oembed.setAttribute(
					"url",
					`https://www.youtube.com/watch?v=${videoId}`
				);

				const figure = document.createElement("figure");
				figure.className = "media";
				figure.appendChild(oembed);

				iframe.replaceWith(figure);
			}
		}
	});

	return div.innerHTML;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
	func: T,
	wait: number
) {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export async function getCroppedImg(
	imageSrc: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	croppedAreaPixels: any
): Promise<Blob> {
	const image = await createImage(imageSrc);
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	canvas.width = croppedAreaPixels.width;
	canvas.height = croppedAreaPixels.height;

	ctx!.drawImage(
		image,
		croppedAreaPixels.x,
		croppedAreaPixels.y,
		croppedAreaPixels.width,
		croppedAreaPixels.height,
		0,
		0,
		croppedAreaPixels.width,
		croppedAreaPixels.height
	);

	return new Promise<Blob>((resolve) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
			},
			"image/jpeg",
			1
		);
	});
}

// Helper untuk kompresi gambar
export async function compressImage(blob: Blob): Promise<File> {
	const file = new File([blob], "temp-image.jpg", { type: blob.type });
	const compressedBlob = await imageCompression(file, {
		maxSizeMB: 2, // Targetkan 2MB
		maxWidthOrHeight: 1024, // Bisa ubah sesuai kebutuhan
		useWebWorker: true,
	});

	return new File([compressedBlob], "cropped-profile.jpg", {
		type: "image/jpeg",
	});
}

// Helper untuk load gambar ke dalam elemen Image
function createImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.addEventListener("load", () => resolve(img));
		img.addEventListener("error", (err) => reject(err));
		img.setAttribute("crossOrigin", "anonymous");
		img.src = url;
	});
}

export async function uploadImage(file: File, folder: string): Promise<string> {
	const buffer = Buffer.from(await file.arrayBuffer());
	const fileExt = file.name.split(".").pop();

	// Use the browser's crypto.randomUUID()
	const uniqueId = self.crypto.randomUUID();
	const fileName = `${folder}/${Date.now()}-${uniqueId}.${fileExt}`;

	const { error } = await supabase.storage
		.from("talas-image") // Ensure this bucket name is correct
		.upload(fileName, buffer, {
			contentType: file.type,
			// Consider adding cacheControl for browser caching, e.g., 'public, max-age=31536000'
		});

	if (error) {
		console.error("Supabase upload error:", error); // Log the actual error
		throw new Error(`Failed to upload image: ${error.message}`);
	}

	return fileName;
}

export async function deleteImage(path: string): Promise<void> {
	const { error } = await supabase.storage.from("talas-image").remove([path]);

	if (error) {
		console.error("Supabase delete error:", error);
		throw new Error(`Failed to delete image: ${error.message}`);
	}
}

export function getPublicUrl(path: string | null | undefined): string {
	// Allow null/undefined input
	if (!path) {
		// Handle cases where path might be null, undefined, or empty
		// console.warn("getPublicUrl called with empty or invalid path.");
		return ""; // Return empty or a fallback placeholder URL
	}

	// Check if the path is already an absolute URL
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path; // It's already a full URL, return it as is
	}

	// If it's a relative path, then construct the Supabase public URL
	const { data } = supabase.storage.from("talas-image").getPublicUrl(path);

	if (!data.publicUrl) {
		console.error(`Error getting public URL for relative path: ${path}`);
		return ""; // Or return a placeholder / error image URL
	}

	return data.publicUrl;
}

// DELETE the old getAllDescendantCommentIds function

// ADD this new, efficient function
export async function getCommentTreeIds(parentId: string): Promise<string[]> {
	// This raw SQL query is extremely efficient and runs in a single database roundtrip.
	// Note: The table name "Comment" must exactly match your database table name (it's case-sensitive).
	const result = await prisma.$queryRaw<Array<{ id: string }>>`
        WITH RECURSIVE CommentTree AS (
            -- This is the starting point: the direct parent comment
            SELECT id FROM "Comment" WHERE id = ${parentId}
            UNION ALL
            -- This part runs repeatedly, finding all children of the previous set
            SELECT c.id
            FROM "Comment" c
            JOIN CommentTree ct ON c.parent_id = ct.id
        )
        -- Finally, select all the IDs found, excluding the original parent
        SELECT id FROM CommentTree WHERE id != ${parentId}
    `;

	// Extracts just the ID strings from the result
	return result.map((row) => row.id);
}
