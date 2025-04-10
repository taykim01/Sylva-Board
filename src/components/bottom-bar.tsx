"use client";

import { useNote } from "@/hooks/use-note";

export default function BottomItems() {
  const { createNote } = useNote();

  return (
    <div className="absolute right-6 bottom-9 flex items-center gap-2">
      <div
        className="rounded-full bg-slate-500 hover:bg-slate-600 transition-all duration-200 text-white h-10 text-m14 w-fit flex items-center gap-1 pr-3 pl-2 cursor-pointer"
        style={{ boxShadow: "2px 2px 4px 0px rgba(0, 0, 0, 0.08)" }}
        onClick={async () => await createNote()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4.5 9H13.5M9 13.5V4.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Add Leaf
      </div>
    </div>
  );
}
