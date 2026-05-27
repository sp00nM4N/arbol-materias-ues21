import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      <span className="theme-toggle-label">
        <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
        <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
      </span>
      <span className="theme-switch" aria-hidden="true">
        <span className="theme-switch-thumb" />
      </span>
    </button>
  );
}
