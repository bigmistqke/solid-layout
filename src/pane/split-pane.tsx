import { minni } from '@bigmistqke/minni'
import clsx from 'clsx'
import {
  Accessor,
  ComponentProps,
  Index,
  Setter,
  Show,
  children,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
} from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'
import { SetStoreFunction, createStore } from 'solid-js/store'
import { Mandatory, Merge } from '../utils'
import { LeafPane } from './leaf-pane'
import { Pane, PaneProps } from './pane'

import styles from './pane.module.css'

export type SplitPaneProps = Merge<
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

export class SplitPane extends Pane {
  element: HTMLElement = null!
  private relativeSize: Accessor<number>
  private setRelativeSize: Setter<number>
  private panelRelativeSizes: number[]
  private setPanelRelativeSizes: SetStoreFunction<number[]>
  private panes: Accessor<Pane[]>
  props: Mandatory<SplitPaneProps, 'flex'>
  totalMin: Accessor<{ width: number; height: number }>

  constructor(props: SplitPaneProps) {
    const config = mergeProps({ flex: 1 }, props)
    super(config)

    this.props = config
    ;[this.panelRelativeSizes, this.setPanelRelativeSizes] = createStore<number[]>([])
    ;[this.relativeSize, this.setRelativeSize] = createSignal(0)

    this.panes = children(() =>
      props.children
        .map(child => {
          if (child instanceof Pane) return child
          console.error('Child is not an instance of Pane')
          return null
        })
        .filter(Boolean),
    ) as unknown as Accessor<Pane[]>

    this.totalMin = createMemo(() => {
      const sum = { width: 0, height: 0 }
      this.panes().forEach(pane => {
        if (pane instanceof SplitPane) {
          const totalMin = pane.totalMin()
          if (this.props.column) {
            sum.width += totalMin.width
            sum.height += Math.max(pane.props.min || 0, totalMin.height)
          } else {
            sum.width += Math.max(pane.props.min || 0, totalMin.width)
            sum.height += totalMin.height
          }
        } else {
          if (this.props.column) {
            sum.height += pane.props.min || 0
          } else {
            sum.width += pane.props.min || 0
          }
        }
      })
      return sum
    })

    createEffect(() => {
      this.panes().forEach(pane => {
        if (pane instanceof LeafPane) {
          pane.setOrientation(props.column ? 'column' : 'row')
        }
      })
    })

    createEffect(this.updateLayout.bind(this))

    createEffect(() => {
      this.panes().forEach((pane, index) => {
        const relativeSize = this.panelRelativeSizes[index]
        if (relativeSize === undefined) {
          console.error('relative size is undefined')
          return
        }
        pane.resize(relativeSize)
      })
    })

    this.element = this.createElement(props)

    // TODO:  find a better way to ensure that layout is updated after initial paint
    const observer = new ResizeObserver(() => {
      this.updateLayout()
      setTimeout(() => observer.disconnect(), 500)
    })
    observer.observe(this.element)
  }

  resize(flex: number): void {
    this.setRelativeSize(flex)
  }

  private createElement() {
    const [props, rest] = splitProps(this.props, [
      'class',
      'style',
      'children',
      'handleClass',
      'handleStyle',
      'min',
      'max',
      'column',
    ])
    return (
      <div
        style={{
          display: 'flex',
          flex: this.relativeSize(),
          'flex-direction': props.column ? 'column' : 'row',
          ['min-height']: props.column
            ? `${Math.max(props.min || 0, this.totalMin().height)}px`
            : `${this.totalMin().height}px`,
          ['min-width']: !props.column
            ? `${Math.max(props.min || 0, this.totalMin().width)}px`
            : `${this.totalMin().width}px`,
          height: '100%',
          'user-select': this.context.dragging() ? 'none' : undefined,
          ...props.style,
        }}
        class={clsx(styles.panel, props.class)}
        {...rest}
      >
        <Index each={this.panes()}>
          {(child, index) => (
            <>
              <Show when={child()}>{child().element}</Show>
              <Show when={index < this.panes().length - 1}>
                <div
                  style={{
                    cursor: props.column ? 'row-resize' : 'col-resize',
                    // flex: `0 5px`,
                    width: props.column ? undefined : '5px',
                    height: props.column ? '5px' : undefined,
                    // 'max-height': props.column ? '5px' : undefined,
                    background: 'grey',
                    ...props.handleStyle,
                  }}
                  class={clsx(styles.handle, props.handleClass)}
                  onMouseDown={event => this.onDrag(event, index)}
                />
              </Show>
            </>
          )}
        </Index>
      </div>
    ) as HTMLElement
  }

