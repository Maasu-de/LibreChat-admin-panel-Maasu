import { ThemeProvider } from 'styled-components';
import type { Theme as ClickUITheme } from '@clickhouse/click-ui';

type BrandControlsThemeProps = {
  children: React.ReactNode;
  mode: 'light' | 'dark';
};

const controlFont = '600 0.875rem/1.5 Inter, sans-serif';
const menuFont = '500 0.875rem/1.5 Inter, sans-serif';

function brandControlsTheme(theme: ClickUITheme, mode: 'light' | 'dark'): ClickUITheme {
  const dark = mode === 'dark';
  const accent = dark ? '#89cff0' : '#0115e9';
  const accentHover = dark ? '#b8e4f8' : '#191970';
  const accentInk = dark ? '#010001' : '#fefeff';
  const surface = dark ? '#101327' : '#fefeff';
  const surfaceHover = dark ? '#191970' : '#eaf5fc';
  const line = dark ? '#41456e' : '#c0c0c0';
  const text = dark ? '#fefeff' : '#010001';
  const muted = dark ? '#c0c0c0' : '#4b5271';
  const button = theme.click.button;
  const field = theme.click.field;
  const menu = theme.click.genericMenu;

  return {
    ...theme,
    click: {
      ...theme.click,
      button: {
        ...button,
        radii: { ...button.radii, all: '0.5rem' },
        basic: {
          ...button.basic,
          space: { ...button.basic.space, x: '1rem', y: '0.5625rem' },
          typography: {
            ...button.basic.typography,
            label: {
              ...button.basic.typography.label,
              default: controlFont,
              hover: controlFont,
              active: controlFont,
              disabled: controlFont,
            },
            mobile: {
              ...button.basic.typography.mobile,
              label: {
                ...button.basic.typography.mobile.label,
                default: controlFont,
                hover: controlFont,
                active: controlFont,
              },
            },
          },
          color: {
            ...button.basic.color,
            primary: {
              ...button.basic.color.primary,
              background: {
                ...button.basic.color.primary.background,
                default: accent,
                hover: accentHover,
                active: accentHover,
              },
              stroke: {
                ...button.basic.color.primary.stroke,
                default: accent,
                hover: accentHover,
                active: accentHover,
              },
              text: {
                ...button.basic.color.primary.text,
                default: accentInk,
                hover: accentInk,
                active: accentInk,
              },
            },
            secondary: {
              ...button.basic.color.secondary,
              background: {
                ...button.basic.color.secondary.background,
                default: surface,
                hover: surfaceHover,
                active: surfaceHover,
              },
              stroke: {
                ...button.basic.color.secondary.stroke,
                default: line,
                hover: accent,
                active: accent,
              },
              text: {
                ...button.basic.color.secondary.text,
                default: text,
                hover: text,
                active: text,
              },
            },
            empty: {
              ...button.basic.color.empty,
              text: {
                ...button.basic.color.empty.text,
                default: accent,
                hover: accentHover,
                active: accent,
              },
            },
          },
        },
        iconButton: {
          ...button.iconButton,
          radii: { ...button.iconButton.radii, all: '0.5rem' },
          color: {
            ...button.iconButton.color,
            primary: {
              ...button.iconButton.color.primary,
              background: {
                ...button.iconButton.color.primary.background,
                hover: surfaceHover,
                active: surfaceHover,
              },
              text: {
                ...button.iconButton.color.primary.text,
                default: text,
                hover: accent,
                active: accent,
              },
            },
            secondary: {
              ...button.iconButton.color.secondary,
              background: {
                ...button.iconButton.color.secondary.background,
                default: accent,
                hover: accentHover,
                active: accentHover,
              },
              text: {
                ...button.iconButton.color.secondary.text,
                default: accentInk,
                hover: accentInk,
                active: accentInk,
              },
            },
          },
        },
      },
      field: {
        ...field,
        radii: { ...field.radii, all: '0.5rem' },
        space: { ...field.space, x: '0.75rem', y: '0.5625rem' },
        typography: {
          ...field.typography,
          fieldText: {
            ...field.typography.fieldText,
            default: controlFont,
            hover: controlFont,
            active: controlFont,
            disabled: controlFont,
          },
        },
        color: {
          ...field.color,
          background: {
            ...field.color.background,
            default: surface,
            hover: surfaceHover,
            active: surface,
          },
          text: {
            ...field.color.text,
            default: text,
            hover: text,
            active: text,
          },
          stroke: {
            ...field.color.stroke,
            default: line,
            hover: accent,
            active: accent,
          },
          placeholder: { ...field.color.placeholder, default: muted },
        },
      },
      genericMenu: {
        ...menu,
        panel: {
          ...menu.panel,
          radii: { ...menu.panel.radii, all: '0.5rem' },
          size: { ...menu.panel.size, height: '2.625rem' },
          color: {
            ...menu.panel.color,
            background: { ...menu.panel.color.background, default: surface },
            stroke: { ...menu.panel.color.stroke, default: line },
          },
        },
        item: {
          ...menu.item,
          space: { ...menu.item.space, x: '0.625rem', y: '0.4375rem' },
          typography: {
            ...menu.item.typography,
            label: {
              ...menu.item.typography.label,
              default: menuFont,
              hover: menuFont,
              active: menuFont,
              disabled: menuFont,
            },
          },
          color: {
            ...menu.item.color,
            default: {
              ...menu.item.color.default,
              text: {
                ...menu.item.color.default.text,
                default: text,
                hover: text,
                active: text,
                muted,
              },
              background: {
                ...menu.item.color.default.background,
                default: surface,
                hover: surfaceHover,
                active: surfaceHover,
              },
              stroke: {
                ...menu.item.color.default.stroke,
                default: line,
                focus: accent,
              },
            },
          },
        },
      },
    },
  };
}

export function BrandControlsTheme({ children, mode }: BrandControlsThemeProps) {
  return (
    <ThemeProvider theme={(theme) => brandControlsTheme(theme as ClickUITheme, mode)}>
      {children}
    </ThemeProvider>
  );
}
