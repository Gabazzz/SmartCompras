import type { Categoria } from '../types';

/**
 * Remove acentos e normaliza texto pra comparação (ex: "Açúcar" -> "acucar")
 */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Palavras-chave (já normalizadas) mapeadas pra categoria.
 * Cobre os produtos mais comuns de mercado no Brasil.
 */
const KEYWORDS: Record<string, Categoria> = {
  // Alimentação (secos, mercearia)
  arroz: 'Alimentação', feijao: 'Alimentação', macarrao: 'Alimentação',
  espaguete: 'Alimentação', acucar: 'Alimentação', sal: 'Alimentação',
  oleo: 'Alimentação', azeite: 'Alimentação', farinha: 'Alimentação',
  cafe: 'Alimentação', achocolatado: 'Alimentação', chocolate: 'Alimentação',
  biscoito: 'Alimentação', bolacha: 'Alimentação', pao: 'Alimentação',
  molho: 'Alimentação', extrato: 'Alimentação', tempero: 'Alimentação',
  vinagre: 'Alimentação', maionese: 'Alimentação', ketchup: 'Alimentação',
  mostarda: 'Alimentação', cereal: 'Alimentação', aveia: 'Alimentação',
  granola: 'Alimentação', mel: 'Alimentação', geleia: 'Alimentação',
  fermento: 'Alimentação', gelatina: 'Alimentação', pudim: 'Alimentação',
  suco: 'Alimentação', refrigerante: 'Alimentação', agua: 'Alimentação',
  cha: 'Alimentação', enlatado: 'Alimentação', atum: 'Alimentação',
  sardinha: 'Alimentação', milho: 'Alimentação', ervilha: 'Alimentação',
  azeitona: 'Alimentação', pipoca: 'Alimentação', lentilha: 'Alimentação',
  quinoa: 'Alimentação', castanha: 'Alimentação', amendoim: 'Alimentação',

  // Hortifruti (frutas, legumes, verduras)
  banana: 'Hortifruti', maca: 'Hortifruti', laranja: 'Hortifruti',
  uva: 'Hortifruti', mamao: 'Hortifruti', abacaxi: 'Hortifruti',
  melancia: 'Hortifruti', melao: 'Hortifruti', morango: 'Hortifruti',
  limao: 'Hortifruti', tomate: 'Hortifruti', cebola: 'Hortifruti',
  alho: 'Hortifruti', batata: 'Hortifruti', cenoura: 'Hortifruti',
  alface: 'Hortifruti', couve: 'Hortifruti', repolho: 'Hortifruti',
  pepino: 'Hortifruti', abobrinha: 'Hortifruti', abobora: 'Hortifruti',
  chuchu: 'Hortifruti', pimentao: 'Hortifruti', brocolis: 'Hortifruti',
  beterraba: 'Hortifruti', mandioca: 'Hortifruti', 'batata doce': 'Hortifruti',
  vagem: 'Hortifruti', 'couve-flor': 'Hortifruti', rucula: 'Hortifruti',
  salsa: 'Hortifruti', cebolinha: 'Hortifruti', coentro: 'Hortifruti',
  abacate: 'Hortifruti', manga: 'Hortifruti', pera: 'Hortifruti',
  kiwi: 'Hortifruti', maracuja: 'Hortifruti',

  // Laticínios
  leite: 'Laticínios', queijo: 'Laticínios', manteiga: 'Laticínios',
  margarina: 'Laticínios', iogurte: 'Laticínios', requeijao: 'Laticínios',
  'creme de leite': 'Laticínios', nata: 'Laticínios', mussarela: 'Laticínios',
  ricota: 'Laticínios', coalhada: 'Laticínios', 'leite condensado': 'Laticínios',

  // Carnes
  carne: 'Carnes', frango: 'Carnes', peixe: 'Carnes', linguica: 'Carnes',
  bacon: 'Carnes', salsicha: 'Carnes', costela: 'Carnes', bisteca: 'Carnes',
  picanha: 'Carnes', alcatra: 'Carnes', file: 'Carnes', 'peito de frango': 'Carnes',
  presunto: 'Carnes', mortadela: 'Carnes', peru: 'Carnes', camarao: 'Carnes',
  tilapia: 'Carnes', salmao: 'Carnes', hamburguer: 'Carnes', costelinha: 'Carnes',

  // Limpeza
  detergente: 'Limpeza', sabao: 'Limpeza', amaciante: 'Limpeza',
  desinfetante: 'Limpeza', 'agua sanitaria': 'Limpeza', alvejante: 'Limpeza',
  esponja: 'Limpeza', vassoura: 'Limpeza', rodo: 'Limpeza', pano: 'Limpeza',
  'saco de lixo': 'Limpeza', limpador: 'Limpeza', multiuso: 'Limpeza',
  'lustra moveis': 'Limpeza', cera: 'Limpeza', inseticida: 'Limpeza',
  'papel toalha': 'Limpeza', 'papel alumínio': 'Limpeza', 'filme plastico': 'Limpeza',

  // Higiene
  'papel higienico': 'Higiene', sabonete: 'Higiene', shampoo: 'Higiene',
  condicionador: 'Higiene', 'creme dental': 'Higiene', 'pasta de dente': 'Higiene',
  'escova de dente': 'Higiene', 'fio dental': 'Higiene', absorvente: 'Higiene',
  fralda: 'Higiene', desodorante: 'Higiene', lamina: 'Higiene',
  algodao: 'Higiene', cotonete: 'Higiene', 'lenco umedecido': 'Higiene',
  hidratante: 'Higiene', 'protetor solar': 'Higiene', enxaguante: 'Higiene',

  // Farmácia
  dipirona: 'Farmácia', paracetamol: 'Farmácia', ibuprofeno: 'Farmácia',
  vitamina: 'Farmácia', remedio: 'Farmácia', antialergico: 'Farmácia',
  curativo: 'Farmácia', bandaid: 'Farmácia', soro: 'Farmácia',
  alcool: 'Farmácia', pomada: 'Farmácia', termometro: 'Farmácia',
  mascara: 'Farmácia', vermifugo: 'Farmácia',

  // Não Essencial
  'refrigerante zero': 'Não Essencial', salgadinho: 'Não Essencial',
  doce: 'Não Essencial', bala: 'Não Essencial', chiclete: 'Não Essencial',
  sorvete: 'Não Essencial', cerveja: 'Não Essencial', vinho: 'Não Essencial',
  chips: 'Não Essencial', energetico: 'Não Essencial', wafer: 'Não Essencial',
};

