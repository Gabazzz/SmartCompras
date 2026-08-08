import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from 'framer-motion';
import { Trash2, Pencil, AlertTriangle, X, Check } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  itemTitle?: string;
}

export default function SwipeableListItem({
  children,
  onDelete,
  onEdit,
  itemTitle = 'este item',
}: Props) {
  const x = useMotionValue(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Transform values for action background indicators
  const deleteOpacity = useTransform(x, [-80, -20, 0], [1, 0.5, 0]);
  const editOpacity = useTransform(x, [0, 20, 80], [0, 0.5, 1]);

  const resetPosition = () => {
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -50 && onDelete) {
      setShowDeleteConfirm(true);
      resetPosition();
    } else if (info.offset.x > 50 && onEdit) {
      resetPosition();
      onEdit();
    } else {
      resetPosition();
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    resetPosition();
    onDelete?.();
  };

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-2xl">
        {/* Background Action Indicators */}
        <div className="absolute inset-0 flex items-center justify-between px-4 rounded-2xl pointer-events-none bg-white/[0.02]">
          {/* Swipe Right -> EDIT (Left side background) */}
          <motion.div
            style={{ opacity: editOpacity }}
            className="flex items-center gap-2 text-[#00F5FF] font-label text-xs font-semibold"
          >
            <div className="w-9 h-9 rounded-full bg-[#00F5FF]/20 flex items-center justify-center border border-[#00F5FF]/40">
              <Pencil className="w-4 h-4 text-[#00F5FF]" />
            </div>
            <span>Editar</span>
          </motion.div>

          {/* Swipe Left -> DELETE (Right side background) */}
          <motion.div
            style={{ opacity: deleteOpacity }}
            className="flex items-center gap-2 text-[#FF3131] font-label text-xs font-semibold ml-auto"
          >
            <span>Excluir</span>
            <div className="w-9 h-9 rounded-full bg-[#FF3131]/20 flex items-center justify-center border border-[#FF3131]/40">
              <Trash2 className="w-4 h-4 text-[#FF3131]" />
            </div>
          </motion.div>
        </div>

        {/* Foreground Content */}
        <motion.div
          style={{ x }}
          drag={onDelete || onEdit ? 'x' : false}
          dragConstraints={{ left: onDelete ? -80 : 0, right: onEdit ? 80 : 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className="relative z-10 touch-pan-y"
        >
          {children}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/75 z-[90] backdrop-blur-sm flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowDeleteConfirm(false);
              resetPosition();
            }}
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4 border border-[#FF3131]/30 shadow-[0_0_30px_rgba(255,49,49,0.2)]"
              style={{ background: '#0D0F14' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF3131]/20 flex items-center justify-center shrink-0 border border-[#FF3131]/30">
                  <AlertTriangle className="w-5 h-5 text-[#FF3131]" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Confirmar Exclusão</h3>
              </div>

              <p className="text-xs text-white/60 font-body leading-relaxed">
                Tem certeza que deseja apagar <strong className="text-white font-semibold">{itemTitle}</strong>? Esta ação não pode ser desfeita.
              </p>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    resetPosition();
                  }}
                  className="flex-1 py-3.5 rounded-xl font-label text-xs font-semibold text-white/60 hover:text-white border border-white/10 bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>

                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3.5 rounded-xl font-display font-bold text-xs text-white bg-[#FF3131] shadow-[0_0_15px_rgba(255,49,49,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Sim, Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
