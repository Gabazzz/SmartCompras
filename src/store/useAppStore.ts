import { create } from 'zustand';
import type { Compra, Estoque, Meta } from '../types';
import { SEED_COMPRAS, SEED_ESTOQUE, COMPRAS_JULHO } from './seedData';
import { format, isSameMonth, parseISO } from 'date-fns';
import {
  fetchCompras,
  insertCompra,
  updateCompraRow,
  deleteCompraRow,
  fetchEstoque,
  insertEstoque,
  updateEstoqueRow,
  deleteEstoqueRow,
  fetchMeta,
  upsertMeta,
  fetchMercados,
  insertMercado,
} from './supabaseSync';

interface AppState {
  // Data
  compras: Compra[];
  estoque: Estoque[];
  meta: Meta;
  mercados: string[];

  // Estado de carregamento
  loading: boolean;
  loaded: boolean;
  loadError: string | null;

  // Inicialização (busca tudo do Supabase)
  loadFromSupabase: () => Promise<void>;

  // Compras actions
  addCompra: (compra: Omit<Compra, 'id'>) => Promise<void>;
  updateCompra: (id: string, data: Partial<Compra>) => Promise<void>;
  deleteCompra: (id: string) => Promise<void>;

  // Estoque actions
  addEstoque: (item: Omit<Estoque, 'id'>) => Promise<void>;
  updateEstoque: (id: string, data: Partial<Estoque>) => Promise<void>;
  deleteEstoque: (id: string) => Promise<void>;

  // Meta
  setMeta: (valor: number) => Promise<void>;

  // Mercados
  addMercado: (nome: string) => Promise<void>;

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

export const useAppStore = create<AppState>()((set, get) => ({
  compras: [],
  estoque: [],
  meta: { mes: currentMes(), valor: 800 },
  mercados: [],
  loading: false,
  loaded: false,
  loadError: null,

  loadFromSupabase: async () => {
    set({ loading: true, loadError: null });
    try {
      let [compras, estoque, mercados] = await Promise.all([
        fetchCompras(),
        fetchEstoque(),
        fetchMercados(),
      ]);

      // Primeira vez que o app roda com o banco vazio: popula com os dados iniciais
      if (compras.length === 0) {
        const seed = [...COMPRAS_JULHO, ...SEED_COMPRAS];
        compras = await Promise.all(seed.map((c) => insertCompra(c)));
      }
      if (estoque.length === 0) {
        estoque = await Promise.all(SEED_ESTOQUE.map((e) => insertEstoque(e)));
      }

      const mes = currentMes();
      let meta = await fetchMeta(mes);
      if (!meta) {
        meta = { mes, valor: 800 };
        await upsertMeta(meta);
      }

      set({ compras, estoque, mercados, meta, loading: false, loaded: true });
    } catch (err) {
      set({
        loading: false,
        loadError: err instanceof Error ? err.message : 'Erro ao carregar dados do Supabase',
      });
    }
  },

  addCompra: async (compra) => {
    const novo = await insertCompra(compra);
    set((s) => ({ compras: [novo, ...s.compras] }));
  },

  updateCompra: async (id, data) => {
    await updateCompraRow(id, data);
    set((s) => ({
      compras: s.compras.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  deleteCompra: async (id) => {
    await deleteCompraRow(id);
    set((s) => ({ compras: s.compras.filter((c) => c.id !== id) }));
  },

  addEstoque: async (item) => {
    const novo = await insertEstoque(item);
    set((s) => ({ estoque: [novo, ...s.estoque] }));
  },

  updateEstoque: async (id, data) => {
    await updateEstoqueRow(id, data);
    set((s) => ({
      estoque: s.estoque.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
  },

  deleteEstoque: async (id) => {
    await deleteEstoqueRow(id);
    set((s) => ({ estoque: s.estoque.filter((e) => e.id !== id) }));
  },

  setMeta: async (valor) => {
    const novaMeta: Meta = { mes: currentMes(), valor };
    await upsertMeta(novaMeta);
    set({ meta: novaMeta });
  },

  addMercado: async (nome) => {
    const { mercados } = get();
    if (mercados.includes(nome)) return;
    await insertMercado(nome);
    set((s) => ({ mercados: [...s.mercados, nome] }));
  },

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
}));
