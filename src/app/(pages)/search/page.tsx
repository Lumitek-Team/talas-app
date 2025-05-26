"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/app/_trpc/client"
import { CategoryType, ProjectOneType, UserSearchType } from "@/lib/type"
import { useEffect, useState, useRef, useCallback } from "react"
import { cn, getPublicUrl } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


const formSchema = z.object({
    query: z.string().max(50).optional(),
    type: z.enum(['PROJECT', 'USER', 'CATEGORY']),
    category: z.string().nullish(),
})

const SearchPage = () => {
    const { data: categoryResponse, isLoading: isCategoryLoading } = trpc.category.getAll.useQuery();
    const categories: CategoryType[] = categoryResponse?.data || [];
    const router = useRouter();
    const searchParams = useSearchParams();

    // Ambil nilai awal dari URL
    const initialQuery = searchParams.get("query") || "";
    const initialType = searchParams.get("type") || "PROJECT";
    const initialCategory = searchParams.get("category") || "";

    // State untuk menyimpan nilai terakhir yang sudah di-commit ke URL/query
    const [committedValues, setCommittedValues] = useState<z.infer<typeof formSchema>>({
        type: initialType as "PROJECT" | "USER" | "CATEGORY",
        query: initialQuery,
        category: initialCategory
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: committedValues
    })

    const { user } = useUser()
    const [optimisticBookmarks, setOptimisticBookmarks] = useState<Record<string, boolean>>({})
    const [optimisticLikes, setOptimisticLikes] = useState<Record<string, boolean>>({})

    // State untuk menyimpan nilai form yang sudah debounce

    // Debounce logic, hanya update committedValues dan URL jika memang berubah
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const formValues = form.watch();

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (
                formValues.query &&
                formValues.query.length >= 2 &&
                (
                    formValues.query !== committedValues.query ||
                    formValues.type !== committedValues.type ||
                    (formValues.category || "") !== (committedValues.category || "")
                )
            ) {
                setCommittedValues({
                    type: formValues.type,
                    query: formValues.query,
                    category: formValues.category,
                });

                // Update URL hanya jika berbeda
                const params = new URLSearchParams();
                params.set("query", formValues.query);
                params.set("type", formValues.type);
                if (formValues.category) {
                    params.set("category", formValues.category);
                }
                if (formValues.type !== "PROJECT") {
                    params.delete("category");
                }
                router.replace(`?${params.toString()}`, { scroll: false });
            }
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [formValues, committedValues, router]);

    // Query hanya jalan saat committedValues berubah
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch,
    } = trpc.search.search.useInfiniteQuery(
        {
            limit: 5,
            id_user: user?.id || "",
            type: committedValues.type,
            search: committedValues.query ?? undefined,
            category: committedValues.category ?? undefined,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            enabled: !!user && !!committedValues.query && committedValues.query.length >= 2,
        }
    );

    // Query untuk user search (hanya aktif jika type USER)
    const {
        data: userData,
        fetchNextPage: fetchNextUserPage,
        hasNextPage: hasNextUserPage,
        isFetchingNextPage: isFetchingNextUserPage,
        isLoading: isUserLoading,
    } = trpc.search.search.useInfiniteQuery(
        {
            limit: 10,
            id_user: user?.id || "",
            type: "USER",
            search: committedValues.query ?? undefined,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            enabled:
                !!user &&
                committedValues.type === "USER" &&
                !!committedValues.query &&
                committedValues.query.length >= 2,
        }
    );

    // Query untuk category search (hanya aktif jika type CATEGORY)
    const {
        data: categoryData,
        fetchNextPage: fetchNextCategoryPage,
        hasNextPage: hasNextCategoryPage,
        isFetchingNextPage: isFetchingNextCategoryPage,
        isLoading: isCategorySearchLoading,
    } = trpc.search.search.useInfiniteQuery(
        {
            limit: 10,
            id_user: user?.id || "",
            type: "CATEGORY",
            search: committedValues.query,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            enabled:
                !!user &&
                committedValues.type === "CATEGORY" &&
                !!committedValues.query &&
                committedValues.query.length >= 2,
        }
    );

    // Only log data once when it changes
    useEffect(() => {
        console.log("SearchPage data", data)
    }, [data])

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    const bookmarkMutation = trpc.bookmark.create.useMutation({
        onSuccess: () => {
            refetch()
        },
    })
    const unbookmarkMutation = trpc.bookmark.delete.useMutation({
        onSuccess: () => {
            refetch()
        },
    })

    const likeMutation = trpc.likeProject.like.useMutation({
        onSuccess: () => {
            refetch()
        },
    })
    const unlikeMutation = trpc.likeProject.unlike.useMutation({
        onSuccess: () => {
            refetch()
        },
    })

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 100
            ) {
                if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    // Infinite scroll untuk user
    useEffect(() => {
        if (committedValues.type !== "USER") return;
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 100
            ) {
                if (hasNextUserPage && !isFetchingNextUserPage) {
                    fetchNextUserPage();
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasNextUserPage, isFetchingNextUserPage, fetchNextUserPage, committedValues.type]);

    // Infinite scroll untuk category
    useEffect(() => {
        if (committedValues.type !== "CATEGORY") return;
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 100
            ) {
                if (hasNextCategoryPage && !isFetchingNextCategoryPage) {
                    fetchNextCategoryPage();
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasNextCategoryPage, isFetchingNextCategoryPage, fetchNextCategoryPage, committedValues.type]);

    // Handler untuk klik kategori pada hasil pencarian kategori
    const handleCategoryClick = useCallback((slug: string) => {
        const params = new URLSearchParams();
        params.set("type", "PROJECT");
        params.set("category", slug);
        // Set query minimal 3 karakter agar query langsung jalan (misal: "__all__")
        params.set("query", "__all__");
        router.replace(`/search?${params.toString()}`, { scroll: false });
        form.setValue("type", "PROJECT");
        form.setValue("category", slug);
        form.setValue("query", "__all__");
    }, [router, form]);

    if (!user) return <div>Silakan login untuk melihat feeds.</div>

    const handleBookmark = (project: ProjectOneType) => {
        setOptimisticBookmarks((prev) => ({ ...prev, [project.id]: true }))
        bookmarkMutation.mutate({
            id_user: user.id,
            id_project: project.id,
        }, {
            onError: () => setOptimisticBookmarks((prev) => ({ ...prev, [project.id]: false })),
        })
    }

    const handleUnbookmark = (project: ProjectOneType) => {
        setOptimisticBookmarks((prev) => ({ ...prev, [project.id]: false }))
        unbookmarkMutation.mutate({
            id_user: user.id,
            id_project: project.id,
        }, {
            onError: () => setOptimisticBookmarks((prev) => ({ ...prev, [project.id]: true })),
        })
    }

    const handleLike = (project: ProjectOneType) => {
        setOptimisticLikes((prev) => ({ ...prev, [project.id]: true }))
        likeMutation.mutate({
            id_user: user.id,
            id_project: project.id,
        }, {
            onError: () => setOptimisticLikes((prev) => ({ ...prev, [project.id]: false })),
        })
    }

    const handleUnlike = (project: ProjectOneType) => {
        setOptimisticLikes((prev) => ({ ...prev, [project.id]: false }))
        unlikeMutation.mutate({
            id_user: user.id,
            id_project: project.id,
        }, {
            onError: () => setOptimisticLikes((prev) => ({ ...prev, [project.id]: true })),
        })
    }

    return (
        <div className="flex flex-col items-center ">
            <div className="py-8">
                <Link href={"/search"} className="text-2xl font-bold mb-8">Search Page</Link>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="space-y-3 mb-8">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={"PROJECT"}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="PROJECT" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    project
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="USER" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    user
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="CATEGORY" />
                                                </FormControl>
                                                <FormLabel className="font-normal">category</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {formValues.type === "PROJECT" && (
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value || "__all__"}
                                                onValueChange={(value) => {
                                                    // Jika pilih "__all__", set ke "" (anggap tidak memilih kategori)
                                                    field.onChange(value === "__all__" ? "" : value);
                                                }}
                                            >
                                                <SelectTrigger className="w-[280px]">
                                                    <SelectValue placeholder="Semua Kategori" />
                                                </SelectTrigger>
                                                {isCategoryLoading ? (
                                                    <SelectContent>Loading...</SelectContent>
                                                ) : (
                                                    <SelectContent>
                                                        <SelectItem value="__all__">
                                                            Semua Kategori
                                                        </SelectItem>
                                                        {categories?.map((category) => (
                                                            <SelectItem key={category.id} value={category.slug}>
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
                        )}
                        <FormField
                            control={form.control}
                            name="query"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Search</FormLabel>
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
                    </form>
                </Form>
            </div>

            {/* Projects */}
            <Separator />

            {committedValues.type == "PROJECT" &&
                (isLoading ? <div>Loading...</div> : (
                    <div className={cn("flex flex-col gap-4")}>
                        {/* Tampilkan not found jika tidak ada data */}
                        {data && data.pages.every(page => page.data.length === 0) && (
                            <div className="text-center text-muted-foreground py-8">not found</div>
                        )}
                        {data?.pages.map((page, pageIndex) => (
                            <div key={pageIndex}>
                                {
                                    page.data.map((project: ProjectOneType) => {
                                        const isBookmarked = optimisticBookmarks[project.id] !== undefined
                                            ? optimisticBookmarks[project.id]
                                            : project.is_bookmarked

                                        const isLiked = optimisticLikes[project.id] !== undefined
                                            ? optimisticLikes[project.id]
                                            : project.is_liked


                                        return (
                                            <div
                                                key={project.id}
                                                className="grid grid-cols-3 gap-4 mb-4"
                                            >
                                                <div className="col-span-1">
                                                    {/* Replace with actual image */}
                                                    {project.image1 ? (
                                                        <Image width={800} height={450} src={getPublicUrl(project.image1)} alt={project.slug + " image"} />
                                                    ) : (
                                                        <div className="bg-gray-200 h-24 w-full"></div>
                                                    )}
                                                </div>
                                                <div className="col-span-2 flex flex-col gap-2">
                                                    <Link className="text-lg font-semibold" href={`/project/${project.slug}`}>{project.title}</Link>
                                                    <Link href={`/feeds/?category=${project.category.slug}`}>{project.category.title}</Link>
                                                    <p>komentar: {project.count_comments}</p>

                                                    <div className="flex gap-2 w-full">
                                                        {!isBookmarked ? (
                                                            <Button
                                                                variant="outline"
                                                                className="w-fit"
                                                                onClick={() => handleBookmark(project)}
                                                            >
                                                                Bookmark
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="default"
                                                                className="w-fit"
                                                                onClick={() => handleUnbookmark(project)}
                                                            >
                                                                Unbookmark
                                                            </Button>
                                                        )}
                                                        {!isLiked ? (
                                                            <Button
                                                                variant="outline"
                                                                className="w-fit"
                                                                onClick={() => handleLike(project)}
                                                            >
                                                                Like
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="default"
                                                                className="w-fit"
                                                                onClick={() => handleUnlike(project)}
                                                            >
                                                                Unlike
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div >
                        ))}
                        {isFetchingNextPage && <p>Loading more...</p>}
                    </div>
                ))}

            {committedValues.type == "USER" && (
                <div className={cn("flex flex-col gap-4 w-full max-w-2xl")}>
                    {isUserLoading ? (
                        <div>Loading...</div>
                    ) : userData && userData.pages.every(page => page.data.length === 0) ? (
                        <div className="text-center text-muted-foreground py-8">not found</div>
                    ) : (
                        userData?.pages.map((page, pageIndex) => (
                            <div key={pageIndex}>
                                {page.data.map((user: UserSearchType) => (
                                    <div key={user.username} className="flex items-center gap-4 border-b py-4">
                                        <Avatar>
                                            <AvatarImage src={user.photo_profile || undefined} />
                                            <AvatarFallback>
                                                {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <Link href={`/user/${user.username}`} className="font-semibold hover:underline">
                                                {user.name || user.username}
                                            </Link>
                                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                                            <div className="text-xs mt-1">
                                                Project: {user.count_summary?.count_project ?? 0} | Followers: {user.count_summary?.count_follower ?? 0} | Following: {user.count_summary?.count_following ?? 0}
                                            </div>
                                        </div>
                                        {/* Tambahkan social link jika ingin */}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                    {isFetchingNextUserPage && <p>Loading more...</p>}
                </div>
            )}
            {committedValues.type == "CATEGORY" && (
                <div className={cn("flex flex-col gap-4 w-full max-w-2xl")}>
                    {isCategorySearchLoading ? (
                        <div>Loading...</div>
                    ) : categoryData && categoryData.pages.every(page => page.data.length === 0) ? (
                        <div className="text-center text-muted-foreground py-8">not found</div>
                    ) : (
                        categoryData?.pages.map((page, pageIndex) => (
                            <div key={pageIndex}>
                                {page.data.map((cat: CategoryType) => (
                                    <div key={cat.id} className="p-4 border rounded flex flex-col gap-1 mb-2">
                                        <button
                                            type="button"
                                            className="cursor-pointer text-lg font-semibold hover:underline text-left"
                                            onClick={() => handleCategoryClick(cat.slug)}
                                        >
                                            {cat.title}
                                        </button>
                                        <span className="text-xs text-muted-foreground">{cat.count_projects} projects</span>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                    {isFetchingNextCategoryPage && <p>Loading more...</p>}
                </div>
            )}

        </div>
    );
}

export default SearchPage;