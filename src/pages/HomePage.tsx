import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, Pencil, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIA_EMOJI } from '../types';

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const duration = 1000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      ref.current = value * eased;
      setDisplayed(ref.current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>;
}

const staggerItem = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.05 } },
});

export default function HomePage() {
  const navigate = useNavigate();
  const { getComprasDoMes, getTotalMes, getPercMeta, getEssenciaisTotal, getNaoEssenciaisTotal, getInsight, meta, setMeta } = useAppStore();

  const [editingMeta, setEditingMeta] = useState(false);
  const [metaInput, setMetaInput] = useState(String(meta.valor));

  const compras = getComprasDoMes();
  const total = getTotalMes();
  const perc = getPercMeta();
  const essenciais = getEssenciaisTotal();
  const naoEssenciais = getNaoEssenciaisTotal();
  const ultimas = compras.slice(0, 5);
  const insight = getInsight();

  const mesAtual = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });
  
  // Progress class mapping
  const barClass = perc >= 100 ? 'red' : perc >= 80 ? 'yellow' : 'green';

  const saveMeta = () => {
    const v = parseFloat(metaInput.replace(',', '.'));
    if (!isNaN(v) && v > 0) setMeta(v);
    setEditingMeta(false);
  };

  return (
    <div className="scroll-area" style={{ height: '100%', paddingBottom: 100 }}>
      {/* Header Minimal */}
      <div style={{ padding: '48px 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="SmartCompras Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: 'var(--text-primary)' }}>SmartCompras</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{mesAtual}</div>
          </div>
        </div>
        <button className="btn-ghost" style={{ width: 44, height: 44, borderRadius: 22, padding: 0 }}>
          <Bell size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* HERO SECTION */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>Total gasto</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 44, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            <AnimatedNumber value={total} />
          </div>
          
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>Orçamento: {meta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              <span style={{ fontWeight: 600, color: `var(--neon-${barClass})` }}>{perc.toFixed(0)}%</span>
            </div>
            <div className="progress-track" style={{ height: 6 }}>
              <div className={`progress-fill ${barClass}`} style={{ width: `${Math.min(perc, 100)}%` }} />
            </div>
            
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Livre: {Math.max(0, meta.valor - total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              {editingMeta ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input 
                    className="input" 
                    style={{ padding: '4px 8px', fontSize: 13, width: 90, textAlign: 'right' }} 
                    value={metaInput} 
                    onChange={(e) => setMetaInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && saveMeta()} 
                    autoFocus 
                  />
                  <button onClick={saveMeta} style={{ background: 'none', border: 'none', color: 'var(--neon-green)', padding: 4, cursor: 'pointer' }}>
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setMetaInput(String(meta.valor)); setEditingMeta(true); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Editar <Pencil size={12} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* INSIGHT CARD (Mais Premium) */}
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } }} style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.15)' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: 8, borderRadius: 10 }}>✨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{insight}</div>
          </div>
        </motion.div>

        {/* STATS RÁPIDOS */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.15 } }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="dot green" /> Essenciais
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: 'var(--text-primary)' }}>
              {essenciais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className={`dot ${total > 0 && (naoEssenciais / total) * 100 > 25 ? 'red' : 'yellow'}`} /> Supérfluos
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: 'var(--text-primary)' }}>
              {naoEssenciais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </motion.div>

        {/* ÚLTIMAS COMPRAS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span className="section-label">Recentes</span>
            <button onClick={() => navigate('/lista')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              Ver todas <ChevronRight size={14} />
            </button>
          </div>

          {ultimas.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: 32 }}>🛒</span>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma compra este mês</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ultimas.map((compra, i) => (
                <motion.button key={compra.id} {...staggerItem(i)} className="list-item" onClick={() => navigate('/lista')}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginRight: 16 }}>
                    {CATEGORIA_EMOJI[compra.categoria]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{compra.produto}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{format(parseISO(compra.data), 'dd/MM', { locale: ptBR })}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                      {compra.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
