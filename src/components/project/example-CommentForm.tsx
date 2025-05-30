"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "../ui/textarea"
import { useState } from "react"
import { trpc } from "@/app/_trpc/client"
import { useUser } from "@clerk/nextjs"

const formSchema = z.object({
    content: z.string().min(2).max(500),
    parent_id: z.string().nullable(),
})

interface CommentFormProps {
    id_project: string
    parent_id?: string | null
    mode?: "create" | "edit"
    onSuccess?: () => void
    onCancel?: () => void // tambahkan ini
    id_comment?: string
    oldContent?: string
}

const CommentForm: React.FC<CommentFormProps> = ({ id_project, parent_id, mode = "create", onSuccess, onCancel, id_comment, oldContent }) => {
    const [isLoading, setIsLoading] = useState(false)
    const id_user = useUser().user?.id

    const createMutation = trpc.comment.create.useMutation({
        onSuccess: () => {
            setIsLoading(false)
            form.reset()
            // router.refresh() // HAPUS agar tidak refresh halaman
            if (onSuccess) onSuccess()
        },
        onError: (error) => {
            setIsLoading(false)
            alert(`Failed to create comment: ${error.message}`)
        },
    });

    const editMutation = trpc.comment.edit.useMutation({
        onSuccess: () => {
            setIsLoading(false)
            form.reset()
            // router.refresh() // HAPUS agar tidak refresh halaman
            if (onSuccess) onSuccess()
        },
        onError: (error) => {
            setIsLoading(false)
            alert(`Failed to edit comment: ${error.message}`)
        },
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: oldContent ?? "",
            parent_id: parent_id ?? null,
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (mode === "create") {
            setIsLoading(true)
            createMutation.mutate({
                id_project,
                content: values.content,
                parent_id: parent_id ?? null,
            })
        } else if (mode === "edit") {
            if (!id_comment) {
                alert("Comment ID is required for editing.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true)
            editMutation.mutate({
                id: id_comment,
                content: values.content,
                id_user: id_user ?? "",
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Komentar</FormLabel>
                            <FormControl>
                                <Textarea placeholder="shadcn" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-x-4">
                    {onCancel && (
                        <Button type="button" variant={"outline"} onClick={onCancel}>
                            Batal
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Loading..." : "Submit"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default CommentForm;