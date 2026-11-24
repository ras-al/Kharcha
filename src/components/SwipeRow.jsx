import { PencilSimpleLine, Trash } from '@phosphor-icons/react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

const THRESHOLD = 88;

/**
 * Touch row: swipe left to delete, swipe right to edit. A plain tap also
 * opens the editor (which has a Delete button), so nothing depends on swiping.
 */
export default function SwipeRow({ children, onEdit, onDelete }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const editOpacity = useTransform(x, [0, THRESHOLD], [0, 1]);
  const deleteOpacity = useTransform(x, [-THRESHOLD, 0], [1, 0]);

  const onDragEnd = (_, info) => {
    if (info.offset.x < -THRESHOLD) {
      animate(x, -window.innerWidth, { duration: 0.18 }).then(onDelete);
    } else {
      if (info.offset.x > THRESHOLD) onEdit();
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-control">
      <motion.div style={{ opacity: editOpacity }} className="absolute inset-0 flex items-center pl-6 bg-accent text-accent-ink font-bold gap-2" aria-hidden="true">
        <PencilSimpleLine size={20} weight="bold" /> Edit
      </motion.div>
      <motion.div style={{ opacity: deleteOpacity }} className="absolute inset-0 flex items-center justify-end pr-6 bg-expense text-on-expense font-bold gap-2" aria-hidden="true">
        Delete <Trash size={20} weight="bold" />
      </motion.div>
      <motion.div
        style={{ x }}
        drag={reduce ? false : 'x'}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={onDragEnd}
        className="relative bg-surface touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
