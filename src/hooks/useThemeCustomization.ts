"use client";

import type { CSSProperties } from 'react';
import { useAppSelector } from '@/src/store';
import { useTheme } from '@/src/hooks/useTheme';
import type { Section } from '@/src/store/slices/themeCustomizationSlice';

/**
 * Returns a `style` object for each shell section (rail / sidebar / header).
 * Values are applied as inline styles that override Tailwind bg/border classes,
 * plus CSS custom properties that cascade to child icon/text elements.
 */
export function useThemeCustomization() {
  const { isDark } = useTheme();
  const mode       = isDark ? 'dark' : 'light';
  const custom     = useAppSelector((s) => s.themeCustomization[mode]);

  function getSectionStyle(section: Section): CSSProperties {
    const c = custom[section];
    if (!c) return {};

    if (section === 'panel') {
      return {
        ...(c.borderColor && { '--panel-border-color': c.borderColor } as CSSProperties),
      };
    }

    if (section === 'banner') {
      return {
        ...(c.bg && { backgroundColor: c.bg }),
        ...(c.fg && { color: c.fg }),
      };
    }

    if (section === 'contentBg') {
      return {
        ...(c.bg && { backgroundColor: c.bg }),
      };
    }

    if (section === 'widget') {
      return {
        ...(c.bg          && { '--custom-bg-elevated':        c.bg          } as CSSProperties),
        ...(c.borderColor && { '--custom-bg-elevated-border': c.borderColor } as CSSProperties),
      };
    }

    if (section === 'sidebar') {
      return {
        ...(c.bg          && { backgroundColor: c.bg, '--custom-sidebar-bg':     c.bg          } as CSSProperties),
        ...(c.borderColor && { borderColor:     c.borderColor, '--custom-header-input-border': c.borderColor } as CSSProperties),
      };
    }

    if (section === 'card') {
      return {
        ...(c.bg          && { '--custom-card-bg':     c.bg          } as CSSProperties),
        ...(c.borderColor && { '--custom-card-border': c.borderColor } as CSSProperties),
      };
    }

    if (section === 'header') {
      return {
        ...(c.bg          && { backgroundColor: c.bg                                       }),
        ...(c.borderColor && { borderColor:     c.borderColor                               }),
        ...(c.fg          && { '--custom-fg':                     c.fg    } as CSSProperties),
        // Tenant switcher + header search box border — driven by borderColor (every
        // preset sets this) rather than altBg (no preset actually sets that field,
        // which left this permanently stuck on its root fallback regardless of theme).
        ...(c.borderColor && { '--custom-header-input-border':    c.borderColor } as CSSProperties),
        // search bg/border set on the header element so header SearchInput inherits them
        ...(c.iconColor   && { '--custom-search-bg':     c.iconColor  } as CSSProperties),
        ...(c.activeBg    && { '--custom-search-border': c.activeBg   } as CSSProperties),
      };
    }

    if (section === 'table') {
      // No built-in preset currently sets table.altBg (the row-stripe tint), so
      // without a fallback every preset's stripe silently stays on the root
      // default regardless of theme. table.borderColor is already a suitable
      // low-opacity accent tint and every preset does set it.
      const altBg = c.altBg || c.borderColor;
      return {
        ...(c.bg          && { '--custom-table-bg':            c.bg          } as CSSProperties),
        ...(altBg         && { '--custom-table-alt-bg':        altBg         } as CSSProperties),
        ...(c.activeBg    && { '--custom-table-header-bg':     c.activeBg    } as CSSProperties),
        ...(c.fg          && { '--custom-table-pagination-bg': c.fg          } as CSSProperties),
        ...(c.iconColor   && { '--custom-table-input-border':  c.iconColor   } as CSSProperties),
        ...(c.borderColor && { '--custom-table-border':        c.borderColor } as CSSProperties),
        // also cascade search vars into <main> so table SearchInputs are themed
        ...(altBg         && { '--custom-search-bg':     altBg              } as CSSProperties),
        ...(c.iconColor   && { '--custom-search-border': c.iconColor        } as CSSProperties),
      };
    }

    if (section === 'button') {
      // No built-in preset currently populates the Buttons section at all, so
      // every default-variant button silently stays the root-default blue
      // regardless of theme. Fall back to fields every preset *does* set:
      // card.borderColor (already a low-opacity accent tint, good for bg/border)
      // and banner.fg (a solid, readable accent-tinted foreground color).
      const card   = custom.card;
      const banner = custom.banner;
      const bg     = c.bg          || card?.borderColor;
      const border = c.borderColor || card?.borderColor;
      const fg     = c.fg          || banner?.fg;
      return {
        ...(bg            && { '--custom-btn-bg':           bg            } as CSSProperties),
        ...(c.activeBg    && { '--custom-btn-bg-hover':     c.activeBg    } as CSSProperties),
        ...(fg            && { '--custom-btn-fg':           fg            } as CSSProperties),
        ...(border        && { '--custom-btn-border':       border        } as CSSProperties),
        ...(border        && { '--custom-btn-border-hover': border        } as CSSProperties),
      };
    }

    return {
      ...(c.bg          && { backgroundColor: c.bg }),
      ...(c.borderColor && { borderColor:     c.borderColor }),
      ...(c.fg          && { '--custom-fg':   c.fg          } as CSSProperties),
      ...(c.iconColor   && {
        '--nav-fg-dim':   c.iconColor,
        '--nav-fg-label': c.iconColor,
      } as CSSProperties),
      ...(c.iconHoverColor && {
        '--nav-fg-hover': c.iconHoverColor,
      } as CSSProperties),
      ...(c.activeBg && { '--custom-active-bg': c.activeBg } as CSSProperties),
    };
  }

  return { getSectionStyle, mode };
}
