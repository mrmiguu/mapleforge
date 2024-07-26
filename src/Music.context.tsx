import { createContext, PropsWithChildren, useEffect, useState } from 'react'

export type MusicContextType = {
  playing: Howl | null
  play: (music: Howl) => void
}

export const MusicContext = createContext<MusicContextType>(undefined as unknown as MusicContextType)

export function MusicContextProvider({ children }: PropsWithChildren) {
  const [playing, setPlaying] = useState<Howl | null>(null)

  const play = (music: Howl) => {
    setPlaying(music)
  }

  useEffect(() => {
    playing?.loop(true)
    // playing?.play()

    return () => {
      playing?.stop()
    }
  }, [playing])

  return <MusicContext.Provider value={{ playing, play }}>{children}</MusicContext.Provider>
}
