import { useState, useMemo, FormEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Check,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Task } from '../types';

interface TaskSectionProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (id: string, newStatus: Task['status']) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskSection({ tasks, onAddTask, onUpdateTaskStatus, onDeleteTask }: TaskSectionProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');

  // Filtering / Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Task['status']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Task['priority']>('all');

  // Submission error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Por favor, defina um título para a tarefa.');
      return;
    }

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'pending',
      dueDate: dueDate || new Date(Date.now() + 864500000).toISOString().split('T')[0] // default: tomorrow
    });

    setTitle('');
    setDescription('');
    setDueDate('');
  };

  // Filter Tasks list
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        // High priority first, then pending, then due dates
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (b.status === 'completed' && a.status !== 'completed') return -1;
        
        const priorityScore = { high: 3, medium: 2, low: 1 };
        const scoreDiff = priorityScore[b.priority] - priorityScore[a.priority];
        if (scoreDiff !== 0) return scoreDiff;

        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Is task overdue helper
  const isDueSoonOrOverdue = (dateStr: string, status: Task['status']) => {
    if (status === 'completed') return 'normal';
    
    const taskDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    taskDate.setHours(0,0,0,0);

    const timeDiff = taskDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) return 'overdue';
    if (daysDiff <= 1) return 'soon';
    return 'normal';
  };

  return (
    <div id="tasks-section-wrapper" className="space-y-6">
      
      {/* Top statistics overview bar */}
      <div id="tasks-horizontal-summary" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card text-center hover:border-white/10 transition-all">
          <span className="text-xs text-slate-355 font-semibold uppercase tracking-wider">Total</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-white mt-1">{tasks.length}</p>
        </div>
        <div className="p-4 rounded-2xl glass-card text-center hover:border-white/10 transition-all">
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Metas Concluídas</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-emerald-400 mt-1">
            {tasks.filter(t => t.status === 'completed').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl glass-card text-center hover:border-white/10 transition-all">
          <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Em Progresso</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-blue-400 mt-1">
            {tasks.filter(t => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl glass-card text-center hover:border-white/10 transition-all">
          <span className="text-xs text-amber-500 font-semibold uppercase tracking-wider">Pendentes</span>
          <p className="text-xl md:text-2xl font-bold font-mono text-amber-500 mt-1">
            {tasks.filter(t => t.status === 'pending').length}
          </p>
        </div>
      </div>

      <div id="tasks-main" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Task Form */}
        <div className="p-5 rounded-3xl glass-card h-fit">
          <h4 className="text-base font-bold text-white mb-4">Adicionar Nova Meta</h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Título do Projeto ou Tarefa
              </label>
              <input
                type="text"
                placeholder="Ex: Desenvolver protótipo de UI"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Description or details */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Especificação / Mini Descrição (Opcional)
              </label>
              <textarea
                placeholder="Ex: Modelagem e refinamentos de flexbox..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>

            {/* Priority and Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm focus:outline-none cursor-pointer [&>option]:bg-slate-900"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Prazo de Entrega
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Submit responses error info */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/25 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl glass-button-primary text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Tarefa
            </button>
          </form>
        </div>

        {/* Action items listing with reactive status management */}
        <div className="lg:col-span-2 p-5 rounded-3xl glass-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h4 className="text-base font-bold text-white">Quadro de Ações</h4>
            
            {/* Real Search bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Procurar metas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg glass-input text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Filters Pills toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-black/20 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-2 pr-1">Filtros:</span>
            
            {/* Status Pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                  statusFilter === 'all' 
                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30' 
                    : 'text-slate-400 hover:text-slate-200 bg-white/5 border-transparent'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                  statusFilter === 'pending' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                    : 'text-slate-400 hover:text-slate-200 bg-white/5 border-transparent'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                  statusFilter === 'in_progress' 
                    ? 'bg-sky-500/20 text-sky-305 text-sky-300 border-sky-500/30' 
                    : 'text-slate-400 hover:text-slate-200 bg-white/5 border-transparent'
                }`}
              >
                Fazendo
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                  statusFilter === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'text-slate-400 hover:text-slate-200 bg-white/5 border-transparent'
                }`}
              >
                Concluídos
              </button>
            </div>

            <div className="w-px h-4 bg-white/10 mx-2"></div>

            {/* Priority Pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPriorityFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                  priorityFilter === 'all' 
                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30' 
                    : 'text-slate-400 hover:text-slate-200 bg-white/5 border-transparent'
                }`}
              >
                Prioridade (Todas)
              </button>
              <button
                onClick={() => setPriorityFilter('high')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                  priorityFilter === 'high' 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                    : 'text-slate-400 hover:text-slate-200 bg-white/5 border-transparent'
                }`}
              >
                Urgente
              </button>
            </div>
          </div>

          {/* List items with responsive structures */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-20 text-slate-450 text-slate-400 text-sm">
                Nenhuma tarefa correspondente aos filtros.
              </div>
            ) : (
              filteredTasks.map((t) => {
                const timing = isDueSoonOrOverdue(t.dueDate, t.status);
                return (
                  <div 
                    key={t.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      t.status === 'completed' 
                        ? 'bg-black/10 border-white/5 opacity-55' 
                        : 'bg-black/10 hover:bg-black/20 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Name, descriptions and key labels */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onUpdateTaskStatus(t.id, t.status === 'completed' ? 'pending' : 'completed')}
                          className={`mt-0.5 p-1 rounded-full border transition-colors outline-none cursor-pointer ${
                            t.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25'
                              : 'bg-black/30 hover:bg-white/10 text-slate-400 hover:text-slate-200 border-white/10'
                          }`}
                          title="Marcar como concluído"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <div className="space-y-1">
                          <h5 className={`text-sm font-bold tracking-tight text-white leading-tight ${
                            t.status === 'completed' ? 'line-through text-slate-500' : ''
                          }`}>
                            {t.title}
                          </h5>
                          {t.description && (
                            <p className="text-xs text-slate-405 text-slate-400 leading-relaxed font-light max-w-xl">
                              {t.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-1.5">
                            {/* Priority Badge */}
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                              t.priority === 'high' 
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/20' 
                                : t.priority === 'medium' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' 
                                : 'bg-white/5 text-slate-400 border border-white/5'
                            }`}>
                              {t.priority === 'high' ? 'Urgente' : t.priority === 'medium' ? 'Médio' : 'Secundário'}
                            </span>

                            {/* Status controls cycle display */}
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold capitalize ${
                              t.status === 'completed' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' 
                                : t.status === 'in_progress' 
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/20' 
                                : 'bg-amber-500/20 text-amber-350 text-amber-300 border border-amber-500/20'
                            }`}>
                              {t.status === 'completed' ? 'Finalizado' : t.status === 'in_progress' ? 'Executando' : 'Aguardando'}
                            </span>

                            {/* Overdue deadliner alert badge */}
                            <span className={`inline-flex items-center gap-1 font-mono text-[9px] font-bold px-2 py-0.5 border rounded ${
                              timing === 'overdue' 
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/20 animate-pulse' 
                                : timing === 'soon' 
                                ? 'bg-amber-500/20 text-amber-305 text-amber-300 border border-amber-500/20' 
                                : 'bg-white/5 text-slate-450 text-slate-400 border-white/5'
                            }`}>
                              <Calendar className="w-2.5 h-2.5 text-indigo-400" />
                              Prazo: {new Date(t.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                              {timing === 'overdue' && ' (Atrasada!)'}
                              {timing === 'soon' && ' (Vence Logo)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive controllers actions */}
                      <div className="flex items-center gap-2 justify-end sm:shrink-0">
                        {t.status !== 'completed' && (
                          <button
                            onClick={() => onUpdateTaskStatus(t.id, t.status === 'pending' ? 'in_progress' : 'completed')}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Clock className="w-3 h-3 text-sky-450 text-sky-400" />
                            {t.status === 'pending' ? 'Começar' : 'Concluir'}
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteTask(t.id)}
                          className="p-1.5 rounded-lg bg-transparent hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Eliminar tarefa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
