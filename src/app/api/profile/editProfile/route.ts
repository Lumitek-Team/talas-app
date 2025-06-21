import { NextResponse } from "next/server";
import { uploadImage, deleteImages } from "@/lib/imageUtils";

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File | null;
		const folder = formData.get("folder") as string | undefined;
		const oldImagePath = formData.get("oldImagePath") as string | undefined;

		if (!file || !folder) {
			return NextResponse.json(
				{ error: "File and folder are required." },
				{ status: 400 }
			);
		}

		// Delete the old image if it exists
		if (oldImagePath) {
			await deleteImages([oldImagePath]);
		}

		// Upload the new image and get the relative path
		const newImagePath = await uploadImage(file, folder);

		// Return the relative path
		return NextResponse.json({ newImagePath });
	} catch (error) {
		console.error("Error editing profile image:", error);
		return NextResponse.json(
			{ error: "Failed to edit profile image." },
			{ status: 500 }
		);
	}
}
