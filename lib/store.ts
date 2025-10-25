import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "notion-clone-workspace";

export type BlockType = "text" | "heading" | "subheading" | "todo" | "bulleted" | "numbered" | "quote";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  updatedAt: number;
  blocks: Block[];
}

interface WorkspaceState {
  pages: Page[];
  activePageId: string | null;
  setActivePage: (pageId: string) => void;
  createPage: () => string;
  renamePage: (pageId: string, title: string) => void;
  updatePageIcon: (pageId: string, icon: string) => void;
  deletePage: (pageId: string) => void;
  addBlockAfter: (pageId: string, afterBlockId: string | null, type?: BlockType) => string;
  updateBlock: (pageId: string, blockId: string, data: Partial<Block>) => void;
  removeBlock: (pageId: string, blockId: string) => void;
  toggleTodo: (pageId: string, blockId: string) => void;
}

const now = () => Date.now();
const globalCrypto = typeof globalThis === "object" ? globalThis.crypto : undefined;
const generateId = () =>
  globalCrypto && typeof globalCrypto.randomUUID === "function"
    ? globalCrypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const defaultPage = (): Page => ({
  id: generateId(),
  title: "Quickstart",
  icon: "📝",
  updatedAt: now(),
  blocks: [
    {
      id: generateId(),
      type: "heading",
      content: "Welcome to your Notion workspace"
    },
    {
      id: generateId(),
      type: "text",
      content:
        "Use the sidebar to add more pages. Click into any block to start editing. Press Enter to create a new block or / to change block types."
    },
    {
      id: generateId(),
      type: "todo",
      content: "Create your first page",
      checked: false
    },
    {
      id: generateId(),
      type: "todo",
      content: "Add some blocks to it",
      checked: false
    },
    {
      id: generateId(),
      type: "quote",
      content: "“Productivity is being able to do things that you were never able to do before.” – Franz Kafka"
    }
  ]
});

const storage =
  typeof window === "undefined"
    ? undefined
    : createJSONStorage(() => window.localStorage);

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      pages: [defaultPage()],
      activePageId: null,
      setActivePage: (pageId) => set({ activePageId: pageId }),
      createPage: () => {
        const page: Page = {
          id: generateId(),
          title: "Untitled",
          icon: "📄",
          updatedAt: now(),
          blocks: [
            {
              id: generateId(),
              type: "heading",
              content: "New page"
            },
            {
              id: generateId(),
              type: "text",
              content: ""
            }
          ]
        };

        set((state) => ({
          pages: [page, ...state.pages],
          activePageId: page.id
        }));

        return page.id;
      },
      renamePage: (pageId, title) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === pageId
              ? { ...page, title, updatedAt: now() }
              : page
          )
        })),
      deletePage: (pageId) =>
        set((state) => {
          const pages = state.pages.filter((page) => page.id !== pageId);
          const activePageId =
            state.activePageId === pageId
              ? pages.length > 0
                ? pages[0].id
                : null
              : state.activePageId;
          return { pages, activePageId };
        }),
      updatePageIcon: (pageId, icon) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === pageId ? { ...page, icon, updatedAt: now() } : page
          )
        })),
      addBlockAfter: (pageId, afterBlockId, type = "text") => {
        const newBlock: Block = {
          id: generateId(),
          type,
          content: "",
          checked: false
        };

        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id !== pageId) return page;
            const updatedBlocks = [...page.blocks];
            if (afterBlockId === null) {
              updatedBlocks.unshift(newBlock);
            } else {
              const index = updatedBlocks.findIndex(
                (block) => block.id === afterBlockId
              );
              if (index === -1) {
                updatedBlocks.push(newBlock);
              } else {
                updatedBlocks.splice(index + 1, 0, newBlock);
              }
            }
            return {
              ...page,
              updatedAt: now(),
              blocks: updatedBlocks
            };
          })
        }));

        return newBlock.id;
      },
      updateBlock: (pageId, blockId, data) =>
        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id !== pageId) return page;
            return {
              ...page,
              updatedAt: now(),
              blocks: page.blocks.map((block) =>
                block.id === blockId ? { ...block, ...data } : block
              )
            };
          })
        })),
      removeBlock: (pageId, blockId) =>
        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id !== pageId) return page;
            return {
              ...page,
              updatedAt: now(),
              blocks: page.blocks.filter((block) => block.id !== blockId)
            };
          })
        })),
      toggleTodo: (pageId, blockId) =>
        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id !== pageId) return page;
            return {
              ...page,
              updatedAt: now(),
              blocks: page.blocks.map((block) =>
                block.id === blockId
                  ? { ...block, checked: !block.checked }
                  : block
              )
            };
          })
        }))
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage,
      partialize: (state) => ({
        pages: state.pages,
        activePageId: state.activePageId
      })
    }
  )
);
