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
import { useRouter } from "next/navigation"

const formSchema = z.object({
    content: z.string().min(2).max(500),
    parent_id: z.string().nullable(),
})

interface CommentFormProps {
    id_project: string
    parent_id?: string | null
    onSuccess?: () => void // tambahkan prop ini
}

const CommentForm: React.FC<CommentFormProps> = ({ id_project, parent_id, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Panggil hook di sini (level atas komponen)
    const mutation = trpc.comment.create.useMutation({
        onSuccess: () => {
            setIsLoading(false)
            form.reset() // reset form setelah submit
            router.refresh()
            if (onSuccess) onSuccess() // panggil callback jika ada
        },
        onError: (error) => {
            setIsLoading(false)
            alert(`Failed to create comment: ${error.message}`)
        },
    });

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
            parent_id: null,
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        mutation.mutate({
            id_project,
            content: values.content,
            parent_id: parent_id ?? null,
        })
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
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Submit"}
                </Button>
            </form>
        </Form>
    )
}

export default CommentForm;