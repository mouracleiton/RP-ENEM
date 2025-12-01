import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from './Card';

// Mock the ThemeProvider
vi.mock('./ThemeProvider', () => ({
  useTheme: () => ({
    currentTheme: {
      colors: {
        primary: '#00d4ff',
        background: '#000000',
        surface: '#111111',
        accent: '#ff6b6b',
        success: '#4ecdc4',
        warning: '#f39c12',
        error: '#e74c3c',
        text: '#ffffff',
        textSecondary: '#cccccc',
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Arial, sans-serif',
      },
      effects: {
        glow: '0 0 8px #00d4ff',
      },
    },
  }),
  createStyles: () => ({
    card: {
      border: '1px solid #00d4ff',
      borderRadius: '8px',
      backgroundColor: '#111111',
      boxShadow: '0 0 8px #00d4ff',
    },
  }),
}));

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);

    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
  });

  it('renders with title and subtitle', () => {
    render(
      <Card title="Card Title" subtitle="Card Subtitle">
        Content
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies different variants', () => {
    const { rerender } = render(<Card variant="primary">Primary</Card>);
    expect(screen.getByText('Primary')).toBeInTheDocument();

    rerender(<Card variant="glow">Glow</Card>);
    expect(screen.getByText('Glow')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);

    const card = screen.getByText('Clickable Card').parentElement;
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);

    const card = screen.getByText('Clickable Card').parentElement;
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);

    const card = screen.getByText('Clickable Card').parentElement;
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
