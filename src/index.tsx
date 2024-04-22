import { minni } from '@bigmistqke/minni'
import clsx from 'clsx'
import {
  ComponentProps,
  Index,
  Show,
  children,
  createContext,
  createEffect,
  createSignal,
  mergeProps,
  splitProps,
  useContext,
  type Accessor,
  type JSX,
  type Setter,
} from 'solid-js'
import { SetStoreFunction, createStore } from 'solid-js/store'

import styles from './layout.module.css'

type Merge<T, U> = Omit<T, keyof U> & U
export type Mandatory<TTarget, TKeys extends keyof TTarget> = Required<Pick<TTarget, TKeys>> &
  Omit<TTarget, TKeys>

type PaneProps = { flex: number }
abstract class Pane {
  context: DragContext
  public constructor(public props: PaneProps) {
    this.context = useDrag()
  }
  abstract element: HTMLElement
  abstract resize(flex: number): void
}

type TerminalProps = Merge<
  ComponentProps<'div'>,
  Partial<
    PaneProps & {
      style: JSX.CSSProperties
    }
  >
>

class TerminalPane extends Pane {
  element: HTMLElement = null!
  private relativeSize: () => number
  private setRelativeSize: (f: number) => void
  props: Mandatory<TerminalProps, 'flex'>

  constructor(props: TerminalProps) {
    const config = mergeProps({ flex: 1 }, props)
    super(config)
    this.props = config
    ;[this.relativeSize, this.setRelativeSize] = createSignal(0)
    this.init()
  }

  resize(newFlex: number): void {
    this.setRelativeSize(newFlex)
  }

  private init() {
    const [, rest] = splitProps(this.props, ['class', 'style', 'children'])
    this.element = (
      <div
        class={clsx(styles.pane, this.props.class)}
        style={{
          'user-select': this.context.dragging() ? 'none' : undefined,
          flex: this.relativeSize().toString(),
          ...this.props.style,
        }}
        {...rest}
      >
        {this.props.children}
      </div>
    ) as HTMLElement
  }
}

type SplitPaneProps = Merge<
  ComponentProps<'div'>,
  { children: JSX.Element[]; style?: JSX.CSSProperties }
> &
  Partial<
    PaneProps & {
      column: boolean
      handleStyle: JSX.CSSProperties
      handleClass: string
    }
  >

class SplitPane extends Pane {
  element: HTMLElement = null!
  private relativeSize: Accessor<number>
  private setRelativeSize: Setter<number>
  private panelRelativeSizes: number[]
  private setPanelRelativeSizes: SetStoreFunction<number[]>
  private children: Accessor<Pane[]>
  props: Mandatory<SplitPaneProps, 'flex'>

  constructor(props: SplitPaneProps) {
    const config = mergeProps({ flex: 1 }, props)
    super(config)

    this.props = config
    ;[this.panelRelativeSizes, this.setPanelRelativeSizes] = createStore<number[]>([])
    ;[this.relativeSize, this.setRelativeSize] = createSignal(0)

    this.children = children(() =>
      props.children
        .map(child => {
          if (child instanceof Pane) return child
          console.error('Child is not an instance of Pane')
          return null
        })
        .filter(Boolean),
    ) as unknown as Accessor<Pane[]>

    this.init(props)

    createEffect(() => {
      this.setPanelRelativeSizes(() => {
        let total = 0
        this.children().forEach(a => (total += a.props.flex))
        return this.children().map(child => child.props.flex / total)
      })
    })

    createEffect(() => {
      this.children().forEach((pane, index) => {
        const relativeSize = this.panelRelativeSizes[index]
        if (relativeSize === undefined) {
          console.error('relative size is undefined')
          return
        }
        if (relativeSize <= 0) {
          console.log('IS 0')
          useDrag().setOverflowing(true)
        }
        pane.resize(relativeSize)
      })
    })
  }

  resize(flex: number): void {
    this.setRelativeSize(flex)
  }

  private init(props: SplitPaneProps) {
    const [, rest] = splitProps(props, ['class', 'style', 'children'])
    this.element = (
      <div
        style={{
          display: 'flex',
          flex: this.relativeSize(),
          'flex-direction': props.column ? 'column' : 'row',
          height: '100%',
          'user-select': this.context.dragging() ? 'none' : undefined,
          ...props.style,
        }}
        class={clsx(styles.panel, props.class)}
        {...rest}
      >
        <Index each={this.children()}>
          {(child, index) => {
            return (
              <>
                <Show when={child()}>{child().element}</Show>
                <Show when={index < this.children().length - 1}>
                  <div
                    style={{
                      cursor: props.column ? 'row-resize' : 'col-resize',
                      flex: `0 5px`,
                      /* width: props.column ? undefined : '5px',
                      height: props.column ? '5px' : undefined, */
                      // 'max-height': props.column ? '5px' : undefined,
                      background: 'grey',
                      ...props.handleStyle,
                    }}
                    class={clsx(styles.handle, props.handleClass)}
                    onMouseDown={event => this.onHandleDown(event, index)}
                  />
                </Show>
              </>
            )
          }}
        </Index>
      </div>
    ) as HTMLElement
  }

  private async onHandleDown(event: MouseEvent, index: number) {
    const totalSize = this.props.column ? this.element.offsetHeight : this.element.offsetWidth
    const startSizes = this.panelRelativeSizes.map(
      (flex, index) =>
        flex * totalSize /* + (index < this.panelRelativeSizes.length - 1 ? 3 : 0) */,
    )
    this.context.setDragging(true)
    await minni(event, ({ x, y }) => {
      const newSizes = [...startSizes]

      let delta = this.props.column ? y : x * -1
      if (index < newSizes.length - 1) {
        // Stop drag from overflowing container
        const absDelta = Math.abs(delta)
        const sizeToCheck = delta > 0 ? newSizes[index]! : newSizes[index + 1]!
        delta = sizeToCheck <= absDelta ? Math.sign(delta) * sizeToCheck : delta

        if (delta === 0) return

        newSizes[index] = newSizes[index]! - delta // Adjust the current pane
        newSizes[index + 1] = newSizes[index + 1]! + delta // Adjust the next pane
      }
      this.setPanelRelativeSizes(newSizes.map(size => Math.min(1, size / totalSize)))
    })
    this.context.setDragging(true)
  }
}

type DragContext = {
  dragging: Accessor<boolean>
  setDragging: Setter<boolean>
  overflowing: Accessor<boolean>
  setOverflowing: Setter<boolean>
}
const dragContext = createContext<DragContext>()
const useDrag = () => {
  const context = useContext(dragContext)
  if (!context) throw 'useLayout should be used inside a component'
  return context
}

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
