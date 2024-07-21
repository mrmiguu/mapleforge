import { Howl } from 'howler'
import { useEffect, useState } from 'react'

import DieFace from './DieFace.tsx'
import * as Logic from './logic.ts'

import dieRollSoundAudio from './assets/die-roll.mp3'

const dieRollSound = new Howl({ src: dieRollSoundAudio })

type DieProps = {
  faces: [Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace]
}

export default function Die({ faces: [face1, face2, face3, face4, face5, face6] }: DieProps) {
  const dieSizePx = 150
  const textScale = 4.5
  const radiusPx = dieSizePx / 2

  const [rollStarted, setRollStarted] = useState(false)
  const [rollDone, setRollDone] = useState(false)
  const [[rotateX, rotateY, rotateZ], setRotate] = useState([0, 0, 0])

  useEffect(() => {
    if (rollDone || rollStarted) {
      return
    }

    const onClick = () => {
      dieRollSound.play()
      setRollStarted(true)
      setRotate([Math.random() * 2400, Math.random() * 2400, Math.random() * 2400])
    }

    addEventListener('click', onClick)
    return () => removeEventListener('click', onClick)
  }, [rollDone, rollStarted])

  return (
    <div
      className={`animate-bounce ${!rollDone && 'cursor-pointer'}`}
      style={{
        animationPlayState: rollDone ? 'paused' : 'running',
      }}
    >
      <div
        className="relative z-20 transition-transform duration-1000"
        style={{
          width: `${dieSizePx}px`,
          height: `${dieSizePx}px`,
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
        }}
        onTransitionEnd={() => {
          setRollDone(true)
        }}
      >
        <div
          className="bg-red-700 absolute w-full h-full flex justify-center items-center"
          style={{
            transform: `translateZ(${radiusPx}px)`,
          }}
        >
          <div className="h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black">
            <DieFace {...face1} textScale={textScale} />
          </div>
        </div>

        <div
          className="bg-red-700 absolute w-full h-full flex justify-center items-center"
          style={{
            transform: `translateX(-${radiusPx}px) rotateY(-90deg) rotateX(180deg)`,
          }}
        >
          <div className="h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black">
            <DieFace {...face2} textScale={textScale} />
          </div>
        </div>

        <div
          className="bg-red-700 absolute w-full h-full flex justify-center items-center"
          style={{
            transform: `translateY(${radiusPx}px) rotateX(90deg) rotateX(180deg)`,
          }}
        >
          <div className="h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black">
            <DieFace {...face3} textScale={textScale} />
          </div>
        </div>

        <div
          className="bg-red-700 absolute w-full h-full flex justify-center items-center"
          style={{
            transform: `translateY(-${radiusPx}px) rotateX(90deg)`,
          }}
        >
          <div className="h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black">
            <DieFace {...face4} textScale={textScale} />
          </div>
        </div>

        <div
          className="bg-red-700 absolute w-full h-full flex justify-center items-center"
          style={{
            transform: `translateX(${radiusPx}px) rotateY(90deg)`,
          }}
        >
          <div className="h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black">
            <DieFace {...face5} textScale={textScale} />
          </div>
        </div>

        <div
          className="bg-red-700 absolute w-full h-full flex justify-center items-center"
          style={{
            transform: `translateZ(-${radiusPx}px) rotateY(180deg)`,
          }}
        >
          <div className="h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black">
            <DieFace {...face6} textScale={textScale} />
          </div>
        </div>
      </div>
    </div>
  )
}
