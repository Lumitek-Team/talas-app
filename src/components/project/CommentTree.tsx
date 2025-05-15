import { CommentsInProjectType } from "@/lib/type";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import CommentForm from "./CommentForm";
import { useState } from "react";

interface componentProps {
    comments: CommentsInProjectType[];
    id_project: string;
    onCommentAdded?: () => void; // tambahkan prop ini
}

const CommentTree: React.FC<componentProps> = ({ comments, id_project, onCommentAdded }) => {
    const [replyingId, setReplyingId] = useState<string | null>(null);

    const handleToggleReply = (commentId: string) => {
        setReplyingId(prev => (prev === commentId ? null : commentId));
    };

    return (
        <div className="flex flex-col gap-2">
            {comments.map((comment) => (
                <div key={comment.id} className="ml-0">
                    <div>
                        <h2 className="font-semibold">{comment.user.name}</h2>
                        <p>{comment.content}</p>
                        <div className="flex justify-end">
                            <Button
                                variant="link"
                                onClick={() => handleToggleReply(comment.id)}
                            >
                                {replyingId === comment.id ? "Hapus komentar" : "Balas"}
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