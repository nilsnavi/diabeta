import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddGlucosePage from './AddGlucosePage';

// Mock API
vi.mock('../api/glucose', () => ({
  glucoseApi: {
    create: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AddGlucosePage - Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен показывать ошибку при пустом значении сахара', async () => {
    render(<AddGlucosePage />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/введите значение/i)).toBeInTheDocument();
    });
  });

  it('должен показывать ошибку при невалидном диапазоне (< 1)', async () => {
    render(<AddGlucosePage />, { wrapper: createWrapper() });

    const input = screen.getByLabelText(/сахар/i);
    fireEvent.change(input, { target: { value: '0.5' } });

    const submitButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/минимум 1/i)).toBeInTheDocument();
    });
  });

  it('должен показывать ошибку при невалидном диапазоне (> 33)', async () => {
    render(<AddGlucosePage />, { wrapper: createWrapper() });

    const input = screen.getByLabelText(/сахар/i);
    fireEvent.change(input, { target: { value: '35' } });

    const submitButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/максимум 33/i)).toBeInTheDocument();
    });
  });

  it('должен успешно отправлять валидную форму', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: 'entry-1' });
    (await import('../api/glucose')).glucoseApi.create = mockCreate;

    render(<AddGlucosePage />, { wrapper: createWrapper() });

    const input = screen.getByLabelText(/сахар/i);
    fireEvent.change(input, { target: { value: '6.5' } });

    const submitButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        value: 6.5,
      }));
    });
  });

  it('должен показывать loading state во время отправки', async () => {
    const mockCreate = vi.fn().mockReturnValue(new Promise(() => {}));
    (await import('../api/glucose')).glucoseApi.create = mockCreate;

    render(<AddGlucosePage />, { wrapper: createWrapper() });

    const input = screen.getByLabelText(/сахар/i);
    fireEvent.change(input, { target: { value: '6.5' } });

    const submitButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('должен показывать error state при ошибке API', async () => {
    const mockCreate = vi.fn().mockRejectedValue(new Error('API Error'));
    (await import('../api/glucose')).glucoseApi.create = mockCreate;

    render(<AddGlucosePage />, { wrapper: createWrapper() });

    const input = screen.getByLabelText(/сахар/i);
    fireEvent.change(input, { target: { value: '6.5' } });

    const submitButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/ошибка сохранения/i)).toBeInTheDocument();
    });
  });

  it('должен показывать success state после успешного сохранения', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: 'entry-1' });
    (await import('../api/glucose')).glucoseApi.create = mockCreate;

    render(<AddGlucosePage />, { wrapper: createWrapper() });

    const input = screen.getByLabelText(/сахар/i);
    fireEvent.change(input, { target: { value: '6.5' } });

    const submitButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/успешно сохранено/i)).toBeInTheDocument();
    });
  });
});
