import React, { useRef, useCallback, useEffect } from "react";
import blueWavesVideo from "../assets/blue_waves.mp4";

export interface TrailItem {
  /** Tabler icon component – set to null when using imageSrc/src */
  icon?: React.ComponentType<{
    size?: number | string;
    stroke?: number;
    style?: React.CSSProperties;
  }> | null;
  /** Path to a PNG/SVG or image URL */
  imageSrc?: string;
  src?: string;
  alt?: string;
  label?: string;
  color?: string;
  bg?: string;
  size?: number;
}

export interface ImagePathEffectProps {
  items: TrailItem[];
  content?: React.ReactNode;
  trailPattern?: "follow" | "wavy" | "circular" | "random" | "spiral";
  triggerDistance?: number;
  maxTrailImages?: number;
  useFadeEffect?: boolean;
  fadeDelay?: number;
  iconSize?: number;
  containerHeight?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function ImagePathEffect({
  items,
  content,
  trailPattern = "follow",
  triggerDistance = 25,
  maxTrailImages = 6,
  useFadeEffect = true,
  fadeDelay = 1200,
  iconSize = 46,
  containerHeight = 280,
  className,
  style,
}: ImagePathEffectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const zIndexCounterRef = useRef<number>(2);
  const itemIndexRef = useRef<number>(0);
  const lastPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fadeTimeoutsRef = useRef<Map<number, NodeJS.Timeout | number>>(new Map());
  const patternStateRef = useRef<{ time: number }>({ time: 0 });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const calculatePatternPosition = useCallback(
    (baseX: number, baseY: number, index: number) => {
      switch (trailPattern) {
        case "wavy": {
          const amplitude = 28;
          const frequency = 0.08;
          const phase = index * 0.4;
          const waveOffset =
            Math.sin(patternStateRef.current.time * frequency + phase) *
            amplitude;
          return { x: baseX + waveOffset, y: baseY + Math.cos(phase) * 14 };
        }
        case "circular": {
          const radius = 36;
          const angle = index * 0.6 + patternStateRef.current.time * 0.005;
          return {
            x: baseX + Math.cos(angle) * radius,
            y: baseY + Math.sin(angle) * radius,
          };
        }
        case "random": {
          const range = 30;
          const randomX = (((index * 17) % 10) - 5) * (range / 10);
          const randomY = (((index * 23) % 10) - 5) * (range / 10);
          return { x: baseX + randomX, y: baseY + randomY };
        }
        case "spiral": {
          const spiralRadius = 15 + (index % 5) * 6;
          const angle = index * 0.8 + patternStateRef.current.time * 0.005;
          return {
            x: baseX + Math.cos(angle) * spiralRadius,
            y: baseY + Math.sin(angle) * spiralRadius,
          };
        }
        case "follow":
        default:
          return { x: baseX, y: baseY };
      }
    },
    [trailPattern]
  );

  const activateItem = useCallback(
    (itemIdx: number, clientX: number, clientY: number) => {
      const el = itemRefs.current[itemIdx];
      const container = wrapperRef.current;
      if (!el || !container) return;

      const containerBounds = container.getBoundingClientRect();
      const relativeX = clientX - containerBounds.left;
      const relativeY = clientY - containerBounds.top;

      patternStateRef.current.time = Date.now();
      const patternPos = calculatePatternPosition(relativeX, relativeY, itemIdx);

      // Clamp coordinates so cards don't clip at container borders
      const clampedX = Math.max(48, Math.min(containerBounds.width - 48, patternPos.x));
      const clampedY = Math.max(54, Math.min(containerBounds.height - 54, patternPos.y));

      const existingTimeout = fadeTimeoutsRef.current.get(itemIdx);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        fadeTimeoutsRef.current.delete(itemIdx);
      }

      el.style.left = `${clampedX}px`;
      el.style.top = `${clampedY}px`;

      if (zIndexCounterRef.current > 40) {
        zIndexCounterRef.current = 2;
      }
      el.style.zIndex = String(zIndexCounterRef.current++);
      el.style.transform = "translate(-50%, -50%) scale(1)";
      el.style.opacity = "1";

      if (useFadeEffect) {
        const timeoutId = setTimeout(() => {
          if (el) {
            el.style.transform = "translate(-50%, -50%) scale(0)";
            el.style.opacity = "0";
          }
          fadeTimeoutsRef.current.delete(itemIdx);
        }, fadeDelay);
        fadeTimeoutsRef.current.set(itemIdx, timeoutId);
      }

      lastPositionRef.current = { x: clientX, y: clientY };
    },
    [useFadeEffect, fadeDelay, calculatePatternPosition]
  );

