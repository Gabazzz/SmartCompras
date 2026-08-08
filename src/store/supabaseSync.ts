import { supabase } from '../lib/supabase';
import type { Compra, Estoque, Meta, Categoria, Unidade, ItemLista } from '../types';

// ---------- Compras ----------

type CompraRow = {
  id: string;
  produto: string;
  categoria: string;
  essencial: boolean;
  quantidade: number;
  unidade: string;
  valor_uni: number;
  valor_total: number;
  mercado: string;
  data: string;
  obs: string | null;
};

const rowToCompra = (r: CompraRow): Compra => ({
  id: r.id,
  produto: r.produto,
  categoria: r.categoria as Categoria,
  essencial: r.essencial,
  quantidade: r.quantidade,
  unidade: r.unidade as Unidade,
  valorUni: r.valor_uni,
  valorTotal: r.valor_total,
  mercado: r.mercado,
  data: r.data,
  obs: r.obs ?? undefined,
});

const compraToRow = (c: Omit<Compra, 'id'>) => ({
  produto: c.produto,
  categoria: c.categoria,
  essencial: c.essencial,
  quantidade: c.quantidade,
  unidade: c.unidade,
  valor_uni: c.valorUni,
  valor_total: c.valorTotal,
  mercado: c.mercado,
  data: c.data,
  obs: c.obs ?? null,
});

export async function fetchCompras(): Promise<Compra[]> {
  const { data, error } = await supabase
    .from('compras')
    .select('*')
    .order('data', { ascending: false });
  if (error) throw error;
  return (data as CompraRow[]).map(rowToCompra);
}

export async function insertCompra(compra: Omit<Compra, 'id'>): Promise<Compra> {
  const { data, error } = await supabase
    .from('compras')
    .insert(compraToRow(compra))
    .select()
    .single();
  if (error) throw error;
  return rowToCompra(data as CompraRow);
}

export async function updateCompraRow(id: string, patch: Partial<Compra>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.produto !== undefined) row.produto = patch.produto;
  if (patch.categoria !== undefined) row.categoria = patch.categoria;
  if (patch.essencial !== undefined) row.essencial = patch.essencial;
  if (patch.quantidade !== undefined) row.quantidade = patch.quantidade;
  if (patch.unidade !== undefined) row.unidade = patch.unidade;
  if (patch.valorUni !== undefined) row.valor_uni = patch.valorUni;
  if (patch.valorTotal !== undefined) row.valor_total = patch.valorTotal;
  if (patch.mercado !== undefined) row.mercado = patch.mercado;
  if (patch.data !== undefined) row.data = patch.data;
  if (patch.obs !== undefined) row.obs = patch.obs;
  const { error } = await supabase.from('compras').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteCompraRow(id: string): Promise<void> {
  const { error } = await supabase.from('compras').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Estoque ----------

type EstoqueRow = {
  id: string;
  produto: string;
  qtd_atual: number;
  qtd_minima: number;
  unidade: string;
  ultima_compra: string | null;
};

const rowToEstoque = (r: EstoqueRow): Estoque => ({
  id: r.id,
  produto: r.produto,
  qtdAtual: r.qtd_atual,
  qtdMinima: r.qtd_minima,
  unidade: r.unidade as Unidade,
  ultimaCompra: r.ultima_compra ?? undefined,
});

const estoqueToRow = (e: Omit<Estoque, 'id'>) => ({
  produto: e.produto,
  qtd_atual: e.qtdAtual,
  qtd_minima: e.qtdMinima,
  unidade: e.unidade,
  ultima_compra: e.ultimaCompra ?? null,
});

export async function fetchEstoque(): Promise<Estoque[]> {
  const { data, error } = await supabase.from('estoque').select('*');
  if (error) throw error;
  return (data as EstoqueRow[]).map(rowToEstoque);
}

export async function insertEstoque(item: Omit<Estoque, 'id'>): Promise<Estoque> {
  const { data, error } = await supabase
    .from('estoque')
    .insert(estoqueToRow(item))
    .select()
    .single();
  if (error) throw error;
  return rowToEstoque(data as EstoqueRow);
}

export async function updateEstoqueRow(id: string, patch: Partial<Estoque>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.produto !== undefined) row.produto = patch.produto;
  if (patch.qtdAtual !== undefined) row.qtd_atual = patch.qtdAtual;
  if (patch.qtdMinima !== undefined) row.qtd_minima = patch.qtdMinima;
  if (patch.unidade !== undefined) row.unidade = patch.unidade;
  if (patch.ultimaCompra !== undefined) row.ultima_compra = patch.ultimaCompra;
  const { error } = await supabase.from('estoque').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteEstoqueRow(id: string): Promise<void> {
  const { error } = await supabase.from('estoque').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Meta ----------

export async function fetchMeta(mes: string): Promise<Meta | null> {
  const { data, error } = await supabase
    .from('meta')
    .select('*')
    .eq('mes', mes)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { mes: data.mes, valor: data.valor };
}

export async function upsertMeta(meta: Meta): Promise<void> {
  const { error } = await supabase.from('meta').upsert(meta);
  if (error) throw error;
}

// ---------- Mercados ----------

export async function fetchMercados(): Promise<string[]> {
  const { data, error } = await supabase.from('mercados').select('nome');
  if (error) throw error;
  return (data as { nome: string }[]).map((m) => m.nome);
}

export async function insertMercado(nome: string): Promise<void> {
  const { error } = await supabase.from('mercados').insert({ nome });
  if (error) throw error;
}

// ---------- Lista de Compras ----------

type ItemListaRow = {
  id: string;
  produto: string;
  comprado: boolean;
};

const rowToItemLista = (r: ItemListaRow): ItemLista => ({
  id: r.id,
  produto: r.produto,
  comprado: r.comprado,
});

export async function fetchListaCompras(): Promise<ItemLista[]> {
  const { data, error } = await supabase
    .from('lista_compras')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as ItemListaRow[]).map(rowToItemLista);
}

export async function insertItemLista(produto: string): Promise<ItemLista> {
  const { data, error } = await supabase
    .from('lista_compras')
    .insert({ produto, comprado: false })
    .select()
    .single();
  if (error) throw error;
  return rowToItemLista(data as ItemListaRow);
}

export async function updateItemListaRow(id: string, patch: Partial<ItemLista>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.produto !== undefined) row.produto = patch.produto;
  if (patch.comprado !== undefined) row.comprado = patch.comprado;
  const { error } = await supabase.from('lista_compras').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteItemListaRow(id: string): Promise<void> {
  const { error } = await supabase.from('lista_compras').delete().eq('id', id);
  if (error) throw error;
}
