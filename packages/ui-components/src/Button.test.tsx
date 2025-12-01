import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

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
    button: {
      border: '1px solid #00d4ff',
      borderRadius: '4px',
    },
  }),
}));

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders with custom props', () => {
    render(
      <Button variant="secondary" size="large" type="submit" className="custom-class" disabled>
        Submit
      </Button>
    );

    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('custom-class');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Loading...</Button>);

    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toBeDisabled();

    // Check for loading spinner (⚙️)
    const spinner = screen.getByText('⚙️');
    expect(spinner).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveStyle({ backgroundColor: '#00d4ff' });

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveStyle({ backgroundColor: '#111111' });
  });

  it('applies correct size styles', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveStyle({ padding: '8px 16px' });

    rerender(<Button size="large">Large</Button>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveStyle({ padding: '16px 32px' });
  });
});
