import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Delete, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIA_EMOJI, type Categoria, type Unidade } from '../types';

const CATEGORIAS: Categoria[] = ['Alimentação', 'Hortifruti', 'Laticínios', 'Carnes', 'Limpeza', 'Higiene', 'Farmácia', 'Não Essencial', 'Outros'];
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

  // Suggestions
  const prodSugs = Array.from(new Set(compras.filter(c => c.produto.toLowerCase().includes(produto.toLowerCase())).map(c => c.produto))).slice(0, 3);
  const mercSugs = Array.from(new Set(mercados.filter(m => m.toLowerCase().includes(mercado.toLowerCase())))).slice(0, 3);

  useEffect(() => {
    if (step === 1) setTimeout(() => prodInputRef.current?.focus(), 100);
  }, [step]);

  const selectProd = (p: string) => {
    setProduto(p);
    const last = compras.find(c => c.produto === p);
    if (last) { setCategoria(last.categoria); setEssencial(last.essencial); setUnidade(last.unidade); setMercado(last.mercado); }
  };

  const handleNumpad = (val: string) => {
    if (val === 'back') {
      setValorStr(s => s.length > 1 ? s.slice(0, -1) : '0');
    } else {
      setValorStr(s => s === '0' ? val : s + val);
    }
  };

  const displayValor = (parseInt(valorStr, 10) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSave = () => {
    if (!produto || !categoria || !mercado) {
      toast.error('Preencha os campos obrigatórios', { style: { background: 'var(--bg-surface)', color: 'var(--text-primary)' } });
      return;
    }
    const valFinal = parseInt(valorStr, 10) / 100;
    if (valFinal <= 0) {
      toast.error('O valor deve ser maior que zero', { style: { background: 'var(--bg-surface)', color: 'var(--text-primary)' } });
      return;
    }

    addCompra({
      produto, categoria, essencial, mercado,
      quantidade: parseFloat(qtd) || 1,
      unidade, valorUni: valFinal, valorTotal: valFinal * (parseFloat(qtd) || 1),
      data: new Date().toISOString()
    });

    toast.success('Salvo', { style: { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-card)' } });
    navigate(-1);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Header Premium */}
      <div style={{ padding: '48px 24px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="btn-ghost" style={{ padding: 8, width: 40, height: 40, borderRadius: 20 }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, color: 'var(--text-primary)' }}>
            Nova Compra
          </h1>
          <div style={{ fontSize: 12, color: 'var(--neon-green)', fontWeight: 500, letterSpacing: '0.04em' }}>PASSO {step} DE 2</div>
        </div>
      </div>

      <div className="scroll-area" style={{ flex: 1, padding: '0 24px' }}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
              
              <div>
                <input ref={prodInputRef} className="input" style={{ fontSize: 28, fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif", padding: '8px 0', borderBottomColor: produto ? 'var(--neon-green)' : 'var(--border-card)' }} placeholder="O que você comprou?" value={produto} onChange={e => setProduto(e.target.value)} />
                {produto && prodSugs.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {prodSugs.map(s => <button key={s} className="chip" onClick={() => selectProd(s)}>{s}</button>)}
                  </div>
                )}
              </div>

              <div>
                <span className="section-label" style={{ marginBottom: 12, display: 'block' }}>Mercado</span>
                <input className="input" style={{ fontSize: 18, padding: '8px 0' }} placeholder="Nome do mercado" value={mercado} onChange={e => setMercado(e.target.value)} />
                {mercado && mercSugs.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {mercSugs.map(s => <button key={s} className="chip" onClick={() => setMercado(s)}>{s}</button>)}
                  </div>
                )}
              </div>

              <div>
                <span className="section-label" style={{ marginBottom: 12, display: 'block' }}>Categoria</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIAS.map(cat => (
                    <button key={cat} className={`chip ${categoria === cat ? 'active' : ''}`} style={categoria === cat ? { background: 'var(--neon-green)', color: '#000', borderColor: 'var(--neon-green)' } : {}} onClick={() => setCategoria(cat)}>
                      {CATEGORIA_EMOJI[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="section-label" style={{ marginBottom: 12, display: 'block' }}>Tipo de Gasto</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="chip" style={{ flex: 1, justifyContent: 'center', ...(essencial ? { background: 'var(--neon-green)', color: '#000' } : {}) }} onClick={() => setEssencial(true)}>Essencial</button>
                  <button className="chip" style={{ flex: 1, justifyContent: 'center', ...(!essencial ? { background: 'var(--neon-red)', color: '#fff' } : {}) }} onClick={() => setEssencial(false)}>Supérfluo</button>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span className="section-label" style={{ marginBottom: 16 }}>Valor Unitário</span>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 56, fontWeight: 600, color: valorStr !== '0' ? 'var(--neon-green)' : 'var(--text-muted)', letterSpacing: '-0.04em' }}>
                  {displayValor}
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 40, width: '100%', maxWidth: 300 }}>
                  <div style={{ flex: 1 }}>
                    <span className="section-label" style={{ marginBottom: 8, display: 'block', textAlign: 'center' }}>Quantidade</span>
                    <input className="input" style={{ textAlign: 'center', fontSize: 24, padding: '8px 0', borderBottomColor: 'var(--border-card)' }} value={qtd} onChange={e => setQtd(e.target.value)} inputMode="decimal" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span className="section-label" style={{ marginBottom: 8, display: 'block', textAlign: 'center' }}>Unidade</span>
                    <select className="input" style={{ textAlign: 'center', fontSize: 20, padding: '8px 0', borderBottomColor: 'var(--border-card)' }} value={unidade} onChange={e => setUnidade(e.target.value as Unidade)}>
                      {UNIDADES.map(u => <option key={u} value={u} style={{ background: 'var(--bg-surface)' }}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Numpad Premium iOS style */}
              <div style={{ paddingBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 320, margin: '0 auto' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button key={n} onClick={() => handleNumpad(String(n))} className="btn-ghost" style={{ height: 64, fontSize: 24, borderRadius: 32, background: 'var(--bg-card)', border: 'none' }}>{n}</button>
                  ))}
                  <div />
                  <button onClick={() => handleNumpad('0')} className="btn-ghost" style={{ height: 64, fontSize: 24, borderRadius: 32, background: 'var(--bg-card)', border: 'none' }}>0</button>
                  <button onClick={() => handleNumpad('back')} className="btn-ghost" style={{ height: 64, borderRadius: 32, background: 'transparent', border: 'none' }}><Delete size={28} color="var(--text-secondary)" /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Button */}
      <div style={{ padding: '16px 24px 32px', background: 'var(--bg-base)' }}>
        {step === 1 ? (
          <button className="btn-primary" onClick={() => setStep(2)} disabled={!produto || !categoria || !mercado} style={{ opacity: (!produto || !categoria || !mercado) ? 0.5 : 1 }}>
            Avançar <ChevronRight size={20} />
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSave} disabled={valorStr === '0'} style={{ opacity: valorStr === '0' ? 0.5 : 1 }}>
            <Check size={20} /> Confirmar {displayValor}
          </button>
        )}
      </div>
    </div>
  );
}
