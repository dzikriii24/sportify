import { 
  Bitcoin, 
  Layers, 
  Zap, 
  Globe, 
  Shield, 
  Cpu, 
  Database, 
  Cloud, 
  Network,
  Coins,
  Wallet,
  TrendingUp
} from 'lucide-react';
import type { ChainItem } from '../types/chain.types';

export const blockchainData: ChainItem[] = [
  { 
    id: 1, 
    name: 'Bitcoin', 
    icon: Bitcoin, 
    details: 'Digital Gold',
    logo: '' // Bisa diisi dengan URL logo jika ada
  },
  { 
    id: 2, 
    name: 'Ethereum', 
    icon: Layers, 
    details: 'Smart Contracts' 
  },
  { 
    id: 3, 
    name: 'Lightning Network', 
    icon: Zap, 
    details: 'Fast Payments' 
  },
  { 
    id: 4, 
    name: 'Polygon', 
    icon: Network, 
    details: 'Layer 2 Scaling' 
  },
  { 
    id: 5, 
    name: 'Solana', 
    icon: Cpu, 
    details: 'High Performance' 
  },
  { 
    id: 6, 
    name: 'Avalanche', 
    icon: Cloud, 
    details: 'Subnets Platform' 
  },
  { 
    id: 7, 
    name: 'Cosmos', 
    icon: Globe, 
    details: 'Internet of Blockchains' 
  },
  { 
    id: 8, 
    name: 'Polkadot', 
    icon: Database, 
    details: 'Multi-Chain Protocol' 
  },
  { 
    id: 9, 
    name: 'Arbitrum', 
    icon: Shield, 
    details: 'Optimistic Rollup' 
  },
  { 
    id: 10, 
    name: 'Optimism', 
    icon: TrendingUp, 
    details: 'L2 Scaling Solution' 
  },
  { 
    id: 11, 
    name: 'BNB Chain', 
    icon: Coins, 
    details: 'DeFi Ecosystem' 
  },
  { 
    id: 12, 
    name: 'Fantom', 
    icon: Wallet, 
    details: 'Fast Finality' 
  },
];

// Contoh data alternatif untuk kategori lain
export const defiProtocols: ChainItem[] = [
  { id: 1, name: 'Uniswap', icon: Coins, details: 'DEX Protocol' },
  { id: 2, name: 'Aave', icon: TrendingUp, details: 'Lending Platform' },
  { id: 3, name: 'Compound', icon: Database, details: 'Money Market' },
  // ... tambahkan lebih banyak
];