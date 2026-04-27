"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function clampPan(x, y, currentZoom, viewportEl) {
  if (!viewportEl || currentZoom <= MIN_ZOOM) {
    return { x: 0, y: 0 };
  }

  const maxX = ((currentZoom - 1) * viewportEl.clientWidth) / 2;
  const maxY = ((currentZoom - 1) * viewportEl.clientHeight) / 2;

  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
}

export default function SteleDetailWindow({ item, onClose, defaultImage }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [showZoomTip, setShowZoomTip] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [isImageHover, setIsImageHover] = useState(false);
  const [isSwitchHover, setIsSwitchHover] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showStandaloneImage, setShowStandaloneImage] = useState(false);

  const imageViewportRef = useRef(null);
  const thumbnailRefs = useRef([]);
  const hideTimerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const imageList = useMemo(() => {
    const list = Array.isArray(item?.detailImages) ? item.detailImages : [];
    if (list.length > 0) {
      return list;
    }
    if (item?.thumbnail) {
      return [item.thumbnail];
    }
    return [defaultImage];
  }, [item, defaultImage]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (showStandaloneImage && event.key === "Escape") {
        setShowStandaloneImage(false);
        return;
      }

      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, showStandaloneImage]);

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    const ua = navigator.userAgent || "";
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone|HarmonyOS/i.test(ua);
    const iPadOS = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
    setIsMobileDevice(mobileUA || iPadOS);
  }, []);

  useEffect(() => {
    if (!showZoomTip) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setShowZoomTip(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [showZoomTip]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    const onMouseMove = (event) => {
      const nextX = panStartRef.current.x + event.clientX - dragStartRef.current.x;
      const nextY = panStartRef.current.y + event.clientY - dragStartRef.current.y;
      const nextPan = clampPan(nextX, nextY, zoom, imageViewportRef.current);
      if (rafRef.current) {
        return;
      }

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        panRef.current = nextPan;
        setPan(nextPan);
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, zoom]);

  useEffect(() => {
    const target = thumbnailRefs.current[activeIndex];
    if (!target) {
      return;
    }
    target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex, showSwitcher]);

  if (!item) {
    return null;
  }

  const activeImage = imageList[activeIndex] || defaultImage;

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleAutoHide = () => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setShowSwitcher(false);
    }, 3000);
  };

  const updateZoom = (nextZoom) => {
    const clamped = clampZoom(nextZoom);
    setZoom(clamped);
    if (clamped <= MIN_ZOOM) {
      const resetPan = { x: 0, y: 0 };
      panRef.current = resetPan;
      setPan(resetPan);
      if (isImageHover || isSwitchHover) {
        setShowSwitcher(true);
        scheduleAutoHide();
      }
    } else {
      setShowSwitcher(false);
      clearHideTimer();
    }
    setShowZoomTip(true);
  };

  const onWheelZoom = (event) => {
    if (isMobileDevice) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (event.nativeEvent?.stopImmediatePropagation) {
      event.nativeEvent.stopImmediatePropagation();
    }
    const direction = event.deltaY > 0 ? -1 : 1;
    updateZoom(zoom + direction * ZOOM_STEP);
  };

  const onPrevious = () => {
    setZoom(MIN_ZOOM);
    const resetPan = { x: 0, y: 0 };
    panRef.current = resetPan;
    setPan(resetPan);
    setActiveIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const onNext = () => {
    setZoom(MIN_ZOOM);
    const resetPan = { x: 0, y: 0 };
    panRef.current = resetPan;
    setPan(resetPan);
    setActiveIndex((prev) => (prev + 1) % imageList.length);
  };

  const onImageMouseEnter = () => {
    setIsImageHover(true);
    if (zoom > MIN_ZOOM) {
      return;
    }
    setShowSwitcher(true);
    scheduleAutoHide();
  };

  const onImageMouseLeave = () => {
    setIsImageHover(false);
    if (!isSwitchHover) {
      setShowSwitcher(false);
      clearHideTimer();
    }
  };

  const onSwitcherMouseEnter = () => {
    setIsSwitchHover(true);
    setShowSwitcher(true);
    clearHideTimer();
  };

  const onSwitcherMouseLeave = () => {
    setIsSwitchHover(false);
    if (zoom > MIN_ZOOM) {
      setShowSwitcher(false);
      return;
    }
    if (isImageHover) {
      scheduleAutoHide();
      return;
    }
    scheduleAutoHide();
  };

  const onDragStart = (event) => {
    if (isMobileDevice || zoom <= MIN_ZOOM) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    panStartRef.current = panRef.current;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-2 sm:p-8 lg:p-10">
      <div className="detail-window overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-6">
          <h2 className="text-base font-bold text-zinc-900 sm:text-lg">
            {item.title} - 详细信息
          </h2>
          <button
            type="button"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="flex h-[calc(100%-61px)] min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:flex-row lg:items-stretch lg:gap-6 lg:overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-none flex-col items-center lg:h-full lg:flex-1">
            <div
              ref={imageViewportRef}
              className="relative h-[clamp(16rem,42vh,32rem)] min-h-[16rem] w-full overflow-hidden overscroll-contain rounded-xl border border-zinc-200 bg-zinc-100 sm:h-[clamp(18rem,48vh,34rem)] sm:min-h-[18rem] lg:h-full lg:min-h-0"
              onWheelCapture={isMobileDevice ? undefined : onWheelZoom}
              onMouseEnter={onImageMouseEnter}
              onMouseLeave={onImageMouseLeave}
              onClick={() => {
                if (isMobileDevice) {
                  setShowStandaloneImage(true);
                }
              }}
            >
              <Image
                src={activeImage}
                alt={`${item.title}-detail-${activeIndex + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className={["object-contain", isDragging ? "" : "transition-transform duration-150"].join(" ")}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  cursor: zoom > MIN_ZOOM ? (isDragging ? "grabbing" : "grab") : "default",
                }}
                onMouseDown={onDragStart}
                draggable={false}
              />

              {showZoomTip && (
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-black/70 px-3 py-2 text-sm text-white">
                  当前缩放：{Math.round(zoom * 100)}%
                </div>
              )}

              {zoom <= MIN_ZOOM && (
                <div
                  className={[
                    "absolute bottom-3 left-3 right-3 z-20 flex h-18 items-center gap-3 rounded-xl bg-black/55 px-3 transition-all duration-200",
                    showSwitcher
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0",
                  ].join(" ")}
                  onMouseEnter={onSwitcherMouseEnter}
                  onMouseLeave={onSwitcherMouseLeave}
                >
                  <button
                    type="button"
                    className="h-9 w-9 shrink-0 rounded-full border border-white/50 text-white transition hover:bg-white/20"
                    onClick={onPrevious}
                    aria-label="上一张"
                  >
                    <span aria-hidden>{"<"}</span>
                  </button>

                  <div className="flex min-w-0 max-w-full flex-1 items-center justify-center gap-2 overflow-x-auto py-1">
                    {imageList.map((src, idx) => (
                      <button
                        key={`${item.id}-overlay-thumb-${idx}`}
                        ref={(el) => {
                          thumbnailRefs.current[idx] = el;
                        }}
                        type="button"
                        className={[
                          "relative h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition",
                          idx === activeIndex
                            ? "border-white"
                            : "border-white/40 hover:border-white/70",
                        ].join(" ")}
                        onClick={() => {
                          setActiveIndex(idx);
                          setZoom(MIN_ZOOM);
                          const resetPan = { x: 0, y: 0 };
                          panRef.current = resetPan;
                          setPan(resetPan);
                        }}
                      >
                        <Image
                          src={src}
                          alt={`${item.title}-thumbnail-${idx + 1}`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="h-9 w-9 shrink-0 rounded-full border border-white/50 text-white transition hover:bg-white/20"
                    onClick={onNext}
                    aria-label="下一张"
                  >
                    <span aria-hidden>{">"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside className="w-full shrink-0 lg:h-full lg:w-[320px]">
            <div
              className="detail-scroll rounded-xl border border-zinc-200 bg-zinc-50 p-4 lg:h-full lg:overflow-y-auto"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              <h3 className="text-2xl font-bold text-zinc-900">{item.title}</h3>

              <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
                <p className="text-base text-zinc-700">编号：{item.id || "待补充"}</p>
                <p className="mt-1 text-base text-zinc-700">地域：{item.region || "待补充"}</p>
                <p className="mt-1 text-base text-zinc-700">民族：{item.ethnicity || "待补充"}</p>
                <p className="mt-1 text-base text-zinc-700">时代：{item.era || "待补充"}</p>
                <p className="mt-1 text-base text-zinc-700">材质：{item.material || "待补充"}</p>
                <p className="mt-1 text-base text-zinc-700">用途：{item.usage || "待补充"}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-xl font-semibold text-zinc-900">碑刻介绍</h4>
                <p className="mt-2 text-base leading-7 text-zinc-700">{item.intro}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showStandaloneImage && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 p-3">
          <button
            type="button"
            className="absolute right-4 top-4 z-[70] rounded-full border border-white/40 bg-black/45 px-3 py-2 text-sm font-semibold text-white transition hover:bg-black/65"
            onClick={() => setShowStandaloneImage(false)}
            aria-label="关闭独立图片层"
          >
            关闭
          </button>

          <div className="relative h-full w-full">
            <Image
              src={activeImage}
              alt={`${item.title}-standalone-${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      <style jsx>{`
				.detail-scroll::-webkit-scrollbar {
					display: none;
				}

        .detail-window {
          width: min(calc(100vw - 2.5rem), calc((100vh - 2.5rem) * 1.6), 1400px);
          height: min(calc((100vw - 2.5rem) / 1.6), calc(100vh - 2.5rem), 875px);
        }

        @media (orientation: portrait) {
          .detail-window {
            width: min(calc(100vw - 1rem), 720px);
            height: min(calc(100vh - 1rem), 980px);
          }
        }
			`}</style>
    </div>
  );
}
