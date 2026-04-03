import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Zap, 
  Star, 
  Atom, 
  Crown, 
  Book, 
  Settings, 
  Users, 
  Compass, 
  ShoppingCart, 
  Shield,
  ChevronRight,
  Plus,
  Rocket,
  Ghost,
  Flame,
  Wind,
  Target,
  Dna,
  Cpu,
  Globe,
  Trophy,
  Activity,
  ZapOff,
  CloudLightning,
  Sparkles,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- TYPES ---
export interface ResourceState {
  energy: number;
  fragments: number;
  essence: number;
  codex: number;
  voidCoins: number;
  prestigePoints: number;
  tokens: number;
}

export interface Upgrade {
  id: string;
  name: string;
  desc: string;
  cost: number;
  icon: string;
  maxLevel: number;
  bonus: number;
  type: 'cps' | 'click' | 'special';
}

export interface Pet {
  id: string;
  name: string;
  desc: string;
  icon: string;
  costEnergy: number;
  costFragments: number;
  bonusType: 'cps' | 'click' | 'combo' | 'luck';
  bonusValue: number;
}

export interface Hero {
  id: string;
  name: string;
  class: string;
  icon: string;
  baseValue: number;
  bonus: 'energy' | 'fragments' | 'luck';
}

export interface Research {
  id: string;
  name: string;
  desc: string;
  cost: number;
  requiredLevel: number;
}

export interface VoidPet {
  id: string;
  name: string;
  desc: string;
  icon: string;
  costEnergy: number;
  costVoid: number;
  bonus: number;
}

export interface Expedition {
  id: string;
  name: string;
  duration: number;
  cost: number;
  reward: string;
}

export interface Prophecy {
  id: string;
  name: string;
  desc: string;
  duration: number;
  bonus: number;
}

export interface DailyChallenge {
  id: string;
  name: string;
  desc: string;
  target: number;
  progress: number;
  reward: number;
}

export interface GameState {
  resources: ResourceState;
  upgrades: Record<string, number>;
  totalClicks: number;
  totalEnergyGained: number;
  rebirths: number;
  allianceLevel: number;
  allianceExp: number;
  nebulaExploredTiles: string[];
  pets: { id: string; level: number }[];
  activePetId: string | null;
  heroes: { id: string; level: number; exp: number }[];
  activeHeroIds: string[];
  completedResearch: Record<string, boolean>;
  voidPets: { id: string; count: number }[];
  activeExpeditions: { id: string; endTime: number }[];
  activeProphecies: { id: string; endTime: number }[];
  dailyChallenges: DailyChallenge[];
  lastSave: number;
  comboMultiplier: number;
  overdriveActive: boolean;
  overdriveEndTime: number;
  blackholeCharge: number;
  roletaUsada: boolean;
}

// --- CONSTANTS ---
export const DIMENSIONS = [
  { id: 1, name: 'First Dimension', multiplier: 1 },
  { id: 2, name: 'Second Dimension', multiplier: 2.5 },
  { id: 3, name: 'Third Dimension', multiplier: 7.5 },
  { id: 4, name: 'Fourth Dimension', multiplier: 25 },
  { id: 5, name: 'Fifth Dimension', multiplier: 100 },
];

export const UPGRADES: Upgrade[] = [
  { id: 'u1', name: 'Solar Array', desc: 'Harnesses stellar radiation.', cost: 15, icon: '☀️', maxLevel: 100, bonus: 1, type: 'cps' },
  { id: 'u2', name: 'Fusion Core', desc: 'Advanced plasma containment.', cost: 100, icon: '⚛️', maxLevel: 100, bonus: 5, type: 'cps' },
  { id: 'u3', name: 'Dyson Swarm', desc: 'Captures full star output.', cost: 1100, icon: '🛰️', maxLevel: 100, bonus: 20, type: 'cps' },
  { id: 'u4', name: 'Singularity', desc: 'Infinite energy density.', cost: 12000, icon: '🕳️', maxLevel: 100, bonus: 100, type: 'cps' },
  { id: 'u5', name: 'Void Drill', desc: 'Extracts energy from nothing.', cost: 130000, icon: '💎', maxLevel: 100, bonus: 500, type: 'cps' },
  { id: 'u6', name: 'Nano-Bots', desc: 'Microscopic harvesters.', cost: 50, icon: '🤖', maxLevel: 50, bonus: 0.5, type: 'click' },
  { id: 'u7', name: 'Quantum Click', desc: 'Clicks exist in multiple states.', cost: 500, icon: '🖱️', maxLevel: 50, bonus: 2, type: 'click' },
];

