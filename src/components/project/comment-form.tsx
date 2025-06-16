// components/project/comment-form.tsx

"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import { getPublicUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const commentFormSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment is too long (max 1000 characters)."),
});

export type CommentFormValues = z.infer<typeof commentFormSchema>;

interface CommentFormProps {
    projectId: string;
    parentId?: string | null;
    mode?: "create" | "edit";
    currentCommentId?: string;
    initialContent?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    compact?: boolean;
    autoFocus?: boolean;
}

export function CommentForm({
    projectId,
    parentId = null,
    mode = "create",
    currentCommentId,
    initialContent = "",
    onSuccess,
    onCancel,
    compact = false,
    autoFocus = false,
}: CommentFormProps) {
    const { user: userclerk, isLoaded: isUserLoaded } = useUser();
    const user = trpc.user.getById.useQuery(
        { id: userclerk?.id ?? "" },
        { enabled: !!userclerk?.id }
    ).data?.data;
    const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
    const utils = trpc.useUtils();

    // Fetch the latest user data from your database
    const { data: userProfile } = trpc.user.getById.useQuery(
        { id: user?.id ?? "" },
        { enabled: !!user?.id }
    );

    const form = useForm<CommentFormValues>({
        resolver: zodResolver(commentFormSchema),
        defaultValues: {
            content: initialContent,
        },
    });

    useEffect(() => {
        form.reset({ content: initialContent });
        if (autoFocus && mode === "create") {
            setTimeout(() => form.setFocus("content"), 0);
        }
    }, [initialContent, form, autoFocus, mode]);

    const createCommentMutation = trpc.comment.create.useMutation({
        onSuccess: () => {
            setIsSubmittingLocal(false);
            form.reset({ content: "" });
            utils.project.getComments.invalidate({ id: projectId });
            if (onSuccess) onSuccess();
        },
        onError: (error) => {
            setIsSubmittingLocal(false);
            form.setError("root.serverError", { type: "manual", message: error.message || "Failed to post comment." });
            console.error("Failed to create comment:", error);
        },
    });

    const editCommentMutation = trpc.comment.edit.useMutation({
        onSuccess: () => {
            setIsSubmittingLocal(false);
            utils.project.getComments.invalidate({ id: projectId });
            if (onSuccess) onSuccess();
        },
        onError: (error) => {
            setIsSubmittingLocal(false);
            form.setError("root.serverError", { type: "manual", message: error.message || "Failed to update comment." });
            console.error("Failed to edit comment:", error);
        },
    });

    const onSubmit = (values: CommentFormValues) => {
        if (!user?.id) {
            form.setError("root.serverError", { type: "manual", message: "You must be logged in to comment." });
            return;
        }
        setIsSubmittingLocal(true);
        form.clearErrors("root.serverError");

        if (mode === "create") {
            createCommentMutation.mutate({
                id_project: projectId,    // Changed back to snake_case
                content: values.content,
                parent_id: parentId,      // Changed back to snake_case
                // Remove userId - backend doesn't expect it in input
            });
        } else if (mode === "edit" && currentCommentId) {
            editCommentMutation.mutate({
                id: currentCommentId,
                content: values.content,
                id_user: user.id,         // Changed back to snake_case
            });
        } else {
            setIsSubmittingLocal(false);
            form.setError("root.serverError", { type: "manual", message: "Invalid form mode or missing comment ID." })
        }
    };

    if (!isUserLoaded) {
        return <div className={`py-2 ${compact ? 'pl-10' : ''}`}><p className="text-sm text-muted-foreground">Loading form...</p></div>;
    }

    if (!user) {
        if (mode === 'create' && !parentId && !compact) {
            return <div className="py-4"><p className="text-sm text-muted-foreground">Please <a href="/sign-in" className="underline hover:text-primary">sign in</a> to post a comment.</p></div>;
        } else {
            return null;
        }
    }

    // Use database photo if available, otherwise fallback to Clerk's imageUrl
    const currentAvatarSrc = userProfile?.data?.photo_profile
        ? getPublicUrl(userProfile.data.photo_profile)
        : user?.imageUrl || "/img/dummy/profile-photo-dummy.jpg";

    // Use database name/username if available, otherwise use Clerk's data
    const currentUsername = userProfile?.data?.name || userProfile?.data?.username || user.fullName || user.username || "User";

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={`flex gap-3 items-start ${compact ? 'pt-2 pb-1' : 'py-4'}`}>
                <Avatar className={`mt-1 ${compact ? 'w-6 h-6' : 'w-8 h-8'}`}>
                    <AvatarImage src={currentAvatarSrc} alt={currentUsername} />
                    <AvatarFallback>{currentUsername?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                {(!compact && mode === "create" && !parentId) && <FormLabel className="sr-only">Your Comment</FormLabel>}
                                <FormControl>
                                    <Textarea
                                        placeholder={mode === "edit" ? "Edit your comment..." : (parentId ? "Write your reply..." : "Add a public comment...")}
                                        className={`resize-none w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-primary-foreground placeholder:text-muted-foreground ${compact ? 'min-h-[50px] text-xs' : 'min-h-[70px]'}`}
                                        {...field}
                                        rows={compact ? 2 : 3}
                                        autoFocus={autoFocus}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {form.formState.errors.root?.serverError && (
                        <p className="text-sm font-medium text-destructive">
                            {form.formState.errors.root.serverError.message}
                        </p>
                    )}
                    <div className="flex justify-end gap-2 mt-2">
                        {onCancel && (
                            <Button type="button" variant="ghost" size={compact ? "sm" : "sm"} onClick={onCancel} disabled={isSubmittingLocal || createCommentMutation.isPending || editCommentMutation.isPending}>
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={isSubmittingLocal || createCommentMutation.isPending || editCommentMutation.isPending || !form.formState.isDirty || !form.formState.isValid}
                            size={compact ? "sm" : "sm"}
                        >
                            {isSubmittingLocal || createCommentMutation.isPending || editCommentMutation.isPending ? "Posting..." : (mode === "edit" ? "Save Changes" : (parentId ? "Reply" : "Comment"))}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}