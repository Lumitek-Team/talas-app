import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

export function PinnedProject() {
  return (
    <div className="bg-background p-4 rounded-lg border border-white/10 space-y-2">
      <div className="flex justify-between items-center text-sm text-green-500">
        <span>📌 Pinned project</span>
        <EllipsisHorizontalIcon className="w-5 h-5 text-white/50" />
      </div>
      <div>
        <h3 className="text-white font-semibold text-base">Next-Gen Portfolio Website</h3>
        <p className="text-white/60 text-sm">
          A modern, sleek portfolio website built with React and Tailwind CSS.
          Featuring dark mode, smooth animations, and a fully responsive layout.
        </p>
        <ul className="text-xs text-white/50 list-disc pl-5">
          <li>Stack: React, Tailwind CSS, Framer Motion</li>
          <li>GitHub: hanna/portfolio</li>
        </ul>
        <p className="text-sm mt-2 text-white/70">
          Excited to share my latest project. Let me know what you think and feel free to drop feedback. Open for collaborations!
        </p>
      </div>
    </div>
  );
}
