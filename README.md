<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=@bigmistqke/solid-layout&background=tiles&project=%20" alt="@bigmistqke/solid-layout">
</p>

# @bigmistqke/solid-layout

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

Side/Terminal Layout Manager for SolidJS

> **Note** After using this template, you have to search and replace all `@bigmistqke/solid-layout` and similar strings
> with appropriate texts.
>
> `@bigmistqke/solid-layout` should be a **kebab-case** string representing the name of you monorepo.
>
> `Side/Terminal Layout Manager for SolidJS` should be a **Normal case** string with the description of the repository.
>
> `@bigmistqke` should be a **kebab-case** string from your profile URL.

## Quick start

Install it:

```bash
npm i @bigmistqke/solid-layout
# or
yarn add @bigmistqke/solid-layout
# or
pnpm add @bigmistqke/solid-layout
```

Use it:

```tsx
import @bigmistqke/solid-layout from '@bigmistqke/solid-layout'

export const App = () => (
  <Layout style={{ height: '100vh', width: '100vw' }}>
    <Layout.Split column >
      <Layout.Terminal flex={0.2}/>
      <Layout.Terminal />
    </Layout.Split>
    <Layout.Split >
      <Layout.Terminal style={{ background: 'red' }}/>
      <Layout.Terminal style={{ background: 'blue' }}/>
    </Layout.Split>
  </Layout>
)
```
