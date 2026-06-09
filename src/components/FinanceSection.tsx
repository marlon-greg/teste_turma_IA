import { useState, useMemo, FormEvent } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../types';

interface FinanceSectionProps {
  transactions: Transaction[];
  onAddTransaction: (trans: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function FinanceSection({ transactions, onAddTransaction, onDeleteTransaction }: FinanceSectionProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Alimentação');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Input validation state
  const [errorMsg, setErrorMsg] = useState('');

  // Predefined Categories
  const categories = useMemo(() => {
    if (type === 'income') {
      return ['Salário', 'Investimentos', 'Freelance', 'Venda', 'Outros'];
    } else {
      return ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'];
    }
  }, [type]);

  // Adjust default category when type changes
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? 'Salário' : 'Alimentação');
  };

  // Submit hander
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!description.trim()) {
      setErrorMsg('Por favor, informe uma descrição clara.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Por favor, insira um valor monetário válido maior que zero.');
      return;
    }

    onAddTransaction({
      description: description.trim(),
      amount: numericAmount,
      type,
      category,
      date: date || new Date().toISOString().split('T')[0]
    });

    // Reset fields
    setDescription('');
    setAmount('');
    setErrorMsg('');
  };

  // Live calculations
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  // Filter & Search computation
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, categoryFilter, typeFilter]);

  // All distinct categories currently in use (for filter dropdown)
  const distinctCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div id="finance-section-wrapper" className="space-y-6">
      
      {/* Visual Balance Bar */}
      <div id="finance-totals-display" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Available Balance */}
        <div className="p-5 rounded-2xl glass-card flex items-center justify-between hover:border-white/20 transition-all">
          <div>
            <span className="text-xs font-semibold text-slate-355 uppercase tracking-wider">Saldo em Conta</span>
            <h3 className={`text-2xl font-bold mt-1 tracking-tight text-white`}>
              {formatValue(totals.balance)}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${totals.balance >= 0 ? 'bg-emerald-500/15 text-emerald-350 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-355 border border-rose-500/20'}`}>
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Inflow Card */}
        <div className="p-5 rounded-2xl glass-card flex items-center justify-between hover:border-white/20 transition-all">
          <div>
            <span className="text-xs font-semibold text-slate-355 uppercase tracking-wider">Total de Entradas</span>
            <h3 className="text-2xl font-bold mt-1 tracking-tight text-emerald-400">
              {formatValue(totals.income)}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Outflow Card */}
        <div className="p-5 rounded-2xl glass-card flex items-center justify-between hover:border-white/20 transition-all">
          <div>
            <span className="text-xs font-semibold text-slate-355 uppercase tracking-wider">Total de Saídas</span>
            <h3 className="text-2xl font-bold mt-1 tracking-tight text-rose-450 text-rose-400">
              {formatValue(totals.expense)}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/20">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div id="finance-main-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Transaction Form Panel */}
        <div className="p-5 rounded-3xl glass-card h-fit">
          <h4 className="text-base font-bold text-white mb-4">Nova Transação</h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Tipo de Transação
              </label>
              <div className="grid grid-cols-2 gap-2 bg-black/35 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    type === 'expense' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/25 shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Gastos / Saída
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    type === 'income' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Entradas / Ganhos
                  </span>
                </button>
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Descrição
              </label>
              <input
                type="text"
                placeholder="Ex: Almoço Self-Service, Salário"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Money Value Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Category dropdown & Date alignment */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm focus:outline-none capitalize cursor-pointer [&>option]:bg-slate-900"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Display error messages in layout */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                type === 'income' 
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-emerald-500/10' 
                  : 'bg-indigo-600 hover:bg-indigo-505 bg-indigo-500 active:bg-indigo-700 shadow-indigo-500/10'
              }`}
            >
              <Plus className="w-4 h-4" />
              Lançar Transação
            </button>
          </form>
        </div>

        {/* Dynamic Interactive Filter and Transactions List Panel */}
        <div className="lg:col-span-2 p-5 rounded-3xl glass-card flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <h4 className="text-base font-bold text-white">Extrato de Movimentações</h4>
              
              {/* Simple count label */}
              <span className="text-xs text-slate-350 glass-badge px-3 py-1 rounded-xl">
                Mostrando <strong>{filteredTransactions.length}</strong> lançamentos
              </span>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3 bg-black/20 rounded-2xl border border-white/5">
              {/* Search String */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filtrar por texto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg glass-input text-xs focus:outline-none"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs focus:outline-none cursor-pointer [&>option]:bg-slate-900"
                >
                  <option value="all">Tipos (Todos)</option>
                  <option value="income">Apenas Entradas</option>
                  <option value="expense">Apenas Saídas</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs focus:outline-none cursor-pointer capitalize [&>option]:bg-slate-900"
                >
                  <option value="all">Categorias (Todas)</option>
                  {distinctCategories.map(cat => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List items with responsive layout */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                  {transactions.length === 0 
                    ? 'Nenhuma transação lançada ainda. Crie seu primeiro lançamento ao lado!'
                    : 'Nenhum resultado encontrado para os filtros selecionados.'}
                </div>
              ) : (
                filteredTransactions.map((t) => (
                  <div 
                    key={t.id} 
                    className="p-3.5 rounded-xl bg-black/10 hover:bg-black/20 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${
                        t.type === 'income' 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/10' 
                          : 'bg-rose-500/15 text-rose-450 text-rose-400'
                      }`}>
                        {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{t.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-300 font-bold capitalize glass-badge px-2 py-0.5 rounded-md">
                            {t.category}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-indigo-400" />
                            {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold font-mono ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatValue(t.amount)}
                      </span>
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-1 rounded bg-transparent hover:bg-rose-500/15 text-slate-400 hover:text-rose-450 active:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
                        title="Deletar lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 p-3 text-xs text-slate-400 flex flex-col sm:flex-row gap-2 justify-between items-center glass-badge rounded-2xl">
            <span>Todas as finanças são salvas estritamente no seu localStorage.</span>
            <span className="font-mono text-[10px] text-indigo-300 font-semibold">Workspace Criptografado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
