'use client';

import React, { useState, useEffect } from 'react';
import { Match, PlayerProfile, PreferencePosition } from '@/types';
import { INITIAL_PLAYERS, INITIAL_MATCH, EMPTY_USER_TEMPLATE } from '@/lib/mock-data';
import { Navbar, NavTab } from '@/components/Navbar';
import { HomeView } from '@/components/HomeView';
import { MatchDrawView } from '@/components/MatchDrawView';
import { ScoreBoardView } from '@/components/ScoreBoardView';
import { RankingView } from '@/components/RankingView';
import { VotingModal } from '@/components/VotingModal';
import { ProfileModal } from '@/components/ProfileModal';
import { PlayerCard } from '@/components/PlayerCard';
import { OnboardingView } from '@/components/OnboardingView';
import { TutorialModal } from '@/components/TutorialModal';
import {
  loadPersistedState,
  fetchRemoteStateFromSupabase,
  savePlayerProfile,
  persistMatchAndPlayers,
  loadUIState,
  saveUIState,
} from '@/lib/supabase-service';
import { X } from 'lucide-react';

const VALID_TABS: NavTab[] = ['home', 'sorteio', 'placar', 'rankings'];

export default function HomePage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [players, setPlayers] = useState<PlayerProfile[]>(INITIAL_PLAYERS);
  const [match, setMatch] = useState<Match>(INITIAL_MATCH);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile>(EMPTY_USER_TEMPLATE);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [votingPlayer, setVotingPlayer] = useState<PlayerProfile | null>(null);
  const [previewPlayer, setPreviewPlayer] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initApp() {
      const local = loadPersistedState(INITIAL_PLAYERS, INITIAL_MATCH);
      const ui = loadUIState();

      const isUserRegistered = Boolean(
        ui.hasCompletedOnboarding &&
          local.currentUser &&
          local.currentUser.id &&
          local.currentUser.fullName.trim() !== ''
      );

      if (mounted) {
        setPlayers(local.players);
        setMatch(local.match);
        setCurrentPlayer(local.currentUser);
        setHasCompletedOnboarding(isUserRegistered);

        const hashTab = window.location.hash.replace('#', '') as NavTab;
        if (VALID_TABS.includes(hashTab)) {
          setCurrentTab(hashTab);
          saveUIState({ currentTab: hashTab });
        } else if (ui.currentTab && VALID_TABS.includes(ui.currentTab)) {
          setCurrentTab(ui.currentTab);
          window.history.replaceState(null, '', `#${ui.currentTab}`);
        }

        if (ui.isProfileOpen && isUserRegistered) {
          setIsProfileOpen(true);
        }
        if (isUserRegistered && !ui.hasSeenTutorial) {
          setIsTutorialOpen(true);
        }
        setIsHydrated(true);
      }

      const remote = await fetchRemoteStateFromSupabase(INITIAL_MATCH);
      if (mounted && remote) {
        setPlayers(remote.players);
        setMatch(remote.match);

        if (local.currentUser && local.currentUser.id) {
          const freshMe = remote.players.find((p) => p.id === local.currentUser.id);
          if (freshMe) {
            setCurrentPlayer(freshMe);
          }
        }

        if (ui.votingPlayerId) {
          const vp = remote.players.find((p) => p.id === ui.votingPlayerId);
          if (vp) setVotingPlayer(vp);
        }
        if (ui.previewPlayerId) {
          const pp = remote.players.find((p) => p.id === ui.previewPlayerId);
          if (pp) setPreviewPlayer(pp);
        }
      }
    }

    initApp();
    return () => {
      mounted = false;
    };
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    saveUIState({ currentTab: tab });
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tab}`);
    }
  };

  const handleOpenProfile = (open: boolean) => {
    setIsProfileOpen(open);
    saveUIState({ isProfileOpen: open });
  };

  const handleSetVotingPlayer = (player: PlayerProfile | null) => {
    setVotingPlayer(player);
    saveUIState({ votingPlayerId: player ? player.id : null });
  };

  const handleSetPreviewPlayer = (player: PlayerProfile | null) => {
    setPreviewPlayer(player);
    saveUIState({ previewPlayerId: player ? player.id : null });
  };

  const updateMatchState = (updated: Match) => {
    setMatch(updated);
    persistMatchAndPlayers(updated, players, currentPlayer);
  };

  const updatePlayersState = (updatedList: PlayerProfile[]) => {
    setPlayers(updatedList);
    persistMatchAndPlayers(match, updatedList, currentPlayer);
  };

  const handleSaveProfile = async (updated: PlayerProfile) => {
    const { savedProfile, updatedPlayers, updatedMatch } = await savePlayerProfile(
      updated,
      players,
      match
    );
    setCurrentPlayer(savedProfile);
    setPlayers(updatedPlayers);
    setMatch(updatedMatch);
    await persistMatchAndPlayers(updatedMatch, updatedPlayers, savedProfile);
  };

  const handleCompleteOnboarding = async (
    updated: PlayerProfile,
    initialCheckInPreference: PreferencePosition | 'nao_confirmar'
  ) => {
    const remoteBefore = await fetchRemoteStateFromSupabase(INITIAL_MATCH);
    const basePlayers = remoteBefore ? remoteBefore.players : players;
    const baseMatch = remoteBefore ? remoteBefore.match : match;

    const { savedProfile, updatedPlayers, updatedMatch } = await savePlayerProfile(
      updated,
      basePlayers,
      baseMatch
    );

    let finalMatch = updatedMatch;
    if (initialCheckInPreference === 'nao_confirmar') {
      finalMatch = {
        ...updatedMatch,
        presences: updatedMatch.presences.filter((pr) => pr.playerId !== savedProfile.id),
      };
    } else {
      const alreadyIn = updatedMatch.presences.some((pr) => pr.playerId === savedProfile.id);
      if (alreadyIn) {
        finalMatch = {
          ...updatedMatch,
          presences: updatedMatch.presences.map((pr) =>
            pr.playerId === savedProfile.id
              ? {
                  ...pr,
                  player: savedProfile,
                  positionPreference: initialCheckInPreference,
                  isReserve: initialCheckInPreference === 'reserva',
                }
              : pr
          ),
        };
      } else {
        finalMatch = {
          ...updatedMatch,
          presences: [
            ...updatedMatch.presences,
            {
              id: `pr-${Date.now()}`,
              matchId: updatedMatch.id,
              playerId: savedProfile.id,
              player: savedProfile,
              positionPreference: initialCheckInPreference,
              isReserve: initialCheckInPreference === 'reserva',
              confirmedAt: new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          ],
        };
      }
    }

    setCurrentPlayer(savedProfile);
    setPlayers(updatedPlayers);
    setMatch(finalMatch);
    saveUIState({ hasCompletedOnboarding: true, hasSeenTutorial: false });
    setHasCompletedOnboarding(true);
    setIsTutorialOpen(true);
    await persistMatchAndPlayers(finalMatch, updatedPlayers, savedProfile);
  };

  const handleSaveVote = (playerId: string, rating: number, categoryVote?: string) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    const newRating =
      target.starsRating <= 0
        ? Number(rating.toFixed(1))
        : Number(((target.starsRating * 3 + rating) / 4).toFixed(1));
    const baseOverallFromStars = Math.round(50 + newRating * 9);
    const newOverall =
      target.overallRating <= 0
        ? Math.min(99, baseOverallFromStars)
        : Math.min(99, Math.max(baseOverallFromStars, Math.round(target.overallRating + (rating >= 4.5 ? 2 : rating >= 3.5 ? 1 : 0))));
    const isMvp = categoryVote === 'mvp' ? target.mvpCount + 1 : target.mvpCount;

    const updatedTarget: PlayerProfile = {
      ...target,
      starsRating: newRating,
      overallRating: newOverall,
      mvpCount: isMvp,
    };

    const updatedList = players.map((p) => (p.id === playerId ? updatedTarget : p));
    const nextCurrentUser = currentPlayer.id === playerId ? updatedTarget : currentPlayer;

    const updatedMatch: Match = {
      ...match,
      presences: match.presences.map((pr) =>
        pr.playerId === playerId ? { ...pr, player: updatedTarget } : pr
      ),
    };

    setPlayers(updatedList);
    setMatch(updatedMatch);
    setCurrentPlayer(nextCurrentUser);
    persistMatchAndPlayers(updatedMatch, updatedList, nextCurrentUser);
  };

  if (!isHydrated) {
    return <div className="min-h-screen bg-[#f0f4f8]" />;
  }

  if (!hasCompletedOnboarding || !currentPlayer.id || !currentPlayer.fullName.trim()) {
    return (
      <OnboardingView
        initialPlayer={currentPlayer}
        onCompleteOnboarding={handleCompleteOnboarding}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        currentPlayer={currentPlayer}
        onOpenProfile={() => handleOpenProfile(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-5 pb-24 md:pb-8 w-full flex-1">
        {currentTab === 'home' && (
          <HomeView
            match={match}
            currentPlayer={currentPlayer}
            allPlayers={players}
            onNavigate={handleTabChange}
            onOpenProfile={() => handleOpenProfile(true)}
            onOpenVoting={(p) => handleSetVotingPlayer(p)}
          />
        )}

        {currentTab === 'sorteio' && (
          <MatchDrawView
            match={match}
            currentPlayer={currentPlayer}
            allPlayers={players}
            onUpdateMatch={updateMatchState}
            onGoToGame={() => handleTabChange('placar')}
          />
        )}

        {currentTab === 'placar' && (
          <ScoreBoardView
            match={match}
            allPlayers={players}
            onUpdateMatch={updateMatchState}
            onUpdatePlayers={updatePlayersState}
            onOpenVoting={() => handleTabChange('rankings')}
          />
        )}

        {currentTab === 'rankings' && (
          <RankingView
            players={players}
            onSelectPlayer={(p) => handleSetPreviewPlayer(p)}
            onOpenVoting={(p) => handleSetVotingPlayer(p)}
          />
        )}
      </main>

      {votingPlayer && (
        <VotingModal
          player={votingPlayer}
          isOpen={Boolean(votingPlayer)}
          onClose={() => handleSetVotingPlayer(null)}
          onSaveVote={handleSaveVote}
        />
      )}

      <ProfileModal
        player={currentPlayer}
        isOpen={isProfileOpen}
        onClose={() => handleOpenProfile(false)}
        onSave={handleSaveProfile}
        onReopenOnboarding={() => {
          setCurrentPlayer(EMPTY_USER_TEMPLATE);
          saveUIState({ hasCompletedOnboarding: false, hasSeenTutorial: false });
          setHasCompletedOnboarding(false);
        }}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        playerName={currentPlayer.fullName}
        onClose={() => {
          setIsTutorialOpen(false);
          saveUIState({ hasSeenTutorial: true });
        }}
      />

      {previewPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => handleSetPreviewPlayer(null)}
              className="absolute -top-3 -right-3 z-10 p-2 text-slate-600 hover:text-slate-900 bg-white rounded-full shadow-lg border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <PlayerCard
              player={previewPlayer}
              compact={false}
              showVoteButton={true}
              onVote={() => {
                handleSetVotingPlayer(previewPlayer);
                handleSetPreviewPlayer(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
