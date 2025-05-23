"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectCollabType } from "@/lib/type";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";

interface CollaboratorSelectProps {
    value: SelectCollabType[];
    onChange: (users: SelectCollabType[]) => void;
}

export default function CollaboratorSelect({ value, onChange }: CollaboratorSelectProps) {
    const [query, setQuery] = useState("");
    const userId = useUser().user?.id;
    console.log("userId", userId);

    // Debounced search
    const { data: options = [], isLoading: loadingQuery } =
        trpc.user.getSelectCollab.useQuery({

            query: encodeURIComponent(query),
            id_user: userId ?? "",
        }, {
            enabled: query.length > 0,
        });

    function handleSelect(user: SelectCollabType) {
        if (!value.find(u => u.id === user.id)) {
            onChange([...value, user]);
        }
        setQuery("");
    }

    function handleRemove(userId: string) {
        onChange(value.filter(u => u.id !== userId));
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map(user => (
                    <Badge key={user.id} variant="secondary">
                        {user.username}
                        <Button size="sm" variant="ghost" onClick={() => handleRemove(user.id)}>×</Button>
                    </Badge>
                ))}
            </div>
            <Input
                placeholder="Cari user untuk kolaborasi..."
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            {loadingQuery && <div>Loading...</div>}
            {options.length > 0 && (
                <div className="border rounded mt-1 bg-zinc-900 z-10 absolute">
                    {options.map(user => (
                        <div
                            key={user.id}
                            className="p-2 hover:bg-zinc-800 cursor-pointer"
                            onClick={() => handleSelect(user)}
                        >
                            {user.name} <span className="text-muted-foreground">@{user.username}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}