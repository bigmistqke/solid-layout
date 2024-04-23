import { Layout } from '../src'

export default function App() {
  console.log('App')
  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      <Layout.Split column style={{ background: 'yellow' }}>
        <Layout.Split column style={{ background: 'yellow' }}>
          <Layout.Leaf style={{ background: 'red' }} />
          <Layout.Leaf style={{ background: 'green' }} />
          <Layout.Leaf style={{ background: 'green' }} />
        </Layout.Split>
        <Layout.Leaf style={{ background: 'red' }} />
        <Layout.Leaf style={{ background: 'green' }} />
        <Layout.Leaf style={{ background: 'green' }} />
      </Layout.Split>
      <Layout.Leaf style={{ background: 'red' }} />
      <Layout.Leaf style={{ background: 'green' }} />
      <Layout.Leaf style={{ background: 'green' }} />
    </Layout>
  )
}
