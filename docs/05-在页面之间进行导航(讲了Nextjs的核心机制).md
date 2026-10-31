# Chapter 5 — Navigating Between Pages

## 1. 本章学习目标

本章要解决两个相互关联的问题：

1. **导航问题**： 用户从 Dashboard 的一个页面进入另一个页面时，如何避免传统浏览器导航带来的完整页面刷新？
2. **导航状态问题**： 用户进入不同页面后，如何让侧边栏自动标识当前所在的页面？

围绕这两个问题，Next.js 提供了两组核心能力：

| 能力         | API / 机制      | 作用                       |
| ------------ | --------------- | -------------------------- |
| 页面导航     | `next/link`     | 在应用内部实现客户端导航   |
| 路由状态读取 | `usePathname()` | 获取当前 URL 的 pathname   |
| 条件样式     | `clsx`          | 根据路由状态决定 CSS class |
| 导航性能     | Code Splitting  | 减少初始加载的代码量       |
| 导航性能     | Prefetching     | 提前获取可能访问的路由资源 |

本章的核心逻辑：

![image-20261030205307859](./05-在页面之间进行导航(讲了Nextjs的核心机制).assets/image-20261030205307859.png)

学习边界： 主要研究 App Router 的公开机制、组件职责和典型执行过程，不把 Next.js 未公开的内部实现细节当成稳定 API。

---

## 2. 页面导航的基本问题：为什么需要客户端导航？

### 2.1 HTML `<a>` 的传统导航行为

在 HTML 中，`<a>` 是创建超链接的标准元素。

```html
<a href="/dashboard/invoices">
  Invoices
</a>
```

用户点击链接后，浏览器会根据 `href` 导航到目标 URL。在传统的完整页面导航中，浏览器会向服务器请求新页面，并加载新的文档。

大致过程：

```
用户点击 <a>
     │
     ▼
浏览器发起页面请求
     │
     ▼
服务器返回目标页面
     │
     ▼
浏览器加载新文档
     │
     ▼
重新解析 HTML、加载资源、执行 JavaScript
     │
     ▼
目标页面显示
```

这属于一次完整的**文档导航（Full Page Navigation）**。

每次点击链接跳转时，**浏览器都会进行整页刷新（Full page refresh）**！

它不意味着浏览器会重新下载所有资源——浏览器仍然可能利用 HTTP 缓存。但整个文档会发生导航和重新加载。

---

### 2.2 完整页面导航有什么问题？

对于一个包含多个页面的 Dashboard：

```
/dashboard
/dashboard/invoices
/dashboard/customers
```

如果每次都使用传统的完整页面导航，就可能造成：

- 当前文档被新的文档替换。
- 页面中的客户端运行状态需要重新建立。
- React 组件树需要重新初始化。
- 共享界面可能重复加载和渲染。
- 用户感受到明显的页面切换过程。

因此，对于应用内部的路由导航，**更理想的做法是保留应用中可以复用的部分，只更新需要变化的内容**。这就是客户端导航要解决的问题。

**理解重点**： **完整页面导航**和**客户端导航**的区别，不是简单的「有没有网络请求」，而是**是否进行了完整的浏览器文档导航**。

Next.js 的客户端导航仍然可能向服务器请求数据和页面所需的资源。**它只是避免了每次导航都重新加载整个 HTML 文档**。

---

### 2.3 Next.js 的解决方向：客户端导航

Next.js 提供了 `<Link>` 组件，**使应用内部的路由切换**不必通过完整页面导航完成。

它带来的主要变化：

```
传统导航：

点击链接
   ↓
浏览器加载新文档
   ↓
原来的 React 应用被替换
   ↓
重新建立页面
```

```
Next.js 客户端导航：

点击 <Link>
   ↓
Next.js 执行客户端路由切换
   ↓
保留共享 Layout
   ↓
更新目标页面
   ↓
继续使用已有的客户端应用
```

客户端导航不意味着整个页面完全不重新渲染，而是避免重新加载整个浏览器文档。即页面切换的范围从「替换整个文档」变成了「在现有应用中更新路由对应的 UI」。

---

## 3. `next/link`：Next.js 的导航组件

### 3.1 什么是 `<Link>`？（课程实践）

