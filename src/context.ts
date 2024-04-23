import { Accessor, Setter, createContext, useContext } from 'solid-js'

export type DragContext = {
  dragging: Accessor<boolean>
  setDragging: Setter<boolean>
  overflowing: Accessor<boolean>
  setOverflowing: Setter<boolean>
}
export const dragContext = createContext<DragContext>()
export const useDrag = () => {
  const context = useContext(dragContext)
  if (!context) throw 'useLayout should be used inside a component'
  return context
}
