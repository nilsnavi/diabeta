import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import * as analyticsApi from '../api/analytics';
import * as timelineApi from '../api/timeline';
import * as remindersApi from '../api/reminders';

// Mock API calls
vi.mock('../api/analytics', () => ({
  analyticsApi: {
    getSummary: vi.fn(),
    getGlucoseChart: vi.fn(),
  },
}));

vi.mock('../api/timeline', () => ({
  timelineApi: {
    getTimeline: vi.fn(),
  },
}));

vi.mock('../api/reminders', () => ({
  remindersApi: {
    list: vi.fn(),
  },
}));

// Mock auth store
vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    user: { firstName: 'Иван', lastName: 'Иванов' },
  }),
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

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен отображать loading state при загрузке', () => {
    (analyticsApi.analyticsApi.getSummary as any).mockReturnValue(
      new Promise(() => {}), // never resolves
    );

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('должен отображать empty state когда нет данных', async () => {
    (analyticsApi.analyticsApi.getSummary as any).mockResolvedValue(null);
    (analyticsApi.analyticsApi.getGlucoseChart as any).mockResolvedValue({ points: [] });
    (timelineApi.timelineApi.getTimeline as any).mockResolvedValue({ items: [] });
    (remindersApi.remindersApi.list as any).mockResolvedValue({ data: [] });

    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/нет измерений/i)).toBeInTheDocument();
    });
  });

  it('должен отображать последний сахар когда есть данные', async () => {
    const mockSummary = { average: 6.5 };
    const mockChart = {
      points: [
        { value: 6.5, measuredAt: new Date().toISOString() },
      ],
      targetMin: 4.0,
      targetMax: 7.0,
    };

    (analyticsApi.analyticsApi.getSummary as any).mockResolvedValue(mockSummary);
    (analyticsApi.analyticsApi.getGlucoseChart as any).mockResolvedValue(mockChart);
    (timelineApi.timelineApi.getTimeline as any).mockResolvedValue({ items: [] });
    (remindersApi.remindersApi.list as any).mockResolvedValue({ data: [] });

    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('6.5')).toBeInTheDocument();
    });
  });

  it('должен отображать быстрые действия', async () => {
    (analyticsApi.analyticsApi.getSummary as any).mockResolvedValue(null);
    (analyticsApi.analyticsApi.getGlucoseChart as any).mockResolvedValue({ points: [] });
    (timelineApi.timelineApi.getTimeline as any).mockResolvedValue({ items: [] });
    (remindersApi.remindersApi.list as any).mockResolvedValue({ data: [] });

    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Сахар')).toBeInTheDocument();
      expect(screen.getByText('Инсулин')).toBeInTheDocument();
      expect(screen.getByText('Еда')).toBeInTheDocument();
      expect(screen.getByText('Самочувствие')).toBeInTheDocument();
    });
  });

  it('должен отображать кнопку отчёта для врача', async () => {
    (analyticsApi.analyticsApi.getSummary as any).mockResolvedValue(null);
    (analyticsApi.analyticsApi.getGlucoseChart as any).mockResolvedValue({ points: [] });
    (timelineApi.timelineApi.getTimeline as any).mockResolvedValue({ items: [] });
    (remindersApi.remindersApi.list as any).mockResolvedValue({ data: [] });

    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/создать отчёт/i)).toBeInTheDocument();
    });
  });
});
