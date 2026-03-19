import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Copy, Reply, X } from 'lucide-react';
import styles from './MessageActions.module.css';

const MessageActions = ({ isOpen, onClose, anchor, onDelete, onCopy, isMobile }) => {
    if (!isOpen) return null;

    // Анимация для мобильного (выезд снизу)
    const mobileVariants = {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' }
    };

    // Анимация для ПК (появление у курсора)
    const desktopVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    };

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <motion.div
                    className={isMobile ? styles.bottomSheet : styles.desktopMenu}
                    style={!isMobile ? {
                        top: anchor.y,
                        // Вычитаем ширину меню (180) и добавляем небольшой отступ (5), 
                        // чтобы курсор не был вплотную к краю меню
                        left: anchor.x - 185
                    } : {}}
                    variants={isMobile ? mobileVariants : desktopVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isMobile && <div className={styles.handle} />}

                    <div className={styles.menuItem} onClick={onCopy}>
                        <Copy size={20} /> <span>Копировать</span>
                    </div>

                    <div className={`${styles.menuItem} ${styles.delete}`} onClick={onDelete}>
                        <Trash2 size={20} /> <span>Удалить для всех</span>
                    </div>

                    {isMobile && (
                        <div className={styles.cancelBtn} onClick={onClose}>
                            <X size={20} /> <span>Отмена</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MessageActions;