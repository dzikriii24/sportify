"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MoveUpRight as ArrowIcon } from "lucide-react";

interface VisualItem {
  key: number;
  url: string;
  label: string;
}

const visualData: VisualItem[] = [
  {
    key: 1,
    url: "https://images.pexels.com/photos/2654902/pexels-photo-2654902.jpeg",
    label: "Running",
  },
  {
    key: 2,
    url: "https://images.pexels.com/photos/159684/soccer-football-soccer-player-sport-159684.jpeg",
    label: "Soccer",
  },
  {
    key: 3,
    url: "https://images.pexels.com/photos/8485104/pexels-photo-8485104.jpeg",
    label: "Padel",
  },
  {
    key: 4,
    url: "https://images.pexels.com/photos/9072317/pexels-photo-9072317.jpeg",
    label: "E-Sport",
  },
];

const ImageReveal: React.FC = () => {
  const [focusedItem, setFocusedItem] = useState<VisualItem | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { stiffness: 300, damping: 40 });
  const smoothY = useSpring(cursorY, { stiffness: 300, damping: 40 });

  useEffect(() => {
    const updateScreen = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };
    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  const onMouseTrack = (e: React.MouseEvent) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
  };

  const onHoverActivate = (item: VisualItem) => {
    setFocusedItem(item);
  };

  const onHoverDeactivate = () => {
    setFocusedItem(null);
  };

  return (
    <div
      className="relative mx-auto w-full min-h-fit bg-background rounded-md overflow-hidden"
      onMouseMove={onMouseTrack}
      onMouseLeave={onHoverDeactivate}
    >
      {visualData.map((item) => (
        <div
          key={item.key}
          className="p-4 cursor-pointer relative sm:flex items-center justify-between"
          onMouseEnter={() => onHoverActivate(item)}
        >
          {!isLargeScreen && (
            <img
              src={item.url}
              className="sm:w-32 sm:h-20 w-full h-52 object-cover rounded-md"
              alt={item.label}
            />
          )}
          <h2
            className={`newFont uppercase md:text-3xl sm:text-2xl text-xl font-semibold sm:py-4 py-2 leading-[100%] relative transition-colors duration-300 ${
              focusedItem?.key === item.key
                ? "mix-blend-difference z-20 text-[#006989]"
                : "text-[#006989]"
            }`}
          >
            {item.label}
          </h2>
          <button
            className={`sm:block hidden p-4 rounded-full transition-all duration-300 ease-out ${
              focusedItem?.key === item.key
                ? "mix-blend-difference z-20 bg-white text-black"
                : "text-[#006989]"
            }`}
          >
            <ArrowIcon className="w-8 h-8" />
          </button>
          <div
            className={`h-[2px] bg-black absolute bottom-0 left-0 transition-all duration-300 ease-linear ${
              focusedItem?.key === item.key ? "w-full" : "w-0"
            }`}
          />
        </div>
      ))}

      {isLargeScreen && focusedItem && (
        <motion.img
          src={focusedItem.url}
          alt={focusedItem.label}
          className="fixed z-30 object-cover w-[300px] h-[400px] rounded-lg pointer-events-none shadow-2xl bg-white"
          style={{
            left: smoothX,
            top: smoothY,
            x: "-50%",
            y: "-50%",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </div>
  );
};

export default ImageReveal;
