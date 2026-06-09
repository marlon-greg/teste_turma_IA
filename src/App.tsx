import { useState, useEffect } from 'react';
import { User, Task, Transaction, Note } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check saved session on load
  useEffect(() => {
    const savedSession = localStorage.getItem('current_user');
    if (savedSession) {
      try {
        const parsedUser = JSON.parse(savedSession);
        setCurrentUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('current_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Fetch or populate user-scoped data once logged in
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setTransactions([]);
      setNotes([]);
      return;
    }

    const tasksKey = `tasks_${currentUser.username}`;
    const transKey = `trans_${currentUser.username}`;
    const notesKey = `notes_${currentUser.username}`;

    // Get or initialize tasks
    const savedTasks = localStorage.getItem(tasksKey);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const initialTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Ajustar layout responsivo do Dashboard',
          description: 'Garantir que os gráficos SVG e o bloco de notas adaptem-se a telas menores.',
          priority: 'high',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
          createdAt: new Date().toISOString()
        },
        {
          id: 'task-2',
          title: 'Implementar validação local de formulários',
          description: 'Validar valores negativos em transações e campos vazios antes do cadastro.',
          priority: 'medium',
          status: 'completed',
          dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
          createdAt: new Date().toISOString()
        },
        {
          id: 'task-3',
          title: 'Revisar metas da semana',
          description: 'Ajustar planejamentos estratégicos de finanças com foco na economia mensal.',
          priority: 'low',
          status: 'pending',
          dueDate: new Date(Date.now() + 432000000).toISOString().split('T')[0], // 5 days from now
          createdAt: new Date().toISOString()
        }
      ];
      setTasks(initialTasks);
      localStorage.setItem(tasksKey, JSON.stringify(initialTasks));
    }

    // Get or initialize transactions
    const savedTrans = localStorage.getItem(transKey);
    if (savedTrans) {
      setTransactions(JSON.parse(savedTrans));
    } else {
      const initialTrans: Transaction[] = [
        {
          id: 'trans-1',
          description: 'Desenvolvimento de Dashboard React',
          type: 'income',
          category: 'Freelance',
          amount: 5200.00,
          date: new Date().toISOString().split('T')[0]
        },
        {
          id: 'trans-2',
          description: 'Aluguel do Coworking',
          type: 'expense',
          category: 'Moradia',
          amount: 1550.00,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
        },
        {
          id: 'trans-3',
          description: 'Curso Avançado de TypeScript',
          type: 'expense',
          category: 'Educação',
          amount: 280.00,
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
        }
      ];
      setTransactions(initialTrans);
      localStorage.setItem(transKey, JSON.stringify(initialTrans));
    }

    // Get or initialize notes
    const savedNotes = localStorage.getItem(notesKey);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      const initialNotes: Note[] = [
        {
          id: 'note-1',
          title: 'Ideias para o Próximo Projeto',
          content: 'Fazer um aplicativo de meditação minimalista off-line com sintetizadores Web Audio API internos para loops de respiração.',
          color: 'indigo',
          tags: ['ideias', 'projetos'],
          updatedAt: new Date().toISOString()
        },
        {
          id: 'note-2',
          title: 'Anotações sobre LocalStorage',
          content: 'Lembrar que o localStorage suporta apenas strings de até ~5MB de dados por domínio. Serializar tudo utilizando JSON.stringify.',
          color: 'slate',
          tags: ['lembretes', 'tecnico'],
          updatedAt: new Date().toISOString()
        }
      ];
      setNotes(initialNotes);
      localStorage.setItem(notesKey, JSON.stringify(initialNotes));
    }
  }, [currentUser]);

  // Auth Operations
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    setCurrentUser(null);
  };

  // Scoped Storage Helpers
  const saveTasksToStorage = (updatedTasks: Task[]) => {
    if (!currentUser) return;
    localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const saveTransactionsToStorage = (updatedTrans: Transaction[]) => {
    if (!currentUser) return;
    localStorage.setItem(`trans_${currentUser.username}`, JSON.stringify(updatedTrans));
    setTransactions(updatedTrans);
  };

  const saveNotesToStorage = (updatedNotes: Note[]) => {
    if (!currentUser) return;
    localStorage.setItem(`notes_${currentUser.username}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  // Task Handlers
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    saveTasksToStorage([...tasks, newTask]);
  };

  const handleUpdateTaskStatus = (id: string, newStatus: Task['status']) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    saveTasksToStorage(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasksToStorage(updated);
  };

  // Transaction Handlers
  const handleAddTransaction = (transData: Omit<Transaction, 'id'>) => {
    const newTrans: Transaction = {
      ...transData,
      id: `trans-${Date.now()}`
    };
    saveTransactionsToStorage([newTrans, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    saveTransactionsToStorage(updated);
  };

  // Note Handlers
  const handleAddNote = (noteData: Omit<Note, 'id' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    saveNotesToStorage([newNote, ...notes]);
  };

  const handleUpdateNote = (id: string, updatedFields: Partial<Omit<Note, 'id'>>) => {
    const updated = notes.map(n => n.id === id ? { 
      ...n, 
      ...updatedFields, 
      updatedAt: new Date().toISOString() 
    } : n);
    saveNotesToStorage(updated);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotesToStorage(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs">
        Carregando workspace seguro...
      </div>
    );
  }

  return (
    <div id="app-viewport">
      {currentUser ? (
        <Dashboard
          user={currentUser}
          onLogout={handleLogout}
          tasks={tasks}
          transactions={transactions}
          notes={notes}
          onAddTask={handleAddTask}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onDeleteTask={handleDeleteTask}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
        />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
