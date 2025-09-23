import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../shared/ui/Toast';
import Upload from '../../pages/Upload';

const mockPost = vi.fn();

vi.mock('../../shared/lib/axiosInstance', () => ({
  axiosInstance: { 
    post: (...args: unknown[]) => mockPost(...args) 
  }
}));

describe('Upload page', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });
  
  afterEach(() => {
    cleanup();
  });

  it('shows error when non-PDF selected', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <Upload />
        </ToastProvider>
      </MemoryRouter>
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    const errs = screen.getAllByText(/допускаются только pdf/i);
    expect(errs.length).toBeGreaterThan(0);
  });

  it('uploads pdf and navigates to chat', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { sessionId: 'abc-123' } } });
    render(
      <MemoryRouter>
        <ToastProvider>
          <Upload />
        </ToastProvider>
      </MemoryRouter>
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['%PDF-1.4'], 'doc.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const buttons = screen.getAllByRole('button', { name: /загрузить и начать чат/i });
    const enabled = buttons.find(b => !(b as HTMLButtonElement).disabled) as HTMLButtonElement;
    fireEvent.click(enabled);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/api/upload',
        expect.any(FormData),
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });
  });
});


