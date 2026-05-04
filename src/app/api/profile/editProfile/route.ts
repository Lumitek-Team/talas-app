import { NextResponse } from "next/server";
import { uploadImage, deleteImages } from "@/lib/imageUtils";
import { auth } from "@clerk/nextjs/server";
export async function POST(req: Request) {
	try {
		const { getToken, userId } = await auth();
		const supabaseToken = await getToken();

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

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

		// Prepend userId to create a unique path for the user: userId/folder/filename
		const secureFolder = `${userId}/${folder}`;

		// Delete the old image if it exists
		if (oldImagePath) {
			await deleteImages([oldImagePath], supabaseToken || undefined);
		}

		// Upload the new image
		const newImagePath = await uploadImage(file, secureFolder, supabaseToken || undefined);

		return NextResponse.json({ newImagePath });
	} catch (error) {
		console.error("Error editing profile image:", error);
		return NextResponse.json(
			{ error: "Failed to edit profile image." },
			{ status: 500 }
		);
	}
}
