"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

// Tidak ada perubahan di interface ini
export interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverEffect?: boolean;
  style?: React.CSSProperties;
}

// Tidak ada perubahan di interface ini
export interface GlowingCardsProps {
  children: React.ReactNode;
  className?: string;
  enableGlow?: boolean;
  glowRadius?: number;
  glowOpacity?: number;
  animationDuration?: number;
  enableHover?: boolean;
  gap?: string;
  maxWidth?: string;
  padding?: string;
  backgroundColor?: string;
  borderRadius?: string;
  responsive?: boolean;
  customTheme?: {
    cardBg?: string;
    cardBorder?: string;
    textColor?: string;
    hoverBg?: string;
  };
}

// Tidak ada perubahan di komponen ini
export const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  className,
  glowColor = "#3b82f6",
  hoverEffect = true,
  ...props
}) => {
  return (
    <div className='flex justify-center items-center mx-auto px-2'>
      <div
        className={cn(
          "relative flex-1 min-w-[14rem] p-6 rounded-2xl text-[#006989]",
          "bg-background border ",
          "transition-all duration-400 ease-out",
          className
        )}
        style={{
          '--glow-color': glowColor, // CSS variable definition
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export const GlowingCards: React.FC<GlowingCardsProps> = ({
  children,
  className,
  enableGlow = true,
  glowRadius = 25,
  glowOpacity = 1,
  animationDuration = 400,
  // enableHover dihapus dari props karena tidak pernah dipakai
  gap = "2.5rem",
  maxWidth = "75rem",
  padding = "1rem 1.5rem",
  backgroundColor,
  borderRadius = "1rem",
  responsive = true,
  customTheme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  // mousePosition dihapus karena state-nya tidak pernah dibaca/dipakai
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;

    if (!container || !overlay || !enableGlow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // setMousePosition dihapus karena tidak perlu
      setShowOverlay(true);

      overlay.style.setProperty('--x', x + 'px');
      overlay.style.setProperty('--y', y + 'px');
      overlay.style.setProperty('--opacity', glowOpacity.toString());
    };

    const handleMouseLeave = () => {
      setShowOverlay(false);
      overlay.style.setProperty('--opacity', '0');
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enableGlow, glowOpacity]);

  const containerStyle = {
    '--gap': gap,
    '--max-width': maxWidth,
    '--padding': padding,
    '--border-radius': borderRadius,
    '--animation-duration': animationDuration + 'ms',
    '--glow-radius': glowRadius + 'rem',
    '--glow-opacity': glowOpacity,
    backgroundColor: backgroundColor || undefined,
    ...customTheme,
  } as React.CSSProperties;

  return (
    <div
      className={cn("relative w-full", className)}
      style={containerStyle}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative max-w-[var(--max-width)] mx-auto",
          "px-6 py-2"
        )}
        style={{ padding: "var(--padding)" }}
      >
        <div
          className={cn(
            "flex items-center justify-center flex-wrap gap-[var(--gap)]",
            responsive && "flex-col sm:flex-row "
          )}
        >
          {children}
        </div>

        {enableGlow && (
          <div
            ref={overlayRef}
            className={cn(
              "absolute inset-0 pointer-events-none select-none flex justify-center items-center ",
              "opacity-0 transition-all duration-[var(--animation-duration)] ease-out"
            )}
            style={{
              WebkitMask:
                "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              mask:
                "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              opacity: showOverlay ? 'var(--opacity)' : '0',
            }}
          >
            <div
              className={cn(
                "flex items-center justify-center flex-wrap gap-[var(--gap)] max-w-[var(--max-width)] center mx-auto",
                responsive && "flex-col sm:flex-row"
              )}
              style={{ padding: "var(--padding)" }}
            >
              {/* 'index' dihapus karena tidak pernah dipakai */}
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === GlowingCard) {
                  // PERBAIKAN UTAMA: Casting 'child' agar TypeScript tahu tipe props-nya
                  const typedChild = child as React.ReactElement<GlowingCardProps>;
                  const cardGlowColor = typedChild.props.glowColor || "#3b82f6";
                  
                  return React.cloneElement(typedChild, {
                    className: cn(
                      typedChild.props.className,
                      "bg-opacity-15 dark:bg-opacity-15",
                      "border-opacity-100 dark:border-opacity-100"
                    ),
                    style: {
                      ...typedChild.props.style,
                      backgroundColor: cardGlowColor + "15",
                      borderColor: cardGlowColor,
                      boxShadow: "0 0 0 1px inset " + cardGlowColor,
                    },
                  });
                }
                return child;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { GlowingCards as default };