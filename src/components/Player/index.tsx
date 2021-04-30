import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';

import Image from 'next/image';
import styles from  './styles.module.scss'

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player () {
    const audioRef = useRef <HTMLAudioElement> (null);
    const [progress, setProgress] = useState(0);

    const { currentEpisodeIndex, 
            episodeList,
            hasNext,
            hasPrevious,
            isLooping, 
            isPlaying, 
            isShuffling,
            clearPlayerState,
            playNext,
            playPrevious,
            toggleLoop,
            togglePlay, 
            toggleShuffle,
            setPlayingState, 
    } = usePlayer();
    
    useEffect (() => {
        if(!audioRef.current) {
            return;
        }
        
        if(isPlaying) {
            audioRef.current.play();
        }
        else {
            audioRef.current.pause();
        }
    }, [isPlaying])


    function handleEpisodeEnded () {
        if (hasNext) {
            playNext();
        }
        else {
            clearPlayerState();
        }
    }

    function handleSeek (amount: number) {
        audioRef.current.currentTime= amount;
        setProgress(amount);
    }

    function setupProgressListener () {
        audioRef.current.currentTime= 0;
        audioRef.current.addEventListener('timeupdate', event => {
            setProgress(Math.floor(audioRef.current.currentTime));
        })
    }

    const episode = episodeList[currentEpisodeIndex];

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src='/playing.svg' alt='Tocando agora'/>
                <strong>Tocando agora</strong>
            </header>

            { episode 
                ? (
                    <div className={styles.currentEpisode}>
                        <Image 
                            width={592} 
                            height={592} 
                            src={episode.thumbnail} 
                            objectFit='cover' 
                        />

                        <strong>{episode.title}</strong>
                        <span>{episode.members}</span>
                    </div>
                ) 
                : (
                    <div className={styles.emptyPlayer}>
                        <strong>Selecione um podcats para ouvir</strong>
                    </div>
                ) 
            }

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>

                    <div className={styles.slider}>
                        {episode 
                            ? (
                                <Slider
                                    max={episode.duration}
                                    value={progress}
                                    onChange={handleSeek}
                                    trackStyle={{ backgroundColor: '#04D361' }}
                                    railStyle={{ backgroundColor: '#9F75FF' }}
                                    handleStyle={{ borderColor: '#04D361', borderWidth: 4 }}
                                />
                            ) 
                            : (
                                <div className={styles.emptySlider} />
                            )
                        }
                    </div>

                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                { episode && (
                    <audio
                        src={episode.url}
                        
                        autoPlay
                        loop={isLooping}
                        ref={audioRef}
                        onEnded={handleEpisodeEnded}
                        onLoadedMetadata={setupProgressListener}
                        onPause={() => setPlayingState(false)}
                        onPlay={() => setPlayingState(true)}
                    />
                )}

                <div className={styles.buttons}>
                    <button 
                        type='button' 

                        className={isShuffling ? styles.isActive : ''}
                        disabled={!episode || episodeList.length === 1} 
                        onClick={toggleShuffle}
                    >
                        <img src='/shuffle.svg' alt='Embaralhar'/>
                    </button>

                    <button 
                        type='button' 
        
                        disabled={!episode || !hasPrevious} 
                        onClick={playPrevious} 
                    >
                        <img src='/play-previous.svg' alt='Tocar anterior'/>
                    </button>

                    <button 
                        type='button' 

                        disabled={!episode} 
                        onClick={togglePlay} >
                        { isPlaying 
                        ? <img src='/pause.svg' alt='Pausar'/>
                        : <img src='/play.svg' alt='Tocar'/>}
                    </button>

                    <button 
                        type='button' 
                        
                        disabled={!episode || !hasNext} 
                        onClick={playNext} 
                    >
                        <img src='/play-next.svg' alt='Tocar próxima'/>
                    </button>

                    <button 
                        type='button'

                        className={isLooping ? styles.isActive : ''}
                        disabled={!episode} 
                        onClick={toggleLoop}
                    >
                        <img src='/repeat.svg' alt='Repetir'/>
                    </button>
                </div>
            </footer>
        </div>
    );
}