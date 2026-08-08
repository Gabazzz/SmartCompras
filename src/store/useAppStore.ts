import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Compra, Estoque, Meta, Categoria } from '../types';
import { SEED_COMPRAS, SEED_ESTOQUE, COMPRAS_JULHO } from './seedData';
import { format, isSameMonth, parseISO } from 'date-fns';

interface AppState {
  // Data
  compras: Compra[];
  estoque: Estoque[];
  meta: Meta;
  mercados: string[];
  seeded: boolean;

  // Compras actions
  addCompra: (compra: Omit<Compra, 'id'>) => void;
  updateCompra: (id: string, data: Partial<Compra>) => void;
  deleteCompra: (id: string) => void;

  // Estoque actions
  addEstoque: (item: Omit<Estoque, 'id'>) => void;
  updateEstoque: (id: string, data: Partial<Estoque>) => void;
  deleteEstoque: (id: string) => void;

  // Meta
  setMeta: (valor: number) => void;

  // Mercados
  addMercado: (nome: string) => void;

  // Computed (called as functions)
  getTotalMes: (mes?: string) => number;
  getPercMeta: () => number;
  getEssenciaisTotal: (mes?: string) => number;
  getNaoEssenciaisTotal: (mes?: string) => number;
  getComprasDoMes: (mes?: string) => Compra[];
  getInsight: () => string;
  getProdutosHistorico: () => string[];
}

const currentMes = () => format(new Date(), 'yyyy-MM');

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      compras: [],
      estoque: [],
      meta: { mes: currentMes(), valor: 800 },
      mercados: ['Atacadão', 'Mercado A', 'Feira', 'Farmácias'],
      seeded: false,

      addCompra: (compra) => {
        const newCompra: Compra = {
          ...compra,
          id: `compra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };
        set((s) => ({ compras: [newCompra, ...s.compras] }));
      },

      updateCompra: (id, data) =>
        set((s) => ({
          compras: s.compras.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      deleteCompra: (id) =>
        set((s) => ({ compras: s.compras.filter((c) => c.id !== id) })),

      addEstoque: (item) => {
        const newItem: Estoque = {
          ...item,
          id: `est-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };
        set((s) => ({ estoque: [newItem, ...s.estoque] }));
      },

      updateEstoque: (id, data) =>
        set((s) => ({
          estoque: s.estoque.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),

      deleteEstoque: (id) =>
        set((s) => ({ estoque: s.estoque.filter((e) => e.id !== id) })),

      setMeta: (valor) =>
        set((s) => ({ meta: { ...s.meta, valor, mes: currentMes() } })),

      addMercado: (nome) =>
        set((s) => ({
          mercados: s.mercados.includes(nome)
            ? s.mercados
            : [...s.mercados, nome],
        })),

      getComprasDoMes: (mes) => {
        const target = mes || currentMes();
        const targetDate = parseISO(`${target}-01`);
        return get().compras.filter((c) =>
          isSameMonth(parseISO(c.data), targetDate)
        );
      },

      getTotalMes: (mes) => {
        return get()
          .getComprasDoMes(mes)
          .reduce((acc, c) => acc + c.valorTotal, 0);
      },

      getPercMeta: () => {
        const { meta } = get();
        const total = get().getTotalMes();
        return meta.valor > 0 ? (total / meta.valor) * 100 : 0;
      },

      getEssenciaisTotal: (mes) => {
        return get()
          .getComprasDoMes(mes)
          .filter((c) => c.essencial)
          .reduce((acc, c) => acc + c.valorTotal, 0);
      },

      getNaoEssenciaisTotal: (mes) => {
        return get()
          .getComprasDoMes(mes)
          .filter((c) => !c.essencial)
          .reduce((acc, c) => acc + c.valorTotal, 0);
      },

      getInsight: () => {
        const compras = get().getComprasDoMes();
        if (compras.length === 0) return 'Adicione suas primeiras compras para ver insights automáticos! 🚀';

        // Total por categoria
        const porCategoria: Record<string, number> = {};
        compras.forEach((c) => {
          porCategoria[c.categoria] = (porCategoria[c.categoria] || 0) + c.valorTotal;
        });

        // Produto mais caro
        const maisCaro = [...compras].sort((a, b) => b.valorTotal - a.valorTotal)[0];

        // Categoria que mais gasta
        const catEntries = Object.entries(porCategoria);
        const topCat = catEntries.sort((a, b) => b[1] - a[1])[0];

        const naoEssencial = get().getNaoEssenciaisTotal();
        const total = get().getTotalMes();
        const percNE = total > 0 ? (naoEssencial / total) * 100 : 0;

        if (percNE > 25) {
          return `⚠️ Itens não essenciais representam ${percNE.toFixed(0)}% do gasto mensal. Reveja essa categoria para economizar!`;
        }
        if (maisCaro) {
          return `💡 Seu item mais caro foi "${maisCaro.produto}" com ${maisCaro.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. ${topCat ? `Maior gasto: ${topCat[0]}.` : ''}`;
        }
        return `✅ Você está no controle! Gasto em ${topCat?.[0] || 'compras'}: ${(topCat?.[1] || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`;
      },

      getProdutosHistorico: () => {
        const produtos = get().compras.map((c) => c.produto);
        return [...new Set(produtos)];
      },
    }),
    {
      name: 'minu-storage',
      onRehydrateStorage: () => (state) => {
        if (state && !state.seeded) {
          state.compras = [...COMPRAS_JULHO, ...SEED_COMPRAS];
          state.estoque = SEED_ESTOQUE;
          state.seeded = true;
        }
      },
    }
  )
);
