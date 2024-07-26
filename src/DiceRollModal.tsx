import { useEffect, useMemo, useState } from 'react'

import * as Logic from './logic.ts'

import { useDie } from './Die.tsx'
import { clickSound } from './audio.ts'

const generateDiceRollModal = (dice: [Logic.Die, Logic.Die]) => {
  function DiceRollModal() {
    const [hidden, hide] = useState(true)
    const [face1, setFace1] = useState<Logic.DieFace>()
    const [face2, setFace2] = useState<Logic.DieFace>()
    const Die1 = useDie()
    const Die2 = useDie()

    const rollDone = Boolean(face1 && face2)

    const [rollPromiseId, setRollPromiseId] = useState(Math.random())
    const {
      promise: rollPromise,
      resolve: resolveRoll,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } = useMemo(() => Promise.withResolvers<[Logic.DieFace, Logic.DieFace]>(), [rollPromiseId])

    DiceRollModal.waitForRoll = async () => {
      try {
        hide(false)
        return await rollPromise
      } finally {
        setRollPromiseId(Math.random())
      }
    }

    useEffect(() => {
      if (face1 && face2) {
        resolveRoll([face1, face2])
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [face1, face2])

    return (
      <div
        className={`fixed z-50 w-full h-full flex flex-col gap-20 justify-center items-center transition-all cursor-pointer ${
          hidden && 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          clickSound.play()

          if (rollDone) {
            hide(true)
          } else {
            Die1.roll(Die2)
          }
        }}
      >
        <div className="absolute w-full h-full bg-black/50 pointer-events-none" />

        <Die1 faces={dice[0]} onRollEnd={setFace1} />
        <Die2 faces={dice[1]} onRollEnd={setFace2} />
      </div>
    )
  }

  DiceRollModal.waitForRoll = undefined as unknown as () => Promise<[Logic.DieFace, Logic.DieFace]>

  return DiceRollModal
}

export const useDiceRollModal = (dice: [Logic.Die, Logic.Die]) => useMemo(() => generateDiceRollModal(dice), [dice])
