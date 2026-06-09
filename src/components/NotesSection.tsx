import { useState, useMemo, FormEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Edit3, 
  Check, 
  Tag, 
  Palette, 
  FileText,
  Lightbulb
} from 'lucide-react';
import { Note } from '../types';

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updatedFields: Partial<Omit<Note, 'id'>>) => void;
  onDeleteNote: (id: string) => void;
}

export default function NotesSection({ notes, onAddNote, onUpdateNote, onDeleteNote }: NotesSectionProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [tagInput, setTagInput] = useState('');

  // Searching & Tag filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');

  // Inline Editing Mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedColor, setEditedColor] = useState('indigo');

  // Color Palette Definitions
  const colorPalette = [
    { name: 'Sloky Silver', value: 'slate', bgClass: 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 hover:border-white/10', dotClass: 'bg-slate-400', textBadge: 'bg-white/5 text-slate-300' },
    { name: 'Aurora Indigo', value: 'indigo', bgClass: 'bg-indigo-500/[0.05] hover:bg-indigo-500/[0.1] border-indigo-500/10 hover:border-indigo-500/25', dotClass: 'bg-indigo-400', textBadge: 'bg-indigo-500/10 text-indigo-300' },
    { name: 'Emerald Pine', value: 'emerald', bgClass: 'bg-emerald-500/[0.05] hover:bg-emerald-500/[0.1] border-emerald-500/10 hover:border-emerald-500/25', dotClass: 'bg-emerald-400', textBadge: 'bg-emerald-500/10 text-emerald-300' },
    { name: 'Warm Amber', value: 'amber', bgClass: 'bg-amber-500/[0.05] hover:bg-amber-500/[0.1] border-amber-500/10 hover:border-amber-500/25', dotClass: 'bg-amber-400', textBadge: 'bg-amber-500/10 text-amber-300' },
    { name: 'Sunset Rose', value: 'rose', bgClass: 'bg-rose-500/[0.05] hover:bg-rose-500/[0.1] border-rose-500/10 hover:border-rose-500/25', dotClass: 'bg-rose-400', textBadge: 'bg-rose-500/10 text-rose-305 text-rose-300' },
    { name: 'Cyber Violet', value: 'violet', bgClass: 'bg-violet-500/[0.05] hover:bg-violet-500/[0.1] border-violet-500/10 hover:border-violet-500/25', dotClass: 'bg-violet-400', textBadge: 'bg-violet-500/10 text-violet-300' },
  ];

  // Helper mapping values
  const getPaletteByValue = (val: string) => {
    return colorPalette.find(p => p.value === val) || colorPalette[1];
  };

  const handleCreateNote = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() && !content.trim()) return;

    // Process tags comma or space separated
    const tags = tagInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    onAddNote({
      title: title.trim() || 'Sem Título',
      content: content.trim(),
      color: selectedColor,
      tags
    });

    setTitle('');
    setContent('');
    setTagInput('');
    setSelectedColor('indigo');
  };

  const handleStartEditing = (note: Note) => {
    setEditingId(note.id);
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setEditedColor(note.color);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateNote(id, {
      title: editedTitle.trim() || 'Sem Título',
      content: editedContent.trim(),
      color: editedColor
    });
    setEditingId(null);
  };

  // Compute all unique tags across all stored notes
  const allTags = useMemo(() => {
    const ts = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(t => ts.add(t));
    });
    return Array.from(ts);
  }, [notes]);

  // Compute filtered notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              note.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = selectedTagFilter === 'all' || note.tags.includes(selectedTagFilter);
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchTerm, selectedTagFilter]);

  return (
    <div id="notes-view" className="space-y-6">
      
      {/* Search and Filters toolbar */}
      <div id="notes-toolbar" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl glass-card">
        <div className="flex items-center gap-2.5">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h4 className="text-base font-bold text-white">Quadro de Notas</h4>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
          {/* Tag Select */}
          <div className="relative shrink-0">
            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className="w-full sm:w-44 px-3 py-1.5 rounded-xl glass-input text-xs focus:outline-none cursor-pointer capitalize [&>option]:bg-slate-900"
            >
              <option value="all">Tags (Todas)</option>
              {allTags.map(tag => (
                <option key={tag} value={tag} className="capitalize">{tag}</option>
              ))}
            </select>
          </div>

          {/* Search form */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar notas ou rascunhos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Create Note box sidebar */}
        <div id="create-note-box" className="p-5 rounded-3xl glass-card h-fit">
          <h5 className="text-sm font-bold text-white mb-3">Nova Nota Rápida</h5>
          
          <form onSubmit={handleCreateNote} className="space-y-4">
            {/* Title text */}
            <div>
              <input
                type="text"
                placeholder="Título..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-slate-200 text-sm focus:outline-none font-semibold placeholder-slate-500"
              />
            </div>

            {/* Content text */}
            <div>
              <textarea
                placeholder="Escreva algo..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 rounded-xl glass-input text-slate-200 text-xs placeholder-slate-500 focus:outline-none resize-none font-light"
              />
            </div>

            {/* Tag system system */}
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">
                Tags (Separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="ideias, lembretes, finanças"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl glass-input text-xs focus:outline-none placeholder-slate-500"
              />
            </div>

            {/* Colors picker selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                Paleta / Marcador
              </label>
              <div className="flex gap-1.5">
                {colorPalette.map(palette => (
                  <button
                    key={palette.value}
                    type="button"
                    onClick={() => setSelectedColor(palette.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 flex items-center justify-center ${palette.dotClass} ${
                      selectedColor === palette.value ? 'border-white scale-105' : 'border-transparent'
                    }`}
                    title={palette.name}
                  >
                    {selectedColor === palette.value && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 glass-button-primary text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Fixar Nota
            </button>
          </form>
        </div>

        {/* Notes listings cards */}
        <div id="notes-desktop-mesh" className="lg:col-span-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20 text-slate-400 rounded-3xl glass-card">
              <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-pulse" />
              Nenhum registro de notas encontradas. Escreva sua primeira nota rápida!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredNotes.map((note) => {
                const palette = getPaletteByValue(note.color);
                const isEditing = editingId === note.id;

                return (
                  <div 
                    key={note.id} 
                    className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300 relative group ${palette.bgClass}`}
                  >
                    {/* Top colored aesthetic marker strip */}
                    <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl ${palette.dotClass}`}></div>

                    {isEditing ? (
                      // EDITING INTERFACE INLINE
                      <div className="space-y-3 pt-2">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg glass-input text-white text-xs font-bold focus:outline-none"
                        />
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={4}
                          className="w-full px-2 py-1.5 rounded-lg glass-input text-slate-200 text-[11px] focus:outline-none resize-none font-light"
                        />
                        <div className="flex justify-between items-center bg-black/40 p-1.5 rounded-xl border border-white/5">
                          <div className="flex gap-1">
                            {colorPalette.map(p => (
                              <button
                                key={p.value}
                                type="button"
                                onClick={() => setEditedColor(p.value)}
                                className={`w-3.5 h-3.5 rounded-full ${p.dotClass} ${editedColor === p.value ? 'ring-2 ring-white scale-110' : 'opacity-65 hover:opacity-100'} transition-transform cursor-pointer`}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => handleSaveEdit(note.id)}
                            className="bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/25 p-1 px-2 rounded-lg text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Check className="w-3 h-3" /> Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // STANDARD READ-ONLY INTERFACE
                      <div className="space-y-3 pt-1">
                        <div className="flex items-start justify-between gap-2">
                          <h6 className="text-[13px] font-bold text-white tracking-tight leading-tight line-clamp-1">
                            {note.title}
                          </h6>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartEditing(note)}
                              className="p-1 rounded-lg hover:bg-white/10 text-slate-450 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                              title="Editar nota"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteNote(note.id)}
                              className="p-1 rounded-lg hover:bg-white/10 text-slate-450 text-slate-450 text-rose-400 hover:text-rose-450 transition-colors cursor-pointer"
                              title="Apagar nota"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-205 text-slate-200 whitespace-pre-line leading-relaxed line-clamp-6 font-light">
                          {note.content}
                        </p>
                      </div>
                    )}

                    {/* Footer note area */}
                    {!isEditing && (
                      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(note.updatedAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              onClick={() => setSelectedTagFilter(tag)}
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-lg cursor-pointer transition-colors hover:opacity-90 ${palette.textBadge}`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
