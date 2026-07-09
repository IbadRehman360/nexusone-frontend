import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ComponentColors {
  bg:             string; // background
  fg:             string; // text / label color
  iconColor:      string; // inactive icon color
  iconHoverColor: string; // hover / active icon color
  activeBg:       string; // active nav item background / table header bg
  borderColor:    string; // border color
  altBg:          string; // alternate row bg (table) / input border (header)
}

export interface SectionTheme {
  rail:      ComponentColors;
  sidebar:   ComponentColors;
  header:    ComponentColors;
  panel:     ComponentColors; // workspace panel border
  banner:    ComponentColors; // trial / grace / locked banner
  contentBg: ComponentColors; // main content area background
  widget:    ComponentColors; // bg-background-elevated components app-wide
  card:      ComponentColors; // stat cards & inner components
  table:     ComponentColors; // data table rows & container
  button:    ComponentColors; // primary button accent color
}

export interface SavedPalette {
  id:    string;
  name:  string;
  light: SectionTheme;
  dark:  SectionTheme;
}

const EMPTY: ComponentColors = {
  bg:             '',
  fg:             '',
  iconColor:      '',
  iconHoverColor: '',
  activeBg:       '',
  borderColor:    '',
  altBg:          '',
};

const DEFAULT_SECTION: SectionTheme = {
  rail:      { ...EMPTY },
  sidebar:   { ...EMPTY },
  header:    { ...EMPTY },
  panel:     { ...EMPTY },
  banner:    { ...EMPTY },
  contentBg: { ...EMPTY },
  widget:    { ...EMPTY },
  card:      { ...EMPTY },
  table:     { ...EMPTY },
  button:    { ...EMPTY },
};

export interface ThemeCustomizationState {
  light:         SectionTheme;
  dark:          SectionTheme;
  savedPalettes: SavedPalette[];
}

// No customization active by default — cards/tables/etc. render the base
// design tokens from globals.css. "Onyx" (defined independently in
// ThemeCustomizer.tsx's preset list) is still available as an explicit,
// opt-in preset from the Theme Testing panel; it just isn't force-applied
// to everyone before they've chosen it.
const initialState: ThemeCustomizationState = {
  light:         { ...DEFAULT_SECTION },
  dark:          { ...DEFAULT_SECTION },
  savedPalettes: [],
};

export type Section  = keyof SectionTheme;
export type ColorKey = keyof ComponentColors;

const themeCustomizationSlice = createSlice({
  name: 'themeCustomization',
  initialState,
  reducers: {
    setColor(
      state,
      action: PayloadAction<{ mode: 'light' | 'dark'; section: Section; key: ColorKey; value: string }>,
    ) {
      const { mode, section, key, value } = action.payload;
      if (!state[mode][section]) state[mode][section] = { ...EMPTY };
      state[mode][section][key] = value;
    },

    resetSection(
      state,
      action: PayloadAction<{ mode: 'light' | 'dark'; section: Section }>,
    ) {
      const { mode, section } = action.payload;
      if (state[mode]) state[mode][section] = { ...EMPTY };
    },

    resetMode(state, action: PayloadAction<{ mode: 'light' | 'dark' }>) {
      state[action.payload.mode] = {
        rail:      { ...EMPTY },
        sidebar:   { ...EMPTY },
        header:    { ...EMPTY },
        panel:     { ...EMPTY },
        banner:    { ...EMPTY },
        contentBg: { ...EMPTY },
        widget:    { ...EMPTY },
        card:      { ...EMPTY },
        table:     { ...EMPTY },
        button:    { ...EMPTY },
      };
    },

    savePalette(state, action: PayloadAction<{ name: string }>) {
      state.savedPalettes.push({
        id:    Date.now().toString(),
        name:  action.payload.name,
        light: JSON.parse(JSON.stringify(state.light)),
        dark:  JSON.parse(JSON.stringify(state.dark)),
      });
    },

    applyPalette(state, action: PayloadAction<{ id: string }>) {
      const p = state.savedPalettes.find((x) => x.id === action.payload.id);
      if (p) {
        state.light = p.light;
        state.dark  = p.dark;
      }
    },

    deletePalette(state, action: PayloadAction<{ id: string }>) {
      state.savedPalettes = state.savedPalettes.filter((x) => x.id !== action.payload.id);
    },

    applyPreset(state, action: PayloadAction<{ light: SectionTheme; dark: SectionTheme }>) {
      state.light = action.payload.light;
      state.dark  = action.payload.dark;
    },
  },
});

export const {
  setColor,
  resetSection,
  resetMode,
  savePalette,
  applyPalette,
  deletePalette,
  applyPreset,
} = themeCustomizationSlice.actions;

export default themeCustomizationSlice.reducer;
