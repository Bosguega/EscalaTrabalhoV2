export type ThemeName =
    | 'light'
    | 'dark'
    | 'ocean'
    | 'nature'
    | 'sunset'
    | 'space'

export interface ThemeColors {
    primary: string
    secondary: string
    background: string
    text: string
    border: string
    trabalho: string
    folga: string
}

export interface ThemeInfo {
    name: ThemeName
    label: string
    color: string
    dark: boolean
}
