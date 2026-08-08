import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Delete, ArrowRight, Store, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIA_EMOJI, type Categoria, type Unidade } from '../types';

const CATEGORIAS: Categoria[] = [
  'Alimentação', 'Hortifruti', 'Laticínios', 'Carnes',
  'Limpeza', 'Higiene', 'Farmácia', 'Não Essencial', 'Outros',
];
const UNIDADES: Unidade[] = ['un', 'kg', 'g', 'L', 'mL', 'cx', 'pct'];

export default function NewPurchasePage() {
  const navigate = useNavigate();
  const { addCompra, compras, mercados } = useAppStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [produto, setProduto] = useState('');
  const [mercado, setMercado] = useState('');
  const [categoria, setCategoria] = useState<Categoria | ''>('');
  const [essencial, setEssencial] = useState(true);
  const [valorStr, setValorStr] = useState('0');
  const [qtd, setQtd] = useState('1');
  const [unidade, setUnidade] = useState<Unidade>('un');

  const prodInputRef = useRef<HTMLInputElement>(null);

  const prodSugs = Array.from(
    new Set(compras.filter((c) => c.produto.toLowerCase().includes(produto.toLowerCase())).map((c) => c.produto))
  ).slice(0, 3);
  const mercSugs = Array.from(
    new Set(mercados.filter((m) => m.toLowerCase().includes(mercado.toLowerCase())))
  ).slice(0, 3);

  useEffect(() => {
    if (step === 1) setTimeout(() => prodInputRef.current?.focus(), 100);
  }, [step]);

  const selectProd = (p: string) => {
    setProduto(p);
    const last = compras.find((c) => c.produto === p);
    if (last) {
      setCategoria(last.categoria);
      setEssencial(last.essencial);
      setUnidade(last.unidade);
      setMercado(last.mercado);
    }
  };

  const handleNumpad = (val: string) => {
    if (val === 'back') {
      setValorStr((s) => (s.length > 1 ? s.slice(0, -1) : '0'));
    } else if (val === ',') {
      return;
    } else {
      setValorStr((s) => (s === '0' ? val : s + val));
    }
  };

  const valFinal = parseInt(valorStr, 10) / 100;
  const displayValor = valFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const valUnitario = (valFinal / (parseFloat(qtd) || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const canContinue = !!produto && !!categoria && !!mercado;

  const handleSave = () => {
    if (!produto || !categoria || !mercado) {
      toast.error('Preencha os campos obrigatórios', {
        style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
      });
      return;
    }
    if (valFinal <= 0) {
      toast.error('O valor deve ser maior que zero', {
        style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
      });
      return;
    }
    addCompra({
      produto, categoria, essencial, mercado,
      quantidade: parseFloat(qtd) || 1,
      unidade,
      valorUni: valFinal / (parseFloat(qtd) || 1),
      valorTotal: valFinal,
      data: new Date().toISOString(),
    });
    toast.success('Compra registrada!', {
      style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
    });
    navigate(-1);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      {/* Wizard Header */}
      <header className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => (step === 2 ? setStep(1) : navigate(-1))}
          className="w-10 h-10 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="w-2.5 h-2.5 rounded-full transition-all" style={{
              background: step === s ? '#39FF14' : 'rgba(255,255,255,0.2)',
              boxShadow: step === s ? '0 0 8px #39FF14' : 'none',
            }} />
          ))}
        </div>
        <div className="w-10" />
      </header>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            /* ─── STEP 1 ─── */
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 overflow-y-auto flex flex-col px-5 pt-6 gap-5 pb-6"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Nome do Produto */}
              <div className="flex flex-col gap-1">
                <input
                  ref={prodInputRef}
                  className="w-full bg-transparent outline-none font-display text-3xl font-bold text-white placeholder:text-white/25 pb-3"
                  style={{ borderBottom: '1.5px solid rgba(255,255,255,0.15)' }}
                  placeholder="Nome do Produto"
                  value={produto}
                  onChange={(e) => setProduto(e.target.value)}
                  autoComplete="off"
                />
                {produto && prodSugs.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {prodSugs.map((s) => (
                      <button key={s} onClick={() => selectProd(s)}
                        className="px-3 py-1 rounded-full text-xs text-white/50 hover:text-white transition-colors font-label"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mercado */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-label">Mercado</label>
                <div className="relative w-full h-12 flex items-center rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Store className="w-4 h-4 text-white/30 ml-3.5 shrink-0" />
                  <input
                    className="w-full bg-transparent border-none outline-none text-white font-body text-sm pl-2.5 pr-4 h-full placeholder:text-white/25"
                    placeholder="Ex: Carrefour, Atacadão..."
                    value={mercado}
                    onChange={(e) => setMercado(e.target.value)}
                  />
                </div>
                {mercado && mercSugs.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {mercSugs.map((s) => (
                      <button key={s} onClick={() => setMercado(s)}
                        className="px-3 py-1 rounded-full text-xs text-white/50 hover:text-white transition-colors font-label"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Categoria */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-label">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map((cat) => {
                    const active = categoria === cat;
                    return (
                      <button key={cat} type="button" onClick={() => setCategoria(cat)}
                        className="flex items-center gap-1.5 px-3.5 h-9 rounded-full font-label text-xs transition-all"
                        style={active ? { border: '1px solid rgba(57,255,20,0.5)', background: 'rgba(57,255,20,0.1)', color: '#39FF14' }
                          : { border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)' }}>
                        <span>{CATEGORIA_EMOJI[cat]}</span>
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggle Essencial */}
              <div className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="font-display font-semibold text-sm text-white">Item Essencial?</p>
                  <p className="text-[10px] text-white/40 font-label mt-0.5">Avisar se faltar no estoque</p>
                </div>
                <button type="button" onClick={() => setEssencial((p) => !p)}
                  className="relative rounded-full transition-all duration-300"
                  style={{
                    width: 52, height: 28,
                    background: essencial ? 'rgba(57,255,20,0.2)' : 'rgba(255,255,255,0.08)',
                    border: essencial ? '1px solid rgba(57,255,20,0.6)' : '1px solid rgba(255,255,255,0.15)',
                    boxShadow: essencial ? '0 0 12px rgba(57,255,20,0.3)' : 'none',
                  }}>
                  <div className="absolute top-[3px] w-[22px] h-[22px] rounded-full transition-transform duration-300"
                    style={{
                      background: essencial ? '#39FF14' : 'rgba(255,255,255,0.4)',
                      transform: essencial ? 'translateX(27px)' : 'translateX(3px)',
                      boxShadow: essencial ? '0 0 8px #39FF14' : 'none',
                    }} />
                </button>
              </div>

              {/* Continuar Button */}
              <button
                onClick={() => setStep(2)}
                disabled={!canContinue}
                className="w-full h-14 rounded-2xl font-display font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
                style={canContinue
                  ? { background: '#39FF14', color: '#000', boxShadow: '0 0 24px rgba(57,255,20,0.4)' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Continuar <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            /* ─── STEP 2 ─── */
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Context Bar */}
              <div className="px-5 pt-4 pb-2 shrink-0">
                <div className="flex justify-between items-center p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div>
                    <span className="text-[9px] text-white/30 font-label uppercase">Produto</span>
                    <p className="font-display font-semibold text-sm text-white truncate max-w-[200px]">{produto}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-[#00F5FF] text-xs flex items-center gap-1 font-label hover:underline">
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                </div>
              </div>

              {/* Value Display */}
              <div className="flex-1 flex flex-col items-center justify-center px-5 relative">
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(57,255,20,0.07) 0%, transparent 70%)' }} />
                <p className="text-xs text-white/40 font-label uppercase tracking-widest mb-3">Valor Total</p>
                <span className="font-display font-black text-5xl text-center tracking-tighter"
                  style={{ color: '#39FF14', textShadow: '0 0 30px rgba(57,255,20,0.4)' }}>
                  {displayValor}
                </span>
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex flex-col items-center px-4 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-[9px] text-white/30 font-label uppercase">Valor Un.</span>
                    <span className="font-display font-semibold text-sm text-white mt-0.5">{valUnitario}</span>
                  </div>
                  <X className="w-4 h-4 text-white/20" />
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-white/30 font-label uppercase">Qtd.</span>
                      <input className="bg-transparent font-display font-semibold text-sm text-white w-10 text-center outline-none mt-0.5"
                        value={qtd} onChange={(e) => setQtd(e.target.value)} inputMode="decimal" />
                    </div>
                    <select value={unidade} onChange={(e) => setUnidade(e.target.value as Unidade)}
                      className="bg-transparent text-xs text-[#00F5FF] font-label outline-none">
                      {UNIDADES.map((u) => (
                        <option key={u} value={u} style={{ background: '#131318' }}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Keypad + Confirm */}
              <div className="shrink-0 px-4 pt-4 pb-6"
                style={{ background: 'rgba(13,15,20,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0'].map((n) => (
                    <button key={n} onClick={() => handleNumpad(n)}
                      className="h-14 rounded-2xl font-display text-xl font-semibold text-white transition-all active:scale-95"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => handleNumpad('back')}
                    className="h-14 rounded-2xl text-white transition-all active:scale-95 flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Delete className="w-5 h-5 text-white/50" />
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={valFinal <= 0}
                  className="w-full h-14 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 uppercase tracking-wide transition-all active:scale-[0.98]"
                  style={{
                    background: valFinal > 0 ? '#39FF14' : 'rgba(255,255,255,0.06)',
                    color: valFinal > 0 ? '#000' : 'rgba(255,255,255,0.25)',
                    boxShadow: valFinal > 0 ? '0 0 24px rgba(57,255,20,0.4)' : 'none',
                  }}>
                  <Check className="w-5 h-5" /> Confirmar Registro
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
