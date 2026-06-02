import React, { createContext, useContext, useState, useCallback } from 'react';

const ReportFilterContext = createContext();

const DEFAULT_FILTERS = {
  dateRange: { start: '2026-05-03', end: '2026-06-02' },
  timeFilter: 'all',
  employeeFilter: 'all',
};

export const ReportFilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const setDateRange = useCallback((start, end) => {
    setFilters(prev => ({ ...prev, dateRange: { start, end } }));
  }, []);

  const setTimeFilter = useCallback((time) => {
    setFilters(prev => ({ ...prev, timeFilter: time }));
  }, []);

  const setEmployeeFilter = useCallback((employee) => {
    setFilters(prev => ({ ...prev, employeeFilter: employee }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <ReportFilterContext.Provider value={{
      ...filters,
      setDateRange,
      setTimeFilter,
      setEmployeeFilter,
      resetFilters,
    }}>
      {children}
    </ReportFilterContext.Provider>
  );
};

export const useReportFilters = () => {
  const context = useContext(ReportFilterContext);
  if (!context) throw new Error('useReportFilters must be used within ReportFilterProvider');
  return context;
};
