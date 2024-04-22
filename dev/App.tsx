import { Layout } from '../src/index'

export default function App() {
  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>
      <Layout.Split column style={{ background: 'yellow' }} flex={1}>
        <Layout.Terminal style={{ background: 'purple' }} />
        <Layout.Terminal style={{ background: 'orange' }} />
      </Layout.Split>
      <Layout.Terminal style={{ background: 'red' }} />
      <Layout.Terminal style={{ background: 'green' }} />
      <Layout.Split column style={{ background: 'yellow' }} flex={0.2}>
        <Layout.Split column style={{ background: 'yellow' }} flex={1}>
          <Layout.Terminal style={{ background: 'purple' }} />
          <Layout.Terminal style={{ background: 'orange' }} />
        </Layout.Split>
        <Layout.Terminal style={{ background: 'purple' }} />
        <Layout.Terminal style={{ background: 'orange' }} />
      </Layout.Split>
      <Layout.Split style={{ background: 'yellow' }}>
        <Layout.Terminal style={{ background: 'purple' }} />
        <Layout.Terminal style={{ background: 'pink' }} />
        <Layout.Split column style={{ background: 'yellow' }}>
          <Layout.Terminal style={{ background: 'grey' }} />
          <Layout.Terminal flex={0.5} style={{ background: 'mint' }} />
        </Layout.Split>
      </Layout.Split>
    </Layout>
  )
}
