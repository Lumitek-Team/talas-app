import { getTrpcCaller } from "@/app/_trpc/server";
import { auth } from "@clerk/nextjs/server";
import { deleteImage, uploadImage } from "@/lib/utils";

export async function POST(req: Request) {
	const trpc = await getTrpcCaller();
	const formData = await req.formData();

	const id_user = (await auth()).userId;
	const id = formData.get("id")?.toString();
	const id_category = formData.get("id_category")?.toString();
	const title = formData.get("title")?.toString();
	const content = formData.get("content")?.toString();
	const image1 = formData.get("image1") as File | null;
	const image2 = formData.get("image2") as File | null;
	const image3 = formData.get("image3") as File | null;
	const image4 = formData.get("image4") as File | null;
	const image5 = formData.get("image5") as File | null;

	if (!id || !id_user) {
		return new Response("Project ID and user ID are required", { status: 400 });
	}

	try {
		const existingProject = await trpc.project.getOne({ id, id_user });

		if (!existingProject) {
			return new Response("Project not found or access denied", {
				status: 404,
			});
		}

		const updatedImages: Record<string, string | null> = {};
		const images = [image1, image2, image3, image4, image5];
		const existingImages = [
			existingProject.image1,
			existingProject.image2,
			existingProject.image3,
			existingProject.image4,
			existingProject.image5,
		];

		for (let i = 0; i < images.length; i++) {
			if (images[i]) {
				if (existingImages[i]) {
					await deleteImage(existingImages[i]);
				}
				updatedImages[`image${i + 1}`] = await uploadImage(
					images[i]!,
					"project"
				);
			} else {
				updatedImages[`image${i + 1}`] = existingImages[i] || null;
			}
		}

		const updatedProject = await trpc.project.edit({
			id,
			id_user,
			id_category,
			title,
			content,
			image1: updatedImages.image1,
			image2: updatedImages.image2,
			image3: updatedImages.image3,
			image4: updatedImages.image4,
			image5: updatedImages.image5,
		});

		return Response.json({ success: true, project: updatedProject });
	} catch (error) {
		console.error("[ERROR DI API]", error);
		return new Response("Failed to edit project", { status: 500 });
	}
}
