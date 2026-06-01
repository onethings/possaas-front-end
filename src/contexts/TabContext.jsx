import React, { createContext, useContext, useState, useCallback } from 'react';

const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  const addTab = useCallback((id, config) => {
    setTabs(prev => {
      const exists = prev.find(t => t.id === id);
      if (exists) {
        // Tab already open, just switch to it
        return prev;
      }
      return [...prev, { id, title: config.title, icon: config.icon, component: config.component, closable: config.closable !== false }];
    });
    setActiveTabId(id);
  }, []);

  const closeTab = useCallback((id) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const newTabs = prev.filter(t => t.id !== id);
      
      // If closing active tab, set active to the next one
      if (id === activeTabId && newTabs.length > 0) {
        const newIdx = Math.min(idx, newTabs.length - 1);
        setActiveTabId(newTabs[newIdx].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  const setActive = useCallback((id) => {
    setActiveTabId(id);
  }, []);

  return (
    <TabContext.Provider value={{ tabs, activeTabId, addTab, closeTab, setActiveTab: setActive }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) throw new Error('useTabs must be used within a TabProvider');
  return context;
};
