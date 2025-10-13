import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { ChainCarouselProps } from '../../types/chain.types';
import type { ChainItem } from '../../types/chain.types';

// Simple Input Component
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} />
);

// Extended type for animated items
type AnimatedChainItem = ChainItem & {
  distanceFromCenter: number;
  originalIndex: number;
};

interface CarouselItemProps {
  chain: AnimatedChainItem;
  side: 'left' | 'right';
}

// Carousel Item Card Component
const CarouselItemCard: React.FC<CarouselItemProps> = ({ chain, side }) => {
  const { distanceFromCenter, id, name, details, logo, icon: FallbackIcon } = chain;
  const distance = Math.abs(distanceFromCenter);
  
  // Calculate visual effects based on distance
  const opacity = 1 - distance / 4;
  const scale = 1 - distance * 0.1;
  const yOffset = distanceFromCenter * 90;
  const xOffset = side === 'left' ? -distance * 50 : distance * 50;

  return (
    <motion.div
      key={id}
      className={`absolute flex items-center gap-4 px-6 py-3 
        ${side === 'left' ? 'flex-row-reverse' : 'flex-row'}`}
      animate={{ opacity, scale, y: yOffset, x: xOffset }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <div className="rounded-full border border-muted-foreground/60 
        dark:border-muted-foreground/40 p-2 bg-foreground">
        {logo ? (
          <img 
            src={logo} 
            alt={`${name} logo`} 
            className="w-8 h-8 rounded-full object-cover" 
          />
        ) : (
          <FallbackIcon className="w-8 h-8 text-background" />
        )}
      </div>

      <div className={`flex flex-col mx-4 
        ${side === 'left' ? 'text-right' : 'text-left'}`}>
        <span className="text-base lg:text-lg font-semibold text-foreground whitespace-nowrap">
          {name}
        </span>
        <span className="text-xs lg:text-sm text-gray-500">
          {details}
        </span>
      </div>
    </motion.div>
  );
};

// Main Carousel Component
const ChainCarousel: React.FC<ChainCarouselProps> = ({
  items,
  scrollSpeedMs = 1500,
  visibleItemCount = 9,
  className = '',
  onChainSelect,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const rightSectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rightSectionRef, { margin: '-100px 0px -100px 0px' });
  const totalItems = items.length;

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || totalItems === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, scrollSpeedMs);
    
    return () => clearInterval(interval);
  }, [isPaused, totalItems, scrollSpeedMs]);

  // Pause on scroll
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleScroll = () => {
      setIsPaused(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsPaused(false), 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Get visible items for carousel
  const getVisibleItems = useCallback((): AnimatedChainItem[] => {
    const visibleItems: AnimatedChainItem[] = [];
    if (totalItems === 0) return [];

    const itemsToShow = visibleItemCount % 2 === 0 ? visibleItemCount + 1 : visibleItemCount;
    const half = Math.floor(itemsToShow / 2);

    for (let i = -half; i <= half; i++) {
      let index = currentIndex + i;
      if (index < 0) index += totalItems;
      if (index >= totalItems) index -= totalItems;

      visibleItems.push({
        ...items[index],
        originalIndex: index,
        distanceFromCenter: i,
      });
    }
    return visibleItems;
  }, [currentIndex, items, totalItems, visibleItemCount]);

  // Filter items for search
  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Handle chain selection
  const handleSelectChain = (id: ChainItem['id'], name: string) => {
    const index = items.findIndex((c) => c.id === id);
    if (index !== -1) {
      setCurrentIndex(index);
      setIsPaused(true);
      if (onChainSelect) onChainSelect(id, name);
    }
    setSearchTerm(name);
    setShowDropdown(false);
  };

  const currentItem = items[currentIndex];

  return (
    <div id="explore-section" className={`space-y-20 ${className}`}>
      <div className="flex flex-col xl:flex-row max-w-7xl mx-auto px-4 md:px-8 gap-12 justify-center items-center">
        
        {/* Left Carousel */}
        <motion.div
          className="relative w-full max-w-md xl:max-w-2xl h-[450px] 
            flex items-center justify-center hidden xl:flex -left-14"
          onMouseEnter={() => !searchTerm && setIsPaused(true)}
          onMouseLeave={() => !searchTerm && setIsPaused(false)}
          initial={{ x: '-100%', opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 20, duration: 0.8 }}
        >
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-0 h-1/4 w-full bg-transparent"></div>
            <div className="absolute bottom-0 h-1/4 w-full bg-transparent"></div>
          </div>
          {getVisibleItems().map((chain) => (
            <CarouselItemCard key={chain.id} chain={chain} side="left" />
          ))}
        </motion.div>

        {/* Middle Section - Center Display & Search */}
        <div className="flex flex-col text-center gap-4 max-w-md">
          {currentItem && (
            <div className="flex flex-col items-center justify-center gap-0 mt-4">
              <div className="p-2 bg-foreground rounded-full">
                {currentItem.logo ? (
                  <img 
                    src={currentItem.logo} 
                    alt={`${currentItem.name} logo`} 
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                ) : (
                  <currentItem.icon className="w-8 h-8 text-background" />
                )}
              </div>
              <h3 className="text-xl xl:text-2xl font-bold text-foreground mt-2">
                {currentItem.name}
              </h3>
              <p className="text-sm xl:text-lg text-gray-400">
                {currentItem.details || 'View Details'}
              </p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mt-6 relative max-w-lg mx-auto xl:mx-0">
            <div className="px-3 flex items-center relative">
              <Input
                type="text"
                value={searchTerm}
                placeholder="Search Items..."
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  setShowDropdown(val.length > 0);
                  if (val === '') setIsPaused(false);
                }}
                onFocus={() => {
                  if (searchTerm.length > 0) setShowDropdown(true);
                  setIsPaused(true);
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="flex-grow outline-none text-foreground bg-background px-4 
                  placeholder-gray-800 text-lg rounded-full border-gray-500 
                  pr-10 pl-10 py-2 cursor-pointer border"
              />
              <Search className="absolute text-foreground w-5 h-5 left-6 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowDropdown(false);
                    setIsPaused(false);
                  }}
                  className="absolute right-6 text-foreground hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {showDropdown && filteredItems.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-background 
                rounded-lg border z-20 max-h-60 overflow-y-auto shadow-xl">
                {filteredItems.slice(0, 10).map((chain) => (
                  <div
                    key={chain.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectChain(chain.id, chain.name);
                    }}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer 
                      hover:bg-gray-100/10 transition-colors duration-150 rounded-lg m-2"
                  >
                    {chain.logo ? (
                      <img 
                        src={chain.logo} 
                        alt={`${chain.name} logo`} 
                        className="w-6 h-6 rounded-full object-cover" 
                      />
                    ) : (
                      <chain.icon size={24} className="text-primary" />
                    )}
                    <span className="text-foreground font-medium">{chain.name}</span>
                    <span className="ml-auto text-sm text-gray-500">{chain.details}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Carousel */}
        <motion.div
          ref={rightSectionRef}
          className="relative w-full max-w-md xl:max-w-2xl h-[450px] 
            flex items-center justify-center -right-14"
          onMouseEnter={() => !searchTerm && setIsPaused(true)}
          onMouseLeave={() => !searchTerm && setIsPaused(false)}
          initial={{ x: '100%', opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 20, duration: 0.8 }}
        >
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-0 h-1/4 w-full bg-transparent"></div>
            <div className="absolute bottom-0 h-1/4 w-full bg-transparent"></div>
          </div>
          {getVisibleItems().map((chain) => (
            <CarouselItemCard key={chain.id} chain={chain} side="right" />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ChainCarousel;