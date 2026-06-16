import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const styles = {
  body: {
    margin: 0,
    fontFamily: "'Segoe UI', Arial, sans-serif",
    background: '#0f172a',
    color: '#e2e8f0',
    minHeight: '100vh',
  },
  header: {
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { margin: 0, fontSize: 24, fontWeight: 700, color: '#38bdf8' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  container: { maxWidth: 900, margin: '0 auto', padding: '32px 16px' },
  card: {
    background: '#1e293b',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    border: '1px solid #334155',
  },
  inputRow: { display: 'flex', gap: 12 },
  input: {
    flex: 1,
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
  },
  btn: {
    background: '#38bdf8',
    color: '#0f172a',
    border: 'none',
    borderRadius: 8,
    padding: '10px 22px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  },
  btnDanger: {
    background: 'transparent',
    color: '#f87171',
    border: '1px solid #f87171',
    borderRadius: 6,
    padding: '4px 12px',
    fontSize: 12,
    cursor: 'pointer',
  },
  urlCard: {
    background: '#0f172a',
    borderRadius: 10,
    padding: '16px 20px',
    marginBottom: 12,
    border: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  badge: (up) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: up ? '#14532d' : '#450a0a',
    color: up ? '#4ade80' : '#f87171',
    border: `1px solid ${up ? '#4ade80' : '#f87171'}`,
    minWidth: 48,
    textAlign: 'center',
  }),
  dot: (up) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: up ? '#4ade80' : '#f87171',
    display: 'inline-block',
    marginRight: 8,
    boxShadow: up ? '0 0 6px #4ade80' : '0 0 6px #f87171',
  }),
  urlText: { fontWeight: 600, fontSize: 14, color: '#e2e8f0', wordBreak: 'break-all' },
  meta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  sectionTitle: { margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#94a3b8' },
  refreshNote: { fontSize: 12, color: '#475569', textAlign: 'right', marginTop: -12, marginBottom: 16 },
  empty: { textAlign: 'center', color: '#475569', padding: '40px 0', fontSize: 14 },
  historyBtn: {
    background: 'transparent',
    color: '#38bdf8',
    border: '1px solid #38bdf8',
    borderRadius: 6,
    padding: '4px 12px',
    fontSize: 12,
    cursor: 'pointer',
    marginRight: 8,
  },
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  modalBox: {
    background: '#1e293b', borderRadius: 12, padding: 28,
    minWidth: 340, maxWidth: 560, width: '90%',
    border: '1px solid #334155', maxHeight: '80vh', overflowY: 'auto',
  },
  historyRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid #1e293b', fontSize: 13,
  },
};

export default function App() {
  const [urls, setUrls] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(null);
  const [historyUrl, setHistoryUrl] = useState('');

  const fetchUrls = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/urls`);
      setUrls(res.data);
    } catch (e) {
      console.error('Failed to fetch URLs', e);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
    const interval = setInterval(fetchUrls, 15000);
    return () => clearInterval(interval);
  }, [fetchUrls]);

  const addUrl = async () => {
    setError('');
    let url = input.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    setLoading(true);
    try {
      await axios.post(`${API}/urls`, { url });
      setInput('');
      await fetchUrls();
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to add URL');
    }
    setLoading(false);
  };

  const deleteUrl = async (id) => {
    await axios.delete(`${API}/urls/${id}`);
    await fetchUrls();
  };

  const showHistory = async (id, url) => {
    const res = await axios.get(`${API}/urls/${id}/history`);
    setHistory(res.data);
    setHistoryUrl(url);
  };

  const upCount = urls.filter(u => u.latest_check?.is_up).length;
  const downCount = urls.filter(u => u.latest_check && !u.latest_check.is_up).length;

  return (
    <div style={styles.body}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⬆ Uptime Monitor</h1>
          <p style={styles.subtitle}>Real-time URL health tracking</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <span style={{ color: '#4ade80' }}>● {upCount} UP</span>
          <span style={{ color: '#f87171' }}>● {downCount} DOWN</span>
          <span style={{ color: '#64748b' }}>{urls.length} total</span>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.sectionTitle}>Add URL to Monitor</p>
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="https://example.com"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addUrl()}
            />
            <button style={styles.btn} onClick={addUrl} disabled={loading}>
              {loading ? 'Adding...' : '+ Add'}
            </button>
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>

        <p style={styles.refreshNote}>Auto-refreshes every 15s · Pings every 60s</p>

        <div style={styles.card}>
          <p style={styles.sectionTitle}>Monitored URLs ({urls.length})</p>
          {urls.length === 0 && (
            <div style={styles.empty}>No URLs monitored yet. Add one above!</div>
          )}
          {urls.map(item => {
            const check = item.latest_check;
            const isUp = check?.is_up === 1;
            const hasCheck = !!check;
            return (
              <div key={item.id} style={styles.urlCard}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={styles.dot(isUp)} />
                    <span style={styles.urlText}>{item.url}</span>
                  </div>
                  <div style={styles.meta}>
                    {hasCheck ? (
                      <>
                        Status: {check.status_code ?? 'N/A'} ·{' '}
                        {check.response_time_ms != null ? `${check.response_time_ms} ms` : 'Timeout'} ·{' '}
                        Last checked: {check.checked_at}
                      </>
                    ) : 'Not checked yet'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={styles.badge(isUp)}>{hasCheck ? (isUp ? 'UP' : 'DOWN') : '—'}</span>
                  <button style={styles.historyBtn} onClick={() => showHistory(item.id, item.url)}>History</button>
                  <button style={styles.btnDanger} onClick={() => deleteUrl(item.id)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {history && (
        <div style={styles.modal} onClick={() => setHistory(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px', color: '#38bdf8', fontSize: 15 }}>Check History</h3>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b', wordBreak: 'break-all' }}>{historyUrl}</p>
            {history.length === 0 && <p style={{ color: '#64748b' }}>No history yet.</p>}
            {history.map((h, i) => (
              <div key={i} style={styles.historyRow}>
                <span style={styles.badge(h.is_up === 1)}>{h.is_up ? 'UP' : 'DOWN'}</span>
                <span style={{ color: '#94a3b8' }}>{h.status_code ?? 'N/A'}</span>
                <span style={{ color: '#38bdf8' }}>{h.response_time_ms != null ? `${h.response_time_ms} ms` : 'Timeout'}</span>
                <span style={{ color: '#64748b' }}>{h.checked_at}</span>
              </div>
            ))}
            <button style={{ ...styles.btn, marginTop: 16 }} onClick={() => setHistory(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