在 Next.js 中，你可以使用 `<Link/>` 组件来实现**应用内的页面互联**。`<Link>` 允许通过 JavaScript 在客户端进行无刷新的**客户端导航（[Client-side navigation](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#how-routing-and-navigation-works)）**。

打开 `/app/ui/dashboard/nav-links.tsx` 文件，从 `next/link` 导入 `Link` 组件，并将原有的 `<a>` 标签替换为 `<Link>`：

```tsx
"use client";

import { Files, Home, UserGroup } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Home", href: "/dashboard", icon: Home },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: Files,
  },
  { name: "Customers", href: "/dashboard/customers", icon: UserGroup },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "group flex h-[48px] grow items-center justify-center gap-3 rounded-lg p-3 text-sm font-medium transition-all duration-200 md:flex-none md:justify-start md:px-4",
              isActive
                ? "bg-blue-50 font-semibold text-blue-600 shadow-xs"
                : "bg-gray-50 text-gray-700 hover:bg-blue-50/80 hover:text-blue-600 hover:shadow-xs",
            )}
          >
            <LinkIcon
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 group-hover:text-blue-600",
              )}
            />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
```

---

### 3.2 `<Link>` 与 `<a>` 的关系

这里有一个重要的技术细节：`<Link>` 不是完全独立于 HTML 超链接体系的另一种元素。

官方定义： `<Link>` 是一个扩展 HTML `<a>` 元素的 React Component，增加了客户端导航和预取能力。

可以这样理解：

| HTML `<a>`                |      |      | Next.js `<Link>`       |
| ------------------------- | ---- | ---- | ---------------------- |
| 浏览器原生超链接          |      |      | Next.js React 组件     |
| 提供 `href` 导航          |      |      | 提供 `href` 导航       |
| 默认使用浏览器导航行为    |      |      | 支持客户端路由切换     |
| 没有 Next.js 路由预取机制 |      |      | 集成自动 Prefetching   |
| 支持原生链接属性          |      |      | 继承并传递相关链接属性 |

例如，下面这种写法仍然有效：

```tsx
<Link
  href="/dashboard/invoices"
  className="text-blue-600"
  target="_self"
>
  Invoices
</Link>
```

`className`、`target` 等 `<a>` 属性可以传递给底层的 HTML 超链接。因此，教程虽然要求将 `<a>` 替换成 `<Link>`，但并没有丢弃 HTML 超链接本身的语义。

---

### 3.3 `<Link>` 的核心职责

可以把 `<Link>` 理解为 Next.js 导航体系的入口。

它主要承担两项职责：

1. Client-side Navigation：用户点击应用内部的链接时，执行客户端路由切换，而不是直接重新加载整个文档。
2. Prefetching：当链接进入浏览器视口时，在生产环境中自动预取目标路由所需的资源。

需要区分：

- `<Link>` 是实现导航的组件。
- Next.js Router 负责管理路由切换。
- Prefetching 是 Next.js 提供的导航性能优化机制。

`<Link>` 并不是一个负责把所有页面内容直接加载到浏览器的组件。

---

### 3.4 为什么推荐使用 `<Link>`？

对于应用内部的页面导航，Next.js 官方推荐优先使用 `<Link>`。它集成了框架的路由能力，不需要开发者手动通过普通 `<a>` 实现整套客户端导航。

但这不意味着 HTML `<a>` 已经过时。普通外部链接、下载链接等场景仍然可以使用 `<a>`。

---

## 4. Next.js 导航的运行机制

这是本章最重要的原理部分。如果只记住 `<Link>` 的写法，就只是掌握了 API。真正需要理解的是：Next.js 如何在页面内容依然可能由服务器生成的情况下，实现不刷新整个文档的页面导航？

要理解这个问题，需要认识三个概念：

1. Route Segment。
2. React Server Components（RSC）。
3. Client-side Transitions。

---

### 4.1 Route Segment：路由分段

在 App Router 中，路由由 `app` 目录下的文件结构定义。

例如：

```
app/
├── layout.tsx
├── page.tsx
└── dashboard/
    ├── layout.tsx
    ├── page.tsx
    ├── invoices/
    │   └── page.tsx
    └── customers/
        └── page.tsx
```

每一个路由层级都可以形成一个 Route Segment。例如：

```
/dashboard/invoices
     │         │
     ▼         ▼
 dashboard   invoices
  Segment     Segment
```

不同路由可以拥有独立的页面内容，同时共享其共同的 Layout。当用户在 Invoices 和 Customers 之间切换：

- Root Layout 可以继续复用。
- Dashboard Layout 可以继续复用。
- 主要变化的是下面的 Page。

这就避免了每一次切换都重新建立整个页面结构。

---

### 4.2 React Server Components（RSC）

Next.js App Router 默认使用 Server Components。

需要注意：Server Component 并不意味着页面不能在客户端发生切换。

服务器组件**描述的是组件的执行和渲染方式**，不意味着整个路由都必须通过浏览器完整刷新才能显示。

为了让服务器生成的页面内容参与客户端导航，Next.js 使用了 React Server Component Payload，简称 RSC Payload。

RSC Payload 可以理解为：

> 服务器将 Server Component 渲染结果序列化（一种特殊的序列化二进制 / 文本流，不是普通 JSON）后，发送给客户端用于更新 React 组件树的数据载荷。

它包含：

1. Server Components 的渲染结果：静态节点（文本、标签，直接上 DOM）
2. 客户端组件占位标记：`$$id`、chunk 地址、序列化好的 props
3. Suspense 边界、错误边界、Server Action 引用等元信息

浏览器（客户端）拿到这个流，**由 React 内置的 RSC 解析器（在 react-client 包里面）逐块消费 Payload**：

- 遇到静态内容：直接构建 Fiber 节点，生成 DOM；
- 遇到 Client Component 占位：记录下来，异步去加载对应的 `.js` chunk；等 chunk 加载完成，再实例化这个客户端组件、做 hydration，绑定事件、状态、effect；
- Server Component 的代码**永远不会到浏览器**，客户端只能看到它输出的 UI 描述，不能再执行它。

---

#### 初次访问页面时发生什么？

以首次打开 `/dashboard` 为例：

```
浏览器请求 /dashboard
          │
          ▼
Next.js 在服务器端执行相关渲染
          │
          ├── 生成 HTML
          │
          └── 生成 RSC Payload
                    │
                    ▼
              返回浏览器
                    │
           ┌────────┴─────────┐
           ▼                  ▼
       HTML 显示          RSC Payload
       页面内容            协调组件树
                              │
                              ▼
                         Client Component
                              │
                              ▼
                           Hydration
                              │
                              ▼
                         页面获得交互能力
```

这里有两个重要过程：

1. HTML Rendering：服务器生成 HTML，浏览器可以较早显示页面内容。
2. Hydration：React 将客户端 JavaScript 与已经存在的 HTML 关联起来，建立事件处理等交互能力。

注意：Hydration 并不是重新生成整个 HTML 文档，**而是让已经生成的页面具备交互能力**。

---

### 4.3 后续路由导航发生什么？

现在用户已经处于 `/dashboard`，点击：

```
<Link href="/dashboard/invoices">
  Invoices
</Link>
```

这时不需要重新加载整个浏览器文档。后续导航大致是：

```
用户点击 <Link>
       │
       ▼
Next.js 客户端路由开始导航
       │
       ▼
检查目标路由是否有可复用的预取结果
       │
       ├── 有：使用已有的 RSC Payload
       │
       └── 无：向服务器请求需要的路由内容
                    │
                    ▼
              获取 RSC Payload
                    │
                    ▼
             React 协调组件树
                    │
                    ▼
             保留共享 Layout
                    │
                    ▼
             更新目标 Page
                    │
                    ▼
              新页面显示
```

这是一个概念流程图，并不代表 Next.js 所有路由都严格执行相同的网络请求顺序。是否需要服务器请求取决于缓存、预取结果以及路由的渲染方式。

官方文档明确说明：

- 后续导航时，Next.js 可以使用预取并缓存的 RSC Payload。
- 共享 Layout 可以在客户端导航过程中保留。
- 目标 Page 会替换为新页面内容。
- Client Components 在后续导航中可以直接在客户端渲染，不需要重新获取服务端 HTML。

> 参考：[Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components?utm_source=chatgpt.com) 与 [Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating?utm_source=chatgpt.com)

---

### 4.4 为什么页面没有完整刷新？

现在可以准确理解本章最核心的问题了。不是因为 Next.js 不需要服务器，也不是因为页面切换完全不涉及网络。

而是因为：

1. Next.js 使用客户端 Router 管理应用内部导航。
2. 服务器可以通过 RSC Payload 提供目标路由的渲染结果。
3. React 根据新的路由数据更新组件树。
4. 共享 Layout 得以复用。
5. 浏览器不必重新加载整个 HTML 文档。

**核心心智模型**：Next.js App Router 是一种**结合服务器渲染和客户端导航的架构**。它**既能够利用服务器生成页面内容，又能够通过客户端路由切换保留应用的持续运行状态**。

---

## 5. 导航性能优化：Code Splitting 与 Prefetching

原文接下来解释两个机制，说明为什么 Next.js 的导航体验可以很快。

为了优化导航体验，Next.js 会**按照路由段（Route Segments）自动对应用进行代码分割（Code Splitting）**。这与传统 React [SPA](https://nextjs.org/docs/app/building-your-application/upgrading/single-page-applications)（单页应用在首次访问时就必须把整个应用的所有代码一次性载入）有本质区别：

- **路由级隔离**：按路由分割代码意味着每个页面都是相互独立的。如果某个特定页面抛出异常报错，应用的其余部分仍然可以正常运行。
- **更小的解析体积**：浏览器每次只需下载并解析当前页面所需的最少代码，显著加快加载性能。

**视口内自动预取（Prefetching）**：在生产环境（Production）下，只要 `<Link>` 组件**出现在浏览器的视口（Viewport）内**，Next.js 就会自动在后台静默**预取**该目标路由的代码。当用户实际点击链接时，目标页面的静态资源早已在后台下载完成，从而实现近乎瞬时的页面切换。

这两个概念必须分别理解。

---

### 5.1 自动代码分割（核心机制）

定义：**Code Splitting（代码分割）是将应用代码拆分成多个较小的代码块（Chunks），而不是将所有代码都集中在一个初始 JavaScript 包中**。

例如一个应用有三个页面：

```
Application
   ├── Dashboard
   ├── Invoices
   └── Customers
```

如果应用需要加载所有页面的客户端 JavaScript 才能开始工作，那么初始加载就可能需要下载大量代码（这是 React 这种单页面应用必须做的）。

Next.js 采用路由级代码分割后，可以形成类似：

```
Application
   ├── Shared Chunks
   ├── Dashboard Chunks
   ├── Invoices Chunks
   └── Customers Chunks
```

当用户访问某个路由时，只需要加载当前页面所需的代码及其依赖，而不必一次性下载所有路由对应的客户端代码。

为什么这样更快？减少初始加载的 JavaScript 代码量，可以降低下载与执行的负担。这对大型应用尤其重要。

---

### 5.2 Next.js 如何实现代码分割与复用？⭐⭐

Next.js 实现上述代码分割与复用的底层核心，是**在构建阶段同时维护两张模块依赖图（Server Graph 与 Client Graph）**，并通过 **RSC Payload（模块引用清单）** 在运行时按路由段动态拼装共享的 Chunks。

要彻底把这段结论串起来，我们需要先把概念关系的骨架理清，再拆解从**编译期**到**运行期**的完整转换链路。

#### 5.2.1 核心逻辑骨架

```
问题 (Problem)
  如果把整个应用打包成一个 JS，首屏太慢；如果每个页面各自打包一份独立 JS，共享库会被重复下载。
  ↓
约束 (Constraints)
  1. Server Component 绝不能进入客户端 JS Bundle（零客户端体积）。
  2. 嵌套路由切换时，父级 Layout 不能重新加载，只加载变化的子 Route Segment。
  ↓
核心机制 (Mechanism)
  1. 边界切分：以 'use client' 为分界线，将 Server Graph 中的客户端组件替换为“模块引用 (Module Reference)”。
  2. 多入口构建：把每个 Route Segment (layout/page) 作为独立入口收集 Client 引用，再通过 Bundler 的 Chunk Splitting 算法提取公共依赖。
  ↓
结果 (Consequence)
  路由不再对应“单个 JS 文件”，而是对应“一组 Chunk 的组合清单（Manifest）”。
```

---

#### 5.2.2 机制拆解：从源码到浏览器的四步转换

下面我们按 `输入 → 转换 → 中间状态 → 输出` 的过程，看 Next.js 究竟是如何做到的。

**（1）识别 `'use client'` 边界，一分为二（编译期）**

当 Next.js 编译器（SWC）结合打包器（Webpack 或 Turbopack）扫描源码时，它默认所有组件都是 Server Component。

- **输入**：包含 `layout.tsx`、`page.tsx`（Server）以及交互组件 `Button.tsx`（带有 `'use client'`）的源码树。
- **转换**：当编译器在 Server Component 中遇到 `import Button from './Button'`，且发现 `Button.tsx` 顶部有 `'use client'` 指令时，它会在此处**切断服务端依赖图**。
- **中间状态**：
  - **Server Bundle**：保留 Server Component 的执行逻辑，但把 `Button` 的具体代码删掉，替换为一个**模块引用占位符（Module Reference）**——本质上是一段元数据，比如 `{ id: "chunk-button-123", name: "Button", chunks: ["static/chunks/app/button.js"] }`。
  - **Client Graph**：把 `Button.tsx` 及其后续 `import` 的所有模块，作为客户端打包的入口节点（Entry Point）收集起来。

> [!note]
>
> **为什么这样设计？** 
>
> 因为 Server Component 在服务端运行后直接输出虚拟 DOM 描述，浏览器不需要知道它是怎么算出来的；浏览器只需要知道：“当渲染到这个位置时，去下载 `chunk-button-123` 并在客户端挂载（Hydrate）它”。



**（2）以 Route Segment 为单位建立入口（构建期）**

为什么教程强调是按 **Route Segment（路由段）** 而不是按“完整页面（Page）”分割？

在 App Router 中，一个 URL 路径 `/dashboard/settings` 对应的是嵌套的路由段结构：

1. `app/layout.tsx`（根路由段）
2. `app/dashboard/layout.tsx`（父路由段）
3. `app/dashboard/settings/page.tsx`（叶路由段）

- **机制**：Next.js 在构建时，会将每一个路由段（每个 `layout`、`page`、`loading`、`error`）视为一个独立的构建单元，分别统计该路由段内部直接引用了哪些 `'use client'` 组件。
- **意义**：当用户从 `/dashboard/analytics` 切换到 `/dashboard/settings` 时，前两个路由段（根 Layout 和 `/dashboard` Layout）已经加载过了，Next.js 只需要请求 `settings/page.tsx` 这一小段新增的客户端 JS 资源。



**（3）基于模块依赖关系的 Chunk 拆分与复用（构建优化）**

如果 `/dashboard` 和 `/profile` 两个路由里的 Client Component 都引入了同一个体积庞大的图表库 `Chart.js` 或 UI 组件库，Next.js 是如何避免重复打包的？

这就涉及你提到的最后两句话：**“共享代码可以由不同路由复用，实际 Bundle 的组织粒度取决于模块依赖关系和构建优化。”**

打包器（Webpack `SplitChunksPlugin` 或 Turbopack 的 Chunking 算法）在拿到所有路由段的 Client 入口后，会做一张全局的**模块-路由引用矩阵**，把客户端代码拆分成不同层级的 Chunk：

| **Chunk 类型**              | **包含内容**                                                 | **复用范围与加载时机**                                       |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Framework / Main Chunks** | `react`、`react-dom`、`next/router` 及 RSC 运行时解析器      | 全局所有路由强制共享，首屏加载后永久驻留缓存                 |
| **Shared Chunks (公共块)**  | 被 $\ge 2$ 个路由段同时引用的第三方库（`node_modules`）或公共业务 Client 组件 | 仅当访问到依赖它的路由时按需下载；跨路由切换时直接复用浏览器内存/缓存 |
| **Segment-Specific Chunks** | 仅被某一个特定 `page.tsx` 或 `layout.tsx` 独享的 Client Component 代码 | 只有进入该具体路由段时才下载                                 |

> **关键推论（解释你的核心结论）：** 
>
> 经过这一步后，`/dashboard/page` 对应的不再是一个名为 `dashboard.js` 的大文件，而在构建产物里的 `client-reference-manifest.json`（客户端引用清单）中，被映射成了一个列表：
>
> -  `[/dashboard/page] -> [framework.js, shared-chart-lib.js, dashboard-page-client.js]` 
> - 而另一个页面可能映射为： `[/profile/page] -> [framework.js, shared-chart-lib.js, profile-page-client.js]`



**（4）运行时的 RSC Payload 驱动按需加载（运行期）**

构建完成后，用户访问或切换路由时，前后端如何配合把这些碎片拼起来？

1. **请求路由**：用户在浏览器点击 `<Link href="/dashboard">`。
2. **服务端执行 Server Component**：服务器直接运行 `/dashboard` 路由段的 Server Component 代码（此时涉及的数据库查询、服务端工具库如 `marked`、`date-fns` 完全在内存里跑完，**0 字节 JS 下发给浏览器**）。
3. **生成并流式下发 RSC Payload**：服务器将渲染结果序列化为一种特殊的流格式（Flight 格式）。遇到 Server Component 就直接输出生成的 HTML/虚拟节点结构；遇到第一步留下的 **Client Component 占位符**，就在流里写下一条指令： *“此处需要渲染 Client 组件 `Chart`，请浏览器去加载 `shared-chart-lib.js` 和 `dashboard-page-client.js`。”*
4. **客户端按清单拉取与复用**：浏览器的 Next.js Runtime 解析这段 RSC Payload，检查需要加载的 Chunk 列表：
   - 发现 `framework.js` 已经在内存里了 $\rightarrow$ **跳过**；
   - 发现 `shared-chart-lib.js` 在上一个页面加载过了 $\rightarrow$ **直接复用**；
   - 发现 `dashboard-page-client.js` 还没加载 $\rightarrow$ **发起网络请求拉取该 JS 文件**，执行并完成该局部组件的 Hydration。

---

#### 5.2.3 检验一下当前的心智模型（这个思考题不错的）

为了确认这套机制在你脑中已经闭环，你可以试着根据上面的原理推导下面这个场景：

**思考题：** 假设我们有两个路由：`/a` 和 `/b`。

- `/a/page.tsx` 是一个 **Server Component**，它 `import` 了一个工具库 `utils.js`（纯函数，无 `'use client'`）。
- `/b/page.tsx` 引入了一个 **Client Component** `ClientBox.tsx`（有 `'use client'`），而 `ClientBox.tsx` 也 `import` 了同一个 `utils.js`。

请问：

1. `utils.js` 会进入客户端的 JS Bundle 吗？
2. 当用户只访问 `/a` 页面时，浏览器会下载包含 `utils.js` 的客户端 Chunk 吗？为什么？

回答：

1. 会
2. 不会（前提是 `utils.js` 位于一个本次请求中**未被激活**的客户端边界内，且它是通过动态导入引入的）。构建时按路由分割代码，只是“准备了”包含 `utils.js` 的 Chunk；实际下载由 RSC Payload 中的客户端模块引用触发。如果 `/a` 的服务端渲染没有产生指向该模块的引用，浏览器就不会请求这个 Chunk，也不会对它进行水合。但如果 `utils.js` 是被某个已渲染的父级客户端组件**静态导入**的，它会被打包进上游 Chunk 一并下发，即使本次渲染没有直接使用它。

**核心结论**是：浏览器是否下载 `utils.js` 的客户端 Chunk，取决于它在 RSC Payload 中**是否被引用**，而不仅仅是构建时是否做了代码分割。

更准确地说：如果 `/a` 页面在服务端渲染时**没有激活**包含 `utils.js` 的那个 `"use client"` 边界，RSC Payload 中就不会出现对应的**客户端模块引用**；浏览器的 React 运行时也就不会触发对这个 Chunk 的请求与后续水合。

需要注意的是：

1. **第一，构建期的代码分割本身不决定下载。** Next.js 确实会按路由段分割代码，但客户端 Chunk 的实际加载是由 RSC Payload 中的引用驱动的，而不是“分割了就一定会被请求”。你提到的“占位符”，本质上就是 Payload 里那条指向客户端模块的引用；没有它，运行时就没有理由去拉取对应 Chunk。
2. **第二，需要区分 `utils.js` 的导入方式。** 如果 `utils.js` 只是被某个**父级客户端组件静态导入**，那么只要该父组件被渲染了，`utils.js` 就会随父组件的 Chunk 一起进入客户端，即使 `utils.js` 中的某个具体导出在本次渲染中没有被使用。你原回答隐含的“只要没渲染就不下载”只严格适用于**通过 `next/dynamic` 或 `React.lazy` 动态导入**、且服务端渲染期间确实没有被求值的客户端组件。对于静态导入的模块，构建工具通常已经把它打进了某个上游 Chunk，下载行为由上游边界决定，而不是由 `utils.js` 自身是否被“用到”决定。

---

#### 5.2.4 一个关键底层视角：模块的“双重分身”

顺着你的推导，我们可以把这个场景里最微妙的一个构建产物细节补全——**同一个 `utils.js` 在构建产物里其实存在两份**（但在各自的图里互不干扰）：

1. **在 Server Graph 中（供 `/a` 使用）**： `/a/page.tsx` 是 Server Component，它直接 `import` 了 `utils.js`。这里**没有经过 `'use client'` 边界**，所以 `utils.js` 被直接打进了服务端的 Node.js 构建产物里。当用户访问 `/a` 时，`utils.js` 在服务器上跑完，输出最终的 HTML/RSC 节点，不产生任何客户端 Chunk 引用。
2. **在 Client Graph 中（供 `/b` 使用）**： `/b/page.tsx` 引用了 `ClientBox.tsx`（跨过了 `'use client'` 边界），而 `ClientBox.tsx` 又 `import` 了 `utils.js`。由于一旦跨过 `'use client'` 边界，其后续的所有静态 `import` 都会自动归入 Client Graph，所以 `utils.js` 也被打进了 `/b` 路由对应的客户端 Chunk 中。

**结论**：一个没有标注 `'use client'` 的普通模块（如 `utils.js`），它到底属于服务端还是客户端，**完全取决于谁 `import` 了它（它处在依赖图的哪一侧）**。

如果两边都 `import` 了它，它就会同时存在于服务端产物和客户端某个路由的 Chunk 中，但只有在渲染包含对应 Client 占位符的路由（`/b`）时，客户端那一份才会被浏览器下载。

普通模块“属于服务端还是客户端，**完全取决于**谁 import 了它”。在绝大多数情况下成立，但**不完全是**——还存在显式的构建期约束会覆盖导入关系：

- `import 'server-only'` 会阻止模块进入客户端图，如果在客户端代码中导入它，**构建直接报错**；
- 反过来，某些客户端专用模块或 `next/dynamic` 动态导入也可能影响最终的打包与下载行为。

所以更严谨的表述是：**在没有显式环境约束的前提下**，普通模块的归属由导入方所在的图决定；`'use client'` 是决定“谁进入客户端图”的分界线。

> 参考：[The Server and Client Boundary](https://nextjs.org/docs/app/guides/server-and-client-boundary)

---

#### 5.2.5 总结

既然你已经验证了对这套机制的理解，我们可以把整套知识压缩成 4 条核心定律，作为你日后排查打包体积和优化架构的随身标尺：

- **核心不变量（Invariant）**：只有跨过 `'use client'` 边界的模块及其下游静态依赖，才会进入 Client Graph 并生成客户端 JS Chunk。
- **分割粒度（Granularity）**：构建入口按 **Route Segment（路由段）** 收集，但最终落盘的 JS 文件由打包器根据**模块被多少个路由共享**动态拆分为 `Framework`、`Shared` 和 `Segment-Specific` 三类 Chunk。
- **运行时映射（Runtime Mapping）**：一个路由段 $\neq$ 一个 JS 文件；一个路由段 $=$ 服务端 RSC Payload 中下发的一组 **Client Chunk 引用清单**。
- **失效边界（Failure Mode）**：如果在 `'use client'` 文件里不小心静态 `import` 了重型库，或者通过未做 Tree-shaking 的 `index.ts`（桶文件）把大量无关的 Client 组件绑在一起导出，按路由段分割的优化效果就会被破坏。

如果你还想在这个心智模型上做最后一步拓展，有一个工程实战中最高频的问题值得思考： **如果一个 Client Component 内部必须包裹一个包含重型依赖的 Server Component，怎么写才能防止那个 Server Component 被拉进 Client Graph？**（也就是上面提到的 `children` 穿插模式）。

---

#### 5.2.6 回答总结里面的问题⭐

核心原则是：**切断 `import` 依赖，而不是切断视觉上的嵌套关系**。只要 Client Component 的模块图（Module Graph）中没有引入那个 Server Component，它就不会被打进客户端包。实现这一点，主要依靠**组合模式（Composition）**，并用 `server-only` 作为安全兜底。

**（1）正确做法（Server Component 留在服务端）**

```tsx
// ClientWrapper.tsx
'use client'
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  // 只负责交互/布局逻辑，不关心 children 是什么
  return <div className="client-shell">{children}</div>
}

// page.tsx (这是一个 Server Component)
import ClientWrapper from './ClientWrapper'
import HeavyServerComponent from './HeavyServerComponent'

export default function Page() {
  return (
    <ClientWrapper>
      <HeavyServerComponent /> {/* 作为 children 传入 */}
    </ClientWrapper>
  )
}
```

此时，`HeavyServerComponent` 是在 `page.tsx`（服务端）里被导入和渲染的。`ClientWrapper` 只接收到一个已经序列化好的 **RSC Payload**（即渲染结果），而**不是**组件的代码。

官方文档对此有明确说明：以 `children` 或 props 形式传递的 Server Component，**不会进入 Client Component 的模块图**，它们只在服务端渲染，然后把渲染输出传递给客户端。



**（2）用 `server-only` 包作为兜底**

组合模式需要开发者自觉遵守结构约定。为了防止团队成员（或未来的自己）不小心在 Client Component 里 `import` 了重型 Server Component，可以在那个 Server Component（或其依赖的重型模块）顶部加上 `server-only`。

```tsx
// HeavyServerComponent.tsx
import 'server-only'
import { someHeavyLib } from 'heavy-package'

export default function HeavyServerComponent() { ... }
```

一旦有任何客户端模块试图导入它，**Next.js 会在构建时直接报错**，而不是悄悄地把重型代码打进浏览器。这等于把“防止误入客户端图”从结构约定升级成了**编译期强制约束**。



**（3）为什么这两种方式能奏效？**

回顾你之前关于“双重分身”的讨论：

1. 模块归属取决于**导入关系**。`children` 模式之所以有效，是因为它**没有建立从 Client Component 到 Server Component 的 `import` 边**。
2. Server Component 的代码始终只存在于 Server Graph 中
3. Client Component 拿到的只是 RSC Payload 里一段序列化的、已渲染的 UI 描述。没有 `import` 边，打包器就没有理由把那份模块拉进客户端 Chunk。

> 参考：[The Server and Client Boundary](https://nextjs.org/docs/app/guides/server-and-client-boundary)

---

### 5.3 自动预获取（核心机制）

定义：Prefetching（预取）是指在用户真正访问一个路由之前，提前在后台获取该路由所需的资源。

采用 Prefetching 后：

```
<Link> 进入浏览器视口
          │
          ▼
Next.js 在后台预取资源
          │
          ▼
资源进入客户端缓存
          │
          ▼
用户点击链接
          │
          ▼
使用已有的预取结果
          │
          ▼
执行客户端导航
```

这样就可以把部分网络等待时间提前到用户尚未点击链接的时候。

---

#### 5.3.1 什么情况下触发 Prefetching？

教程明确指出：

> 在生产环境中，当 `<Link>` 组件进入浏览器视口时，Next.js 会自动预取目标路由。

需要强调两个条件：

1. 使用 Next.js `<Link>`。
2. 在生产环境中进入浏览器视口。

Next.js 官方文档也明确说明，自动预取默认只在生产环境启用。开发模式不会采用相同的自动预取行为。

---

#### 5.3.2 预取什么内容？

原文将其概括为预取目标路由的代码。

这是一个适合入门的描述，但对于 App Router，需要进一步理解。

预取资源可能涉及：

- JavaScript 文件。
- CSS 等页面资源。
- React Server Component Payload。
- 路由所需的其他可复用数据。

具体预取多少内容，取决于路由类型以及 Next.js 的预取策略。

---

#### 5.3.3 静态路由与动态路由的区别

这是原教程没有展开、但在实现层面很重要的内容。

在当前官方 App Router 文档的默认预取策略下（不启用 Cache Components 的基线情况）：

| 路由类型                      | 默认预取行为                          |
| ----------------------------- | ------------------------------------- |
| Static Route                  | 预取完整路由                          |
| Dynamic Route                 | 通常不预取完整路由                    |
| Dynamic Route + `loading.tsx` | 可以部分预取到最近的 Loading Boundary |

为什么要区别对待？假设有一个动态路由：

```
/blog/[slug]
```

不同用户可能访问不同的文章。如果某个路由依赖动态数据，Next.js 不一定适合提前生成完整的页面结果，因为用户可能根本不会访问它。所以可以采用部分预取：

```
/blog/[slug]
      │
      ▼
预取共享 Layout
      │
      ▼
预取 Loading UI
      │
      ▼
用户点击
      │
      ▼
服务器继续生成动态内容
      │
      ▼
流式返回页面结果
```

`loading.tsx` 可以形成一个 Loading Boundary，允许 Next.js 提前获取一部分可用内容，减少用户等待时的空白感。

---

#### 5.3.4 如何控制 Prefetching？

`<Link>` 提供 `prefetch` 属性：

```tsx
<Link href="/dashboard/invoices">
  Invoices
</Link>
```

默认值为 `null`，相当于自动策略。还可以：

```tsx
// 禁止自动预取
<Link
  href="/dashboard/invoices"
  prefetch={false}
>
  Invoices
</Link>
```

或者：

```tsx
// 请求完整预取
<Link
  href="/dashboard/invoices"
  prefetch={true}
>
  Invoices
</Link>
```

需要注意，最新 App Router 文档中 `prefetch` 还有 `auto` 等支持形式，具体策略会随着 Next.js 版本和 Cache Components 等功能配置变化。

---

### 5.4 Code Splitting 和 Prefetching 的区别

这两个概念经常被混淆。

| 比较维度 | Code Splitting     | Prefetching        |
| -------- | ------------------ | ------------------ |
| 核心问题 | 如何拆分应用代码？ | 何时提前加载资源？ |
| 主要目的 | 减少初始加载负担   | 减少导航时的等待   |
| 触发方式 | 构建和资源组织机制 | 运行时预取机制     |
| 作用阶段 | 构建、加载阶段     | 用户导航之前       |
| 核心思想 | 按需加载           | 提前加载           |

两者是互补关系：

![image-20261031023700825](./05-在页面之间进行导航(讲了Nextjs的核心机制).assets/image-20261031023700825.png)

---

## 6. Server Component 与 Client Component：为什么需要 `'use client'`？

这是本章 Active Link 部分背后的重要架构知识。

### 6.1 两种组件的运行职责

Next.js App Router 中存在两种主要组件类型：

| 对比         | Server Component         | Client Component         |
| ------------ | ------------------------ | ------------------------ |
| 默认类型     | App Router 默认          | 需要声明                 |
| 主要执行环境 | 服务器                   | 浏览器                   |
| React Hooks  | 不能使用客户端交互 Hooks | 可以使用                 |
| 事件处理     | 不直接提供客户端事件处理 | 支持                     |
| 浏览器 API   | 不能直接访问浏览器环境   | 可以访问                 |
| 主要适用场景 | 数据获取、服务端渲染     | 交互、状态、客户端 Hooks |

**这里需要特别理解**：Client Component 并不意味着它只能在浏览器渲染。初始页面加载时，Next.js 也可以在服务器上预渲染 Client Component 的 HTML。之后浏览器再通过 JavaScript 完成 Hydration。

它的关键区别在于：**该组件参与客户端 JavaScript 运行，支持 Hooks、事件和浏览器 API**。

---

### 6.2 `'use client'` 是什么？

在文件顶部加入：

```ts
'use client';
```

就声明了一个 Client Component 的模块边界。

```tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

这里的原因是：

- `useState` 需要客户端交互状态。
- `onClick` 需要浏览器事件处理。
- 这些功能不能作为普通 Server Component 的客户端交互逻辑使用。

**客户端模块边界所导入的模块以及直接渲染的组件会进入客户端模块图**。

对于从服务器组件通过 `children` 或其他 Props 传入的 Server Component，不会仅仅因为被 Client Component 包含，就自动变成 Client Component。

官方特别建议将 `'use client'` 放在真正需要交互的组件边界，而不是随意扩大客户端组件范围，以控制客户端 JavaScript 的体积。

---

## 7. UI 模式：高亮显示当前激活链接（课程实践）

在 Web 界面设计中，通过高亮当前链接来告知用户所处的页面是一种非常常见的 UI 模式。要实现这一功能，你需要从 URL 中获取用户当前的访问路径。Next.js 提供了 `usePathname()` Hook 来读取路径并实现该模式。

由于 `usePathname()` 是一个 React Hook，必须在客户端组件中使用。

因此需要将 `nav-links.tsx` 转换为**客户端组件（Client Component）**：在文件顶部添加 React 的 `'use client'` 指令，并从 `next/navigation` 导入 `usePathname()`：

```ts
// /app/ui/dashboard/nav-links.tsx
'use client';
 
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
 
// ...
```

在 `<NavLinks/>` 组件内，将当前路径赋值给变量 `pathname`：

```ts
// /app/ui/dashboard/nav-links.tsx
export default function NavLinks() {
  const pathname = usePathname();
  // ...
}
```

你可以使用在样式章节中介绍过的 `clsx` 工具库，在链接处于激活状态时动态追加类名。当 `link.href` 与当前的 `pathname` 完全匹配时，给该链接附加蓝色文本和浅蓝色背景样式。

`nav-links.tsx` 的完整代码如下：

```ts
"use client";

import { Files, Home, UserGroup } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Home", href: "/dashboard", icon: Home },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: Files,
  },
  { name: "Customers", href: "/dashboard/customers", icon: UserGroup },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "group flex h-[48px] grow items-center justify-center gap-3 rounded-lg p-3 text-sm font-medium transition-all duration-200 md:flex-none md:justify-start md:px-4",
              isActive
                ? "bg-blue-50 font-semibold text-blue-600 shadow-xs"
                : "bg-gray-50 text-gray-700 hover:bg-blue-50/80 hover:text-blue-600 hover:shadow-xs",
            )}
          >
            <LinkIcon
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 group-hover:text-blue-600",
              )}
            />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
