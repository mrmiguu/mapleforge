import { useEffect, useMemo, useState } from 'react'

import { useDie } from './Die.tsx'

type RollDiceViewProps = {
  onHide: () => void
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
        onHide()
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
        className={`fixed z-50 w-full h-full flex flex-col gap-20 justify-center items-center transition-all ${
          rollDiceViewHidden && 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          Die1.roll(Die2)
        }}
        onMouseDown={() => {
          if (rollDone) {
            hideRollDiceView(true)
          }
        }}
      >
        <div className="absolute w-full h-full bg-black opacity-50 pointer-events-none" />

        <Die1
          faces={[
            { gain: ['meso', 6] },
            { gain: ['wisdom', 1] },
            { gain: ['wisdom', 2] },
            { gain: ['power', 1] },
            { gain: ['power', 2] },
            { gain: ['level', 3] },
          ]}
          onRollDone={() => setRollDone(true)}
        />

        <Die2
          faces={[
            { gain: ['meso', 6] },
            { gain: ['wisdom', 1] },
            { gain: ['wisdom', 2] },
            { gain: ['power', 1] },
            { gain: ['power', 2] },
            { gain: ['level', 3] },
          ]}
          onRollDone={() => setRollDone(true)}
        />
      </div>
    )
  }

  RollDiceView.show = undefined as unknown as () => void

  return RollDiceView
}

export const useRollDiceView = () => useMemo(generateRollDiceView, [])
