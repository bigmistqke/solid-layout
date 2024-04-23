import { createSignal, type JSX } from 'solid-js'
import { dragContext } from './context'
import { SplitPane, SplitPaneProps } from './pane/split-pane'
import { TerminalPane, TerminalProps } from './pane/terminal-pane'

export function Layout(props: SplitPaneProps) {
  const [dragging, setDragging] = createSignal(false)
  const [overflowing, setOverflowing] = createSignal(false)

  return (
    <dragContext.Provider
      value={{
        dragging,
        setDragging,
        overflowing,
        setOverflowing,
      }}
    >
      {(() => {
        const pane = new SplitPane(props)
        console.log('pane', pane)
        return pane.element
      })()}
    </dragContext.Provider>
  )
}
Layout.Split = (props: SplitPaneProps) => {
  const pane = new SplitPane(props)
  return pane as unknown as JSX.Element
}

Layout.Terminal = (props: Partial<TerminalProps>) => {
  const pane = new TerminalPane(props)
  return pane as unknown as JSX.Element
}