```

---

## 8. `usePathname()`：读取当前路由状态

### 8.1 什么是 pathname？

首先要区分 URL 的组成部分。

```
https://example.com/dashboard/invoices?page=2
```

可以分为：

| 部分         | 内容                  |
| ------------ | --------------------- |
| Protocol     | `https:`              |
| Host         | `example.com`         |
| Pathname     | `/dashboard/invoices` |
| Query String | `?page=2`             |

本章需要的就是 Pathname。它标识当前 URL 的路径部分。

---

### 8.2 `usePathname()` 的作用

导入：

```tsx
import { usePathname } from 'next/navigation';
```

使用：

```tsx
const pathname = usePathname();
```

它返回当前 URL 的 `pathname` 字符串。例如：

| 当前 URL                     | `usePathname()` 返回值  |
| ---------------------------- | ----------------------- |
| `/`                          | `'/'`                   |
| `/dashboard`                 | `'/dashboard'`          |
| `/dashboard/invoices`        | `'/dashboard/invoices'` |
| `/dashboard/invoices?page=2` | `'/dashboard/invoices'` |
| `/blog/hello-world`          | `'/blog/hello-world'`   |

> 注意：查询参数不会包含在 `pathname` 返回结果中。

---

### 8.3 为什么必须使用 Hook？

`usePathname()` 并不是普通的工具函数，而是一个依赖 Next.js 客户端路由状态的 React Hook。

路由变化后，客户端可以重新渲染使用该 Hook 的组件，从而让组件获得新的 pathname。

例如：

```
当前路由：
/dashboard/invoices

