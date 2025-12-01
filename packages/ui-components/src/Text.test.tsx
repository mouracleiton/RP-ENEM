import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Text } from './Text';

// Mock the ThemeProvider
vi.mock('./ThemeProvider', () => ({
  useTheme: () => ({
    currentTheme: {
      colors: {
        primary: '#00d4ff',
        text: '#ffffff',
        surface: '#111111',
        border: '#333333',
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Arial, sans-serif',
        monospace: 'Monaco, monospace',
      },
    },
  }),
}));

describe('Text', () => {
  it('renders with default props', () => {
    render(<Text>Default text</Text>);

    const text = screen.getByText('Default text');
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe('SPAN');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Text variant="heading">Heading</Text>);
    let text = screen.getByText('Heading');
    expect(text).toBeInTheDocument();

    rerender(<Text variant="code">Code</Text>);
    text = screen.getByText('Code');
    expect(text).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Text size="xs">Extra small</Text>);
    let text = screen.getByText('Extra small');
    expect(text).toBeInTheDocument();

    rerender(<Text size="3xl">Extra large</Text>);
    text = screen.getByText('Extra large');
    expect(text).toBeInTheDocument();
  });

  it('renders with different weights', () => {
    const { rerender } = render(<Text weight="light">Light</Text>);
    let text = screen.getByText('Light');
    expect(text).toBeInTheDocument();

    rerender(<Text weight="black">Black</Text>);
    text = screen.getByText('Black');
    expect(text).toBeInTheDocument();
  });

  it('renders with custom color', () => {
    render(<Text color="#ff0000">Red text</Text>);

    const text = screen.getByText('Red text');
    expect(text).toBeInTheDocument();
  });

  it('renders with glow effect', () => {
    render(<Text glow>Glowing text</Text>);

    const text = screen.getByText('Glowing text');
    expect(text).toBeInTheDocument();
  });

  it('renders with custom alignment', () => {
    render(<Text align="center">Centered text</Text>);

    const text = screen.getByText('Centered text');
    expect(text).toBeInTheDocument();
  });

  it('renders with custom element type', () => {
    render(<Text as="h1">Heading text</Text>);

    const text = screen.getByText('Heading text');
    expect(text.tagName).toBe('H1');
  });

  it('applies custom className', () => {
    render(<Text className="custom-class">Custom class</Text>);

    const text = screen.getByText('Custom class');
    expect(text).toHaveClass('custom-class');
  });
});
