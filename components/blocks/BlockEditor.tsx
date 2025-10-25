"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import {
  Block,
  BlockType,
  useWorkspaceStore
} from "../../lib/store";
import {
  autoGrow,
  blockStyles,
  blockTypeOptions
} from "../PageCanvas";

interface BlockEditorProps {
  pageId: string;
  block: Block;
  blocks: Block[];
  index: number;
}

const focusBlockById = (blockId: string | null, position: "start" | "end" = "end") => {
  if (!blockId) return;
  const element = document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);
  if (!element) return;
  element.focus();
  if ("setSelectionRange" in element) {
    const length = (element as HTMLInputElement | HTMLTextAreaElement).value.length;
    const cursor = position === "start" ? 0 : length;
    (element as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(cursor, cursor);
  }
};

const nextFocusableBlock = (blocks: Block[], index: number, direction: 1 | -1) => {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= blocks.length) return null;
  return blocks[nextIndex].id;
};

const BlockEditor = ({ pageId, block, blocks, index }: BlockEditorProps) => {
  const updateBlock = useWorkspaceStore((state) => state.updateBlock);
  const removeBlock = useWorkspaceStore((state) => state.removeBlock);
  const toggleTodo = useWorkspaceStore((state) => state.toggleTodo);
  const addBlockAfter = useWorkspaceStore((state) => state.addBlockAfter);

  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current instanceof HTMLTextAreaElement) {
      autoGrow(inputRef.current);
    }
  }, [block.content, block.type]);

  const handleContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const value = event.target.value;
      updateBlock(pageId, block.id, { content: value });
      if (event.target instanceof HTMLTextAreaElement) {
        autoGrow(event.target);
      }
    },
    [block.id, pageId, updateBlock]
  );

  const handleBlockTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const type = event.target.value as BlockType;
      updateBlock(pageId, block.id, {
        type,
        checked: type === "todo" ? block.checked ?? false : undefined
      });
    },
    [block.checked, block.id, pageId, updateBlock]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const target = event.currentTarget;
      const selectionStart = target.selectionStart ?? 0;
      const selectionEnd = target.selectionEnd ?? selectionStart;
      const caretAtStart = selectionStart === 0 && selectionEnd === 0;
      const caretAtEnd = selectionEnd === target.value.length;

      if (event.key === "Enter" && !event.shiftKey && block.type !== "todo") {
        event.preventDefault();
        const newBlockId = addBlockAfter(pageId, block.id);
        requestAnimationFrame(() => focusBlockById(newBlockId));
        return;
      }

      if (event.key === "Enter" && block.type === "todo") {
        event.preventDefault();
        const newBlockId = addBlockAfter(pageId, block.id, "todo");
        requestAnimationFrame(() => focusBlockById(newBlockId));
        return;
      }

      if (event.key === "/" && caretAtStart) {
        event.preventDefault();
        const currentIndex = blockTypeOptions.findIndex(
          (option) => option.value === block.type
        );
        const next = blockTypeOptions[(currentIndex + 1) % blockTypeOptions.length];
        updateBlock(pageId, block.id, {
          type: next.value,
          checked: next.value === "todo" ? false : undefined
        });
        return;
      }

      if (event.key === "Backspace" && block.content.length === 0) {
        if (blocks.length === 1) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        const fallbackId =
          nextFocusableBlock(blocks, index, -1) ??
          nextFocusableBlock(blocks, index, 1);
        removeBlock(pageId, block.id);
        requestAnimationFrame(() => focusBlockById(fallbackId));
        return;
      }

      if (event.key === "ArrowUp" && caretAtStart) {
        event.preventDefault();
        const targetId = nextFocusableBlock(blocks, index, -1);
        focusBlockById(targetId, "end");
        return;
      }

      if (
        event.key === "ArrowDown" &&
        caretAtEnd
      ) {
        event.preventDefault();
        const targetId = nextFocusableBlock(blocks, index, 1);
        focusBlockById(targetId);
      }
    },
    [
      addBlockAfter,
      block.content.length,
      block.id,
      block.type,
      blocks,
      index,
      pageId,
      removeBlock,
      updateBlock
    ]
  );

  const listMarker = useMemo(() => {
    if (block.type !== "numbered" && block.type !== "bulleted") return null;
    if (block.type === "bulleted") return "•";
    let count = 0;
    for (let i = 0; i <= index; i += 1) {
      if (blocks[i].type === "numbered") {
        count += 1;
      }
    }
    return `${count}.`;
  }, [block.type, blocks, index]);

  return (
    <div className="group relative flex items-start gap-4 py-1">
      <select
        aria-label="Block type"
        value={block.type}
        onChange={handleBlockTypeChange}
        className="absolute left-0 top-3 hidden w-32 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 shadow-sm focus:outline-none group-hover:block"
      >
        {blockTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {block.type === "todo" ? (
        <div className="flex w-full items-start gap-3">
          <input
            type="checkbox"
            checked={Boolean(block.checked)}
            onChange={() => toggleTodo(pageId, block.id)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
          />
          <input
            ref={(element) => {
              inputRef.current = element;
            }}
            data-block-id={block.id}
            type="text"
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="To-do"
            className={clsx(
              "w-full bg-transparent text-base outline-none transition",
              block.checked ? "text-slate-400 line-through" : "text-slate-800"
            )}
          />
        </div>
      ) : (
        <div
          className={clsx(
            "flex w-full items-start gap-3",
            block.type === "quote" && "rounded-md border border-slate-200 bg-white/60 p-4"
          )}
        >
          {listMarker && (
            <span className="mt-1 select-none text-base text-slate-400">{listMarker}</span>
          )}
          <textarea
            ref={(element) => {
              inputRef.current = element;
            }}
            data-block-id={block.id}
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Type '/' for commands"
            className={clsx(
              "min-h-[28px] w-full resize-none bg-transparent outline-none transition",
              blockStyles[block.type]
            )}
            rows={1}
          />
        </div>
      )}
    </div>
  );
};

export default BlockEditor;
