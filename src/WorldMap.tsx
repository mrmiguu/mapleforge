import victoriaIslandImage from './assets/victoria-island.png'
import { kpqSound } from './audio'
import { usePlayMusic } from './Music.hooks'

export default function WorldMap() {
  usePlayMusic(kpqSound)

  return (
    <div>
      <img src={victoriaIslandImage} className="z-0 max-w-none h-[125vh]" />
    </div>
  )
}