usePathname()
      │
      ▼
pathname = "/dashboard/invoices"
      │
      ▼
点击 Customers
      │
      ▼
路由切换
      │
      ▼
usePathname() 获得新路径
      │
      ▼
pathname = "/dashboard/customers"
      │
      ▼
NavLinks 重新渲染
```

`pathname` 本身不是我们通过 `useState` 创建和维护的状态。**它来自 Next.js 的当前路由状态**。因此不需要自己监听 `window.location`，也不需要在每次导航时手动更新一个 pathname state。

---

### 8.4 为什么 Next.js 不允许服务端组件读取当前 `pathname`？

这是一个重要的架构设计。在 App Router 中，Layout 通常会在多个页面之间持续复用。例如：

```
/dashboard/invoices
/dashboard/customers
```

两个页面使用同一个 Dashboard Layout。如果当前 URL 必须通过服务器上的 Layout 重新读取才能得到，就会影响这种共享 Layout 的持续复用模型（每次请求都动态渲染，无法做静态生成 SSG）。

Next.js 因此将读取当前 pathname 的能力提供给 Client Component。

这样共享 Layout 可以保留，而客户端组件可以随着路由状态变化更新自己的 UI。



**追问 1**：`page.tsx` 也是 Server Component，为什么它也不能直接拿完整 `pathname`，却可以拿 `params` 和 `searchParams`？

- **`page.tsx` 是路由树的叶子节点**，它不需要像 `layout.tsx` 那样跨不同路径复用（切换路径本来就要卸载旧 Page、加载新 Page）。
- 因此，`page.tsx` 可以安全地接收动态路径参数 `params`（如 `/blog/[slug]` 里的 `slug`）和查询参数 `searchParams`（如 `?page=2`），因为它的生命周期本就与当前单个路由绑定。
- 即便如此，Next.js 依然不在 `page.tsx` 里提供完整的 `pathname` 字符串，是为了保持 Server Component API 的统一性，并防止开发者把依赖 `pathname` 的通用组件不小心抽离并塞进 `layout.tsx` 中。



**追问 2**：网上有人用 Middleware 把当前 URL 塞进 Request Header，然后在 Server Layout 里用 `headers().get('x-pathname')` 强行读取，这样做有什么代价？

这是一个典型的**破坏架构设计的反模式（Anti-pattern）**：

1. 一旦你在 `layout.tsx` 里调用了 `headers()`，整个路由段及其下属所有页面都会被强制降级为 **Dynamic Rendering（每次请求都动态渲染，无法做静态生成 SSG）**。
2. 更致命的是，因为客户端路由切换（`<Link>` 软导航）默认**不会重新请求父级 Layout**，你在 Server Layout 里用 `headers()` 读到的 `x-pathname` **只在首次刷新的那一刻是准的**！一旦用户通过 `<Link>` 切换到别的子页面，Server Layout 不会重跑，界面上的 `pathname` 就会立刻卡死在首屏的值上。

---

## 9. 实现边界与常见问题

下面是教程没有详细讨论，但在实际开发中应该了解的几个问题。

### 9.1 精确匹配与嵌套路由

教程采用：

```tsx
pathname === link.href
```

这是精确匹配。例如：

```tsx
link.href = "/dashboard/invoices"
pathname  = "/dashboard/invoices/123"
```

结果：

```tsx
false
```

因此，当应用存在更深层次的嵌套路由时，父级导航不会自动保持激活状态。一种常见改进：

```tsx
const isActive =
  pathname === link.href ||
  pathname.startsWith(`${link.href}/`);
```

这样：

```
/dashboard/invoices
/dashboard/invoices/123
```

都会使 Invoices 激活。不过，这个改进需要结合项目实际路由层级，避免不恰当的前缀匹配。

---

### 9.2 代码分割不意味着 React SPA 无法实现

教程将 Next.js 与传统 React SPA 对比，强调 Next.js 自动进行路由代码分割。这不意味着普通 React SPA 完全不支持 Code Splitting。**React SPA 也可以使用动态导入、路由级懒加载等机制**。

区别主要在于框架是否自动提供整合后的路由分割与预取体系。



