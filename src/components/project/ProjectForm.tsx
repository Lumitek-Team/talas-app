"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CategoryType, ProjectOneType } from "@/lib/type"
import { useState } from "react"
import { convertIframeToOembed, convertOembedToIframe } from "@/lib/utils"
import RichEditor from "./ckeditor"
import { Separator } from "../ui/separator"
import { trpc } from "@/app/_trpc/client"


interface ProjectFormProps {
    mode: "create" | "edit";
    project?: ProjectOneType;
}

const formSchema = z.object({
    title: z.string().min(2).max(50),
    category: z.string().min(2),
    content: z.string().min(2),
    image1: z.any().nullable(),
    image2: z.any().nullable(),
    image3: z.any().nullable(),
    image4: z.any().nullable(),
    image5: z.any().nullable(),
    video: z.any().nullable(),
    is_archived: z.boolean()
});

const defaultContent = convertIframeToOembed(`
    <h2>📌 Informasi Penting</h2>
    <p>Ini adalah <strong>konten demo</strong> yang memanfaatkan fitur-fitur utama dari editor CKEditor:</p>
    <ul>
      <li><strong>Bold</strong>, <em>Italic</em>, <u>Underline</u>, <s>Strikethrough</s></li>
      <li><sub>Subscript</sub> dan <sup>Superscript</sup>, serta <code>Inline code</code></li>
      <li><a href="https://example.com" target="_blank">Link ke situs eksternal</a></li>
      <li>Special Character: © ™ ∞ ☕ ★</li>
    </ul>
    <hr>
    <h3>📋 List & Alignment</h3>
    <p style="text-align: left;">Ini teks rata kiri</p>
    <p style="text-align: center;">Ini teks rata tengah</p>
    <p style="text-align: right;">Ini teks rata kanan</p>
    <ol>
      <li>Langkah pertama</li>
      <li>Langkah kedua</li>
    </ol>
    <blockquote>"Kutipan penting yang ingin disorot."</blockquote>
    <pre><code class="language-js">function helloWorld() {
        console.log("Hello, world!");
    }</code></pre>
    <h3>📺 Media & Tabel</h3>
    <figure class="media"><iframe class="mx-auto mt-2 w-3/4 aspect-video" src="https://www.youtube.com/embed/Y78JLjlXP7g?si=ZMLaNEBeZ6MPmoOg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true"></iframe></figure>
    <p>Contoh tabel:</p>
    <table>
      <thead>
        <tr><th>Nama</th><th>Umur</th><th>Kota</th></tr>
      </thead>
      <tbody>
        <tr><td>Ana</td><td>23</td><td>Bandung</td></tr>
        <tr><td>Budi</td><td>30</td><td>Surabaya</td></tr>
      </tbody>
    </table>
        `);


const ProjectForm: React.FC<ProjectFormProps> = ({ mode, project }) => {
    const [loading, setLoading] = useState(false);
    const [submittedTitle, setSubmittedTitle] = useState('');
    const [submittedContent, setSubmittedContent] = useState('');
    const [openCropper, setOpenCropper] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
    const [croppedImage, setCroppedImage] = useState<File | null>(null);

    const { data, isLoading } = trpc.category.getAll.useQuery<CategoryType[]>();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: project?.title || "",
            category: project?.category.id || "",
            content: defaultContent,
            // content: project?.content ? convertIframeToOembed(project.content) : "Isi konten disini...",
            image1: project?.image1 || null,
            image2: project?.image2 || null,
            image3: project?.image3 || null,
            image4: project?.image4 || null,
            image5: project?.image5 || null,
            video: project?.video || null,
            is_archived: project?.is_archived || false,
        },
    });

    function previewContent() {
        const values = form.getValues();
        setSubmittedTitle(values.title || "No Title");
        setSubmittedContent(convertOembedToIframe(values.content) || "<p>No content provided.</p>");
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        const transformedContent = convertOembedToIframe(values.content);

        console.log("Form values:", {
            ...values,
            content: transformedContent,
        });
        setLoading(false);
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="shadcn" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* <div className="col-span-1">
                            <FormField
                                control={form.control}
                                name="featuredImage"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>featured Image</FormLabel>
                                        <FormControl >
                                            <div>
                                                {project?.featuredImage && !croppedImage && (
                                                    <Image src={project.featuredImage} alt="Current Image" className="w-full h-auto rounded mb-2 aspect-video" width={480} height={480} />
                                                )}
                                                <div className="flex gap-2">
                                                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                                                    {croppedImage && (
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            className="w-fit"
                                                            onClick={() => setOpenCropper(true)}
                                                        >
                                                            Edit Image
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            This is your Thumbnail image.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div> */}
                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value)}
                                            >
                                                <SelectTrigger className="w-[280px]">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {data?.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            This is your category blog.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                            <RichEditor
                                                placeholder="Type your message here."
                                                value={field.value}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            This is your content blog.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant={"outline"} onClick={previewContent}>Preview</Button>
                        {loading ? (
                            <Button type="submit" disabled={loading} className="cursor-default" >
                                Saving...
                            </Button>
                        ) : (
                            <Button type="submit" className="cursor-pointer">
                                Save changes
                            </Button>
                        )}
                    </div>
                </form>

                <Separator />

                {/* hasil */}

                <div className="project-view mt-8" id="project-view">
                    <h2 className="text-lg font-semibold mb-2">{submittedTitle}</h2>
                    <div dangerouslySetInnerHTML={{ __html: submittedContent }} />
                </div>
            </Form>
        </>
    )
}

export default ProjectForm