// TODO: 1. 优化卡片展示效果（图片与文本比例）
//       2. 固定非响应式卡片高度
//       3. 增加筛选条件：地域为云南时显示云南的二级筛选（如宏德州、大理州等，共计16个州市）
//       4. 更新筛选条件后，将页面滚动到筛选条件控件的顶部

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import SteleDetailWindow from "../../components/SteleDetailWindow";

const FILTER_OPTIONS = [
  { key: "all", label: "未筛选" },
  { key: "region", label: "地域" },
  { key: "ethnicity", label: "民族" },
  { key: "era", label: "时代" },
  { key: "material", label: "材质" },
  { key: "usage", label: "用途" },
];

const SECONDARY_FILTER_OPTIONS = {
  region: ["云南", "四川", "西藏", "贵州"],
  ethnicity: ["彝族", "白族", "傣族", "纳西族", "藏族"],
  era: ["唐代", "宋代", "明代", "清代", "民国"],
  material: ["砂岩", "青石", "大理石", "木质"],
  usage: ["纪功", "祭祀", "界碑", "墓志", "交通记事"],
};

const YUNNAN_PREFECTURES = [
  "昆明市",
  "曲靖市",
  "玉溪市",
  "保山市",
  "昭通市",
  "丽江市",
  "普洱市",
  "临沧市",
  "楚雄州",
  "红河州",
  "文山州",
  "西双版纳州",
  "大理州",
  "德宏州",
  "怒江州",
  "迪庆州",
];

// 数据库筛选实现示例（默认保持注释状态，便于后续切换到真实接口）：

// const [filterSchema, setFilterSchema] = useState({
//   primary: [],
//   secondary: {},
// });

// useEffect(() => {
//   async function loadFilterSchema() {
//     const response = await fetch("/api/stele-filters");
//     if (!response.ok) {
//       return;
//     }

//     const data = await response.json();
//     setFilterSchema({
//       primary: data.primaryFilters ?? [],
//       secondary: data.secondaryFilters ?? {},
//     });
//   }

//   loadFilterSchema();
// }, []);

// const FILTER_OPTIONS = [
//   { key: "all", label: "未筛选" },
//   ...filterSchema.primary.map((item) => ({
//     key: item.key,
//     label: item.label,
//   })),
// ];

// const SECONDARY_FILTER_OPTIONS = filterSchema.secondary;

const DEFAULT_IMAGE = "/images/stele-default.svg";
const DEFAULT_TITLE = "待补充碑刻名称";
const DEFAULT_DESC = "暂无碑刻描述，待数据库完善";
const DEFAULT_TAGS = ["待补充标签"];

const PAGE_SIZE = 10;

