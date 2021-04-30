import {createContext, ReactNode, useContext, useState } from 'react';

type Episode = {
    duration: number,
    members: string,
    thumbnail: string,
    title: string,
    url: string
}

type PlayerContextData = {
    currentEpisodeIndex: number;
    episodeList: Array <Episode>; 
    hasNext: boolean;
    hasPrevious: boolean;
    isLooping: boolean;
    isPlaying: boolean;
    isShuffling: boolean;
    clearPlayerState: () => void;
    play: (episode: Episode) => void;
    playList: (list: Episode[], index: number) => void;
    playNext: () => void;
    playPrevious: () => void;
    toggleLoop: () => void;
    togglePlay: () => void;
    toggleShuffle: () => void;
    setPlayingState: (state: boolean) => void;
}

export const PlayerContext = createContext ({} as PlayerContextData);

type PlayerContextProviderProps = {
    children: ReactNode
}

export function PlayerContextProvider ({ children }: PlayerContextProviderProps) {
    const [currentEpisodeIndex, setCurrentEpisodeIndex ] = useState(0);
    const [episodeList, setEpisodeList] = useState([]);
    const [isLooping, setIsLooping ] = useState(false);
    const [isPlaying, setIsPlaying ] = useState(false);
    const [isShuffling, setIsShuffling ] = useState(false);
  
    function clearPlayerState () {
        setEpisodeList([]);
        setCurrentEpisodeIndex(0);
    }

    function play (episode: Episode) {
      setEpisodeList([episode]);
      setCurrentEpisodeIndex(0);
      setIsPlaying(true);
    }

    function playList (list: Episode[], index: number) {
        setEpisodeList(list);
        setCurrentEpisodeIndex(index);
        setIsPlaying(true);
    }

    const hasPrevious = currentEpisodeIndex > 0;
    const hasNext = isShuffling ||  (currentEpisodeIndex + 1) < episodeList.length;

    function playNext () {   
        if (isShuffling) {
            const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length);
            setCurrentEpisodeIndex(nextRandomEpisodeIndex);
        }
        else if (hasNext) {
            setCurrentEpisodeIndex(currentEpisodeIndex + 1);
        }
    }

    function playPrevious () {
        if(hasPrevious) {
            setCurrentEpisodeIndex (currentEpisodeIndex - 1);
        }
    }

    function toggleLoop () {
        setIsLooping(!isLooping);
    }
  
    function togglePlay () {
      setIsPlaying(!isPlaying);
    }
  
    function toggleShuffle () {
        setIsShuffling (!isShuffling);
    }

    function setPlayingState (state: boolean) {
      setIsPlaying(state);
    }
    
    return (
      <PlayerContext.Provider 
        value={{ 
            currentEpisodeIndex, 
            episodeList,
            hasNext,
            hasPrevious,
            isLooping, 
            isPlaying, 
            isShuffling,
            clearPlayerState,
            play, 
            playList,
            playNext,
            playPrevious,
            toggleLoop,
            togglePlay, 
            toggleShuffle,
            setPlayingState, 
        }}>

        { children }
      </PlayerContext.Provider>
    );
}

export const usePlayer = () => {
    return useContext(PlayerContext);
}