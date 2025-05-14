import { getTrpcCaller } from "@/app/_trpc/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
	const trpc = await getTrpcCaller();
	const formData = await req.formData();

	const id_user = (await auth()).userId;
	const id = formData.get("id")?.toString();
	const id_category = formData.get("id_category")?.toString();
	const title = formData.get("title")?.toString();
	const content = formData.get("content")?.toString();

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

		const updatedProject = await trpc.project.edit({
			id,
			id_user,
			id_category,
			title,
			content,
		});

		return Response.json({ success: true, project: updatedProject });
	} catch (error) {
		console.error("[ERROR DI API]", error);
		return new Response("Failed to edit project", { status: 500 });
	}
}
