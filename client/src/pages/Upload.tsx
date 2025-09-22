import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { axiosInstance } from '../shared/lib/axiosInstance';
import type { UploadResponse } from '../types/upload';

export default function Upload(): JSX.Element {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setError('');
    const f = e.target.files?.[0] ?? null;
    if (!f) return setFile(null);
    if (f.type !== 'application/pdf') {
      setError('Допускаются только PDF файлы');
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
      setLoading(true);
      setError('');
      const form = new FormData();
      form.append('file', file);
      const { data } = await axiosInstance.post<UploadResponse>('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const sessionId = data?.data?.sessionId;
      if (!sessionId) throw new Error('Не удалось получить sessionId');
      navigate(`/chat/${sessionId}`);
    } catch (e: unknown) {
      const err = e as Error & { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || err.message || 'Ошибка загрузки';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
      <div style={{
        width: 'min(560px, 92vw)',
        background: 'var(--panel)',
        border: '1px solid #223044',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>AI PDF Chat</h2>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>Загрузите PDF и начните диалог с документом</p>

        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          background: '#0e1520',
          border: '1px dashed #2a3a54',
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
        }}>
          <input type="file" accept=".pdf" onChange={onFileChange} />
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,107,107,0.08)',
            border: '1px solid rgba(255,107,107,0.35)',
            color: '#ffb3b3',
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        <button onClick={onUpload} disabled={loading || !file} style={{ width: '100%' }}>
          {loading ? 'Загрузка…' : 'Загрузить и начать чат'}
        </button>
      </div>
    </div>
  );
}


