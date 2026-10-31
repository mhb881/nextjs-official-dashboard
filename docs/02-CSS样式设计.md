## 1. 内容概览

本章节选自 Next.js 官方应用开发教程（App Router 架构）第 2 章，系统介绍了现代 Next.js 应用程序中主流的样式解决方案与工程实践。核心脉络包含：

1. **全局样式引入**：如何通过根布局（Root Layout）引入全局 CSS，并以此挂载 CSS 重置规则与全站基础样式；
2. **两类组件级样式方案的权衡与落地**：
   - **Tailwind CSS**：利用实用优先（Utility-First）原子类直接在 JSX 中构建 UI，兼顾开发效率与静态产物体积控制；
   - **CSS 模块（CSS Modules）**：利用构建期的选择器哈希重命名机制，实现无运行时开销的原生 CSS 组件级作用域隔离
3. **动态条件样式处理**：借助工具库 `clsx`，根据组件状态或属性（Props）清晰、声明式地切换类名。

---

# 第 2 章：CSS 样式设计

目前，你的主页还没有任何样式。我们来看看为 Next.js 应用程序添加样式的不同方式。

## 在本章中……

我们将涵盖以下主题：

* 如何为你的应用程序添加全局 CSS 文件。
* 两种不同的样式编写方式：Tailwind 与 CSS 模块（CSS Modules）。
* 如何使用 `clsx` 工具包按条件添加类名。

---

## 全局样式

如果你查看 `/app/ui` 目录，会看到一个名为 `global.css` 的文件。你可以使用此文件为应用程序中的所有路由添加 CSS 规则——例如 CSS 重置规则（CSS Reset Rules）、全站范围的 HTML 元素样式（如链接样式）等。

你可以在应用程序的任意组件中导入 `global.css`，但通常的最佳实践是将其添加到顶层组件中。在 Next.js 中，顶层组件就是**根布局（Root Layout）**（稍后会详细介绍）。

导航至 `/app/layout.tsx` 并导入 `global.css` 文件，以此将全局样式添加到你的应用程序中：

