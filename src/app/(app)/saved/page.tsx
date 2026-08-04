'use client';

import { Bookmark, FolderOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { EmptyState } from '@/src/components/ui/empty-state';
import { formatRelativeDate } from '@/src/lib/utils';
import { savedRepository } from '@/src/services/firestore/saved';
import type { ResearchFolder, SavedResearchItem } from '@/src/types';

export default function SavedPage() {
  const [folders, setFolders] = useState<ResearchFolder[]>([]);
  const [items, setItems] = useState<SavedResearchItem[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (folderId?: string | null) => {
    setLoading(true);
    const [folderList, itemList] = await Promise.all([
      savedRepository.listFolders(),
      savedRepository.listItems(folderId),
    ]);
    setFolders(folderList);
    setItems(itemList);
    setLoading(false);
  };

  useEffect(() => {
    void load(activeFolderId);
  }, [activeFolderId]);

  const handleCreateFolder = async () => {
    const name = window.prompt('Folder name');
    if (!name?.trim()) return;
    await savedRepository.createFolder(name.trim());
    await load(activeFolderId);
  };

  const handleDeleteItem = async (itemId: string) => {
    await savedRepository.deleteItem(itemId);
    await load(activeFolderId);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Saved research
          </h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Organize AI responses, profiles, comparisons, and notes.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void handleCreateFolder()}>
          New folder
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-border p-4">
          <button
            type="button"
            onClick={() => setActiveFolderId(null)}
            className={`mb-2 flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm ${
              activeFolderId === null
                ? 'bg-accent-muted text-accent'
                : 'text-foreground-secondary hover:bg-surface-secondary'
            }`}
          >
            <Bookmark className="size-4" />
            All items
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => setActiveFolderId(folder.id)}
              className={`mb-1 flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-sm ${
                activeFolderId === folder.id
                  ? 'bg-accent-muted text-accent'
                  : 'text-foreground-secondary hover:bg-surface-secondary'
              }`}
            >
              <FolderOpen className="size-4 shrink-0" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </aside>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-foreground-secondary">Loading saved research…</p>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="Nothing saved yet"
              description="Save AI responses or peptide profiles to build your research library."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription>{formatRelativeDate(item.updatedAt)}</CardDescription>
                      </div>
                      <Badge variant="muted">{item.itemType.replace(/_/g, ' ')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-4 text-sm text-foreground-secondary">
                      {item.content}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-critical"
                      onClick={() => void handleDeleteItem(item.id)}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
