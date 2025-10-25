"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useWorkspaceStore } from "../lib/store";
import { formatRelativeTime } from "../lib/utils";

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const pages = useWorkspaceStore((state) => state.pages);
  const activePageId = useWorkspaceStore((state) => state.activePageId);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const createPage = useWorkspaceStore((state) => state.createPage);

  const filtered = useMemo(() => {
    if (!query.trim()) return pages;
    const lower = query.toLowerCase();
    return pages.filter((page) =>
      page.title.toLowerCase().includes(lower) ||
      page.blocks.some((block) => block.content.toLowerCase().includes(lower))
    );
  }, [pages, query]);

  return (
    <aside className="hidden w-80 flex-shrink-0 border-r border-slate-200 bg-sidebar/80 backdrop-blur md:flex md:flex-col">
      <div className="px-5 pb-4 pt-6">
        <div className="mb-4 flex items-center justify-between text-sm font-medium text-slate-600">
          <span>Workspace</span>
          <button
            type="button"
            onClick={() => createPage()}
            className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            New page
          </button>
        </div>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-6 scrollbar-thin">
        {filtered.map((page) => {
          const isActive = page.id === activePageId;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => setActivePage(page.id)}
              className={clsx(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition",
                isActive
                  ? "bg-white shadow-card"
                  : "hover:bg-white/70 hover:text-slate-900"
              )}
            >
              <span className="text-xl">{page.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">
                  {page.title || "Untitled"}
                </span>
                <span className="block truncate text-xs text-slate-400">
                  Edited {formatRelativeTime(page.updatedAt)}
                </span>
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-sm text-slate-400">
            No pages match your search.
          </div>
        )}
      </nav>
    </aside>
  );
}
