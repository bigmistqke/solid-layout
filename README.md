<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=@bigmistqke/solid-layout&background=tiles&project=%20" alt="@bigmistqke/solid-layout">
</p>

# @bigmistqke/solid-layout

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

Side/Terminal Layout Manager for SolidJS. This package provides components to create flexible, resizable split views and terminal-like interfaces within your SolidJS applications. Ideal for developing sophisticated layouts in web applications, particularly where multiple views or panels are required to interact harmoniously.

## Features

- Flexible Layouts: Create resizable split views that can adjust their sizes based on user interaction.
- Terminal Style Panes: Incorporate terminal-like panes that can be dynamically resized and styled.
- Easy Customization: Style and adjust layouts with simple props.
- SolidJS Integration: Seamlessly integrates with SolidJS projects, leveraging its reactivity and component model.

## Quick start

Install it:

```bash
npm i @bigmistqke/solid-layout
# or
yarn add @bigmistqke/solid-layout
# or
pnpm add @bigmistqke/solid-layout
```

Use it:

```tsx
import { Layout } from '@bigmistqke/solid-layout'

export const App = () => (
  <Layout style={{ height: '100vh', width: '100vw' }}>
    <Layout.Split column>
      <Layout.Terminal flex={0.2} />
      <Layout.Terminal min={50} max={500} />
    </Layout.Split>
    <Layout.Split>
      <Layout.Terminal style={{ background: 'red' }} />
      <Layout.Terminal style={{ background: 'blue' }} />
    </Layout.Split>
  </Layout>
)
```

## Components

### `<Layout/>`

Root component of @bigmistqke/solid-layout used to initiate the layout structure.

**Properties** [`SplitProps`](#splitprops)

- `column`: If true, splits vertically (columns). Default is false (rows).
- `flex`: flex-like value for the split pane.
- `handleClass`: CSS class for the draggable splitter handle.
- `handleStyle`: Inline styles for the draggable splitter handle.
- `max`: Maximum size of the terminal in pixels.
- `min`: Minimum size of the terminal in pixels.
- `style`: CSSProperties to apply custom styles to the split pane.

### `<Layout.Split/>`

A container that divides its child components (either further splits or terminals) into resizable sections either horizontally or vertically.

**Properties** [`SplitProps`](#splitprops)

- `column`: If true, splits vertically (columns). Default is false (rows).
- `flex`: flex-like value for the split pane.
- `handleClass`: CSS class for the draggable splitter handle.
- `handleStyle`: Inline styles for the draggable splitter handle.
- `max`: Maximum size of the terminal in pixels.
- `min`: Minimum size of the terminal in pixels.
- `style`: CSSProperties to apply custom styles to the split pane.

### `<Layout.Terminal/>`

A terminal-pane that can be placed within a split to provide a contained UI section, similar to a panel or frame in desktop interfaces.

**Signature**

```tsx
type Component<TerminalProps>
```

**Properties** [`TerminalProps`](#terminalprops)

- flex: Flex-grow value for the terminal.
- max: Maximum size of the terminal in pixels.
- min: Minimum size of the terminal in pixels.
- style: CSSProperties to apply custom styles to the terminal.

## Types

### `SplitProps`

```tsx
type SplitProps = Omit<ComponentProps<'div'>, 'children' | 'style'> & {
  children: JSX.Element[] // Needs to be Layout.Split || Layout.Terminal
  column?: boolean
  flex?: number
  handleClass?: string
  handleStyle?: JSX.CSSProperties
  max?: number
  min?: number
  style?: JSX.CSSProperties
}
```

### `TerminalProps`

```tsx
type TerminalProps = Omit<ComponentProps<'div'>, 'children' | 'style'> & {
  children: JSX.Element[]
  flex?: number
  max?: number
  min?: number
  style?: JSX.CSSProperties
}
```
