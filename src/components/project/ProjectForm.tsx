"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CategoryType, ProjectOneType } from "@/lib/type";
import { useState, useEffect, useRef } from "react";
import { convertIframeToOembed, convertOembedToIframe } from "@/lib/utils";
import RichEditor from "./ckeditor";
import { Separator } from "../ui/separator";
import { trpc } from "@/app/_trpc/client";
import ImageCropperModal from "../imageCropper";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ProjectFormProps {
    mode: "create" | "edit";
    project?: ProjectOneType;
}

const formSchema = z.object({
    title: z.string().min(2).max(50),
    category: z.string().min(2),
    content: z.string().min(2),
    image1: z.any(),
    image2: z.any().nullable(),
    image3: z.any().nullable(),
    image4: z.any().nullable(),
    image5: z.any().nullable(),
    video: z.any().nullable(),
    is_archived: z.boolean(),
    link_figma: z.string().nullable(),
    link_github: z.string().nullable(),
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

const ProjectForm: React.FC<ProjectFormProps> = ({ mode = "create", project }) => {
    const [loading, setLoading] = useState(false);
    const [submittedTitle, setSubmittedTitle] = useState("");
    const [submittedContent, setSubmittedContent] = useState("");

    const [openCropper, setOpenCropper] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
    const [croppedImage, setCroppedImage] = useState<File | null>(null);

    const { data, isLoading: isCategoryLoading } = trpc.category.getAll.useQuery<CategoryType[]>();

    const router = useRouter();

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: project?.title || "",
            category: project?.category.id || "",
            // content: defaultContent,
            content: project?.content ? convertIframeToOembed(project.content) : "Isi konten disini...",
            image1: project?.image1 || null,
            image2: project?.image2 || null,
            image3: project?.image3 || null,
            image4: project?.image4 || null,
            image5: project?.image5 || null,
            video: project?.video || null,
            is_archived: project?.is_archived || false,
            link_figma: project?.link_figma || "",
            link_github: project?.link_github || "",
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageSrc(URL.createObjectURL(file));
            setOpenCropper(true);
        }
    };

    const handleImageCropped = (file: File) => {
        setCroppedImage(file);
    };

    function previewContent() {
        const values = form.getValues();
        setSubmittedTitle(values.title || "No Title");
        setSubmittedContent(
            convertOembedToIframe(values.content) || "<p>No content provided.</p>"
        );
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        const transformedContent = convertOembedToIframe(values.content);

        const formData = new FormData();
        formData.append("id_category", values.category);
        formData.append("title", values.title);
        formData.append("content", transformedContent);
        if (values.link_figma) {
            formData.append("link_figma", values.link_figma);
        }

        if (values.link_github) {
            formData.append("link_github", values.link_github);
        }

        if (croppedImage && mode === "create") {
            formData.append("image1", croppedImage);
        }

        if (mode === "create") {
            try {
                const res = await fetch("/api/project/create", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Server response:", errorText);
                    throw new Error("Failed to create project");
                }

                const data = await res.json();
                if (isMountedRef.current) {
                    setLoading(false);
                    router.push(`/project/${data.project.slug}`);
                }
            } catch (err) {
                if (isMountedRef.current) {
                    setLoading(false);
                    console.error("Error creating project:", err);
                }
            }
        } else if (mode === "edit") {
            formData.append("id", project?.id || "");

            try {
                const res = await fetch("/api/project/edit", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Server response:", errorText);
                    throw new Error("Failed to edit project");
                }

                const data = await res.json();
                if (isMountedRef.current) {
                    setLoading(false);
                    router.push(`/project/${data.project.slug}`);
                }
            } catch (err) {
                if (isMountedRef.current) {
                    setLoading(false);
                    console.error("Error editing project:", err);
                }
            }
        }
    }

    return (
        <>
            {/* modal image editor */}
            <ImageCropperModal
                open={openCropper}
                imageSrc={imageSrc}
                aspectRatio={16 / 9}
                onClose={() => setOpenCropper(false)}
                onCropDone={handleImageCropped}
            />

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
                                            This is your {mode} project title.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                                                {isCategoryLoading ? (
                                                    <SelectContent>Loading...</SelectContent>
                                                ) : (
                                                    <SelectContent>
                                                        {data?.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                {category.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                )}
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
                        {mode === "create" && (
                            <div className="col-span-1">
                                <FormField
                                    control={form.control}
                                    name="image1"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>featured Image</FormLabel>
                                            <FormControl>
                                                <div>
                                                    {croppedImage && (
                                                        <Image
                                                            src={URL.createObjectURL(croppedImage)}
                                                            alt="Current Image"
                                                            className="w-1/2 h-auto rounded mb-2 aspect-video"
                                                            width={480}
                                                            height={480}
                                                        />
                                                    )}
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            required
                                                        />
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
                            </div>
                        )}

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

                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="link_figma"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link Figma</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://www.figma.com/file/..." {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your link figma.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="link_github"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link Github</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://www.github.com/..." {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your link github.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant={"outline"} onClick={previewContent}>
                            Preview
                        </Button>
                        {loading ? (
                            <Button
                                type="submit"
                                disabled={loading}
                                className="cursor-default"
                            >
                                Saving...
                            </Button>
                        ) : (
                            <Button type="submit" className="cursor-pointer">
                                Save changes
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
            <Separator />

            {/* hasil */}

            <div className="project-view mt-8" id="project-view">
                <h2 className="text-lg font-semibold mb-2">{submittedTitle}</h2>
                <div dangerouslySetInnerHTML={{ __html: submittedContent }} />
            </div>
        </>
    );
};

export default ProjectForm;
