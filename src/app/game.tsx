import { useEffect, useRef, useState } from 'react';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { observer } from 'mobx-react-lite';
import Phaser from 'phaser';
import { ArrowLeft } from 'lucide-react';
import { type StoreArgs, useGameActions, useSettings } from '~/hooks';

import { gameState } from '~/components/game/state';
import { LoadingOverlay } from '~/components/loading-overlay';
import { MultiplayerUI } from '~/components/multiplayer-ui';
import { multiplayerState } from '~/lib/multiplayer';
import { Button } from '~/components/ui/button';

import {
  DungeonGameScene,
  GameOverScene,
  HomeScene,
  MultiplayerDungeonScene,
  MultiplayerLobbyScene,
} from '../components/game/scenes';



const GameWrapper = () => {

  const { storeResult, isLoadingClient } = useGameActions();

  if (isLoadingClient) return <LoadingOverlay />;

  return <GameComponent storeFn={storeResult} />;
};

export const GameComponent = ({
  storeFn,
}: {
  storeFn: (args: StoreArgs) => Promise<string>;
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const { settings, isLoaded } = useSettings();

  useEffect(() => {
    if (gameContainerRef.current && isLoaded) {
      const config: Phaser.Types.Core.GameConfig = {
        width: 800,
        height: 600,
        type: Phaser.AUTO,
        scene: [HomeScene, DungeonGameScene, new GameOverScene(storeFn), MultiplayerLobbyScene, MultiplayerDungeonScene],
        scale: {
          width: '100%',
          height: '100%',
        },
        parent: 'game-container',
        pixelArt: settings.pixelArtMode,
        physics: {
          default: 'arcade',
          arcade: {
            debug: import.meta.env.MODE === 'development',
            gravity: { y: 0, x: 1 },
          },
        },
      };

      const phaserGame = new Phaser.Game(config);
      phaserGameRef.current = phaserGame;
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [isLoaded, settings.pixelArtMode, storeFn]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <BackButton />
      <GameDetails />
      {settings.showFPS ? <FPSDisplay /> : null}
      <div ref={gameContainerRef} id='game-container' className="h-full w-full" />
    </div>
  );
};

export const Route = createFileRoute('/game')({
  component: GameWrapper,
});

const GameDetails = observer(() => {
  if (gameState.activeScene === 'game')
    return (
      <>
        <PlayerHealth />
        <PlayerScore />
        <RoundTimer />
        <CurrentRound />
      </>
    );
  
  // Show multiplayer UI when in multiplayer dungeon
  if (multiplayerState.currentRoom && multiplayerState.isConnected)
    return <MultiplayerUI />;
    
  return null;
});

const RoundTimer = observer(() => {
  const currentRound = gameState.times.find((t) => t.round === gameState.level);

  const [time, setTime] = useState<number>(0);

  // create a timer on if time is not null
  useEffect(() => {
    if (currentRound) {
      const interval = setInterval(() => {
        setTime(Date.now() - currentRound.start);
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }
  }, [currentRound]);

  return (
    <div className='absolute bottom-4 left-4'>
      <div className='text-xl text-white'>
        Current Round: {time ? (time / 1000).toFixed(2) : '0'} seconds
      </div>
    </div>
  );
});

const PlayerHealth = observer(() => {
  const totalLives = Array.from({ length: gameState.totalLives }, (_, i) => i);
  const { getSetting } = useSettings();

  return (
    <div className='absolute top-4 left-4 flex flex-col gap-4'>
      <div className='flex flex-row items-center gap-4'>
        {totalLives.map((_, i) => (
          <img
            key={`heart-${String(i)}`}
            alt='heart'
            className='h-8 w-8'
            src='/heart.png'
          />
        ))}
      </div>
      {getSetting('showHealthBars') && (
        <div className='flex h-2 w-[200px] items-center justify-start rounded-[6px] bg-accent'>
          <div
            className='h-2 rounded-[5px] bg-red-500'
            style={{ width: `${String(gameState.playerHealth)}%` }}
          />
        </div>
      )}
    </div>
  );
});

const PlayerScore = observer(() => {
  return (
    <div className='absolute top-8 right-8 flex flex-col gap-4'>
      <div className='font-golondrina text-6xl text-white'>{gameState.score}</div>
    </div>
  );
});

const CurrentRound = observer(() => {
  return (
    <div className='absolute top-12 right-1/2 flex translate-x-1/2 flex-col gap-4'>
      <div className='font-golondrina text-6xl text-white'>Round: {gameState.level}</div>
    </div>
  );
});

const BackButton = observer(() => {
  const navigate = useNavigate();

  const handleBack = () => {
    void navigate({ to: '/' });
  };

  // Only show back button on home/start page (HomeScene)
  // Hide during active gameplay, game over, or multiplayer dungeon
  const isHomeScene = gameState.activeScene === 'home';
  const isInMultiplayerDungeon = multiplayerState.currentRoom && multiplayerState.isConnected;
  
  // Show only on home scene, hide during any gameplay
  if (!isHomeScene || isInMultiplayerDungeon) {
    return null;
  }

  return (
    <Button
      onClick={handleBack}
      variant="outline"
      className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-black/70 border-neutral-600 text-white"
    >
      <ArrowLeft className="h-10 w-10" />
    </Button>
  );
});

const FPSDisplay = () => {
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      
      setFrameCount(prev => prev + 1);
      
      if (deltaTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / deltaTime));
        setFrameCount(0);
        setLastTime(now);
      }
    }, 16); // ~60fps update rate

    return () => clearInterval(interval);
  }, [frameCount, lastTime]);

  return (
    <div className='absolute top-4 right-4 bg-black/50 px-2 py-1 rounded text-white text-sm font-mono z-50'>
      FPS: {fps}
    </div>
  );
};
