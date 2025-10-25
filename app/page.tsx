"use client";

import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import PageCanvas from "../components/PageCanvas";
import { useWorkspaceStore } from "../lib/store";

export default function Home() {
  const pages = useWorkspaceStore((state) => state.pages);
  const activePageId = useWorkspaceStore((state) => state.activePageId);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const createPage = useWorkspaceStore((state) => state.createPage);

  useEffect(() => {
    if (pages.length > 0 && !activePageId) {
      setActivePage(pages[0].id);
    }
  }, [pages, activePageId, setActivePage]);

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 backdrop-blur md:hidden">
          <select
            value={activePageId ?? ""}
            onChange={(event) => setActivePage(event.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.icon} {page.title || "Untitled"}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => createPage()}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            New
          </button>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <PageCanvas />
        </main>
      </div>
    </div>
  );
}
