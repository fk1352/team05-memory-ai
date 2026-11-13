import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMemoryCount, formatPercent, formatUtcDate, sortMemoriesByLocale } from '../i18n';

const FALLBACK_MEMORIES = [
  { id: 1, category: 'Work', statement: 'Work schedule: M–F, 9am–5pm', memory_type: 'fact', confidence_score: 100, source_info: 'Google Calendar sync', verified_at_utc: '2026-11-10T09:00:00Z' },
  { id: 2, category: 'Work', statement: 'Preferred language: English, Croatian', memory_type: 'fact', confidence_score: 98, source_info: 'Email pattern', verified_at_utc: '2026-11-09T14:20:00Z' },
  { id: 3, category: 'Work', statement: 'Probably likes morning meetings', memory_type: 'inference', confidence_score: 82, source_info: 'Calendar pattern (8/10 before 10 AM)', verified_at_utc: '2026-11-11T08:30:00Z' },
  { id: 4, category: 'Favorites', statement: 'Omiljena hrana: Ćevapi i štrukli', memory_type: 'fact', confidence_score: 95, source_info: 'Chat conversation', verified_at_utc: '2026-11-08T18:00:00Z' },
  { id: 5, category: 'Routines', statement: 'Često uči kasno navečer uz kavu', memory_type: 'inference', confidence_score: 74, source_info: 'Activity logs', verified_at_utc: '2026-11-12T22:15:00Z' },
  { id: 6, category: 'Places', statement: 'Lives and studies in Zagreb, Croatia', memory_type: 'fact', confidence_score: 100, source_info: 'Profile setup', verified_at_utc: '2026-11-01T10:00:00Z' }
];

