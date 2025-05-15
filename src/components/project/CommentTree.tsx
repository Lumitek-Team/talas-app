import { CommentsInProjectType } from "@/lib/type";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import CommentForm from "./CommentForm";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";

interface componentProps {
    comments: CommentsInProjectType[];
    id_project: string;
    onCommentAdded?: () => void; // untuk refetch komentar
}

const CommentTree: React.FC<componentProps> = ({ comments, id_project, onCommentAdded }) => {
    const [replyingId, setReplyingId] = useState<string | null>(null);
    const { user } = useUser();

    const deleteMutation = trpc.comment.deleteById.useMutation({
        onSuccess: () => {
            if (onCommentAdded) onCommentAdded();
        },
        onError: (error) => {
            alert(`Gagal menghapus komentar: ${error.message}`);
        },
    });

    const handleToggleReply = (commentId: string) => {
        setReplyingId(prev => (prev === commentId ? null : commentId));
    };

    const handleDelete = (comment: CommentsInProjectType) => {
        if (!user) return;
        if (user.id !== comment.user.id) {
            alert("Kamu hanya bisa menghapus komentar milikmu sendiri.");
            return;
        }
        if (confirm("Yakin ingin menghapus komentar ini?")) {
            deleteMutation.mutate({
                id: comment.id,
                id_user: comment.user.id,
                id_project: id_project,
            });
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {comments.map((comment) => (
                <div key={comment.id} className="ml-0">
                    <div>
                        <h2 className="font-semibold">{comment.user.name}</h2>
                        <p>{comment.content}</p>
                        <div className="flex justify-end">
                            {user?.id === comment.user.id && (
                                <Button
                                    variant="link"
                                    className="text-rose-400"
                                    onClick={() => handleDelete(comment)}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
                                </Button>
                            )}
                            <Button
                                variant="link"
                                onClick={() => handleToggleReply(comment.id)}
                            >
                                {replyingId === comment.id ? "Batal" : "Balas"}
                            </Button>
                        </div>
                        {replyingId === comment.id && (
                            <div>
                                <CommentForm
                                    id_project={id_project}
                                    parent_id={comment.id}
                                    onSuccess={() => {
                                        setReplyingId(null);
                                        if (onCommentAdded) onCommentAdded(); // trigger refetch
                                    }}
                                />
                            </div>
                        )}
                        <Separator />
                    </div>
                    {comment.children && comment.children.length > 0 && (
                        <div className="flex flex-col gap-2 ml-8">
                            <CommentTree
                                comments={comment.children}
                                id_project={id_project}
                                onCommentAdded={onCommentAdded} // teruskan ke child
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CommentTree;