import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/imageUtils";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
	try {
		const { getToken, userId } = await auth();
		const supabaseToken = await getToken();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await req.formData();
		const folder = formData.get("folder") as string | undefined;

		if (!folder) {
			return NextResponse.json(
				{ error: "Folder is required." },
				{ status: 400 }
			);
		}

		// Prepend userId for secure path
		const secureFolder = `${userId}/${folder}`;

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
			files.map((file) => uploadImage(file, secureFolder, supabaseToken || undefined))
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
