import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const TOUR_STORAGE_KEY = 'kevinpos_guided_tour';

/**
 * GuidedTour — Interactive onboarding walkthrough.
 *
 * Usage:
 *   <GuidedTour
 *     tourId="login"          // unique key for this tour (saved to localStorage)
 *     steps={[                // array of step objects
 *       { target: 'username', title: '...', content: '...', placement: 'bottom' },
 *       ...
 *     ]}
 *     onComplete={() => {}}   // optional callback when tour finishes
 *   />
 *
 * Each step.target should match a `data-tour-id` attribute on the target element.
 */
const GuidedTour = ({ tourId, steps = [], onComplete }) => {
    const [currentStep, setCurrentStep] = useState(-1); // -1 = not started
    const [targetRect, setTargetRect] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [arrowStyle, setArrowStyle] = useState({});
    const tourKey = `${TOUR_STORAGE_KEY}_${tourId}`;

    // Check if tour was already completed
    useEffect(() => {
        const completed = localStorage.getItem(tourKey);
        if (!completed && steps.length > 0) {
            // Small delay to let DOM render
            const timer = setTimeout(() => setCurrentStep(0), 600);
            return () => clearTimeout(timer);
        }
    }, [tourKey, steps.length]);

    const finishTour = useCallback(() => {
        localStorage.setItem(tourKey, 'true');
        setCurrentStep(-1);
        onComplete?.();
    }, [tourKey, onComplete]);

    const goNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
        } else {
            finishTour();
        }
    }, [currentStep, steps.length, finishTour]);

    const goPrev = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((s) => s - 1);
        }
    }, [currentStep]);

    // Calculate tooltip position when step changes
    const lastRectRef = useRef(null);
    useEffect(() => {
        if (currentStep < 0 || currentStep >= steps.length) return;

        const updatePosition = () => {
            const step = steps[currentStep];
            const el = document.querySelector(`[data-tour-id="${step.target}"]`);
            if (!el) return;

            const rect = el.getBoundingClientRect();
            // Store for highlight
            lastRectRef.current = rect;
            setTargetRect(rect);

            const placement = step.placement || 'bottom';
            const tooltipW = 320;
            const tooltipH = 160;
            const gap = 14;
            const padding = 16;

            let top = 0;
            let left = 0;
            let arrow = {};

            switch (placement) {
                case 'bottom':
                    top = rect.bottom + gap;
                    left = Math.min(
                        Math.max(rect.left + rect.width / 2 - tooltipW / 2, padding),
                        window.innerWidth - tooltipW - padding
                    );
                    arrow = {
                        top: -6,
                        left: rect.left + rect.width / 2 - left - 6,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderBottom: '6px solid var(--bg-surface)',
                    };
                    break;
                case 'top':
                    top = rect.top - tooltipH - gap;
                    left = Math.min(
                        Math.max(rect.left + rect.width / 2 - tooltipW / 2, padding),
                        window.innerWidth - tooltipW - padding
                    );
                    arrow = {
                        bottom: -6,
                        left: rect.left + rect.width / 2 - left - 6,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid var(--bg-surface)',
                    };
                    break;
                case 'right':
                    top = rect.top + rect.height / 2 - tooltipH / 2;
                    left = rect.right + gap;
                    arrow = {
                        left: -6,
                        top: rect.top + rect.height / 2 - top - 6,
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderRight: '6px solid var(--bg-surface)',
                    };
                    break;
                case 'left':
                    top = rect.top + rect.height / 2 - tooltipH / 2;
                    left = rect.left - tooltipW - gap;
                    arrow = {
                        right: -6,
                        top: rect.top + rect.height / 2 - top - 6,
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderLeft: '6px solid var(--bg-surface)',
                    };
                    break;
                default:
                    break;
            }

            // Clamp top
            if (top < padding) top = padding;
            if (top + tooltipH > window.innerHeight - padding) {
                top = window.innerHeight - tooltipH - padding;
            }

            setTooltipPosition({ top, left });
            setArrowStyle(arrow);
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [currentStep, steps]);

    // ESC key to dismiss
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') finishTour();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        if (currentStep >= 0) {
            window.addEventListener('keydown', handleKey);
            return () => window.removeEventListener('keydown', handleKey);
        }
    }, [currentStep, finishTour, goNext, goPrev]);

    if (currentStep < 0) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                    pointerEvents: 'auto',
                }}
            >
                {/* Dim overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(1px)',
                    }}
                    onClick={finishTour}
                />

                {/* Highlight cutout */}
                {targetRect && (
                    <div
                        style={{
                            position: 'absolute',
                            top: targetRect.top - 6,
                            left: targetRect.left - 6,
                            width: targetRect.width + 12,
                            height: targetRect.height + 12,
                            borderRadius: 10,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                            zIndex: 1,
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* Highlight border ring */}
                {targetRect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'absolute',
                            top: targetRect.top - 6,
                            left: targetRect.left - 6,
                            width: targetRect.width + 12,
                            height: targetRect.height + 12,
                            borderRadius: 10,
                            border: '2.5px solid var(--primary)',
                            zIndex: 2,
                            pointerEvents: 'none',
                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                        }}
                    />
                )}

                {/* Tooltip card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.25 }}
                    style={{
                        position: 'absolute',
                        top: tooltipPosition.top,
                        left: tooltipPosition.left,
                        width: 320,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 14,
                        padding: '1.25rem',
                        zIndex: 3,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
                    }}
                >
                    {/* Arrow */}
                    <div
                        style={{
                            position: 'absolute',
                            width: 0,
                            height: 0,
                            ...arrowStyle,
                        }}
                    />

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {currentStep + 1} / {steps.length}
                        </span>
                        <button
                            onClick={finishTour}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {step.title}
                    </h3>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                        {step.content}
                    </p>

                    {/* Progress dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: i === currentStep ? 'var(--primary)' : 'var(--glass-border)',
                                    transition: 'background 0.3s',
                                }}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            onClick={finishTour}
                            style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', fontSize: '0.8rem', padding: '0.3rem 0',
                            }}
                        >
                            Skip
                        </button>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {currentStep > 0 && (
                                <button
                                    onClick={goPrev}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                                        background: 'var(--hover-bg)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-main)', borderRadius: 8,
                                        padding: '0.45rem 0.85rem', cursor: 'pointer', fontSize: '0.82rem',
                                    }}
                                >
                                    <ChevronLeft size={14} /> Back
                                </button>
                            )}
                            <button
                                onClick={goNext}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    background: 'var(--primary)', border: 'none',
                                    color: '#fff', borderRadius: 8,
                                    padding: '0.45rem 1rem', cursor: 'pointer',
                                    fontSize: '0.82rem', fontWeight: 600,
                                }}
                            >
                                {isLast ? (
                                    <>Done <Check size={14} /></>
                                ) : (
                                    <>Next <ChevronRight size={14} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default GuidedTour;
