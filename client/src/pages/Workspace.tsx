import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../shared/lib/axiosInstance';
import { useToast } from '../shared/ui/Toast';
import type { UploadResponse } from '../types/upload';
import type { ChatRequest, ChatResponse } from '../types/chat';

type Message = {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  ts: number;
};

const storageKey = (sessionId: string) => `chat-history:${sessionId}`;

export default function Workspace(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams<{ sessionId?: string }>();
  const [sessionId, setSessionId] = useState<string | null>(params.sessionId || null);
  const prevSessionRef = useRef<string | null>(params.sessionId || null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  // Load history when session changes
  useEffect(() => {
    if (!sessionId) return;
    try {
      const raw = localStorage.getItem(storageKey(sessionId));
      if (raw) setMessages(JSON.parse(raw) as Message[]);
      else setMessages([]);
    } catch {}
  }, [sessionId]);

  // Reset when navigating to index (new chat)
  useEffect(() => {
    const routeSession = params.sessionId || null;
    // If route lost sessionId (navigated to "/")
    if (!routeSession && prevSessionRef.current) {
      // remove previous session history
      try { localStorage.removeItem(storageKey(prevSessionRef.current)); } catch {}
      setMessages([]);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSessionId(null);
    }
    // Track current for next comparison
    prevSessionRef.current = routeSession;
  }, [params.sessionId]);

  // Persist history
  useEffect(() => {
    if (!sessionId) return;
    try { localStorage.setItem(storageKey(sessionId), JSON.stringify(messages)); } catch {}
  }, [messages, sessionId]);

  // Auto-scroll
  useEffect(() => {
    const el = listRef.current as unknown as { scrollTo?: Function; scrollTop?: number; scrollHeight?: number } | null;
    if (!el) return;
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({ top: (el as any).scrollHeight, behavior: 'smooth' });
    } else {
      (el as any).scrollTop = (el as any).scrollHeight || 0;
    }
  }, [messages.length]);

  const canSend = useMemo(() => Boolean(sessionId) && !loading && input.trim().length > 0, [sessionId, loading, input]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const f = e.target.files?.[0] ?? null;
    if (!f) return setFile(null);
    if (f.type !== 'application/pdf') {
      setError('Допускаются только PDF файлы');
      toast.notify('Допускаются только PDF файлы', 'error');
      return setFile(null);
    }
    setFile(f);
  };

  const onUpload = async (): Promise<void> => {
    if (!file) {
      setError('Выберите PDF файл');
      return;
    }
    try {
      setUploading(true);
      setError('');
      console.debug('[Upload] start', {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      const form = new FormData();
      form.append('file', file);
      const { data } = await axiosInstance.post<UploadResponse>(`/api/upload`, form, {
        // Не указываем Content-Type — браузер сам добавит boundary
        timeout: 30000,
      });
      console.debug('[Upload] response', data);
      const newSessionId = data?.data?.sessionId;
      if (!newSessionId) throw new Error('Не удалось получить sessionId');
      setSessionId(newSessionId);
      navigate(`/chat/${newSessionId}`, { replace: true });
      toast.notify('PDF успешно загружен', 'success');
    } catch (e: unknown) {
      const err = e as Error & { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || err.message || 'Ошибка загрузки';
      console.error('[Upload] error', {
        message,
        err,
      });
      setError(message);
      toast.notify(message, 'error');
    } finally {
      setUploading(false);
      console.debug('[Upload] end');
    }
  };

  const resetHistory = () => {
    if (!sessionId) return;
    localStorage.removeItem(storageKey(sessionId));
    setMessages([]);
  };

  const jumpToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isToday = (d: Date) => isSameDay(d, new Date());
  const isYesterday = (d: Date) => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return isSameDay(d, y);
  };
  const formatDayLabel = (d: Date) => {
    if (isToday(d)) return 'Сегодня';
    if (isYesterday(d)) return 'Вчера';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };

  const send = async () => {
    if (!canSend || !sessionId) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const payload: ChatRequest = { sessionId, question: userMsg.content };
      const { data } = await axiosInstance.post<ChatResponse>(`/api/chat`, payload);
      const answer = data?.data?.answer || 'Нет ответа';
      const aiMsg: Message = { id: crypto.randomUUID(), role: 'ai', content: answer, ts: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e: unknown) {
      const err = e as Error & { response?: { data?: { message?: string } } };
      const msg = err?.response?.data?.message || err.message || 'Ошибка запроса';
      const sysMsg: Message = { id: crypto.randomUUID(), role: 'system', content: msg, ts: Date.now() };
      setMessages(prev => [...prev, sysMsg]);
      toast.notify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace">
      <aside className="workspace-left">
        <div className="panel-card" style={{ background: 'var(--panel)', border: '1px solid #223044', borderRadius: 16, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Загрузка PDF</h3>
          <div className="upload-drop" style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#0e1520', border: '1px dashed #2a3a54', padding: 12, borderRadius: 12, marginBottom: 12 }}>
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={onFileChange} />
          </div>
          {error && (
            <div className="error-box" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.35)', color: '#ffb3b3', padding: 10, borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}
          <button onClick={onUpload} disabled={uploading || !file} style={{ width: '100%', opacity: (uploading || !file) ? 0.6 : 1 }}>
            {uploading ? 'Загрузка…' : 'Загрузить'}
          </button>
        </div>

        <div className="panel-card" style={{ marginTop: 12, background: 'var(--panel)', border: '1px solid #223044', borderRadius: 16, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>История</h3>
          {!sessionId && <div style={{ color: 'var(--muted)' }}>Загрузите PDF, чтобы начать</div>}
          {sessionId && (
            <div style={{ display: 'grid', gap: 8 }}>
              {(() => {
                const items = messages.filter(m => m.role === 'user');
                const last = items.slice(-50);
                // newest -> oldest
                const sorted = last.sort((a, b) => b.ts - a.ts);
                type Entry = typeof sorted[number];
                const blocks: Array<{ key: string; label: string; entries: Entry[] }> = [];
                let currentKey = '';
                let currentEntries: Entry[] = [];
                let currentLabel = '';
                sorted.forEach((m, idx) => {
                  const d = new Date(m.ts);
                  const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                  const lbl = formatDayLabel(d);
                  if (k !== currentKey) {
                    if (currentEntries.length) {
                      blocks.push({ key: currentKey, label: currentLabel, entries: currentEntries });
                    }
                    currentKey = k;
                    currentLabel = lbl;
                    currentEntries = [m];
                  } else {
                    currentEntries.push(m);
                  }
                  if (idx === sorted.length - 1 && currentEntries.length) {
                    blocks.push({ key: currentKey, label: currentLabel, entries: currentEntries });
                  }
                });
                return blocks.map(block => (
                  <div key={block.key}>
                    <div style={{
                      color: 'var(--muted)',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      margin: '8px 0 4px'
                    }}>{block.label}</div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {block.entries.map(m => (
                        <button
                          key={m.id}
                          onClick={() => jumpToMessage(m.id)}
                          style={{
                            textAlign: 'left',
                            background: 'transparent',
                            color: 'var(--accent)',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={m.content}
                        >
                          {m.content}
                        </button>
                      ))}
                    </div>
                  </div>
                ));
              })()}
              <button onClick={resetHistory} style={{ background: '#2a3a54' }}>Сбросить историю</button>
            </div>
          )}
        </div>
      </aside>

      <section className="workspace-right">
        <div className="chat-root">
          <div ref={listRef} className="messages">
            {!sessionId && (
              <div style={{ color: 'var(--muted)' }}>Загрузите PDF, чтобы активировать чат.</div>
            )}
            {sessionId && messages.length === 0 && (
              <div style={{ color: 'var(--muted)' }}>Начните диалог. Задайте вопрос по документу.</div>
            )}
            {sessionId && messages.map(m => (
              <div id={`msg-${m.id}`} key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                <div style={{ maxWidth: '72%', background: m.role === 'user' ? 'var(--accent)' : 'var(--panel)', color: m.role === 'user' ? '#fff' : 'var(--text)', border: m.role === 'user' ? 'none' : '1px solid #223044', padding: '10px 12px', borderRadius: 12, whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </div>
              </div>
            ))}
            {sessionId && loading && (
              <div style={{ color: 'var(--muted)', fontStyle: 'italic' }}>AI печатает…</div>
            )}
          </div>

          <div className="composer">
            <input
              type="text"
              placeholder="Задайте вопрос по документу"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              disabled={!sessionId}
              style={{ flex: 1 }}
            />
            <button onClick={send} disabled={!canSend} style={{ opacity: !canSend ? 0.6 : 1 }}>
              Отправить
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}


