"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectCollabType } from "@/lib/type";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import { debounce } from "@/lib/utils";

interface CollaboratorSelectProps {
    value: SelectCollabType[];
    onChange: (users: SelectCollabType[]) => void;
}

export default function CollaboratorSelect({ value, onChange }: CollaboratorSelectProps) {
    const [inputValue, setInputValue] = useState("");
    const [query, setQuery] = useState("");
    const userId = useUser().user?.id;

    // Debounced search
    const debouncedSetQuery = useMemo(
        () => debounce((val: string) => setQuery(val), 400),
        []
    );

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInputValue(e.target.value);
        debouncedSetQuery(e.target.value);
    }

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
        setInputValue("");
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
                value={inputValue}
                onChange={handleInputChange}
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