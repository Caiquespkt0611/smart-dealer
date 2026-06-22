import { Theme } from './theme'

export function getThemeStyles(theme: Theme) {
  if (theme === 'dark') {
    return {
      bg: {
        main: '#0A0E1A',
        secondary: '#111827',
        tertiary: '#0F1724',
        card: '#111827',
        hover: '#1F2937',
      },
      border: '#1F2937',
      text: {
        primary: '#F9FAFB',
        secondary: '#9CA3AF',
        tertiary: '#6B7280',
      },
      header: '#003087',
      shadow: 'rgba(0, 0, 0, 0.3)',
      statusBg: {
        ok: '#10B98120',
        warning: '#F59E0B20',
        danger: '#EF444420',
      },
      statusText: {
        ok: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    }
  }

  return {
    bg: {
      main: '#F8FAFC',
      secondary: '#FFFFFF',
      tertiary: '#F1F5F9',
      card: '#FFFFFF',
      hover: '#F1F5F9',
    },
    border: '#E2E8F0',
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      tertiary: '#94A3B8',
    },
    header: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.08)',
    statusBg: {
      ok: '#D1FAE510',
      warning: '#FEF3C710',
      danger: '#FEE2E210',
    },
    statusText: {
      ok: '#059669',
      warning: '#D97706',
      danger: '#DC2626',
    },
  }
}
