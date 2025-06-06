// components/ui/action-menu.tsx
import { Pencil, ArchiveRestore, Trash } from "lucide-react";

type ActionMenuProps = {
  onEdit: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
};

export function ActionMenu({ onEdit, onUnarchive, onDelete }: ActionMenuProps) {
  return (
    <div className="bg-[#2a292b] text-white border border-white/20 rounded-xl p-2 w-48 space-y-1 shadow-md">
      <button
        onClick={onEdit}
        className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition"
      >
        <Pencil className="w-4 h-4 mr-2" />
        Edit
      </button>

      <button
        onClick={onUnarchive}
        className="flex items-center w-full px-3 py-2 text-sm rounded-md bg-white/10 hover:bg-white/20 transition"
      >
        <ArchiveRestore className="w-4 h-4 mr-2" />
        Unarchive
      </button>

      <button
        onClick={onDelete}
        className="flex items-center w-full px-3 py-2 text-sm rounded-md text-red-500 hover:bg-red-500/10 transition"
      >
        <Trash className="w-4 h-4 mr-2 text-red-500" />
        Delete
      </button>
    </div>
  );
}
