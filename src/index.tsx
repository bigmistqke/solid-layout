import { createSignal, type JSX } from 'solid-js'
import { dragContext } from './context'
import { LeafPane, LeafProps } from './pane/leaf-pane'
import { SplitPane, SplitPaneProps } from './pane/split-pane'

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
Layout.Split = (props: SplitPaneProps) => new SplitPane(props) as unknown as JSX.Element
Layout.Leaf = (props: LeafProps) => new LeafPane(props) as unknown as JSX.Element
