import clsx from 'clsx'
import { Accessor, ComponentProps, Setter, createSignal, mergeProps, splitProps } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { Mandatory, Merge } from '../utils'
import { Pane } from './pane'
import { SplitPaneProps } from './split-pane'

import styles from './pane.module.css'

export type TerminalProps = Merge<
  ComponentProps<'div'>,
  Partial<
    SplitPaneProps & {
      style: JSX.CSSProperties
    }
  >
>

export class TerminalPane extends Pane {
  element: HTMLElement = null!
  private relativeSize: () => number
  private setRelativeSize: (f: number) => void
  private orientation: Accessor<'column' | 'row' | undefined>
  setOrientation: Setter<'column' | 'row'>
  props: Mandatory<TerminalProps, 'flex'>

  constructor(props: TerminalProps) {
    const config = mergeProps({ flex: 1 }, props)
    super(config)
    this.props = config
    ;[this.relativeSize, this.setRelativeSize] = createSignal(0)
    ;[this.orientation, this.setOrientation] = createSignal<'column' | 'row'>()
    this.element = this.createElement()
  }

  resize(newFlex: number): void {
    this.setRelativeSize(newFlex)
  }

  private createElement() {
    const [props, rest] = splitProps(this.props, ['class', 'style', 'children', 'min', 'max'])
    return (
      <div
        class={clsx(styles.pane, props.class)}
        style={{
          'user-select': this.context.dragging() ? 'none' : undefined,
          ['min-height']: this.orientation() === 'column' ? `${props.min}px` : undefined,
          ['min-width']: this.orientation() === 'row' ? `${props.min}px` : undefined,
          ['max-height']: this.orientation() === 'column' ? `${props.max}px` : undefined,
          ['max-width']: this.orientation() === 'row' ? `${props.max}px` : undefined,
          flex: this.relativeSize().toString(),
          ...props.style,
        }}
        {...rest}
      >
        {props.children}
      </div>
    ) as HTMLElement
  }
}
