import { DragContext, useDrag } from '../context'

export type PaneProps = { flex: number; min?: number; max?: number }

export abstract class Pane {
  context: DragContext
  public constructor(public props: PaneProps) {
    this.context = useDrag()
  }
  abstract element: HTMLElement
  abstract resize(flex: number): void
}
