"use client";

import { UserRound, Plus } from "lucide-react";

export function PhotoProfile() {
    return (
        <div className="space-y-2">
            <div className="relative w-18 h-18">
                {/* Lingkaran putih */}
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <UserRound className="w-10 h-10 text-black" />
                </div>

                {/* Icon Plus di luar bulatan */}
                <div className="absolute -bottom-0 -right-0 w-6 h-6 bg-[#68DE68] rounded-full border-2 border-[#1e1e1e] flex items-center justify-center">
                    <Plus className="w-3 h-3 text-black" />
                </div>
            </div>
        </div>
    );
}
