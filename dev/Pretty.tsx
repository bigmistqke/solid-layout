import { untrack } from 'solid-js/web'
import { Layout } from '../src'

import styles from './Pretty.module.css'

const coinFlip = (chance = 0.5) => Math.random() > chance

const color = () => `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
const gradient = () => `linear-gradient(${Math.random() * 360}deg, ${color()}, ${color()})`
type Leaf = { type: 'Leaf'; background: string }
type Split = {
  type: 'Split'
  children: (Split | Leaf)[]
  column: boolean
  handleColor: string
}

const createRandomPaneData = () =>
  (coinFlip(0.8)
    ? (() => {
        const column = coinFlip(0.2)
        return {
          type: 'Split',
          children: [],
          column,
          handleColor: gradient(),
        }
      })()
    : {
        type: 'Leaf',
        background: gradient(),
      }) satisfies Split | Leaf

const createRandomLayoutData = () => {
  const recurse = (object: Split, depth: number) => {
    if (depth > 10 || (depth > 5 && coinFlip(0.8))) return object

    const length = Math.floor(Math.random() * 5 + 2)
    for (let i = 0; i < length; i++) {
      const pane = createRandomPaneData()
      object.children.push(pane)
      if (pane.type === 'Split') {
        recurse(pane, depth + 1)
      }
    }

    return object
  }
  const length = Math.floor(Math.random() * 10 + 2)
  return Array.from({ length }).map(() =>
    recurse(
      {
        type: 'Split',
        children: [],
        column: coinFlip(0.2),
        handleColor: gradient(),
      },
      0,
    ),
  )
}

const createRandomLayout = (data: ReturnType<typeof createRandomLayoutData>) => {
  const animTime = `${Math.floor(Math.random() * 10 + 10)}s`
  const dataToComponent = (data: Leaf | Split) =>
    data.type === 'Leaf' ? (
      <Layout.Leaf
        style={{
          background: data.background,
          '--anim-time': animTime,
        }}
        class={styles.pane}
      />
    ) : (
      <Layout.Split
        handleStyle={{ background: data.handleColor }}
        style={{ '--anim-time': animTime }}
        children={data.children.map(child => dataToComponent(child))}
        column={data.column}
        class={styles.pane}
      />
    )
  return data.map(data => dataToComponent(data))
}

export default function App() {
  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      {untrack(() => createRandomLayout(createRandomLayoutData()))}
    </Layout>
  )
}
