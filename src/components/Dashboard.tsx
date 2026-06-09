import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Wallet, 
  CheckSquare, 
  StickyNote, 
  LogOut, 
  User as UserIcon,
  Clock,
  Menu,
  X,
  Sparkles,
  Calendar
} from 'lucide-react';
import { User, Task, Transaction, Note } from '../types';
import OverviewSection from './OverviewSection';
import FinanceSection from './FinanceSection';
import TaskSection from './TaskSection';
import NotesSection from './NotesSection';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  tasks: Task[];
  transactions: Transaction[];
  notes: Note[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (id: string, newStatus: Task['status']) => void;
  onDeleteTask: (id: string) => void;
  onAddTransaction: (trans: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updatedFields: Partial<Omit<Note, 'id'>>) => void;
  onDeleteNote: (id: string) => void;
}

export default function Dashboard({
  user,
  onLogout,
  tasks,
  transactions,
  notes,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onAddTransaction,
  onDeleteTransaction,
  onAddNote,
  onUpdateNote,
  onDeleteNote
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = (d: Date) => {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3, badge: null },
    { id: 'finance', label: 'Financeiro', icon: Wallet, badge: transactions.length > 0 ? `${transactions.length}` : null },
    { id: 'tasks', label: 'Metas & Tarefas', icon: CheckSquare, badge: tasks.filter(t => t.status !== 'completed').length > 0 ? `${tasks.filter(t => t.status !== 'completed').length}` : null },
    { id: 'notes', label: 'Bloco de Notas', icon: StickyNote, badge: notes.length > 0 ? `${notes.length}` : null },
  ];

  return (
    <div id="dashboard-layout" className="min-h-screen glass-background text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside 
        id="dashboard-sidebar" 
        className="hidden md:flex flex-col justify-between w-64 glass-panel border-r border-white/10 p-5 shrink-0"
      >
        <div className="space-y-6">
          {/* Brand/AppName */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-2 glass-badge text-indigo-300 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Workspace</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest leading-none">Painel Pessoal</p>
            </div>
          </div>

          <div className="h-px bg-white/10"></div>

          {/* User Section Info */}
          <div className="flex items-center gap-3 px-2 py-1.5 glass-badge rounded-xl">
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm">
              {user.avatarSeed}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">@{user.username}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-black/30 text-slate-300 border border-white/5'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Details */}
        <div className="space-y-4">
          {/* Live UTC time Display widget */}
          <div className="px-3 py-2 rounded-xl glass-badge text-xs flex items-center justify-between text-slate-300 font-mono">
            <div className="flex items-center gap-1.5 text-[10px]">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatClock(time)}</span>
            </div>
            <span className="text-[9px] text-indigo-400 font-semibold">LOCAL</span>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair da Sessão
          </button>
        </div>
      </aside>

      {/* Mobile Header Menu Panel */}
      <header className="md:hidden flex items-center justify-between glass-panel border-b border-white/10 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
          <span className="text-sm font-bold text-white tracking-tight">Workspace</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Miniature Clock */}
          <span className="text-[10px] text-slate-300 font-mono glass-badge px-2 py-0.5 rounded">
            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded glass-badge text-slate-350 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown context menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 p-4 space-y-3 z-30 transition-all">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-450 border border-indigo-500/20 flex items-center justify-center font-bold text-xs">
              {user.avatarSeed}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">{user.name}</span>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    isActive ? 'bg-indigo-600 text-white' : 'glass-badge text-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={onLogout}
            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 rounded-lg text-xs font-bold text-rose-400 text-center transition-colors block cursor-pointer"
          >
            Sair da Sessão
          </button>
        </div>
      )}

      {/* Main Panel Content Area */}
      <main id="dashboard-content" className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'overview' && (
            <OverviewSection 
              user={user} 
              tasks={tasks} 
              transactions={transactions} 
              notes={notes} 
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceSection 
              transactions={transactions} 
              onAddTransaction={onAddTransaction} 
              onDeleteTransaction={onDeleteTransaction}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskSection 
              tasks={tasks} 
              onAddTask={onAddTask} 
              onUpdateTaskStatus={onUpdateTaskStatus} 
              onDeleteTask={onDeleteTask}
            />
          )}

          {activeTab === 'notes' && (
            <NotesSection 
              notes={notes} 
              onAddNote={onAddNote} 
              onUpdateNote={onUpdateNote} 
              onDeleteNote={onDeleteNote}
            />
          )}
        </div>
      </main>

    </div>
  );
}
