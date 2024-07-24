import { useEffect, useMemo, useState } from 'react'

import { useDie } from './Die.tsx'
import { clickSound } from './audio.ts'

type RollDiceViewProps = {
  onHide?: () => void
  onRollDone: () => void
}

const generateRollDiceView = () => {
  function RollDiceView({ onHide, onRollDone }: RollDiceViewProps) {
    const [rollDiceViewHidden, hideRollDiceView] = useState(true)
    const [rollDone, setRollDone] = useState(false)
    const Die1 = useDie()
    const Die2 = useDie()

    RollDiceView.show = () => hideRollDiceView(false)

    useEffect(() => {
      if (rollDiceViewHidden) {
        onHide?.()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rollDiceViewHidden])

    useEffect(() => {
      if (rollDone) {
        onRollDone()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rollDone])

    return (
      <div
        className={`fixed z-50 w-full h-full flex flex-col gap-20 justify-center items-center transition-all cursor-pointer ${
          rollDiceViewHidden && 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          clickSound.play()

          if (rollDone) {
            hideRollDiceView(true)
          } else {
            Die1.roll(Die2)
          }
        }}
      >
        <div className="absolute w-full h-full bg-black/50 pointer-events-none" />

        <Die1
          faces={[
            { gain: ['wisdom', 1] },
            { gain: ['wisdom', 2] },
            { gain: ['wisdom', 3] },
            { gain: ['wisdom', 4] },
            { gain: ['wisdom', 5] },
            { gain: ['wisdom', 6] },
          ]}
          onRollDone={() => setRollDone(true)}
        />

        {
          <Die2
            faces={[
              { gain: ['power', 1] },
              { gain: ['power', 2] },
              { gain: ['power', 3] },
              { gain: ['power', 4] },
              { gain: ['power', 5] },
              { gain: ['power', 6] },
            ]}
            onRollDone={() => setRollDone(true)}
          />
        }
      </div>
    )
  }

  RollDiceView.show = undefined as unknown as () => void

  return RollDiceView
}

export const useRollDiceView = () => useMemo(generateRollDiceView, [])
