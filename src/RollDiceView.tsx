import { Howl } from 'howler'
import { useState } from 'react'

import dieRollSoundAudio from './assets/die-roll.mp3'
import Die from './Die.tsx'

const dieRollSound = new Howl({ src: dieRollSoundAudio })

type RollDiceViewProps = {}

export default function RollDiceView({}: RollDiceViewProps) {
  const [rollDiceViewHidden, hideRollDiceView] = useState(false)
  const [rollStarted, setRollStarted] = useState(false)
  const [rollDone, setRollDone] = useState(false)
  const [[rotateX1, rotateY1, rotateZ1], setRotate1] = useState([0, 0, 0])
  const [[rotateX2, rotateY2, rotateZ2], setRotate2] = useState([0, 0, 0])

  RollDiceView.show = () => hideRollDiceView(false)

  const rolled = rollStarted || rollDone

  const animationPlayState = rollDone ? 'paused' : 'running'

  return (
    <div
      className={`fixed z-50 w-full h-full flex flex-col gap-20 justify-center items-center transition-all ${
        rollDiceViewHidden && 'opacity-0 pointer-events-none'
      }`}
      onClick={() => {
        if (!rolled) {
          dieRollSound.play()
          setRollStarted(true)
          setRotate1([Math.random() * 2400, Math.random() * 2400, Math.random() * 2400])
          setRotate2([Math.random() * 2400, Math.random() * 2400, Math.random() * 2400])
        }
      }}
      onMouseDown={() => {
        if (rollDone) {
          hideRollDiceView(true)
        }
      }}
    >
      <div className="absolute w-full h-full bg-black opacity-50 pointer-events-none" />

      <div className="relative animate-bounce cursor-pointer" style={{ animationPlayState }}>
        <Die
          faces={[
            { gain: ['meso', 6] },
            { gain: ['wisdom', 1] },
            { gain: ['wisdom', 2] },
            { gain: ['power', 1] },
            { gain: ['power', 2] },
            { gain: ['level', 3] },
          ]}
          rotateX={rotateX1}
          rotateY={rotateY1}
          rotateZ={rotateZ1}
          onRotateEnd={() => setRollDone(true)}
        />
      </div>

      <div className="relative animate-bounce cursor-pointer" style={{ animationPlayState }}>
        <Die
          faces={[
            { gain: ['meso', 6] },
            { gain: ['wisdom', 1] },
            { gain: ['wisdom', 2] },
            { gain: ['power', 1] },
            { gain: ['power', 2] },
            { gain: ['level', 3] },
          ]}
          rotateX={rotateX2}
          rotateY={rotateY2}
          rotateZ={rotateZ2}
          onRotateEnd={() => setRollDone(true)}
        />
      </div>
    </div>
  )
}
RollDiceView.show = () => {}
