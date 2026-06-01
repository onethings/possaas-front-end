import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { useReportFilters } from '../contexts/ReportFilterContext';

const FilterBar = ({ onFilter }) => {
  const { t } = useTranslation();
  const {
    dateRange, setDateRange,
    timeFilter, setTimeFilter,
    employeeFilter, setEmployeeFilter,
  } = useReportFilters();

  const timeOptions = [
    { value: 'all', label: t('report.all_day', '全天') },
    { value: 'morning', label: t('report.morning', '早上') },
    { value: 'afternoon', label: t('report.afternoon', '下午') },
    { value: 'evening', label: t('report.evening', '晚上') },
  ];

  const handleFilter = () => {
    if (onFilter) onFilter(dateRange);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      {/* Date Range */}
      <div className="glass-panel" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar size={14} color="var(--text-muted)" />
        <input
          id="filter-start-date"
          name="filter-start-date"
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange(e.target.value, dateRange.end)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', width: '110px' }}
        />
        <span style={{ color: 'var(--text-muted)' }}>–</span>
        <input
          id="filter-end-date"
          name="filter-end-date"
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange(dateRange.start, e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', width: '110px' }}
        />
      </div>

      {/* Time Filter */}
      <div className="glass-panel" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <select
          id="filter-time"
          name="filter-time"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
        >
          {timeOptions.map(o => (
            <option key={o.value} value={o.value} style={{ background: 'var(--select-bg)', color: 'var(--text-main)' }}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Employee Filter */}
      <div className="glass-panel" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <select
          id="filter-employee"
          name="filter-employee"
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
        >
          <option value="all" style={{ background: 'var(--select-bg)', color: 'var(--text-main)' }}>{t('report.all_employees', '所有員工')}</option>
        </select>
      </div>

      {/* Filter Button */}
      <button
        onClick={handleFilter}
        style={{
          padding: '0.4rem 0.8rem',
          background: 'var(--primary)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          color: 'white',
          fontSize: '0.8rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {t('common.filter', '篩選')}
      </button>
    </div>
  );
};

export default FilterBar;
