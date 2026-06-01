import React from 'react';
import { motion } from 'framer-motion';
import { useTabs } from '../contexts/TabContext';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

/**
 * TabContent renders all open tab components, but only the active one is visible.
 * Inactive tabs remain mounted (not unmounted) so their internal state is preserved.
 */
const TabContent = () => {
  const { tabs, activeTabId } = useTabs();

  if (tabs.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)',
        gap: '1rem',
      }}>
        <div style={{ fontSize: '3rem', opacity: 0.3 }}>📋</div>
        <p style={{ fontSize: '1rem' }}>從左側選單選擇功能以開始操作</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        const Component = tab.component;
        return (
          <div
            key={tab.id}
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'auto',
              visibility: isActive ? 'visible' : 'hidden',
              pointerEvents: isActive ? 'auto' : 'none',
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            {Component && <Component />}
          </div>
        );
      })}
    </div>
  );
};

export default TabContent;
