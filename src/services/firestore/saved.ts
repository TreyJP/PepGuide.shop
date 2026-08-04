import type { ResearchFolder, SavedResearchItem } from '@/src/types';
import { createId } from '@/src/utils/dates';

const folders = new Map<string, ResearchFolder>();
const items = new Map<string, SavedResearchItem>();

function seed() {
  if (folders.size > 0) {
    return;
  }
  const defaults = [
    'Metabolic research',
    'Recovery research',
    'Compounds to compare',
    'Human evidence',
    'Future research',
  ];
  const now = new Date().toISOString();
  defaults.forEach((name) => {
    const id = createId('folder');
    folders.set(id, { id, name, createdAt: now, updatedAt: now });
  });
}

export const savedRepository = {
  async listFolders(): Promise<ResearchFolder[]> {
    seed();
    return Array.from(folders.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  },

  async createFolder(name: string): Promise<ResearchFolder> {
    seed();
    const now = new Date().toISOString();
    const folder: ResearchFolder = {
      id: createId('folder'),
      name,
      createdAt: now,
      updatedAt: now,
    };
    folders.set(folder.id, folder);
    return folder;
  },

  async renameFolder(folderId: string, name: string): Promise<ResearchFolder> {
    const existing = folders.get(folderId);
    if (!existing) {
      throw new Error('Folder not found');
    }
    const updated = { ...existing, name, updatedAt: new Date().toISOString() };
    folders.set(folderId, updated);
    return updated;
  },

  async deleteFolder(folderId: string): Promise<void> {
    folders.delete(folderId);
    Array.from(items.values())
      .filter((item) => item.folderId === folderId)
      .forEach((item) => {
        items.set(item.id, { ...item, folderId: null });
      });
  },

  async listItems(folderId?: string | null): Promise<SavedResearchItem[]> {
    seed();
    const all = Array.from(items.values());
    const filtered =
      folderId === undefined
        ? all
        : all.filter((item) => item.folderId === folderId);
    return filtered.sort(
      (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
    );
  },

  async saveItem(
    input: Omit<SavedResearchItem, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<SavedResearchItem> {
    seed();
    const now = new Date().toISOString();
    const item: SavedResearchItem = {
      ...input,
      id: createId('saved'),
      createdAt: now,
      updatedAt: now,
    };
    items.set(item.id, item);
    return item;
  },

  async deleteItem(itemId: string): Promise<void> {
    items.delete(itemId);
  },
};
