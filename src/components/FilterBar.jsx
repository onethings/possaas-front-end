import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useReportFilters } from '../contexts/ReportFilterContext';
import { getStaff } from '../api/staff';
import DateRangeFilter from './DateRangeFilter';

const FilterBar = ({ onFilter }) => {
  const { t } = useTranslation();
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const {
    dateRange, setDateRange,
    timeFilter, setTimeFilter,
    employeeFilter, setEmployeeFilter,
  } = useReportFilters();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const result = await getStaff();
      if (result.success) setStaffList(result.data || []);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const timeOptions = [
    { value: 'all', label: t('report.all_day', 'All Day') },
    { value: 'morning', label: t('report.morning', 'Morning (06:00-12:00)') },
    { value: 'afternoon', label: t('report.afternoon', 'Afternoon (12:00-18:00)') },
    { value: 'evening', label: t('report.evening', 'Evening (18:00-24:00)') },
  ];

  const handleFilter = () => {
    if (onFilter) onFilter(dateRange);
  };

  const handleDateChange = (newRange) => {
    setDateRange(newRange.start, newRange.end);
    if (onFilter) onFilter(newRange);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      {/* Date Range - 使用新的 DateRangeFilter 元件 */}
      <DateRangeFilter dateRange={dateRange} onDateRangeChange={handleDateChange} />

      {/* Time Filter */}
      <div className="glass-panel" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <select
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

      {/* Employee Filter - Connected to Staff List */}
      <div className="glass-panel" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <select
          name="filter-employee"
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer', minWidth: '80px' }}
        >
          <option value="all" style={{ background: 'var(--select-bg)', color: 'var(--text-main)' }}>
            {loadingStaff ? t('common.loading', 'Loading...') : t('report.all_employees', 'All Employees')}
          </option>
          {staffList.map(staff => (
            <option key={staff._id} value={staff._id} style={{ background: 'var(--select-bg)', color: 'var(--text-main)' }}>
              {staff.name || staff.username}
            </option>
          ))}
        </select>
        {loadingStaff && <Loader2 size={12} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
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
        {t('common.filter', 'Filter')}
      </button>
    </div>
  );
};

export default FilterBar;
