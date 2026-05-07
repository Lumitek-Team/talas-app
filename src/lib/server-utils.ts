import prisma from "@/lib/prisma";

export async function getCommentTreeIds(parentId: string): Promise<string[]> {
	// Final result
	const descendants: string[] = [];

	// Recursive function to fetch all descendants
	async function fetchChildren(parentIds: string[]) {
		if (parentIds.length === 0) return;
		const children = await prisma.comment.findMany({
			where: { parent_id: { in: parentIds } },
			select: { id: true },
		});
		const childIds = children.map((c) => c.id);
		descendants.push(...childIds);
		// Recursive call for the next level
		await fetchChildren(childIds);
	}

	await fetchChildren([parentId]);
	return descendants;
}
