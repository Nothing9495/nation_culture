import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
            测试页面
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
            关于我们
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
            这是一个用于测试页面跳转、导航高亮、布局复用和基础样式是否正常工作的简易介绍页。
            页面内容保持轻量，便于后续快速替换为正式介绍内容。
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900">页面状态</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              当前页面仅用于验证路由、页面渲染和 footer 是否与全局布局一致。
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900">测试内容</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              如果你能正常看到标题、说明文字和下面的跳转按钮，说明基础功能正常。
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900">后续用途</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              之后这里可以扩展为团队介绍、项目背景或数据来源说明等正式内容。
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            返回首页
          </Link>
          <Link
            href="/sub_pages/stele-database"
            className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
          >
            前往碑刻数据库
          </Link>
        </div>
      </section>
    </div>
  );
}
