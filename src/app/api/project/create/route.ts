import { getTrpcCaller } from "@/app/_trpc/server";
import { supabaseServer } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
	const trpc = await getTrpcCaller();
	let image1Path: string;

	const formData = await req.formData();

	const id_user = (await auth()).userId;
	const id_category = formData.get("id_category")?.toString();
	const title = formData.get("title")?.toString();
	const content = formData.get("content")?.toString();
	const image1 = formData.get("image1") as File | null;

	if (!title || !id_category || !content || !image1 || !id_user) {
		return new Response("Name, id_category and content are required", {
			status: 400,
		});
	}

	if (image1) {
		const buffer = Buffer.from(await image1.arrayBuffer());
		const image1Ext = image1.name.split(".").pop();
		const image1Name = `project/${Date.now()}-${randomUUID()}.${image1Ext}`;

		const { error } = await supabaseServer.storage
			.from("talas-image")
			.upload(image1Name, buffer, {
				contentType: image1.type,
			});

		if (error) {
			console.error("Upload error", error.message);
			return new Response("Failed to upload image", { status: 500 });
		}

		image1Path = `${image1Name}`;
	} else {
		return new Response("File are required", { status: 400 });
	}

	try {
		const project = await trpc.project.create({
            id_user,
			id_category,
			title,
			content,
			image1: image1Path,
		});

		return Response.json({ success: true, project });
	} catch (err) {
		console.error("[ERROR DI API]", err);
		return new Response("Failed to create project", { status: 500 });
	}
}
