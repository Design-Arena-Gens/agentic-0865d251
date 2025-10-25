"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  BlockType,
  useWorkspaceStore
} from "../lib/store";
import BlockEditor from "./blocks/BlockEditor";

const blockTypeLabels: Record<BlockType, string> = {
  text: "Text",
  heading: "Heading",
  subheading: "Subheading",
  todo: "To-do",
  bulleted: "Bulleted list",
  numbered: "Numbered list",
  quote: "Quote"
};

export default function PageCanvas() {
  const activePageId = useWorkspaceStore((state) => state.activePageId);
  const pages = useWorkspaceStore((state) => state.pages);
  const renamePage = useWorkspaceStore((state) => state.renamePage);
  const updatePageIcon = useWorkspaceStore((state) => state.updatePageIcon);
  const addBlockAfter = useWorkspaceStore((state) => state.addBlockAfter);
  const deletePage = useWorkspaceStore((state) => state.deletePage);
  const createPage = useWorkspaceStore((state) => state.createPage);

  const titleRef = useRef<HTMLTextAreaElement | null>(null);

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? pages[0],
    [pages, activePageId]
  );

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!activePage) return;
      renamePage(activePage.id, event.target.value);
      autoGrow(event.target);
    },
    [activePage, renamePage]
  );

  const handleIconChange = useCallback(() => {
    if (!activePage) return;
    const nextIcon = window.prompt("Enter an emoji for this page", activePage.icon);
    if (!nextIcon) return;
    const icon = Array.from(nextIcon.trim())[0] ?? activePage.icon;
    updatePageIcon(activePage.id, icon);
  }, [activePage, updatePageIcon]);

  const handleAddBlock = useCallback(() => {
    if (!activePage) return;
    const newBlockId = addBlockAfter(activePage.id, activePage.blocks.at(-1)?.id ?? null);
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-block-id="${newBlockId}"]`);
      el?.focus();
    });
  }, [activePage, addBlockAfter]);

  useEffect(() => {
    if (titleRef.current) {
      autoGrow(titleRef.current);
    }
  }, [activePage?.id]);

  if (!activePage) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-400">
        <p>No pages yet.</p>
        <button
          type="button"
          onClick={() => createPage()}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          Create a page
        </button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col px-6 pb-24 pt-10 md:px-12">
      <div className="mb-6 flex items-start gap-4">
        <button
          type="button"
          onClick={handleIconChange}
          className="flex h-14 w-14 items-center justify-center rounded-lg border border-transparent text-4xl transition hover:border-slate-200 hover:bg-white"
        >
          {activePage.icon}
        </button>
        <div className="flex-1 space-y-3">
          <textarea
            ref={titleRef}
            value={activePage.title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="w-full resize-none bg-transparent text-4xl font-semibold leading-tight text-slate-900 outline-none"
            rows={1}
          />
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">
              Last edited {new Date(activePage.updatedAt).toLocaleString()}
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this page? This cannot be undone.")) {
                  deletePage(activePage.id);
                }
              }}
              className="rounded-full border border-transparent px-3 py-1 font-medium text-slate-400 transition hover:border-slate-200 hover:bg-white hover:text-slate-700"
            >
              Delete page
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {activePage.blocks.map((block, index) => (
          <BlockEditor
            key={block.id}
            pageId={activePage.id}
            block={block}
            index={index}
            blocks={activePage.blocks}
          />
        ))}
        <button
          type="button"
          onClick={handleAddBlock}
          className="mt-4 w-fit rounded-md px-3 py-2 text-sm text-slate-400 transition hover:bg-white hover:text-slate-600"
        >
          + Add block
        </button>
      </div>
    </div>
  );
}

export const blockStyles: Record<BlockType, string> = {
  text: "text-base leading-[1.9]",
  heading: "text-3xl font-semibold",
  subheading: "text-xl font-semibold",
  todo: "text-base",
  bulleted: "text-base leading-[1.9]",
  numbered: "text-base leading-[1.9]",
  quote: "text-base italic leading-[1.9]"
};

export const autoGrow = (element: HTMLTextAreaElement) => {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
};

export const blockTypeOptions = (Object.keys(blockTypeLabels) as BlockType[]).map(
  (type) => ({
    label: blockTypeLabels[type],
    value: type
  })
);
