"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Type, Heading2, Heading3, List } from "lucide-react";

type BlockType = "paragraph" | "h2" | "h3" | "list";

interface Block {
  id: string;
  type: BlockType;
  content: string; // for list: lines joined by \n
}

function uid() { return Math.random().toString(36).slice(2); }

// Markdown → blocks
function parseMarkdown(md: string): Block[] {
  if (!md.trim()) return [{ id: uid(), type: "paragraph", content: "" }];
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let listLines: string[] = [];

  const flushList = () => {
    if (listLines.length) {
      blocks.push({ id: uid(), type: "list", content: listLines.join("\n") });
      listLines = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("## ")) { flushList(); blocks.push({ id: uid(), type: "h2", content: line.slice(3) }); }
    else if (line.startsWith("### ")) { flushList(); blocks.push({ id: uid(), type: "h3", content: line.slice(4) }); }
    else if (line.startsWith("- ")) { listLines.push(line.slice(2)); }
    else if (line.trim() === "") { flushList(); }
    else { flushList(); if (line.trim()) blocks.push({ id: uid(), type: "paragraph", content: line }); }
  }
  flushList();
  return blocks.length ? blocks : [{ id: uid(), type: "paragraph", content: "" }];
}

// blocks → Markdown
function blocksToMarkdown(blocks: Block[]): string {
  return blocks.map(b => {
    if (b.type === "h2") return `## ${b.content}`;
    if (b.type === "h3") return `### ${b.content}`;
    if (b.type === "list") return b.content.split("\n").filter(Boolean).map(l => `- ${l}`).join("\n");
    return b.content;
  }).join("\n\n");
}

const BLOCK_TYPES: { type: BlockType; icon: React.ElementType; label: string }[] = [
  { type: "paragraph", icon: Type,     label: "Paragraphe" },
  { type: "h2",        icon: Heading2, label: "Titre" },
  { type: "h3",        icon: Heading3, label: "Sous-titre" },
  { type: "list",      icon: List,     label: "Liste" },
];

interface Props {
  value: string;
  onChange: (md: string) => void;
}

export default function BlogEditor({ value, onChange }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseMarkdown(value));

  const emit = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onChange(blocksToMarkdown(newBlocks));
  }, [onChange]);

  const updateBlock = (id: string, content: string) => {
    emit(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const changeType = (id: string, type: BlockType) => {
    emit(blocks.map(b => b.id === id ? { ...b, type } : b));
  };

  const addBlock = (afterId: string) => {
    const idx = blocks.findIndex(b => b.id === afterId);
    const next = [...blocks];
    next.splice(idx + 1, 0, { id: uid(), type: "paragraph", content: "" });
    emit(next);
  };

  const removeBlock = (id: string) => {
    const next = blocks.filter(b => b.id !== id);
    emit(next.length ? next : [{ id: uid(), type: "paragraph", content: "" }]);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    const idx = blocks.findIndex(b => b.id === id);
    const next = [...blocks];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    emit(next);
  };

  return (
    <div className="space-y-2">
      <p className="text-white/40 text-xs font-medium mb-1">Contenu de l&apos;article</p>
      <div className="bg-[#111111] border border-white/10 rounded-xl p-4 space-y-3">
        {blocks.map((block, idx) => (
          <div key={block.id} className="group flex gap-2 items-start">
            {/* Contrôles */}
            <div className="flex flex-col gap-0.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button type="button" onClick={() => moveBlock(block.id, -1)} disabled={idx === 0}
                className="p-0.5 text-white/30 hover:text-white disabled:opacity-10 transition-colors">
                <ChevronUp size={12} />
              </button>
              <button type="button" onClick={() => moveBlock(block.id, 1)} disabled={idx === blocks.length - 1}
                className="p-0.5 text-white/30 hover:text-white disabled:opacity-10 transition-colors">
                <ChevronDown size={12} />
              </button>
            </div>

            {/* Sélecteur de type */}
            <select value={block.type} onChange={e => changeType(block.id, e.target.value as BlockType)}
              className="shrink-0 bg-[#1A1A1A] border border-white/10 rounded-lg px-2 py-1.5 text-white/50 text-xs outline-none focus:border-tiki-gold mt-0.5 cursor-pointer">
              {BLOCK_TYPES.map(bt => (
                <option key={bt.type} value={bt.type}>{bt.label}</option>
              ))}
            </select>

            {/* Contenu */}
            <div className="flex-1">
              {block.type === "list" ? (
                <textarea
                  value={block.content}
                  onChange={e => updateBlock(block.id, e.target.value)}
                  placeholder={"Élément 1\nÉlément 2\nÉlément 3"}
                  rows={3}
                  className={`w-full bg-[#1A1A1A] border border-white/10 focus:border-tiki-gold rounded-xl px-3 py-2 text-white placeholder-white/20 outline-none text-sm resize-y`}
                />
              ) : (
                <textarea
                  value={block.content}
                  onChange={e => updateBlock(block.id, e.target.value)}
                  placeholder={
                    block.type === "h2" ? "Titre de section..." :
                    block.type === "h3" ? "Sous-titre..." :
                    "Écrivez votre texte ici..."
                  }
                  rows={block.type === "paragraph" ? 3 : 1}
                  className={`w-full bg-[#1A1A1A] border border-white/10 focus:border-tiki-gold rounded-xl px-3 py-2 text-white placeholder-white/20 outline-none resize-y ${
                    block.type === "h2" ? "text-lg font-bold" :
                    block.type === "h3" ? "text-base font-semibold" :
                    "text-sm"
                  }`}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button type="button" onClick={() => addBlock(block.id)}
                className="p-1 text-white/30 hover:text-tiki-gold transition-colors" title="Ajouter un bloc après">
                <Plus size={13} />
              </button>
              <button type="button" onClick={() => removeBlock(block.id)}
                className="p-1 text-white/30 hover:text-red-400 transition-colors" title="Supprimer ce bloc">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        <button type="button" onClick={() => addBlock(blocks[blocks.length - 1].id)}
          className="w-full mt-2 py-2 border border-dashed border-white/10 rounded-xl text-white/25 hover:text-white/50 hover:border-white/20 transition-all text-xs flex items-center justify-center gap-1.5">
          <Plus size={12} /> Ajouter un bloc
        </button>
      </div>
      <p className="text-white/25 text-xs">Sélectionnez le type de chaque bloc : Paragraphe, Titre, Sous-titre ou Liste.</p>
    </div>
  );
}
