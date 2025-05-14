import { getTrpcCaller } from "@/app/_trpc/server";
import { auth } from "@clerk/nextjs/server";
import { uploadImage } from "@/lib/utils";

export async function POST(req: Request) {
	const trpc = await getTrpcCaller();
	let image1Path: string;

	const formData = await req.formData();

	const id_user = (await auth()).userId;
	const id_category = formData.get("id_category")?.toString();
	const title = formData.get("title")?.toString();
	const content = formData.get("content")?.toString();
	const image1 = formData.get("image1") as File | null;
	const image2 = formData.get("image2") as File | null;
	const image3 = formData.get("image3") as File | null;
	const image4 = formData.get("image4") as File | null;
	const image5 = formData.get("image5") as File | null;
	const link_figma = formData.get("link_figma")?.toString();
	const link_github = formData.get("link_github")?.toString();

	if (!title || !id_category || !content || !image1 || !id_user) {
		return new Response("Name, id_category and content are required", {
			status: 400,
		});
	}

	if (image1) {
		try {
			image1Path = await uploadImage(image1, "project");
		} catch (error) {
			console.error("Upload error", error);
			return new Response("Failed to upload image", { status: 500 });
		}
	} else {
		return new Response("File are required", { status: 400 });
	}

	const imagePaths: string[] = [];
	const images = [image2, image3, image4, image5];

	for (const image of images) {
		if (image) {
			try {
				const imagePath = await uploadImage(image, "project");
				imagePaths.push(imagePath);
			} catch (error) {
				console.error("Upload error", error);
				return new Response("Failed to upload image", { status: 500 });
			}
		}
	}

	try {
		const project = await trpc.project.create({
			id_user,
			id_category,
			title,
			content,
			image1: image1Path,
			image2: imagePaths[0] || null,
			image3: imagePaths[1] || null,
			image4: imagePaths[2] || null,
			image5: imagePaths[3] || null,
			link_figma,
			link_github,
		});

		return Response.json({ success: true, project });
	} catch (err) {
		console.error("[ERROR DI API]", err);
		return new Response("Failed to create project", { status: 500 });
	}
}