// 这里先使用本地 mock 数据。
// 后续对接数据库时，可替换为：const records = await fetch('/api/steles?...').then((r) => r.json())
const MOCK_STELES = [
  {
    id: "TEST-001-001",
    name: "测试数据示例碑刻",
    description: "A quick brown fox jumps over the lazy dog. 这是一段测试描述文本，用于测试界面显示效果。A quick brown fox jumps over the lazy dog. 这是一段测试描述文本，用于测试界面显示效果。A quick brown fox jumps over the lazy dog. 这是一段测试描述文本，用于测试界面显示效果。A quick brown fox jumps over the lazy dog. 这是一段测试描述文本，用于测试界面显示效果。A quick brown fox jumps over the lazy dog. 这是一段测试描述文本，用于测试界面显示效果。A quick brown fox jumps over the lazy dog. 这是一段测试描述文本，用于测试界面显示效果。",
    thumbnail: "",
    region: "测试区域",
    ethnicity: "测试民族",
    era: "测试朝代",
    material: "测试材质",
    usage: "测试用途",
  },
  {
    id: "YN-BZ-001",
    name: "南诏德化碑",
    description: "记述南诏政权治理与教化思想的重要碑刻文献。",
    thumbnail: "",
    region: "云南",
    ethnicity: "白族",
    era: "唐代",
    prefecture: "大理州",
    material: "青石",
    usage: "纪功",
  },
  {
    id: "YN-YZ-002",
    name: "彝文盟誓碑",
    description: "记录部族盟誓与祭祀仪礼的彝文碑刻。",
    thumbnail: "",
    region: "云南",
    ethnicity: "彝族",
    era: "明代",
    prefecture: "楚雄州",
    material: "砂岩",
    usage: "祭祀",
  },
  {
    id: "SC-ZZ-003",
    name: "茶马古道界碑",
    description: "用于标识古道线路与关隘边界的交通碑。",
    thumbnail: "",
    region: "四川",
    ethnicity: "藏族",
    era: "清代",
    material: "大理石",
    usage: "界碑",
  },
  {
    id: "YN-NS-004",
    name: "东巴祭祀碑记",
    description: "纳西东巴文化中关于祭祀流程的碑文记录。",
    thumbnail: "",
    region: "云南",
    ethnicity: "纳西族",
    era: "民国",
    prefecture: "丽江市",
    material: "木质",
    usage: "祭祀",
  },
  {
    id: "GZ-YZ-005",
    name: "",
    description: "",
    thumbnail: "",
    region: "贵州",
    ethnicity: "彝族",
    era: "清代",
    material: "砂岩",
    usage: "墓志",
  },
  {
    id: "YN-DB-006",
    name: "傣文水利碑",
    description: "记述地方水利修缮与民众协作制度。",
    thumbnail: "",
    region: "云南",
    ethnicity: "傣族",
    era: "宋代",
    prefecture: "西双版纳州",
    material: "青石",
    usage: "纪功",
  },
  {
    id: "XZ-ZZ-007",
    name: "藏文边地记程碑",
    description: "记录驿站里程与地理节点的碑刻文本。",
    thumbnail: "",
    region: "西藏",
    ethnicity: "藏族",
    era: "清代",
    material: "砂岩",
    usage: "交通记事",
  },
  {
    id: "YN-BZ-008",
    name: "白文乡约碑",
    description: "反映乡规民约与地方自治传统的重要材料。",
    thumbnail: "",
    region: "云南",
    ethnicity: "白族",
    era: "明代",
    prefecture: "大理州",
    material: "青石",
    usage: "纪功",
  },
  {
    id: "SC-DB-009",
    name: "傣文林契碑",
    description: "记载林地权属与使用规范的契约碑刻。",
    thumbnail: "",
    region: "四川",
    ethnicity: "傣族",
    era: "民国",
    material: "大理石",
    usage: "界碑",
  },
  {
    id: "YN-NS-010",
    name: "纳西祖先纪念碑",
    description: "祭祖文化与家族谱系信息并存的纪念石碑。",
    thumbnail: "",
    region: "云南",
    ethnicity: "纳西族",
    era: "清代",
    prefecture: "丽江市",
    material: "青石",
    usage: "墓志",
  },
  {
    id: "YN-YN-011",
    name: "古村修桥碑",
    description: "记叙乡民捐资修桥及后续维护制度。",
    thumbnail: "",
    region: "云南",
    ethnicity: "白族",
    era: "民国",
    prefecture: "昆明市",
    material: "砂岩",
    usage: "纪功",
  },
  {
    id: "XZ-ZZ-012",
    name: "边疆巡防记功碑",
    description: "表彰巡防功绩并记述驻地沿革的碑刻。",
    thumbnail: "",
    region: "西藏",
    ethnicity: "藏族",
    era: "清代",
    material: "大理石",
    usage: "纪功",
  },
];

function normalizeDescription(text) {
  const safeText = text && text.trim() ? text.trim() : DEFAULT_DESC;
  return safeText;
}

function toDisplayCard(item) {
  // 对接数据库后，建议在此处集中做字段映射与兜底处理，便于后端字段调整时统一维护。
  const title = item.name && item.name.trim() ? item.name.trim() : DEFAULT_TITLE;
  const description = normalizeDescription(item.description);
  const tags = [item.ethnicity, item.region, item.era].filter(Boolean);
  const intro = item.description && item.description.trim() ? item.description.trim() : DEFAULT_DESC;
  const detailImages = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [item.thumbnail && item.thumbnail.trim() ? item.thumbnail : DEFAULT_IMAGE];

  return {
    ...item,
    title,
    description,
    intro,
    detailImages,
    thumbnail: item.thumbnail && item.thumbnail.trim() ? item.thumbnail : DEFAULT_IMAGE,
    tags: tags.length > 0 ? tags : DEFAULT_TAGS,
  };
}

