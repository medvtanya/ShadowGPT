import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Chat from '../../pages/Chat';
import { ToastProvider } from '../../shared/ui/Toast';

vi.mock('../../shared/lib/axiosInstance', () => {
  return {
    axiosInstance: {
      post: vi.fn(),
    },
  };
});

const { axiosInstance } = await import('../../shared/lib/axiosInstance');

describe('Chat page', () => {
  beforeEach(() => {
    (axiosInstance.post as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  const renderWithSession = (sessionId = 's-1') => {
    return render(
      <MemoryRouter initialEntries={[`/chat/${sessionId}`]}>
        <ToastProvider>
          <Routes>
            <Route path="/chat/:sessionId" element={<Chat />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    );
  };

  it('sends message and shows AI reply', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: { data: { answer: 'Привет!' } } });
    renderWithSession();

    const input = screen.getAllByPlaceholderText(/задайте вопрос/i)[0];
    fireEvent.change(input, { target: { value: 'привет' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/chat', { sessionId: 's-1', question: 'привет' });
    });

    await screen.findByText('Привет!');
  });

  it('shows error message on failure', async () => {
    (axiosInstance.post as any).mockRejectedValueOnce({ response: { data: { message: 'Session not found' } } });
    renderWithSession();

    const input = screen.getAllByPlaceholderText(/задайте вопрос/i)[0];
    fireEvent.change(input, { target: { value: 'hi' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    const errs = await screen.findAllByText(/session not found/i);
    expect(errs.length).toBeGreaterThan(0);
  });
});


