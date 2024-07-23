import victoriaIslandImage from './assets/victoria-island.png'
import { kpqSound } from './audio'
import { usePlayMusic } from './Music.hooks'

export default function WorldMap() {
  usePlayMusic(kpqSound)

  return <img src={victoriaIslandImage} className="max-w-none h-screen" />
}