function CustomSelect({
  id,
  value,
  options,
  isOpen,
  onToggle,
  onChange,
}) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? options[0]?.label;

  return (
    <div className="relative w-full sm:w-35">
      <button
        id={id}
        type="button"
        className="flex w-full items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus-visible:border-zinc-500"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedLabel}</span>
        <span
          className={[
            "ml-2 text-xs text-zinc-500 transition-transform duration-250",
            isOpen ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          v
        </span>
      </button>

      <ul
        role="listbox"
        aria-labelledby={id}
        className={[
          "absolute left-0 right-0 z-20 mt-2 origin-top overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg transition-all duration-250 ease-out",
          isOpen
            ? "pointer-events-auto max-h-80 scale-y-100 opacity-100"
            : "pointer-events-none max-h-0 scale-y-0 opacity-0",
        ].join(" ")}
      >
        {options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              className={[
                "w-full px-3 py-2 text-left text-sm transition-colors",
                value === option.value
                  ? "bg-zinc-100 font-semibold text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-50",
              ].join(" ")}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdaptiveTagList({ itemId, tags }) {
  const [visibleTagCount, setVisibleTagCount] = useState(Math.min(3, tags.length));
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const tagsKey = useMemo(() => tags.join("|"), [tags]);

  useEffect(() => {
    const containerElement = containerRef.current;
    const measureElement = measureRef.current;
    if (!containerElement || !measureElement) {
      return;
    }

    const decideVisibleCount = () => {
      const maxCount = Math.min(3, tags.length);
      if (maxCount <= 2) {
        setVisibleTagCount(maxCount);
        return;
      }

      const canShowThree = measureElement.scrollWidth <= containerElement.clientWidth;
      setVisibleTagCount(canShowThree ? 3 : 2);
    };

    let frameId = window.requestAnimationFrame(decideVisibleCount);

    if (typeof ResizeObserver === "undefined") {
      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(decideVisibleCount);
    });

    observer.observe(containerElement);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [tags.length, tagsKey]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 invisible inline-flex gap-2 whitespace-nowrap"
      >
        {tags.slice(0, Math.min(3, tags.length)).map((tag) => (
          <span
            key={`measure-${itemId}-${tag}`}
            className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.slice(0, visibleTagCount).map((tag) => (
          <span
            key={`${itemId}-${tag}`}
            className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SteleDatabasePage() {
  const [primaryFilter, setPrimaryFilter] = useState("all");
  const [secondaryFilter, setSecondaryFilter] = useState("");
  const [yunnanPrefectureFilter, setYunnanPrefectureFilter] = useState("");
  const [page, setPage] = useState(1);
  const [openSelect, setOpenSelect] = useState("");
  const [activeStele, setActiveStele] = useState(null);
  const filterBarRef = useRef(null);
  const hasMountedFilterRef = useRef(false);

  const scrollToFilterTop = () => {
    if (!filterBarRef.current) {
      return;
    }

    const top = filterBarRef.current.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  useEffect(() => {
    const onOutsideClick = (event) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
        setOpenSelect("");
      }
    };

    document.addEventListener("mousedown", onOutsideClick);

    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!activeStele) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [activeStele]);

  useEffect(() => {
    if (!hasMountedFilterRef.current) {
      hasMountedFilterRef.current = true;
      return;
    }

    scrollToFilterTop();
  }, [primaryFilter, secondaryFilter, yunnanPrefectureFilter, page]);

  const secondaryOptions = useMemo(() => {
    if (primaryFilter === "all") {
      return [];
    }
    return SECONDARY_FILTER_OPTIONS[primaryFilter] || [];
  }, [primaryFilter]);

  const filteredSteles = useMemo(() => {
    if (primaryFilter === "all" || !secondaryFilter) {
      return MOCK_STELES.map(toDisplayCard);
    }

    const baseFiltered = MOCK_STELES.filter((item) => item[primaryFilter] === secondaryFilter);

    if (
      primaryFilter === "region"
      && secondaryFilter === "云南"
      && yunnanPrefectureFilter
    ) {
      return baseFiltered
        .filter((item) => item.prefecture === yunnanPrefectureFilter)
        .map(toDisplayCard);
    }

    return baseFiltered.map(toDisplayCard);
  }, [primaryFilter, secondaryFilter, yunnanPrefectureFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSteles.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const currentPageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredSteles.slice(start, start + PAGE_SIZE);
  }, [filteredSteles, safePage]);

  const primarySelectOptions = useMemo(
    () => FILTER_OPTIONS.map((option) => ({ value: option.key, label: option.label })),
    [],
  );

  const secondarySelectOptions = useMemo(() => {
    const headLabel = FILTER_OPTIONS.find((item) => item.key === primaryFilter)?.label;

    return [
      { value: "", label: `全部${headLabel}` },
      ...secondaryOptions.map((item) => ({ value: item, label: item })),
    ];
  }, [primaryFilter, secondaryOptions]);

  const prefectureSelectOptions = useMemo(
    () => [
      { value: "", label: "全部州市" },
      ...YUNNAN_PREFECTURES.map((item) => ({ value: item, label: item })),
    ],
    [],
  );

  const showYunnanPrefectureFilter = primaryFilter === "region" && secondaryFilter === "云南";

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-gray-50">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          {/* <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
            测试页面
          </p> */}
          <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
            碑刻数据库
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
            在此处输入页面介绍
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center" ref={filterBarRef}>
            <label className="text-sm font-semibold text-zinc-700" htmlFor="primary-filter">
              筛选条件
            </label>

            <CustomSelect
              id="primary-filter"
              value={primaryFilter}
              options={primarySelectOptions}
              isOpen={openSelect === "primary"}
              onToggle={() => setOpenSelect((prev) => (prev === "primary" ? "" : "primary"))}
              onChange={(value) => {
                setPrimaryFilter(value);
                setSecondaryFilter("");
                setYunnanPrefectureFilter("");
                setPage(1);
                setOpenSelect("");
              }}
            />

            {primaryFilter !== "all" && (
              <CustomSelect
                id="secondary-filter"
                value={secondaryFilter}
                options={secondarySelectOptions}
                isOpen={openSelect === "secondary"}
                onToggle={() =>
                  setOpenSelect((prev) => (prev === "secondary" ? "" : "secondary"))
                }
                onChange={(value) => {
                  setSecondaryFilter(value);
                  setYunnanPrefectureFilter("");
                  setPage(1);
                  setOpenSelect("");
                }}
              />
            )}

            {showYunnanPrefectureFilter && (
              <CustomSelect
                id="prefecture-filter"
                value={yunnanPrefectureFilter}
                options={prefectureSelectOptions}
                isOpen={openSelect === "prefecture"}
                onToggle={() =>
                  setOpenSelect((prev) => (prev === "prefecture" ? "" : "prefecture"))
                }
                onChange={(value) => {
                  setYunnanPrefectureFilter(value);
                  setPage(1);
                  setOpenSelect("");
                }}
              />
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-5">
          {currentPageItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="content-card flex h-[23.5rem] max-h-[23.5rem] cursor-pointer flex-col text-left"
              onClick={() => setActiveStele(item)}
            >
              <div className="relative h-44 shrink-0 bg-zinc-100">
                {/* 对接数据库后，将 thumbnail 替换为后端返回的缩略图 URL。 */}
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 20vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                {/* 对接数据库后，将 title / description / tags 改为接口字段。 */}
                <h2 className="line-clamp-1 shrink-0 text-lg font-bold leading-7 text-zinc-900">{item.title}</h2>
                <p className="min-h-12 flex-1 overflow-hidden text-sm leading-6 text-zinc-600">{item.description}</p>
                <AdaptiveTagList itemId={item.id} tags={item.tags} />
              </div>
            </button>
          ))}
        </div>

        {currentPageItems.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-500">
            当前筛选条件下暂无数据。
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1}
          >
            上一页
          </button>
          <span className="text-sm font-medium text-zinc-700">
            第 {safePage} / {totalPages} 页
          </span>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
          >
            下一页
          </button>
        </div>
      </section>

      {activeStele && (
        <SteleDetailWindow
          key={activeStele.id}
          item={activeStele}
          onClose={() => setActiveStele(null)}
          defaultImage={DEFAULT_IMAGE}
        />
      )}
    </div>
  );
}
