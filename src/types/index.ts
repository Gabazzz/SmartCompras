export type Categoria =
  | 'Alimentação'
  | 'Hortifruti'
  | 'Laticínios'
  | 'Carnes'
  | 'Limpeza'
  | 'Higiene'
  | 'Farmácia'
  | 'Outros';

export type Unidade = 'un' | 'kg' | 'g' | 'L' | 'mL' | 'cx' | 'pct';

export interface Compra {
  id: string;
  produto: string;
  categoria: Categoria;
  essencial: boolean;
  quantidade: number;
  unidade: Unidade;
  valorUni: number;
  valorTotal: number;
  mercado: string;
  data: string; // ISO string
  obs?: string;
}

export interface Estoque {
  id: string;
  produto: string;
  qtdAtual: number;
  qtdMinima: number;
  unidade: Unidade;
  ultimaCompra?: string;
}

export interface Meta {
  mes: string; // "2025-05"
  valor: number;
}

export interface ItemLista {
  id: string;
  produto: string;
  comprado: boolean;
}

export const CATEGORIAS: { label: Categoria; emoji: string; essencial: boolean }[] = [
  { label: 'Alimentação', emoji: '🌾', essencial: true },
  { label: 'Hortifruti', emoji: '🥦', essencial: true },
  { label: 'Laticínios', emoji: '🥛', essencial: true },
  { label: 'Carnes', emoji: '🥩', essencial: true },
  { label: 'Limpeza', emoji: '🧴', essencial: true },
  { label: 'Higiene', emoji: '🪥', essencial: true },
  { label: 'Farmácia', emoji: '💊', essencial: true },
  { label: 'Outros', emoji: '📦', essencial: false },
];

export const CATEGORIA_EMOJI: Record<Categoria, string> = {
  'Alimentação': '🌾',
  'Hortifruti': '🥦',
  'Laticínios': '🥛',
  'Carnes': '🥩',
  'Limpeza': '🧴',
  'Higiene': '🪥',
  'Farmácia': '💊',
  'Outros': '📦',
};