  private async onDrag(event: MouseEvent, index: number) {
    const totalSize = this.props.column ? this.element.offsetHeight : this.element.offsetWidth
    const startSizes = this.panelRelativeSizes.map((flex, index) => flex * totalSize)

    this.context.setDragging(true)

    await minni(event, ({ x, y }) => {
      const panes = this.panes()
      const newSizes = [...startSizes]

      const leftPane = panes[index]!
      const leftSize = startSizes[index]!

      const rightPane = panes[index + 1]!
      const rightSize = startSizes[index + 1]!

      let delta = this.props.column ? y : x * -1
      if (index < newSizes.length - 1) {
        // Stop drag from overflowing container
        const absDelta = Math.abs(delta)
        const sizeToCheck = delta > 0 ? leftSize : rightSize
        delta = sizeToCheck <= absDelta ? Math.sign(delta) * sizeToCheck : delta

        if (delta === 0) return

        {
          // Adjust delta to respect min/max-width of left/right container

          const leftMin = leftPane.props.min
          const leftMax = leftPane.props.max
          let sizeReduction = leftMin && leftSize - delta - leftMin
          if (sizeReduction && sizeReduction < 0) {
            delta += sizeReduction // Adjust delta to ensure size is not below minWidth
          }
          // Ensure the leftPane size does not exceed the maxWidth
          let sizeExcess = leftMax && leftSize - delta - leftMax
          if (sizeExcess && sizeExcess > 0) {
            delta += sizeExcess // Adjust delta to ensure size is not above maxWidth
          }

          const rightMin = rightPane.props.min
          const rightMax = rightPane.props.max
          let sizeIncrease = rightMin && rightSize + delta - rightMin
          if (sizeIncrease && sizeIncrease < 0) {
            delta -= sizeIncrease // Adjust delta to ensure size is not below minWidth
          }
          // Ensure the rightPane size does not exceed the maxWidth
          sizeExcess = rightMax && rightSize + delta - rightMax
          if (sizeExcess && sizeExcess > 0) {
            delta -= sizeExcess // Adjust delta to ensure size is not above maxWidth
          }
        }

        newSizes[index] = leftSize - delta // Adjust the leftPane pane
        newSizes[index + 1] = rightSize + delta // Adjust the next pane
      }

      this.setPanelRelativeSizes(newSizes.map(size => Math.min(1, size / totalSize)))
    })
    this.context.setDragging(true)
  }

  private updateLayout() {
    const totalFlex = this.panes().reduce((acc, pane) => acc + pane.props.flex, 0)
    const totalSize = this.props.column ? this.element.offsetHeight : this.element.offsetWidth

    let initialSizes = this.panes().map(pane => {
      const baseSize = (pane.props.flex / totalFlex) * totalSize
      return {
        pane: pane,
        size: baseSize,
        minSize: pane.props.min || 0,
        maxSize: pane.props.max || Infinity,
      }
    })

    // Correct sizes to ensure they are within min and max bounds
    let needAdjustment = true
    while (needAdjustment) {
      needAdjustment = false
      let availableFlex = 0
      let excessSize = 0

      // Determine total excess and available flexibility
      initialSizes.forEach(item => {
        if (item.size < item.minSize) {
          excessSize += item.minSize - item.size
          needAdjustment = true
        } else if (item.size > item.maxSize) {
          excessSize -= item.size - item.maxSize
          needAdjustment = true
        } else {
          availableFlex += item.pane.props.flex // Flex that can be adjusted
        }
      })

      // Redistribute excess size proportionally to available flex
      if (needAdjustment && availableFlex > 0) {
        initialSizes = initialSizes.map(item => {
          if (item.size >= item.minSize && item.size <= item.maxSize) {
            const flexRatio = item.pane.props.flex / availableFlex
            const adjustSize = flexRatio * excessSize
            item.size -= adjustSize
          }
          return item
        })
      }

      // Clamp sizes to min and max after redistribution
      initialSizes = initialSizes.map(item => ({
        ...item,
        size: Math.min(Math.max(item.size, item.minSize), item.maxSize),
      }))
    }

    // Normalize sizes to flex basis
    const totalAdjustedSize = initialSizes.reduce((acc, item) => acc + item.size, 0)
    this.setPanelRelativeSizes(initialSizes.map(item => item.size / totalAdjustedSize))
  }
}
