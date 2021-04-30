import { GetStaticPaths, GetStaticProps } from "next";
import styles from './episode.module.scss'
import { usePlayer } from "../../contexts/PlayerContext";

import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link'

import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";
import { api } from "../../services/api";

type Episode = {
    id: string,
    duration: number,
    durationAsString: string,
    description: string,
    members: string,
    publishedAt: string,
    thumbnail: string,    
    title: string,
    url: string,
}

type EpisodeProps = {
    episode: Episode;
}

export default function Episode ({ episode }: EpisodeProps) {
    const { play } = usePlayer();

    return (
        <div className={styles.spaceDiv} >
            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head> 

            <div className={styles.episode}>
                <div className={styles.thumbnailContainer}>
                    <Link href='/'>
                        <button type='button'>
                            <img src='/arrow-left.svg' alt="Voltar"/>
                        </button>
                    </Link>

                    <Image 
                        src={episode.thumbnail} 
                        height={160} 
                        width={700} 
                        objectFit='cover' 
                    />

                    <button type='button' onClick={() => play(episode)}>
                        <img src='/play.svg' alt="Tocar episódio"/>
                    </button>
                </div>

                <header>
                    <h1>{episode.title}</h1>
                    
                    <span>{episode.members}</span>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                </header>

                <div 
                    className={styles.description} 
                    dangerouslySetInnerHTML={{__html: episode.description}}
                />
            </div>
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('episodes', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    })

    const paths = data.map (episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })

    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const {slug} = ctx.params;
    const { data } = await api.get (`episodes/${slug}`)

    const episode = {
        id: data.id,
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
        thumbnail: data.thumbnail,
        title: data.title,
        url: data.file.url
    }

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24 //24 hours
    }
}