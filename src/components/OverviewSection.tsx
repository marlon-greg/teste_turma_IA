import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ClipboardList, 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownRight, 
  Award, 
  Flame, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Task, Transaction, Note, User } from '../types';

interface OverviewSectionProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
  notes: Note[];
  setActiveTab: (tab: string) => void;
}

export default function OverviewSection({ user, tasks, transactions, notes, setActiveTab }: OverviewSectionProps) {
  // Financial metrics
  const financialSummary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expenses += t.amount;
    });
    return {
      income,
      expenses,
      balance: income - expenses,
      savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0
    };
  }, [transactions]);

  // Task metrics
  const taskSummary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [tasks]);

  // Insight message generator
  const insights = useMemo(() => {
    const messages = [];
    if (financialSummary.savingsRate > 30) {
      messages.push({
        type: 'success',
        text: 'Excelente controle financeiro! Sua taxa de economia está saudável.',
        badge: 'Top Poupador'
      });
    } else if (financialSummary.savingsRate < 10 && financialSummary.expenses > 0) {
      messages.push({
        type: 'warning',
        text: 'Atenção: Suas despesas estão próximas das receitas. Revise seus custos nas próximas semanas.',
        badge: 'Alerta Financeiro'
      });
    }

    if (taskSummary.highPriority > 0) {
      messages.push({
        type: 'info',
        text: `Você tem ${taskSummary.highPriority} tarefa(s) de alta prioridade pendente(s). Agende seu foco nelas hoje.`,
        badge: 'Foco Necessário'
      });
    } else if (taskSummary.completed > 0 && taskSummary.total === taskSummary.completed) {
      messages.push({
        type: 'success',
        text: 'Incrível! Todas as suas tarefas foram concluídas. Você está no topo de tudo!',
        badge: 'Produtividade de Elite'
      });
    } else {
      messages.push({
        type: 'info',
        text: 'O seu fluxo de produtividade está constante. Mantenha as tarefas atualizadas.',
        badge: 'Fluxo Estável'
      });
    }

    if (notes.length === 0) {
      messages.push({
        type: 'neutral',
        text: 'Experimente registrar suas principais ideias de hoje na aba de Notas para liberar memória mental.',
        badge: 'Mentalidade'
      });
    }

    return messages;
  }, [financialSummary, taskSummary, notes]);

  // Format currency
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Static structure of financial months for the visual chart (dynamic simulation based on past transactions)
  const monthlyMetrics = useMemo(() => {
    // Basic category distribution
    const categories: { [key: string]: number } = {};
    transactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const categoryList = Object.entries(categories)
      .map(([name, val]) => ({ name, val }))
      .sort((a,b) => b.val - a.val)
      .slice(0, 4);

    return {
      categoryList
    };
  }, [transactions]);

  return (
    <div id="overview-container" className="space-y-6">
      {/* Welcome Banner */}
      <div id="welcome-banner" className="relative overflow-hidden rounded-3xl glass-card p-6 md:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold glass-badge text-indigo-300 mb-3 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Painel Integrado
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Olá, {user.name}! ☕
            </h1>
            <p className="text-slate-350 mt-1 max-w-2xl text-sm md:text-base leading-relaxed">
              Bem-vindo de volta ao seu centro de comando pessoal. Aqui está uma visão atualizada do seu progresso, finanças e tarefas de hoje.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button 
              id="new-task-shortcut" 
              onClick={() => setActiveTab('tasks')}
              className="px-4 py-2.5 rounded-xl glass-button-primary text-sm flex items-center gap-2 cursor-pointer text-white"
            >
              <ClipboardList className="w-4 h-4" />
              Minhas Tarefas
            </button>
            <button 
              id="new-trans-shortcut" 
              onClick={() => setActiveTab('finance')}
              className="px-4 py-2.5 rounded-xl glass-badge hover:bg-white/10 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Financeiro
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div id="kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Saldo Disponível */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Saldo Total</span>
            <div className={`p-2.5 rounded-xl ${financialSummary.balance >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
              {financialSummary.balance >= 0 ? <TrendingUp className="w-5 h-5 animate-bounce" /> : <TrendingDown className="w-5 h-5 animate-bounce" />}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight group-hover:scale-[1.01] transition-transform">
              {formatValue(financialSummary.balance)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-xs font-semibold flex items-center ${financialSummary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {financialSummary.balance >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {financialSummary.savingsRate}% economizados
              </span>
              <span className="text-[10px] text-slate-400 font-mono">da receita</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Entrada / Despesa do Mês */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Entradas / Saídas</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 border border-white/5">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Receitas:</span>
                <span className="text-xs font-semibold text-emerald-400">{formatValue(financialSummary.income)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Despesas:</span>
                <span className="text-xs font-semibold text-rose-400">{formatValue(financialSummary.expenses)}</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Consumido</span>
              <span className="text-[10px] text-slate-200 font-mono">
                {financialSummary.income > 0 ? Math.min(100, Math.round((financialSummary.expenses/financialSummary.income)*100)) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Produtividade */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Produtividade</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-white/5">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {taskSummary.completionRate}%
            </h3>
            <div className="w-full bg-black/40 h-1.5 rounded-full mt-2.5 overflow-hidden border border-white/5">
              <div 
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${taskSummary.completionRate}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-300 font-medium">
                {taskSummary.completed} de {taskSummary.total} concluídas
              </span>
              {taskSummary.highPriority > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 animate-pulse border border-rose-500/20">
                  {taskSummary.highPriority} Urgentes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 4: Notas & Inspirações */}
        <div className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Notas & Ideias</span>
            <div className="p-2.5 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 border border-white/5">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {notes.length}
            </h3>
            <p className="text-xs text-slate-300 mt-2">
              Ideias, lembretes e rascunhos salvos de forma segura no navegador.
            </p>
            <div className="mt-3 pt-1 text-right">
              <button 
                onClick={() => setActiveTab('notes')} 
                className="text-[10px] font-bold text-fuchsia-400 uppercase hover:underline hover:text-fuchsia-300 cursor-pointer"
              >
                Ver Bloco &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Graphs & Insights */}
      <div id="stats-insights-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Pure SVG Income vs Expenses Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-white">Balanço das Suas Transações</h4>
              <p className="text-xs text-slate-300">Comparação visual das finanças registradas</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-200">Entradas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-200">Despesas</span>
              </div>
            </div>
          </div>

          {/* SVG Animated chart rendering */}
          <div className="relative h-64 w-full flex items-end">
            {financialSummary.income === 0 && financialSummary.expenses === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/20 rounded-2xl border border-white/5">
                <p className="text-sm text-slate-300 font-medium">Nenhum dado financeiro para exibir o gráfico.</p>
                <p className="text-xs text-slate-450 mt-1">Registre transações na aba "Financeiro" para gerar dados reais!</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-between pt-2">
                {/* Horizontal guide lines */}
                <div className="flex-1 w-full flex flex-col justify-between relative">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-white/5 w-full h-0"></div>
                    <div className="border-t border-white/5 w-full h-0"></div>
                    <div className="border-t border-white/5 w-full h-0"></div>
                    <div className="border-t border-white/5 w-full h-0"></div>
                  </div>

                  {/* Real Comparison Bars */}
                  <div className="absolute inset-0 flex items-end justify-around px-8">
                    {/* Financial Summary income Bar */}
                    <div className="flex flex-col items-center gap-2 group cursor-pointer transition-transform duration-300 hover:scale-105">
                      <div className="text-[10px] font-bold text-emerald-400 mb-1 opacity-100 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/20">
                        {formatValue(financialSummary.income)}
                      </div>
                      <div 
                        className="w-16 rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-450 shadow-lg shadow-emerald-500/10 group-hover:from-emerald-500 group-hover:to-emerald-400 transition-all duration-500"
                        style={{ 
                          height: `${Math.max(20, Math.min(180, (financialSummary.income / Math.max(1, financialSummary.income, financialSummary.expenses)) * 160))}px` 
                        }}
                      />
                      <span className="text-xs font-semibold text-slate-355 tracking-wide mt-2">Receitas</span>
                    </div>

                    {/* Financial Summary expenses Bar */}
                    <div className="flex flex-col items-center gap-2 group cursor-pointer transition-transform duration-300 hover:scale-105">
                      <div className="text-[10px] font-bold text-rose-400 mb-1 opacity-100 bg-rose-950/80 px-2.5 py-1 rounded border border-rose-500/20">
                        {formatValue(financialSummary.expenses)}
                      </div>
                      <div 
                        className="w-16 rounded-t-xl bg-gradient-to-t from-rose-600 to-rose-450 shadow-lg shadow-rose-500/10 group-hover:from-rose-500 group-hover:to-rose-400 transition-all duration-500"
                        style={{ 
                          height: `${Math.max(20, Math.min(180, (financialSummary.expenses / Math.max(1, financialSummary.income, financialSummary.expenses)) * 160))}px` 
                        }}
                      />
                      <span className="text-xs font-semibold text-slate-355 tracking-wide mt-2">Despesas</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
            <span>Visualização unificada de fluxo local</span>
            <span className="font-mono text-[10px] text-slate-500">Status seguro</span>
          </div>
        </div>

        {/* Workspace Quick Insights Column */}
        <div id="quick-insights" className="p-6 rounded-3xl glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <h4 className="text-base font-bold text-white">Insights Privados</h4>
            </div>
            
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Dicas acionadas com base nas suas informações locais:
            </p>

            <div className="space-y-3.5">
              {insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                    insight.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20' :
                    insight.type === 'warning' ? 'bg-amber-950/40 text-amber-300 border-amber-500/20' :
                    insight.type === 'info' ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/20' :
                    'bg-white/5 text-slate-200 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide inline-block ${
                      insight.type === 'success' ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-500/25' :
                      insight.type === 'warning' ? 'bg-amber-400/15 text-amber-300 border border-amber-500/25' :
                      insight.type === 'info' ? 'bg-indigo-400/15 text-indigo-300 border border-indigo-500/25' :
                      'bg-white/10 text-slate-300 border border-white/10'
                    }`}>
                      {insight.badge}
                    </span>
                  </div>
                  {insight.text}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 text-center">
            <div className="inline-flex items-center gap-1.5 text-slate-400 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
              <span>Análise Dinâmica Ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories & High Priority Row */}
      <div id="distribution-row" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Finance Categories */}
        <div className="p-5 rounded-3xl glass-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Top Gastos por Categoria</h4>
            <span className="text-[10px] text-indigo-300 font-bold glass-badge px-2 py-0.5 rounded">Balanço Ativo</span>
          </div>

          {monthlyMetrics.categoryList.length === 0 ? (
            <div className="text-center py-10 text-slate-450 text-xs">
              Nenhuma transação com categoria cadastrada.
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyMetrics.categoryList.map((cat, idx) => {
                const maxVal = Math.max(...monthlyMetrics.categoryList.map(c => c.val));
                const pct = Math.round((cat.val / (maxVal || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200 capitalize">{cat.name}</span>
                      <span className="font-mono text-slate-100 font-semibold">{formatValue(cat.val)}</span>
                    </div>
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-indigo-505 bg-indigo-500 h-2 rounded-full" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Task Priority Breakdown */}
        <div className="p-5 rounded-3xl glass-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Metas e Progresso</h4>
            <span className="text-[10px] text-amber-300 font-bold glass-badge px-2 py-0.5 rounded">Tarefas</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="p-3 glass-badge rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Concluídas</span>
              <p className="text-2xl font-bold text-white mt-1">{taskSummary.completed}</p>
            </div>
            <div className="p-3 glass-badge rounded-xl">
              <span className="text-[10px] uppercase font-bold text-sky-455 text-sky-400 tracking-wider block">Fazendo</span>
              <p className="text-2xl font-bold text-white mt-1">{taskSummary.inProgress}</p>
            </div>
            <div className="p-3 glass-badge rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">Pendentes</span>
              <p className="text-2xl font-bold text-white mt-1">{taskSummary.pending}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-xs">
            <div className="flex items-center justify-between text-slate-300 mb-2">
              <span>Taxa Geral de Conclusão:</span>
              <span className="font-bold text-white">{taskSummary.completionRate}%</span>
            </div>
            <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-emerald-555 bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${taskSummary.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
