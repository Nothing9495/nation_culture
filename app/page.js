"use client";

// TODO: 1. 更换背景图片 (Completed-partitially, better images are needed)

import { useRouter } from "next/navigation";

const HOME_HERO_BG_IMAGE = "/images/old/homepage_bg.jpg";
const HOME_HERO_BG_STYLE = {
  backgroundImage: `url('${HOME_HERO_BG_IMAGE}')`,
  backgroundPosition: "calc(50% + 30vw) center",
};

export default function Home() {
  const router = useRouter();
  return (
    <div className="group relative flex min-h-screen flex-col overflow-hidden">
      {/* 背景图层：保持 cover 填充，并在悬停时放大 */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-500 ease-out group-hover:scale-110"
        style={HOME_HERO_BG_STYLE}
      />
      {/* 渐变遮罩层：提升左侧文字区可读性 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)",
        }}
      />
      <section
        id="home"
        className="relative z-10 mx-auto flex flex-1 w-full max-w-6xl flex-col justify-center px-6 py-20"
      >
        <p className="mb-4 inline-flex w-fit rounded-full border border-white/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white dark:border-white/60">
          少数民族文字碑刻数字化保护
        </p>
        <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-6xl">
          守护石上史诗 · 传承民族文脉
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white">
          本项目聚焦云南彝文、白文、傣文、东巴文、藏文等少数民族文字碑刻，以“数字化保护+活化传承+文旅融合”为核心，打造集普查、采集、释读、数据库建设、文创开发、研学服务于一体的全链条创业模式。
        </p>
        <div className="mt-6 self-start flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => router.push("/sub_pages/about-page")}
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition transform hover:-translate-y-0.25 hover:scale-101 hover:bg-gray-100 dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            了解更多
          </button>
          <button
            type="button"
            onClick={() => router.push("/sub_pages/stele-database")}
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition transform hover:-translate-y-0.25 hover:scale-101 hover:bg-gray-100 dark:bg-zinc-100 dark:text-black dark:hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            前往碑刻数据库
          </button>
        </div>
      </section>
    </div>
  );
}