export const PETS: Pet[] = [
  { id: 'p1', name: 'Star Fox', desc: 'Increases CPS by 10%.', icon: '🦊', costEnergy: 5000, costFragments: 10, bonusType: 'cps', bonusValue: 0.1 },
  { id: 'p2', name: 'Void Cat', desc: 'Increases Click Power by 20%.', icon: '🐱', costEnergy: 15000, costFragments: 25, bonusType: 'click', bonusValue: 0.2 },
  { id: 'p3', name: 'Nebula Owl', desc: 'Increases Luck in Nebula.', icon: '🦉', costEnergy: 50000, costFragments: 50, bonusType: 'luck', bonusValue: 0.15 },
];

export const HEROES: Hero[] = [
  { id: 'h1', name: 'Nova', class: 'Stellar Knight', icon: '⚔️', baseValue: 0.05, bonus: 'energy' },
  { id: 'h2', name: 'Astra', class: 'Void Mage', icon: '🔮', baseValue: 0.1, bonus: 'fragments' },
  { id: 'h3', name: 'Orion', class: 'Cosmic Hunter', icon: '🏹', baseValue: 0.08, bonus: 'luck' },
];

export const RESEARCH: Research[] = [
  { id: 'r1', name: 'Dark Matter Study', desc: 'Increases CPS by 15%.', cost: 10, requiredLevel: 1 },
  { id: 'r2', name: 'Wormhole Theory', desc: 'Reduces upgrade costs by 10%.', cost: 25, requiredLevel: 5 },
  { id: 'r3', name: 'Antimatter Tech', desc: 'Double click power.', cost: 50, requiredLevel: 10 },
];

export const VOID_PETS: VoidPet[] = [
  { id: 'vp1', name: 'Voidling', desc: 'Generates 1 Void Coin/sec.', icon: '👾', costEnergy: 100000, costVoid: 0, bonus: 1 },
  { id: 'vp2', name: 'Abyss Stalker', desc: 'Generates 5 Void Coins/sec.', icon: '👹', costEnergy: 500000, costVoid: 100, bonus: 5 },
];

export const EXPEDITIONS: Expedition[] = [
  { id: 'e1', name: 'Asteroid Belt', duration: 300, cost: 1000, reward: 'Fragments' },
  { id: 'e2', name: 'Black Hole Rim', duration: 1800, cost: 10000, reward: 'Essence' },
];

export const PROPHECIES: Prophecy[] = [
  { id: 'pr1', name: 'Solar Flare', desc: 'Double energy for 5 mins.', duration: 300, bonus: 2 },
  { id: 'pr2', name: 'Stardust Rain', desc: 'Triple fragments for 10 mins.', duration: 600, bonus: 3 },
];

export const INITIAL_STATE: GameState = {
  resources: {
    energy: 0,
    fragments: 0,
    essence: 0,
    codex: 0,
    voidCoins: 0,
    prestigePoints: 0,
    tokens: 0,
  },
  upgrades: {},
  totalClicks: 0,
  totalEnergyGained: 0,
  rebirths: 0,
  allianceLevel: 1,
  allianceExp: 0,
  nebulaExploredTiles: [],
  pets: [],
  activePetId: null,
  heroes: [],
  activeHeroIds: [],
  completedResearch: {},
  voidPets: [],
  activeExpeditions: [],
  activeProphecies: [],
  dailyChallenges: [
    { id: 'c1', name: 'Energy Surge', desc: 'Click 100 times.', target: 100, progress: 0, reward: 500 },
    { id: 'c2', name: 'Stellar Harvest', desc: 'Gain 10,000 Energy.', target: 10000, progress: 0, reward: 1000 },
  ],
  lastSave: Date.now(),
  comboMultiplier: 1,
  overdriveActive: false,
  overdriveEndTime: 0,
  blackholeCharge: 0,
  roletaUsada: false,
};