/**
 * Marcas comuns em atacados/atacarejos (Atacadão, Assaí, etc).
 * Útil quando a pessoa digita só a marca, sem o tipo de produto
 * (ex: "CCGL", "Camil", "Ypê").
 */
const MARCAS: Record<string, Categoria> = {
  // Alimentação (mercearia/secos/bebidas)
  camil: 'Alimentação', tioJoao: 'Alimentação', 'tio joao': 'Alimentação',
  qualita: 'Alimentação', yoki: 'Alimentação', renata: 'Alimentação',
  barilla: 'Alimentação', adria: 'Alimentação', galo: 'Alimentação',
  uniao: 'Alimentação', dolce: 'Alimentação', caravelas: 'Alimentação',
  nescafe: 'Alimentação', '3 coracoes': 'Alimentação', pilao: 'Alimentação',
  melitta: 'Alimentação', toddy: 'Alimentação', nescau: 'Alimentação',
  ovomaltine: 'Alimentação', heinz: 'Alimentação', quero: 'Alimentação',
  fugini: 'Alimentação', cepera: 'Alimentação', maguary: 'Alimentação',
  dafruta: 'Alimentação', delvalle: 'Alimentação', 'del valle': 'Alimentação',
  kapo: 'Alimentação', tang: 'Alimentação', cocacola: 'Alimentação',
  'coca cola': 'Alimentação', pepsi: 'Alimentação', guarana: 'Alimentação',
  antarctica: 'Alimentação', fanta: 'Alimentação', sprite: 'Alimentação',
  h2oh: 'Alimentação', schweppes: 'Alimentação', bauducco: 'Alimentação',
  marilan: 'Alimentação', aymore: 'Alimentação', piraque: 'Alimentação',
  vitarella: 'Alimentação', trakinas: 'Alimentação', 'club social': 'Alimentação',
  passatempo: 'Alimentação', nutella: 'Alimentação', 'dona benta': 'Alimentação',
  sinha: 'Alimentação', dellalu: 'Alimentação',
  liza: 'Alimentação', soya: 'Alimentação', gallo: 'Alimentação',
  knorr: 'Alimentação', maggi: 'Alimentação', arisco: 'Alimentação',
  sazon: 'Alimentação', kitano: 'Alimentação', ajinomoto: 'Alimentação',

  // Laticínios
  ccgl: 'Laticínios', piracanjuba: 'Laticínios', itambe: 'Laticínios',
  parmalat: 'Laticínios', batavo: 'Laticínios', elege: 'Laticínios',
  vigor: 'Laticínios', danone: 'Laticínios', tirolez: 'Laticínios',
  presidente: 'Laticínios', scala: 'Laticínios', 'verde campo': 'Laticínios',
  betania: 'Laticínios', lider: 'Laticínios', frimesa: 'Laticínios',
  paulista: 'Laticínios', ades: 'Laticínios', ninho: 'Laticínios',
  'poços de caldas': 'Laticínios', 'santa clara': 'Laticínios',
  doriana: 'Laticínios', qualy: 'Laticínios', becel: 'Laticínios',

  // Carnes
  sadia: 'Carnes', perdigao: 'Carnes', seara: 'Carnes', friboi: 'Carnes',
  swift: 'Carnes', aurora: 'Carnes', copacol: 'Carnes', pifpaf: 'Carnes',
  'pif paf': 'Carnes', 'big frango': 'Carnes', rezende: 'Carnes',
  minerva: 'Carnes',

  // Limpeza
  ype: 'Limpeza', omo: 'Limpeza', minuano: 'Limpeza', assolan: 'Limpeza',
  bombril: 'Limpeza', veja: 'Limpeza', 'pinho sol': 'Limpeza',
  ariel: 'Limpeza', comfort: 'Limpeza',
  downy: 'Limpeza', vanish: 'Limpeza', cif: 'Limpeza', qboa: 'Limpeza',
  'q boa': 'Limpeza', brilux: 'Limpeza', limpol: 'Limpeza',
  candida: 'Limpeza', globo: 'Limpeza', rinso: 'Limpeza', surf: 'Limpeza',
  brilhante: 'Limpeza',

  // Higiene
  colgate: 'Higiene', 'close up': 'Higiene', closeup: 'Higiene',
  sorriso: 'Higiene', dove: 'Higiene', rexona: 'Higiene', nivea: 'Higiene',
  johnson: 'Higiene', pantene: 'Higiene', seda: 'Higiene',
  'head shoulders': 'Higiene', palmolive: 'Higiene', protex: 'Higiene',
  lux: 'Higiene', gillette: 'Higiene', prestobarba: 'Higiene',
  'sempre livre': 'Higiene', intimus: 'Higiene', huggies: 'Higiene',
  pampers: 'Higiene', mamypoko: 'Higiene', 'turma da monica': 'Higiene',
  babysec: 'Higiene', 'baby sec': 'Higiene',
  monange: 'Higiene', natura: 'Higiene', oboticario: 'Higiene',

  // Farmácia
  ems: 'Farmácia', neosaldina: 'Farmácia', tylenol: 'Farmácia',
  vick: 'Farmácia', engov: 'Farmácia', buscopan: 'Farmácia',
  dorflex: 'Farmácia', berocca: 'Farmácia', centrum: 'Farmácia',
  addera: 'Farmácia', epocler: 'Farmácia',

  // Não Essencial
  trident: 'Não Essencial', halls: 'Não Essencial', kitkat: 'Não Essencial',
  'kit kat': 'Não Essencial', lacta: 'Não Essencial', garoto: 'Não Essencial',
  doritos: 'Não Essencial', ruffles: 'Não Essencial', 'elma chips': 'Não Essencial',
  cheetos: 'Não Essencial', skol: 'Não Essencial', brahma: 'Não Essencial',
  heineken: 'Não Essencial', corona: 'Não Essencial', kibon: 'Não Essencial',
  fini: 'Não Essencial', mentos: 'Não Essencial', 'tic tac': 'Não Essencial',
};

