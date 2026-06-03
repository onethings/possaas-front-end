import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isInRange(day, start, end) {
  if (!start || !end) return false;
  const t = day.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

const DateRangeFilter = ({ dateRange, onDateRangeChange }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState('calendar'); // 'calendar' | 'presets'
  const [startDate, setStartDate] = useState(dateRange.start);
  const [endDate, setEndDate] = useState(dateRange.end);
  const [selecting, setSelecting] = useState('start'); // 'start' | 'end'
  const [viewYear, setViewYear] = useState(() => parseDate(dateRange.start || dateRange.end || formatDate(new Date())).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parseDate(dateRange.start || dateRange.end || formatDate(new Date())).getMonth());

  const ref = useRef(null);

  // i18n-aware weekday constants
  const WEEKDAYS = useMemo(() => [
    t('datefilter.weekday_sun', 'Sun'),
    t('datefilter.weekday_mon', 'Mon'),
    t('datefilter.weekday_tue', 'Tue'),
    t('datefilter.weekday_wed', 'Wed'),
    t('datefilter.weekday_thu', 'Thu'),
    t('datefilter.weekday_fri', 'Fri'),
    t('datefilter.weekday_sat', 'Sat'),
  ], [t]);

  // i18n-aware quick presets
  const quickPresets = useMemo(() => [
    { key: 'today', label: t('datefilter.today', 'Today'), getValue: () => {
      const now = new Date();
      return { start: formatDate(now), end: formatDate(now) };
    }},
    { key: 'yesterday', label: t('datefilter.yesterday', 'Yesterday'), getValue: () => {
      const d = new Date(); d.setDate(d.getDate() - 1);
      return { start: formatDate(d), end: formatDate(d) };
    }},
    { key: 'this_week', label: t('datefilter.this_week', 'This Week'), getValue: () => {
      const now = new Date();
      const start = new Date(now); start.setDate(now.getDate() - now.getDay());
      const end = new Date(now);
      return { start: formatDate(start), end: formatDate(end) };
    }},
    { key: 'last_week', label: t('datefilter.last_week', 'Last Week'), getValue: () => {
      const now = new Date();
      const end = new Date(now); end.setDate(now.getDate() - now.getDay() - 1);
      const start = new Date(end); start.setDate(end.getDate() - 6);
      return { start: formatDate(start), end: formatDate(end) };
    }},
    { key: 'this_month', label: t('datefilter.this_month', 'This Month'), getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now);
      return { start: formatDate(start), end: formatDate(end) };
    }},
    { key: 'last_month', label: t('datefilter.last_month', 'Last Month'), getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: formatDate(start), end: formatDate(end) };
    }},
    { key: 'past_7', label: t('datefilter.past_7_days', 'Past 7 Days'), getValue: () => {
      const now = new Date();
      const start = new Date(now); start.setDate(now.getDate() - 6);
      return { start: formatDate(start), end: formatDate(now) };
    }},
    { key: 'past_30', label: t('datefilter.past_30_days', 'Past 30 Days'), getValue: () => {
      const now = new Date();
      const start = new Date(now); start.setDate(now.getDate() - 29);
      return { start: formatDate(start), end: formatDate(now) };
    }},
  ], [t]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync external changes
  useEffect(() => {
    setStartDate(dateRange.start);
    setEndDate(dateRange.end);
  }, [dateRange.start, dateRange.end]);

  const handleDayClick = useCallback((day) => {
    const dayStr = formatDate(day);
    if (selecting === 'start') {
      setStartDate(dayStr);
      setSelecting('end');
      // If clicked day is after current end, reset end
      if (endDate && dayStr > endDate) {
        setEndDate(dayStr);
      }
    } else {
      // If clicked day is before start, swap
      if (dayStr < startDate) {
        setEndDate(startDate);
        setStartDate(dayStr);
      } else {
        setEndDate(dayStr);
      }
      setSelecting('start');
    }
  }, [selecting, startDate, endDate]);

  const handlePreset = useCallback((preset) => {
    const val = preset.getValue();
    setStartDate(val.start);
    setEndDate(val.end);
    setSelecting('start');
    onDateRangeChange(val);
    setOpen(false);
  }, [onDateRangeChange]);

  const handleApply = useCallback(() => {
    onDateRangeChange({ start: startDate, end: endDate });
    setOpen(false);
  }, [startDate, endDate, onDateRangeChange]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const today = new Date();
  const startParsed = startDate ? parseDate(startDate) : null;
  const endParsed = endDate ? parseDate(endDate) : null;

  const displayLabel = dateRange.start && dateRange.end
    ? `${dateRange.start} ~ ${dateRange.end}`
    : t('datefilter.select_date_range', 'Select Date Range');

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <div
        className="glass-panel"
        onClick={() => setOpen(!open)}
        style={{
          padding: '0.4rem 0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          fontSize: '0.8rem',
          color: 'var(--text-main)',
        }}
      >
        <Calendar size={14} color="var(--text-muted)" />
        <span>{displayLabel}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 1000,
            display: 'flex',
            background: 'var(--bg-surface)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            minWidth: '580px',
          }}
        >
          {/* Left: Calendar */}
          <div style={{ padding: '1rem', flex: 1 }}>
            {/* Month Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <button onClick={prevMonth} style={navBtnStyle}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {new Date(viewYear, viewMonth).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
              </span>
              <button onClick={nextMonth} style={navBtnStyle}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
              {WEEKDAYS.map((wd) => (
                <div key={wd} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', padding: '4px 0', fontWeight: 600 }}>
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(viewYear, viewMonth, day);
                const dateStr = formatDate(date);
                const isToday = isSameDay(date, today);
                const isStart = startDate === dateStr;
                const isEnd = endDate === dateStr;
                const inRange = isInRange(date, startParsed, endParsed);
                const isTarget = selecting === 'start' ? isStart : (isEnd || (!isStart && selecting === 'end' && dateStr > startDate));

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(date)}
                    style={{
                      textAlign: 'center',
                      padding: '6px 0',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-md)',
                      background: inRange ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      color: inRange ? 'var(--primary-light)' : 'var(--text-main)',
                      fontWeight: isStart || isEnd ? 700 : isToday ? 600 : 400,
                      border: isStart || isEnd ? '1px solid var(--primary)' : isToday ? '1px solid var(--glass-border)' : '1px solid transparent',
                      position: 'relative',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isStart && !isEnd) e.currentTarget.style.background = 'var(--hover-bg-strong)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isStart && !isEnd && !inRange) e.currentTarget.style.background = 'transparent';
                      if (inRange && !isStart && !isEnd) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Selection Hint */}
            <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {selecting === 'start' ? t('datefilter.select_start_date', 'Select start date') : t('datefilter.select_end_date', 'Select end date')}
            </div>

            {/* Apply Button */}
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleApply}
                style={{
                  padding: '0.4rem 1.2rem',
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Check size={14} />
                {t('datefilter.apply', 'Apply')}
              </button>
            </div>
          </div>

          {/* Right: Quick Presets */}
          <div style={{
            width: '140px',
            borderLeft: '1px solid var(--glass-border)',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>
              {t('datefilter.quick_select', 'Quick Select')}
            </div>
            {quickPresets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => handlePreset(preset)}
                style={{
                  padding: '0.45rem 0.5rem',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg-strong)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const navBtnStyle = {
  background: 'transparent',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '4px 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.2s',
};

export default DateRangeFilter;
