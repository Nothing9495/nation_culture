export default function MailSubscribe() {
  return (
    <section className="rounded-2xl border border-black/10 bg-white/80 p-5 backdrop-blur-sm dark:border-white/15 dark:bg-zinc-950/80">
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        订阅项目动态
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        获取少数民族文字碑刻数字化保护的最新进展与活动通知。
      </p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" action="#" method="post">
        <label htmlFor="footer-email" className="sr-only">
          邮箱地址
        </label>
        <input
          id="footer-email"
          name="email"
          type="email"
          required
          placeholder="请输入邮箱地址"
          className="h-11 flex-1 rounded-lg border border-black/15 bg-white px-4 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-500 focus:border-black dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-200"
        />
        <button
          type="submit"
          className="h-11 rounded-lg bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
        >
          立即订阅
        </button>
      </form>
    </section>
  );
}