/**
 * Tenta detectar a categoria de um produto pelo nome digitado.
 * Considera tanto o tipo de produto (ex: "arroz") quanto marcas
 * conhecidas de atacadão (ex: "ccgl", "camil", "ypê").
 * Retorna null se não encontrar nenhuma correspondência confiável.
 */
export function detectarCategoria(nomeProduto: string): Categoria | null {
  const nome = normalizar(nomeProduto);
  if (nome.length < 3) return null;

  const TODAS: Record<string, Categoria> = { ...KEYWORDS, ...MARCAS };

  // 1) Match exato/substring: o nome digitado já contém uma palavra-chave completa
  //    Prioriza a palavra-chave mais longa (mais específica) em caso de múltiplos matches.
  let melhorMatch: { keyword: string; categoria: Categoria } | null = null;
  for (const [keyword, categoria] of Object.entries(TODAS)) {
    if (nome.includes(keyword)) {
      if (!melhorMatch || keyword.length > melhorMatch.keyword.length) {
        melhorMatch = { keyword, categoria };
      }
    }
  }
  if (melhorMatch) return melhorMatch.categoria;

  // 2) Match parcial: a pessoa ainda está digitando (ex: "arr" -> "arroz", "ccg" -> "ccgl")
  //    Só sugere se a palavra-chave começa exatamente com o que foi digitado.
  let melhorPrefixo: { keyword: string; categoria: Categoria } | null = null;
  for (const [keyword, categoria] of Object.entries(TODAS)) {
    if (keyword.startsWith(nome)) {
      if (!melhorPrefixo || keyword.length < melhorPrefixo.keyword.length) {
        melhorPrefixo = { keyword, categoria };
      }
    }
  }
  return melhorPrefixo?.categoria ?? null;
}
