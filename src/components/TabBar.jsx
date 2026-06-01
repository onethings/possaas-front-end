import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTabs } from '../contexts/TabContext';

const TabBar = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabs();
  const scrollRef = useRef(null);

  // Auto-scroll to keep active tab visible
  useEffect(() => {
    if (scrollRef.current && activeTabId) {
      const activeEl = scrollRef.current.querySelector(`[data-tab-id="${activeTabId}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTabId]);

  if (tabs.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0.5rem 0.5rem 0',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        flexShrink: 0,
        minHeight: '40px',
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        const Icon = tab.icon;
        return (
          <div
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
              background: isActive ? 'var(--glass)' : 'transparent',
              border: '1px solid',
              borderColor: isActive ? 'var(--glass-border)' : 'transparent',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              position: 'relative',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            {Icon && <Icon size={14} />}
            <span>{tab.title}</span>
            {tab.closable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  opacity: 0.6,
                  transition: 'opacity 0.15s',
                  marginLeft: '4px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'transparent'; }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TabBar;
