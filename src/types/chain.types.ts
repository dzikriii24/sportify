// src/types/chain.types.ts

import { type LucideIcon } from 'lucide-react';

// ATAU gunakan cara alternatif ini (lebih aman):
export type IconType = React.ComponentType<{ className?: string; size?: number }>;

export interface ChainItem {
  id: string | number;
  name: string;
  icon: IconType; // Gunakan IconType instead of LucideIcon
  details?: string;
  logo?: string;
}

export interface ChainCarouselProps {
  items: ChainItem[];
  scrollSpeedMs?: number;
  visibleItemCount?: number;
  className?: string;
  onChainSelect?: (chainId: ChainItem['id'], chainName: string) => void;
}