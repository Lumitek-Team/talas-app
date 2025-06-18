import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/imageUtils";

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const folder = formData.get("folder") as string | undefined;

		if (!folder) {
			return NextResponse.json(
				{ error: "Folder is required." },
				{ status: 400 }
			);
		}

		const files: File[] = [];
		formData.forEach((value, key) => {
			if (key.startsWith("files") && value instanceof File) {
				files.push(value);
			}
		});

		if (files.length === 0) {
			return NextResponse.json(
				{ error: "No files provided." },
				{ status: 400 }
			);
		}

		const filePaths = await Promise.all(
			files.map((file) => uploadImage(file, folder))
		);
		return NextResponse.json({ filePaths });
	} catch (error) {
		console.error("Error uploading images:", error);
		return NextResponse.json(
			{ error: "Failed to upload images." },
			{ status: 500 }
		);
	}
}