  const deactivateItem = useCallback((itemIdx: number) => {
    const el = itemRefs.current[itemIdx];
    if (!el) return;
    const existingTimeout = fadeTimeoutsRef.current.get(itemIdx);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      fadeTimeoutsRef.current.delete(itemIdx);
    }
    el.style.transform = "translate(-50%, -50%) scale(0)";
    el.style.opacity = "0";
  }, []);

  const calculateDistance = useCallback((clientX: number, clientY: number) => {
    if (lastPositionRef.current.x === 0 && lastPositionRef.current.y === 0) {
      return 9999;
    }
    return Math.hypot(
      clientX - lastPositionRef.current.x,
      clientY - lastPositionRef.current.y
    );
  }, []);

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (items.length === 0) return;

      const distance = calculateDistance(clientX, clientY);
      const threshold =
        typeof window !== "undefined"
          ? Math.max(32, Math.min(65, window.innerWidth / triggerDistance))
          : 45;

      if (distance > threshold) {
        const leadIndex = itemIndexRef.current % items.length;
        activateItem(leadIndex, clientX, clientY);

        if (itemIndexRef.current >= maxTrailImages) {
          const tailIndex = (itemIndexRef.current - maxTrailImages) % items.length;
          const normalizedTail = tailIndex < 0 ? tailIndex + items.length : tailIndex;
          deactivateItem(normalizedTail);
        }

        itemIndexRef.current++;
      }
    },
    [items.length, triggerDistance, maxTrailImages, activateItem, deactivateItem, calculateDistance]
  );

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
    const timeouts = fadeTimeoutsRef.current;
    return () => {
      timeouts.forEach((id) => clearTimeout(id));
      timeouts.clear();
    };
  }, [items.length]);

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch) handlePointerMove(touch.clientX, touch.clientY);
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        if (touch) {
          lastPositionRef.current = { x: 0, y: 0 };
          handlePointerMove(touch.clientX, touch.clientY);
        }
      }}
      onMouseLeave={() => {
        lastPositionRef.current = { x: 0, y: 0 };
      }}
      style={{
        position: "relative",
        width: "100%",
        height: containerHeight,
        background: "#030712",
        borderRadius: 12,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        marginBottom: 24,
        ...style,
      }}
      className={className}
    >
      {/* Video playback background with overlay modifier */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <video
          ref={videoRef}
          src={blueWavesVideo}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          className="video-overlay video-overlay--dark"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      </div>

      {/* Trailing Icon Items */}
      {items.map((item, idx) => {
        const IconComp = item.icon;
        const imgSrc = item.imageSrc || item.src;
        const currentIconSize = item.size || iconSize;

        return (
          <div
            key={idx}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: "translate(-50%, -50%) scale(0)",
              opacity: 0,
              transition:
                "transform 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* Enlarged Clean Icon Box */}
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 18,
                backgroundColor: item.bg || "#e8f5f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 10px 25px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(27, 77, 62, 0.12)",
                backdropFilter: "blur(6px)",
              }}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={item.alt || item.label || "trail"}
                  style={{
                    width: currentIconSize,
                    height: currentIconSize,
                    objectFit: "contain",
                  }}
                />
              ) : IconComp ? (
                <IconComp
                  size={currentIconSize}
                  stroke={1.5}
                  style={{ color: item.color || "#1b4d3e" }}
                />
              ) : null}
            </div>

            {/* Clean Frosted Label Pill */}
            {item.label && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#1b4d3e",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  backgroundColor: "rgba(255, 255, 255, 0.94)",
                  backdropFilter: "blur(6px)",
                  padding: "2px 8px",
                  borderRadius: 10,
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                  border: "1px solid rgba(27, 77, 62, 0.1)",
                }}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ImagePathEffect;
