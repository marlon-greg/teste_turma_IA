export interface User {
  username: string;
  name: string;
  avatarSeed: string; // Used to generate or select a custom profile avatar
  joinedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  updatedAt: string;
}