export default function VisualMapAndSearchPage({ initialTab = 'map' }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'en';

  const [memories, setMemories] = useState(FALLBACK_MEMORIES);
  const [screen, setScreen] = useState(initialTab === 'search' ? 'search' : 'map');
  // screens: 'map' | 'deepDive' | 'search' | 'results' | 'detail' | 'edit' | 'feedback'
  const [viewMode, setViewMode] = useState('map');
  const [selectedCategory, setSelectedCategory] = useState('Work');
  const [deepDiveTab, setDeepDiveTab] = useState('fact');
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [previousMemoryBackup, setPreviousMemoryBackup] = useState(null);

  // Search & Filter states (Screen 03, 04, 10)
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [confFilter, setConfFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  // Edit Form states (Screen 07)
  const [editCategory, setEditCategory] = useState('Work');
  const [editStatement, setEditStatement] = useState('');
  const [editType, setEditType] = useState('fact');
  const [editConfidence, setEditConfidence] = useState(82);

  // Conflict Modal state (Screen 09)
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictChoice, setConflictChoice] = useState('opt1');
  const [selectedFeedbackReason, setSelectedFeedbackReason] = useState('notTrue');

  useEffect(() => {
    setScreen(initialTab === 'search' ? 'search' : 'map');
  }, [initialTab]);

  useEffect(() => {
    fetch('http://localhost:5000/api/memories')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setMemories(data);
      })
      .catch(() => {
        // Fallback to local seed data if backend is not running yet
      });
  }, []);

  // Filtered memories for Search & Filter (Screens 03, 04, 10)
  const filteredMemories = sortMemoriesByLocale(
    memories.filter((m) => {
      const matchesQuery =
        !query.trim() ||
        m.statement.toLowerCase().includes(query.toLowerCase()) ||
        m.category.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === 'all' || m.memory_type === typeFilter;
      const matchesCat = catFilter === 'all' || m.category.toLowerCase() === catFilter.toLowerCase();
      const score = m.confidence_score ?? 100;
      const matchesConf =
        confFilter === 'all' ||
        (confFilter === 'high' && score >= 80) ||
        (confFilter === 'med' && score >= 50 && score < 80) ||
        (confFilter === 'low' && score < 50);
      return matchesQuery && matchesType && matchesCat && matchesConf;
    }),
    locale
  );

  const openDetail = (mem) => {
    setSelectedMemory(mem);
    setScreen('detail');
  };

  const openEdit = (mem) => {
    setSelectedMemory(mem);
    setEditCategory(mem.category);
    setEditStatement(mem.statement);
    setEditType(mem.memory_type);
    setEditConfidence(mem.confidence_score ?? 82);
    setScreen('edit');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = {
      ...selectedMemory,
      category: editCategory,
      statement: editStatement,
      memory_type: editType,
      confidence_score: Number(editConfidence),
      verified_at_utc: new Date().toISOString()
    };

    setMemories((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelectedMemory(updated);

    fetch(`http://localhost:5000/api/memories/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});

    setScreen('detail');
  };

  const handleFlagIncorrect = (mem) => {
    setPreviousMemoryBackup(mem);
    const flagged = { ...mem, confidence_score: 10, memory_type: 'inference' };
    setMemories((prev) => prev.map((m) => (m.id === mem.id ? flagged : m)));
    setSelectedMemory(flagged);
    setScreen('feedback');
  };

  const handleUndoFlag = () => {
    if (previousMemoryBackup) {
      setMemories((prev) => prev.map((m) => (m.id === previousMemoryBackup.id ? previousMemoryBackup : m)));
      setSelectedMemory(previousMemoryBackup);
    }
    setScreen('detail');
  };

  const handleResolveConflict = () => {
    if (conflictChoice === 'opt1') {
      setMemories((prev) => prev.filter((m) => !m.statement.toLowerCase().includes('morning meetings')));
    }
    setShowConflictModal(false);
  };

  const clearAllFilters = () => {
    setQuery('');
    setTypeFilter('all');
    setConfFilter('all');
    setCatFilter('all');
  };

  const categoryNodes = [
    { key: 'Work', x: '22%', y: '24%' },
    { key: 'Favorites', x: '78%', y: '24%' },
    { key: 'Routines', x: '20%', y: '76%' },
    { key: 'Places', x: '78%', y: '76%' }
  ];

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', padding: '16px' }}>
      {/* Top Sub-Navigation between Faris's Map & Search flows */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setScreen('map')}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: screen === 'map' || screen === 'deepDive' ? '#1e293b' : '#ffffff',
            color: screen === 'map' || screen === 'deepDive' ? '#ffffff' : '#1e293b',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {t('nav.map')}
        </button>
        <button
          type="button"
          onClick={() => setScreen('search')}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: screen === 'search' || screen === 'results' ? '#1e293b' : '#ffffff',
            color: screen === 'search' || screen === 'results' ? '#ffffff' : '#1e293b',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {t('nav.search')}
        </button>
        <button
          type="button"
          onClick={() => setShowConflictModal(true)}
          style={{
            marginLeft: 'auto',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #dc2626',
            background: '#fef2f2',
            color: '#991b1b',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ⚠ {t('map.triggerConflict')}
        </button>
      </div>

      {/* SCREEN 01: THE VISUAL MEMORY MAP */}
      {screen === 'map' && (
        <section aria-labelledby="map-heading" style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h1 id="map-heading" style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{t('map.title')}</h1>
              <p style={{ color: '#475569', fontSize: '0.9rem', margin: '4px 0 0' }}>{t('map.subtitle')}</p>
            </div>
            <div role="group" aria-label="View mode" style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                style={{ padding: '6px 10px', background: viewMode === 'map' ? '#2563eb' : '#fff', color: viewMode === 'map' ? '#fff' : '#1e293b', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                {t('map.viewMap')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{ padding: '6px 10px', background: viewMode === 'list' ? '#2563eb' : '#fff', color: viewMode === 'list' ? '#fff' : '#1e293b', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                {t('map.viewList')}
              </button>
            </div>
          </div>

          {/* Plural Counter Badge (Proves Croatian 1 / 2-4 / 5+ plural rules) */}
          <p style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: 600, color: '#1e40af', background: '#eff6ff', padding: '6px 12px', borderRadius: '999px', display: 'inline-block' }}>
            {formatMemoryCount(memories.length, locale)}
          </p>

          {viewMode === 'map' ? (
            <div style={{ position: 'relative', height: '320px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '12px', overflow: 'hidden' }}>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
                <line x1="50%" y1="50%" x2="22%" y2="24%" stroke="#94a3b8" strokeWidth="2" />
                <line x1="50%" y1="50%" x2="78%" y2="24%" stroke="#94a3b8" strokeWidth="2" />
                <line x1="50%" y1="50%" x2="20%" y2="76%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4" />
                <line x1="50%" y1="50%" x2="78%" y2="76%" stroke="#94a3b8" strokeWidth="2" />
              </svg>

              {/* Center YOU Node */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '88px', height: '88px', borderRadius: '50%', background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <span>{t('map.youNode')}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 400 }}>{memories.length}</span>
              </div>

              {/* Category Nodes */}
              {categoryNodes.map((node) => {
                const count = memories.filter((m) => m.category.toLowerCase() === node.key.toLowerCase()).length;
                return (
                  <button
                    key={node.key}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(node.key);
                      setScreen('deepDive');
                    }}
                    style={{
                      position: 'absolute',
                      top: node.y,
                      left: node.x,
                      transform: 'translate(-50%, -50%)',
                      minWidth: '92px',
                      minHeight: '92px',
                      padding: '8px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '2px solid #2563eb',
                      color: '#0f172a',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(37,99,235,0.15)'
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, textAlign: 'center' }}>{t(`categories.${node.key}`)}</span>
                    <span style={{ fontSize: '0.7rem', color: '#475569' }}>({count})</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {memories.map((m) => (
                <div key={m.id} onClick={() => openDetail(m)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', background: '#f8fafc' }}>
                  <strong>{m.statement}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>{m.category} • {formatPercent(m.confidence_score, locale)}</div>
                </div>
              ))}
            </div>
          )}
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#475569', marginTop: '12px' }}>{t('map.tapHint')}</p>
        </section>
      )}

      {/* SCREEN 02: CATEGORY DEEP-DIVE */}
      {screen === 'deepDive' && (
        <section style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <button type="button" onClick={() => setScreen('map')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', marginBottom: '8px' }}>
            ← {t('deepDive.backToMap')}
          </button>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem' }}>
            {t('deepDive.categoryTitle', { cat: t(`categories.${selectedCategory}`) })}
          </h2>

          {/* Segmented Control: Facts vs Inferences */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setDeepDiveTab('fact')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                background: deepDiveTab === 'fact' ? '#fff' : 'transparent',
                cursor: 'pointer'
              }}
            >
              {t('deepDive.factsTab', { count: memories.filter((m) => m.category === selectedCategory && m.memory_type === 'fact').length })}
            </button>
            <button
              type="button"
              onClick={() => setDeepDiveTab('inference')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                background: deepDiveTab === 'inference' ? '#fff' : 'transparent',
                cursor: 'pointer'
              }}
            >
              {t('deepDive.inferencesTab', { count: memories.filter((m) => m.category === selectedCategory && m.memory_type === 'inference').length })}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {memories
              .filter((m) => m.category === selectedCategory && m.memory_type === deepDiveTab)
              .map((m) => (
                <div
                  key={m.id}
                  onClick={() => openDetail(m)}
                  style={{ padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: m.memory_type === 'fact' ? '#dcfce7' : '#fef3c7', color: m.memory_type === 'fact' ? '#166534' : '#92400e' }}>
                      {m.memory_type === 'fact' ? t('detail.verifiedBadge') : t('detail.inferenceBadge')}
                    </span>
                    <p style={{ margin: '6px 0 4px', fontWeight: 600 }}>{m.statement}</p>
                    <small style={{ color: '#475569' }}>
                      {t('deepDive.sourceLabel', { src: m.source_info, date: formatUtcDate(m.verified_at_utc, locale) })}
                    </small>
                  </div>
                  <span aria-hidden="true">→</span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* SCREEN 03: SEARCH & FILTER INTERFACE */}
      {screen === 'search' && (
        <section style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{t('search.title')}</h2>
            <button type="button" onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}>
              {t('search.clearAll')}
            </button>
          </div>

          <label htmlFor="memory-search-input" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
            {t('nav.search')}
          </label>
          <input
            id="memory-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #94a3b8', marginBottom: '16px', boxSizing: 'border-box' }}
          />

          {/* Filter Chips: TYPE */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>{t('search.typeLabel')}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: t('search.all') },
                { id: 'fact', label: t('search.fact') },
                { id: 'inference', label: t('search.inference') }
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setTypeFilter(chip.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: '1px solid #1e293b',
                    background: typeFilter === chip.id ? '#1e293b' : '#fff',
                    color: typeFilter === chip.id ? '#fff' : '#1e293b',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Chips: CONFIDENCE SCORE */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>{t('search.confidenceLabel')}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: t('search.all') },
                { id: 'high', label: t('search.confHigh') },
                { id: 'med', label: t('search.confMed') },
                { id: 'low', label: t('search.confLow') }
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setConfFilter(chip.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: '1px solid #1e293b',
                    background: confFilter === chip.id ? '#1e293b' : '#fff',
                    color: confFilter === chip.id ? '#fff' : '#1e293b',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Chips: CATEGORY */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>{t('search.categoryLabel')}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'Work', 'Favorites', 'Routines', 'Places'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatFilter(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: '1px solid #1e293b',
                    background: catFilter === cat ? '#1e293b' : '#fff',
                    color: catFilter === cat ? '#fff' : '#1e293b',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  {cat === 'all' ? t('search.all') : t(`categories.${cat}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Fitts' Law Full-Width Bottom Action Button */}
          <button
            type="button"
            onClick={() => setScreen('results')}
            style={{ width: '100%', padding: '14px', background: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
          >
            {t('search.showResults', { count: filteredMemories.length })}
          </button>
        </section>
      )}

      {/* SCREEN 04 & SCREEN 10: SEARCH RESULTS + ZERO-RESULTS EMPTY STATE */}
      {screen === 'results' && (
        <section style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <button type="button" onClick={() => setScreen('search')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', marginBottom: '8px' }}>
            ← {t('search.title')}
          </button>
          <p style={{ fontWeight: 700, margin: '4px 0 12px' }}>{formatMemoryCount(filteredMemories.length, locale)}</p>

          {filteredMemories.length === 0 ? (
            /* SCREEN 10: SEARCH ERROR / ZERO RESULTS */
            <div style={{ textAlign: 'center', padding: '24px 12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }} aria-hidden="true">🔍</div>
              <h3 style={{ margin: '0 0 6px' }}>{t('search.zeroTitle')}</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0 0 12px' }}>{t('search.zeroDesc', { query: query || '...' })}</p>
              <p style={{ color: '#475569', fontSize: '0.82rem', marginBottom: '12px' }}>{t('search.zeroHint')}</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => { clearAllFilters(); setTypeFilter('inference'); }} style={{ padding: '6px 12px', borderRadius: '999px', border: '1px solid #64748b', background: '#fff', cursor: 'pointer' }}>
                  {t('search.chipRecent')}
                </button>
                <button type="button" onClick={() => { clearAllFilters(); setCatFilter('Work'); }} style={{ padding: '6px 12px', borderRadius: '999px', border: '1px solid #64748b', background: '#fff', cursor: 'pointer' }}>
                  {t('search.chipPopular')}
                </button>
              </div>
              <button
                type="button"
                onClick={clearAllFilters}
                style={{ width: '100%', padding: '14px', background: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                {t('search.clearAndShowAll')}
              </button>
            </div>
          ) : (
            /* SCREEN 04: SEARCH RESULTS LIST */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredMemories.map((m) => (
                <div key={m.id} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div onClick={() => openDetail(m)} style={{ cursor: 'pointer', flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
                      [{m.memory_type === 'fact' ? t('detail.verifiedBadge') : t('detail.inferenceBadge')}]
                    </span>
                    <p style={{ margin: '4px 0', fontWeight: 600 }}>{m.statement}</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.78rem', color: '#475569' }}>
                      <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '999px', fontWeight: 600, color: '#0f172a' }}>
                        {formatPercent(m.confidence_score, locale)} Conf
                      </span>
                      <span>{m.source_info}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={t('detail.editBtn')}
                    onClick={() => openEdit(m)}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                  >
                    ✎
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SCREEN 05 (VERIFIED FACT) & SCREEN 06 (AI INFERENCE) DETAIL VIEWS */}
      {screen === 'detail' && selectedMemory && (
        <section style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <button type="button" onClick={() => setScreen('map')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', marginBottom: '12px' }}>
            ← {t('detail.back')}
          </button>

          <div style={{ marginBottom: '12px' }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '999px', border: '2px solid #0f172a', fontWeight: 700, fontSize: '0.78rem' }}>
              {selectedMemory.memory_type === 'fact' ? t('detail.verifiedBadge') : t('detail.inferenceBadge')}
            </span>
          </div>

          {selectedMemory.memory_type === 'inference' && (
            <p style={{ color: '#475569', margin: '0 0 4px', fontSize: '0.9rem' }}>{t('detail.aiBelieves')}</p>
          )}
          <h2 style={{ margin: '0 0 12px', fontSize: '1.35rem' }}>"{selectedMemory.statement}"</h2>

          {/* Confidence Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              <span>{t('detail.confidence', { pct: formatPercent(selectedMemory.confidence_score, locale) })}</span>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${selectedMemory.confidence_score ?? 82}%`, height: '100%', background: '#0f172a' }} />
            </div>
          </div>

          {selectedMemory.memory_type === 'inference' ? (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.88rem' }}>
              <strong>{t('detail.basedOn')}</strong>
              <p style={{ margin: '6px 0 4px' }}>{t('detail.reason1')}</p>
              <p style={{ margin: 0 }}>{t('detail.reason2')}</p>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.88rem' }}>
              <p style={{ margin: '0 0 4px' }}><strong>Source:</strong> {selectedMemory.source_info}</p>
              <p style={{ margin: 0 }}>{t('detail.verifiedDate', { date: formatUtcDate(selectedMemory.verified_at_utc, locale) })}</p>
            </div>
          )}

          {/* Primary Action Button in Thumb Zone */}
          <button
            type="button"
            onClick={() => openEdit(selectedMemory)}
            style={{ width: '100%', padding: '14px', background: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', marginBottom: '10px' }}
          >
            {selectedMemory.memory_type === 'inference' ? t('detail.correctBtn') : t('detail.editBtn')}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => handleFlagIncorrect(selectedMemory)}
              style={{ background: 'none', border: 'none', color: '#b45309', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {t('detail.flagBtn')}
            </button>
          </div>
        </section>
      )}

      {/* SCREEN 07: EDIT MEMORY FORM */}
      {screen === 'edit' && (
        <section style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0 0 16px' }}>{t('edit.title')}</h2>
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="edit-cat" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>{t('edit.category')}</label>
              <select
                id="edit-cat"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #94a3b8' }}
              >
                <option value="Work">{t('categories.Work')}</option>
                <option value="Favorites">{t('categories.Favorites')}</option>
                <option value="Routines">{t('categories.Routines')}</option>
                <option value="Places">{t('categories.Places')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-stmt" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>{t('edit.statement')}</label>
              <textarea
                id="edit-stmt"
                rows={3}
                value={editStatement}
                onChange={(e) => setEditStatement(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #94a3b8', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <span style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>{t('edit.type')}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditType('fact')}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #0f172a', background: editType === 'fact' ? '#0f172a' : '#fff', color: editType === 'fact' ? '#fff' : '#0f172a', fontWeight: 600, cursor: 'pointer' }}
                >
                  {t('search.fact')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditType('inference')}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #0f172a', background: editType === 'inference' ? '#0f172a' : '#fff', color: editType === 'inference' ? '#fff' : '#0f172a', fontWeight: 600, cursor: 'pointer' }}
                >
                  {t('search.inference')}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="edit-conf" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                {t('edit.confidence', { pct: formatPercent(editConfidence, locale) })}
              </label>
              <input
                id="edit-conf"
                type="range"
                min="0"
                max="100"
                value={editConfidence}
                onChange={(e) => setEditConfidence(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setScreen('detail')}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #94a3b8', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
              >
                {t('edit.cancel')}
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {t('edit.save')}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* SCREEN 08: MARK AS INCORRECT / FEEDBACK */}
      {screen === 'feedback' && selectedMemory && (
        <section role="status" aria-live="polite" style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ background: '#dcfce7', color: '#14532d', padding: '14px', borderRadius: '12px', fontWeight: 700, marginBottom: '14px' }}>
            ✓ {t('feedback.banner')}
          </div>
          <p style={{ fontWeight: 600, marginBottom: '12px' }}>{t('feedback.youFlagged', { statement: selectedMemory.statement })}</p>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>{t('feedback.whyOptional')}</p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {['wrongCat', 'notTrue', 'tooPersonal', 'outdated'].map((rKey) => (
              <button
                key={rKey}
                type="button"
                onClick={() => setSelectedFeedbackReason(rKey)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: '1px solid #0f172a',
                  background: selectedFeedbackReason === rKey ? '#0f172a' : '#fff',
                  color: selectedFeedbackReason === rKey ? '#fff' : '#0f172a',
                  cursor: 'pointer'
                }}
              >
                {t(`feedback.reasons.${rKey}`)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleUndoFlag}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #0f172a', background: '#fff', fontWeight: 700, cursor: 'pointer', marginBottom: '8px' }}
          >
            ↶ {t('feedback.undo')}
          </button>
          <button
            type="button"
            onClick={() => openEdit(selectedMemory)}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700, cursor: 'pointer', marginBottom: '8px' }}
          >
            ✎ {t('feedback.editDetails')}
          </button>
          <button
            type="button"
            onClick={() => setScreen('map')}
            style={{ width: '100%', padding: '10px', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {t('feedback.backToMap')}
          </button>
        </section>
      )}

      {/* SCREEN 09: CONFLICT RESOLUTION MODAL */}
      {showConflictModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="conflict-title" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '420px', width: '100%', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}>
            <div id="conflict-title" style={{ background: '#0f172a', color: '#fff', padding: '14px 18px', fontWeight: 700 }}>
              ⚠ {t('conflict.banner')}
            </div>
            <div style={{ padding: '18px' }}>
              <p style={{ margin: '0 0 14px', fontSize: '0.92rem', color: '#334155' }}>{t('conflict.desc')}</p>

              <label style={{ display: 'block', padding: '12px', borderRadius: '10px', border: conflictChoice === 'opt1' ? '2px solid #0f172a' : '1px solid #cbd5e1', marginBottom: '10px', cursor: 'pointer' }}>
                <input type="radio" name="conflict" checked={conflictChoice === 'opt1'} onChange={() => setConflictChoice('opt1')} style={{ marginRight: '8px' }} />
                {t('conflict.opt1')}
              </label>

              <label style={{ display: 'block', padding: '12px', borderRadius: '10px', border: conflictChoice === 'opt2' ? '2px solid #0f172a' : '1px solid #cbd5e1', marginBottom: '16px', cursor: 'pointer' }}>
                <input type="radio" name="conflict" checked={conflictChoice === 'opt2'} onChange={() => setConflictChoice('opt2')} style={{ marginRight: '8px' }} />
                {t('conflict.opt2')}
              </label>

              <button
                type="button"
                onClick={handleResolveConflict}
                style={{ width: '100%', padding: '12px', borderRadius: '999px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', marginBottom: '8px' }}
              >
                {t('conflict.confirm')}
              </button>
              <button
                type="button"
                onClick={() => setShowConflictModal(false)}
                style={{ width: '100%', padding: '8px', background: 'none', border: 'none', textDecoration: 'underline', color: '#475569', cursor: 'pointer' }}
              >
                {t('conflict.later')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}