```tsx
// /app/layout.tsx
import '@/app/ui/global.css';
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

保持开发服务器运行，保存更改并在浏览器中预览。现在你的主页应该呈现出新的外观。

但等一下，你并没有添加任何自定义 CSS 规则，这些样式是从哪里来的？

如果查看 `global.css` 内部，你会注意到几条 `@tailwind` 指令：

```css
/* /app/ui/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

> 这是 v3 的版本，v4已经不是这样了

---

## Tailwind

Tailwind 是一个 CSS 框架，允许你直接在 React 代码中快速编写实用类（Utility Classes），从而加快开发流程。

在 Tailwind 中，你通过添加类名来为元素设置样式。例如，添加 `"text-blue-500"` 会将 `<h1>` 的文本变为蓝色：

```tsx
<h1 className="text-blue-500">I'm blue!</h1>
```

尽管 CSS 样式在全局共享，但每个类都是单独应用于具体元素的。这意味着无论你添加还是删除元素，都不必担心维护单独的样式表、样式冲突，或是随着应用程序规模扩大导致 CSS 打包体积不断膨胀的问题。

当你使用 `create-next-app` 初始化新项目时，Next.js 会询问你是否要使用 Tailwind。如果选择“是”，Next.js 会自动安装必要的依赖包并在应用程序中配置好 Tailwind。

如果查看 `/app/page.tsx`，你会看到我们在示例中使用了 Tailwind 类：

```tsx
// /app/page.tsx
import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
 
export default function Page() {
  return (
    // 这些是 Tailwind 类：
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
    // ...
  )
}
```

如果这是你第一次使用 Tailwind，不用担心。为了节省时间，我们已经为你将要使用的所有组件设置好了样式。

让我们来体验一下 Tailwind！复制下方代码并将其粘贴到 `/app/page.tsx` 中的 `<p>` 元素上方：

```tsx
// /app/page.tsx
<div
  className="relative w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black"
/>
```

> **测试你的掌握情况**
> 使用上方代码片段后，你在屏幕上看到了什么形状？
> A. 黄色星星
> B. 蓝色三角形
> C. 黑色三角形
> D. 红色圆形
>
> 答案是 C。

如果你更倾向于编写传统的 CSS 规则，或者希望将样式与 JSX 代码解耦保持分离，CSS 模块是一个极好的替代方案。

---

## CSS 模块

CSS 模块（CSS Modules）通过自动创建唯一的类名，将 CSS 的作用域限定在单个组件内，因此你同样不必担心样式冲突问题。

在后续课程中我们将继续使用 Tailwind，但现在先花一点时间看看如何利用 CSS 模块实现与上述测试题完全相同的效果。

在 `/app/ui` 目录下创建一个名为 `home.module.css` 的新文件，并添加以下 CSS 规则：

```css
/* /app/ui/home.module.css */
.shape {
  height: 0;
  width: 0;
  border-bottom: 30px solid black;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
}
```

然后，在 `/app/page.tsx` 文件中导入该样式，并将你之前添加的 `<div>` 上的 Tailwind 类名替换为 `styles.shape`：

```tsx
// /app/page.tsx
import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
 
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className={styles.shape} />
    // ...
  )
}
```

保存更改并在浏览器中预览。你应该会看到与之前完全相同的形状。

Tailwind 和 CSS 模块是为 Next.js 应用程序设置样式最常见的两种方式。选择哪一种纯属个人偏好——你甚至可以在同一个应用程序中混合使用两者！

> **测试你的掌握情况**
> 使用 CSS 模块的一项优势是什么？
> A. 扩大 CSS 类的全局作用域，使其更容易在不同文件间统一管理。
> B. 提供了一种默认将 CSS 类局限在组件本地作用域的方法，降低样式冲突的风险。
> C. 自动压缩并混淆 CSS 文件以加快页面加载速度。
>
> 答案是B：
>
> CSS Modules 会为每个组件生成唯一的类名，因此你无需担心样式冲突问题。  

---

## 使用 clsx 库切换类名

在某些场景下，你可能需要根据组件的状态或其他条件来动态应用样式。

`clsx` 是一个能让你轻松切换类名的工具库。我们建议查阅官方文档以了解更多细节，以下是基本用法：

假设你想创建一个接收 `status` 属性的 `InvoiceStatus` 组件。`status` 的值可以是 `'pending'`（待处理）或 `'paid'`（已付款）。

* 如果是 `'paid'`，你希望颜色为绿色；
* 如果是 `'pending'`，你希望颜色为灰色。

你可以使用 `clsx` 来有条件地应用这些类，代码如下：

```tsx
// /app/ui/invoices/status.tsx
import clsx from 'clsx';
 
export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-sm',
        {
          'bg-gray-100 text-gray-500': status === 'pending',
          'bg-green-500 text-white': status === 'paid',
        },
      )}
    >
    // ...
)}

```

> **测试你的掌握情况**
> 在代码编辑器中搜索 `"clsx"`，哪些组件使用了它来有条件地应用类名？
> A. `status.tsx` 与 `pagination.tsx`
> B. `table.tsx` 与 `status.tsx`
> C. `nav-links.tsx` 与 `table.tsx`

---

## 其他样式方案

除了我们讨论的方法外，你还可以使用以下方案为 Next.js 应用程序编写样式：

* **Sass**：允许你导入 `.css` 与 `.scss` 文件。
* **CSS-in-JS 库**：例如 `styled-jsx`、`styled-components` 以及 `emotion`。

查阅官方 CSS 文档可获取更多详细信息。

---

**你已完成第 2 章**

干得漂亮！你已经掌握了 Next.js 应用的不同样式处理方式。

下一节：优化字体与图片

通过添加主视觉图（Hero Image）和自定义字体，继续完善你的首页。