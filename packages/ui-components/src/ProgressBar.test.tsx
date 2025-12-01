import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgressBar } from './ProgressBar';

// Mock the ThemeProvider
vi.mock('./ThemeProvider', () => ({
  useTheme: () => ({
    currentTheme: {
      colors: {
        primary: '#00d4ff',
        surface: '#111111',
        border: '#333333',
        text: '#ffffff',
        success: '#4ecdc4',
        warning: '#f39c12',
        error: '#e74c3c',
        accent: '#ff6b6b',
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Arial, sans-serif',
      },
    },
  }),
  createStyles: () => ({
    progressBar: {
      backgroundColor: '#111111',
      border: '1px solid #333333',
    },
  }),
}));

describe('ProgressBar', () => {
  it('renders with default props', () => {
    render(<ProgressBar value={50} />);

    const progressBar = screen.getByText('50 / 100');
    expect(progressBar).toBeInTheDocument();
  });

  it('renders with custom max value', () => {
    render(<ProgressBar value={25} maxValue={200} />);

    const progressBar = screen.getByText('25 / 200');
    expect(progressBar).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ProgressBar value={75} label="Progress" />);

    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('75 / 100')).toBeInTheDocument();
  });

  it('renders different variants', () => {
    const { rerender } = render(<ProgressBar value={50} variant="primary" />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();

    rerender(<ProgressBar value={50} variant="success" />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender } = render(<ProgressBar value={50} size="small" />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();

    rerender(<ProgressBar value={50} size="large" />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('hides text when showText is false', () => {
    render(<ProgressBar value={50} showText={false} />);

    expect(screen.queryByText('50 / 100')).not.toBeInTheDocument();
  });

  it('renders with custom color', () => {
    render(<ProgressBar value={50} color="#ff0000" />);

    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('handles zero value', () => {
    render(<ProgressBar value={0} />);

    expect(screen.getByText('0 / 100')).toBeInTheDocument();
  });

  it('handles max value', () => {
    render(<ProgressBar value={100} />);

    expect(screen.getByText('100 / 100')).toBeInTheDocument();
  });

  it('handles value exceeding max', () => {
    render(<ProgressBar value={150} maxValue={100} />);

    expect(screen.getByText('150 / 100')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ProgressBar value={50} className="custom-class" />);

    const container = screen.getByText('50 / 100').closest('.cyberpunk-progress-bar');
    expect(container).toHaveClass('custom-class');
  });
});