// --- HOOKS ---
function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('supernova_save');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const getCPS = useCallback(() => {
    let base = 0;
    Object.entries(state.upgrades).forEach(([_, level]) => {
      const upg = UPGRADES.find(u => u.id === _);
      if (upg && upg.type === 'cps') base += upg.bonus * (level as number);
    });

    let multiplier = 1;
    multiplier += (state.allianceLevel - 1) * 0.05;
    if (state.activePetId) {
      const pet = PETS.find(p => p.id === state.activePetId);
      if (pet && pet.bonusType === 'cps') multiplier += pet.bonusValue;
    }
    state.activeProphecies.forEach(p => {
      const prop = PROPHECIES.find(pr => pr.id === p.id);
      if (prop && prop.name === 'Solar Flare') multiplier *= prop.bonus;
    });
    if (state.overdriveActive) multiplier *= 2;
    multiplier *= (1 + state.resources.prestigePoints * 0.1);

    return base * multiplier;
  }, [state]);

  const getClickPower = useCallback(() => {
    let base = 1;
    Object.entries(state.upgrades).forEach(([_, level]) => {
      const upg = UPGRADES.find(u => u.id === _);
      if (upg && upg.type === 'click') base += upg.bonus * (level as number);
    });

    let multiplier = state.comboMultiplier;
    if (state.activePetId) {
      const pet = PETS.find(p => p.id === state.activePetId);
      if (pet && pet.bonusType === 'click') multiplier += pet.bonusValue;
    }
    if (state.completedResearch['r3']) multiplier *= 2;

    return base * multiplier;
  }, [state]);

  const addResource = useCallback((type: keyof ResourceState, amount: number) => {
    setState(prev => ({
      ...prev,
      resources: { ...prev.resources, [type]: (prev.resources[type] as number) + amount },
      totalEnergyGained: type === 'energy' ? prev.totalEnergyGained + amount : prev.totalEnergyGained,
      dailyChallenges: prev.dailyChallenges.map(c => 
        c.id === 'c2' && type === 'energy' ? { ...c, progress: Math.min(c.target, c.progress + amount) } : c
      )
    }));
  }, []);

  const handleClick = useCallback(() => {
    const power = getClickPower();
    addResource('energy', power);
    setState(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      comboMultiplier: Math.min(5, prev.comboMultiplier + 0.1),
      dailyChallenges: prev.dailyChallenges.map(c => 
        c.id === 'c1' ? { ...c, progress: Math.min(c.target, c.progress + 1) } : c
      )
    }));
  }, [getClickPower, addResource]);

  const buyUpgrade = useCallback((id: string) => {
    const upg = UPGRADES.find(u => u.id === id);
    if (!upg) return;
    const level = state.upgrades[id] || 0;
    const cost = Math.floor(upg.cost * Math.pow(1.15, level));

    if (state.resources.energy >= cost && level < upg.maxLevel) {
      setState(prev => ({
        ...prev,
        resources: { ...prev.resources, energy: prev.resources.energy - cost },
        upgrades: { ...prev.upgrades, [id]: level + 1 }
      }));
    }
  }, [state]);

  const trade = useCallback((from: keyof ResourceState, to: keyof ResourceState, rate: number) => {
    if (state.resources[from] >= rate) {
      setState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          [from]: prev.resources[from] - rate,
          [to]: prev.resources[to] + 1
        }
      }));
    }
  }, [state]);

  const exploreNebula = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    if (state.resources.energy >= 500 && !state.nebulaExploredTiles.includes(key)) {
      const reward = (Math.random() > 0.5 ? 'fragments' : 'tokens') as keyof ResourceState;
      const amount = Math.floor(Math.random() * 5) + 1;
      setState(prev => ({
        ...prev,
        resources: { 
          ...prev.resources, 
          energy: prev.resources.energy - 500,
          [reward]: (prev.resources[reward] as number) + amount
        },
        nebulaExploredTiles: [...prev.nebulaExploredTiles, key]
      }));
    }
  }, [state]);

  const contributeToAlliance = useCallback((amount: number) => {
    if (state.resources.energy >= amount) {
      setState(prev => {
        let newExp = prev.allianceExp + amount / 10;
        let newLevel = prev.allianceLevel;
        const nextLevelExp = newLevel * 1000;
        if (newExp >= nextLevelExp) {
          newExp -= nextLevelExp;
          newLevel++;
        }
        return {
          ...prev,
          resources: { ...prev.resources, energy: prev.resources.energy - amount },
          allianceExp: newExp,
          allianceLevel: newLevel
        };
      });
    }
  }, [state]);

  const handlePrestige = useCallback(() => {
    const cost = 1000000 * Math.pow(10, state.rebirths);
    if (state.resources.energy >= cost) {
      const pointsGained = Math.floor(Math.log10(state.resources.energy / 1000000)) + 1;
      setState(prev => ({
        ...INITIAL_STATE,
        rebirths: prev.rebirths + 1,
        resources: {
          ...INITIAL_STATE.resources,
          prestigePoints: prev.resources.prestigePoints + pointsGained
        }
      }));
    }
  }, [state]);

  const spinRoulette = useCallback(() => {
    if (!state.roletaUsada) {
      const rewards: (keyof ResourceState)[] = ['energy', 'fragments', 'essence', 'tokens'];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      const amount = reward === 'energy' ? 10000 : 50;
      addResource(reward, amount);
      setState(prev => ({ ...prev, roletaUsada: true }));
    }
  }, [state, addResource]);

  const activateOverdrive = useCallback(() => {
    if (!state.overdriveActive) {
      setState(prev => ({
        ...prev,
        overdriveActive: true,
        overdriveEndTime: Date.now() + 30000 // 30 seconds
      }));
    }
  }, [state.overdriveActive]);

  const collapseSingularity = useCallback(() => {
    if (state.blackholeCharge >= 100) {
      const bonus = state.resources.energy * 0.5;
      addResource('energy', bonus);
      setState(prev => ({ ...prev, blackholeCharge: 0 }));
    }
  }, [state.blackholeCharge, state.resources.energy, addResource]);

  const adminAddEnergy = useCallback(() => addResource('energy', 1000000000), [addResource]);
  const adminUnlockAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      upgrades: UPGRADES.reduce((acc, u) => ({ ...acc, [u.id]: u.maxLevel }), {}),
      pets: PETS.map(p => ({ id: p.id, level: 1 })),
      heroes: HEROES.map(h => ({ id: h.id, level: 1, exp: 0 })),
      completedResearch: RESEARCH.reduce((acc, r) => ({ ...acc, [r.id]: true }), {}),
    }));
  }, []);

  // Game Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const cps = getCPS();
      
      setState(prev => {
        const newEnergy = prev.resources.energy + cps;
        const newCombo = Math.max(1, prev.comboMultiplier - 0.01);
        const newBHCharge = Math.min(100, prev.blackholeCharge + 0.05);
        
        let overdriveActive = prev.overdriveActive;
        if (overdriveActive && now > prev.overdriveEndTime) {
          overdriveActive = false;
        }

        const activeProphecies = prev.activeProphecies.filter(p => now < p.endTime);
        const activeExpeditions = prev.activeExpeditions.filter(e => now < e.endTime);

        return {
          ...prev,
          resources: { ...prev.resources, energy: newEnergy },
          comboMultiplier: newCombo,
          blackholeCharge: newBHCharge,
          overdriveActive,
          activeProphecies,
          activeExpeditions,
          lastSave: now % 30000 < 1000 ? now : prev.lastSave
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [getCPS]);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('supernova_save', JSON.stringify(state));
  }, [state]);

  return {
    state,
    handleClick,
    buyUpgrade,
    trade,
    exploreNebula,
    contributeToAlliance,
    handlePrestige,
    spinRoulette,
    activateOverdrive,
    collapseSingularity,
    adminAddEnergy,
    adminUnlockAll,
    getCPS,
    getClickPower
  };
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const { 
    state, 
    handleClick, 
    buyUpgrade, 
    trade, 
    exploreNebula, 
    contributeToAlliance, 
    handlePrestige,
    spinRoulette,
    activateOverdrive,
    collapseSingularity,
    adminAddEnergy,
    adminUnlockAll,
    getCPS,
    getClickPower
  } = useGameState();
  const [activeTab, setActiveTab] = useState('upgrades');

  const formatNum = (n: number) => {
    if (n < 1000) return Math.floor(n).toString();
    if (n < 1e6) return (n / 1e3).toFixed(2) + 'K';
    if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
    if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
    return (n / 1e12).toFixed(2) + 'T';
  };

  const [floatingTexts, setFloatingTexts] = useState<{ id: number, x: number, y: number, text: string }[]>([]);

  const handleMainClick = (e: React.MouseEvent) => {
    handleClick();
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, x: e.clientX, y: e.clientY, text: `+${formatNum(getClickPower())}` }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-200 font-sans selection:bg-cyan-500/30">
      <AnimatePresence>
        {floatingTexts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 1, y: t.y, x: t.x }}
            animate={{ opacity: 0, y: t.y - 100 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none text-cyan-400 font-black text-2xl z-50 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-cyan-500/20 p-6 flex flex-col gap-6 z-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-cyan-400">SUPERNOVA</h1>
        </div>

        <nav className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
          {[
            { id: 'upgrades', icon: Settings, label: 'Upgrades' },
            { id: 'nebula', icon: Compass, label: 'Nebula' },
            { id: 'market', icon: ShoppingCart, label: 'Market' },
            { id: 'alliance', icon: Users, label: 'Alliance' },
            { id: 'team', icon: Shield, label: 'Team' },
            { id: 'pets', icon: Star, label: 'Companions' },
            { id: 'research', icon: Book, label: 'Research' },
            { id: 'prestige', icon: Crown, label: 'Prestige' },
            { id: 'void', icon: Atom, label: 'Void' },
            { id: 'daily', icon: Star, label: 'Daily' },
            { id: 'admin', icon: Settings, label: 'Admin' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 shrink-0 ${
                activeTab === tab.id 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Alliance Level</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-cyan-400">{state.allianceLevel}</span>
              <Shield size={16} className="text-cyan-500/50" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <header className="flex items-center justify-between mb-12">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Energy</span>
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-black text-white">{formatNum(state.resources.energy)}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Fragments</span>
              <div className="flex items-center gap-2">
                <Star size={18} className="text-cyan-400 fill-cyan-400" />
                <span className="text-2xl font-black text-white">{formatNum(state.resources.fragments)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-900/50 border border-white/5 rounded-full text-xs font-medium text-slate-400">
              CPS: <span className="text-cyan-400">{formatNum(getCPS())}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Clicker & Widgets */}
          <div className="lg:col-span-5 flex flex-col items-center gap-8 py-12">
            <div className="w-full bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-orange-500 mb-1">Combo Multiplier</p>
              <p className="text-3xl font-black text-orange-400">×{state.comboMultiplier.toFixed(1)}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMainClick}
              className="relative w-64 h-64 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1 shadow-[0_0_50px_rgba(6,182,212,0.3)] group"
            >
              <div className="w-full h-full rounded-full bg-[#0a0e1a] flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap size={64} className="text-cyan-400 fill-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                <span className="text-xs font-bold tracking-[0.2em] text-cyan-500/50 uppercase">Harvest</span>
              </div>
            </motion.button>
            
            <div className="text-center">
              <p className="text-slate-500 text-sm mb-1">Total Harvests</p>
              <p className="text-3xl font-black text-white tracking-tight">{state.totalClicks.toLocaleString()}</p>
            </div>

            <div className="w-full bg-pink-500/10 border border-pink-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-pink-400 flex items-center gap-2">
                  <Zap size={16} />
                  Temporal Overdrive
                </h3>
                <span className="text-xs text-pink-500 font-bold">{state.overdriveActive ? 'ACTIVE' : 'READY'}</span>
              </div>
              <button 
                onClick={activateOverdrive}
                disabled={state.overdriveActive}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-400 transition-colors disabled:opacity-50"
              >
                {state.overdriveActive ? 'OVERDRIVE ACTIVE' : 'Activate Overdrive'}
              </button>
            </div>

            <div className="w-full bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Atom size={80} className="text-purple-500" />
              </div>
              <h3 className="font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Atom size={16} />
                Black Hole Generator
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Singularity Charge</span>
                  <span className="text-purple-400 font-bold">{Math.floor(state.blackholeCharge)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${state.blackholeCharge}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                  />
                </div>
                <button 
                  onClick={collapseSingularity}
                  disabled={state.blackholeCharge < 100}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-colors disabled:opacity-50"
                >
                  Collapse Singularity
                </button>
              </div>
            </div>
          </div>

          {/* Right: Tabs Content */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {activeTab === 'upgrades' && (
                <motion.div
                  key="upgrades"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Settings className="text-cyan-400" />
                    Expansion Modules
                  </h2>
                  <div className="grid gap-3">
                    {UPGRADES.map((upg) => {
                      const level = state.upgrades[upg.id] || 0;
                      const cost = Math.floor(upg.cost * Math.pow(1.15, level));
                      const canAfford = state.resources.energy >= cost;
                      return (
                        <button
                          key={upg.id}
                          onClick={() => buyUpgrade(upg.id)}
                          disabled={!canAfford || level >= upg.maxLevel}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                            canAfford 
                            ? 'bg-slate-900/50 border-white/5 hover:border-cyan-500/30 hover:bg-slate-800/50' 
                            : 'bg-slate-900/20 border-white/5 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                              {upg.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-white">{upg.name}</h3>
                              <p className="text-xs text-slate-500">{upg.desc}</p>
                              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded uppercase font-bold mt-1 inline-block">
                                Lv. {level}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                              <Zap size={14} className="fill-cyan-400" />
                              {formatNum(cost)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'nebula' && (
                <motion.div
                  key="nebula"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-900/50 border border-white/5 rounded-3xl p-8"
                >
                  <div className="text-center mb-8">
                    <Compass size={48} className="mx-auto text-cyan-400 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Nebula Exploration</h2>
                    <p className="text-slate-400">Explore tiles for 500 Energy.</p>
                  </div>
                  <div className="grid grid-cols-5 gap-3 max-w-md mx-auto aspect-square">
                    {Array.from({ length: 25 }).map((_, i) => {
                      const x = i % 5;
                      const y = Math.floor(i / 5);
                      const key = `${x},${y}`;
                      const explored = state.nebulaExploredTiles.includes(key);
                      return (
                        <button
                          key={i}
                          onClick={() => exploreNebula(x, y)}
                          disabled={explored || state.resources.energy < 500}
                          className={`aspect-square rounded-xl border transition-all flex items-center justify-center group ${
                            explored 
                            ? 'bg-cyan-500/20 border-cyan-500/40 cursor-default' 
                            : 'bg-slate-800/50 border-white/5 hover:border-cyan-500/30 hover:bg-slate-700/50'
                          }`}
                        >
                          {explored ? <Star size={16} className="text-cyan-400 fill-cyan-400" /> : <Plus size={16} className="text-slate-600 group-hover:text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'market' && (
                <motion.div
                  key="market"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <ShoppingCart className="text-cyan-400" />
                    Stellar Market
                  </h2>
                  <div className="grid gap-4">
                    {[
                      { from: 'energy', to: 'fragments', rate: 1000, icon: Zap, color: 'text-yellow-400' },
                      { from: 'fragments', to: 'essence', rate: 100, icon: Star, color: 'text-cyan-400' },
                    ].map((m) => (
                      <div key={m.from} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${m.color}`}>
                            <m.icon size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white capitalize">{m.from} to {m.to}</h3>
                            <p className="text-xs text-slate-500">Rate: {formatNum(m.rate)} {m.from} = 1 {m.to}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => trade(m.from as any, m.to as any, m.rate)}
                          disabled={state.resources[m.from as any] < m.rate}
                          className="px-6 py-2 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-400 disabled:opacity-50 transition-all"
                        >
                          Trade
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'alliance' && (
                <motion.div
                  key="alliance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-900/50 border border-white/5 rounded-3xl p-8"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                      <Users size={32} className="text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Galactic Alliance</h2>
                      <p className="text-slate-400 text-sm">Level {state.allianceLevel} Commander</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white">Alliance Progression</h3>
                        <span className="text-xs text-slate-500">{formatNum(state.allianceExp)} / {formatNum(state.allianceLevel * 1000)} EXP</span>
                      </div>
                      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          animate={{ width: `${(state.allianceExp / (state.allianceLevel * 1000)) * 100}%` }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => contributeToAlliance(10000)}
                      disabled={state.resources.energy < 10000}
                      className="w-full py-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl font-bold hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      Contribute 10K Energy
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'team' && (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {HEROES.map((hero) => {
                    const owned = state.heroes.find(h => h.id === hero.id);
                    const active = state.activeHeroIds.includes(hero.id);
                    return (
                      <div key={hero.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl">{hero.icon}</div>
                          <div>
                            <h3 className="font-bold text-white">{hero.name}</h3>
                            <p className="text-xs text-slate-500">{hero.class}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">Bonus: +{(hero.baseValue * 100).toFixed(0)}% {hero.bonus}</p>
                        <button 
                          disabled={!owned}
                          className={`w-full py-2 rounded-xl font-bold transition-all ${
                            active ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {owned ? (active ? 'ACTIVE' : 'ACTIVATE') : 'LOCKED'}
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === 'pets' && (
                <motion.div
                  key="pets"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {PETS.map((pet) => {
                    const owned = state.pets.find(p => p.id === pet.id);
                    const active = state.activePetId === pet.id;
                    return (
                      <div key={pet.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl">{pet.icon}</div>
                          <div>
                            <h3 className="font-bold text-white">{pet.name}</h3>
                            <p className="text-xs text-slate-500">{pet.desc}</p>
                          </div>
                        </div>
                        <button 
                          disabled={!owned}
                          className={`w-full py-2 rounded-xl font-bold transition-all ${
                            active ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {owned ? (active ? 'ACTIVE' : 'ACTIVATE') : 'LOCKED'}
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === 'research' && (
                <motion.div
                  key="research"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {RESEARCH.map((res) => {
                    const completed = state.completedResearch[res.id];
                    return (
                      <div key={res.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-white">{res.name}</h3>
                          <p className="text-sm text-slate-500">{res.desc}</p>
                        </div>
                        <button 
                          disabled={completed}
                          className={`px-6 py-2 rounded-xl font-bold transition-all ${
                            completed ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500 text-white'
                          }`}
                        >
                          {completed ? 'COMPLETED' : `Research (${res.cost} Codex)`}
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === 'prestige' && (
                <motion.div
                  key="prestige"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 text-center"
                >
                  <Crown size={48} className="mx-auto text-yellow-400 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Cosmic Ascension</h2>
                  <p className="text-slate-400 mb-8">Reset progress for permanent Prestige Points.</p>
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5">
                      <p className="text-sm text-slate-500 mb-2">Required Energy</p>
                      <div className="flex items-center justify-center gap-2 text-2xl font-black text-white">
                        <Zap size={24} className="text-yellow-400 fill-yellow-400" />
                        {formatNum(1000000 * Math.pow(10, state.rebirths))}
                      </div>
                    </div>
                    <button 
                      onClick={handlePrestige}
                      disabled={state.resources.energy < 1000000 * Math.pow(10, state.rebirths)}
                      className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black text-lg hover:bg-yellow-400 transition-all disabled:opacity-50"
                    >
                      ASCEND NOW
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'void' && (
                <motion.div
                  key="void"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {VOID_PETS.map((vp) => (
                    <div key={vp.id} className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{vp.icon}</span>
                        <span className="font-bold text-purple-200">{vp.name}</span>
                      </div>
                      <p className="text-xs text-purple-400/70 mb-3">{vp.desc}</p>
                      <button className="w-full py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-bold hover:bg-purple-600 transition-all">
                        Summon ({formatNum(vp.costEnergy)} Energy)
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'daily' && (
                <motion.div
                  key="daily"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 text-center">
                    <h3 className="text-xl font-bold mb-4">Galactic Roulette</h3>
                    <button 
                      onClick={spinRoulette}
                      disabled={state.roletaUsada}
                      className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-black text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50"
                    >
                      {state.roletaUsada ? 'SPUN TODAY' : 'SPIN NOW'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-white">Active Challenges</h3>
                    {state.dailyChallenges.map((c, i) => (
                      <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-cyan-400">{c.name}</h4>
                          <span className="text-xs text-slate-500">{c.progress} / {c.target}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${(c.progress / c.target) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <button onClick={adminAddEnergy} className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all">
                    +1B Energy
                  </button>
                  <button onClick={adminUnlockAll} className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all">
                    Unlock All
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
