import { useEffect, useMemo, useState } from 'react'

import * as Logic from './logic.ts'

import { useDie } from './Die.tsx'
import { clickSound } from './audio.ts'

const generateDiceRollModal = (dice: [Logic.Die, Logic.Die]) => {
  function DiceRollModal() {
    const [hidden, hide] = useState(true)
    const [rolled1, setRolled1] = useState(false)
    const [rolled2, setRolled2] = useState(false)
    const Die1 = useDie()
    const Die2 = useDie()

    const [rollPromiseId, setRollPromiseId] = useState(Math.random())
    const {
      promise: rollPromise,
      resolve: resolveRoll,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } = useMemo(() => Promise.withResolvers<void>(), [rollPromiseId])

    DiceRollModal.waitForRoll = async () => {
      try {
        hide(false)
        await rollPromise
      } finally {
        setRollPromiseId(Math.random())
      }
    }

    useEffect(() => {
      if (rolled1 && rolled2) {
        resolveRoll()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rolled1, rolled2])

    return (
      <div
        className={`fixed z-50 w-full h-full flex flex-col gap-20 justify-center items-center transition-all cursor-pointer ${
          hidden && 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          clickSound.play()

          if (rolled1 && rolled2) {
            hide(true)
          } else {
            Die1.roll(Die2)
          }
        }}
      >
        <div className="absolute w-full h-full bg-black/50 pointer-events-none" />

        <Die1 which={1} faces={dice[0]} onRollEnd={() => setRolled1(true)} />
        <Die2 which={2} faces={dice[1]} onRollEnd={() => setRolled2(true)} />
      </div>
    )
  }

  DiceRollModal.waitForRoll = undefined as unknown as () => Promise<void>

  return DiceRollModal
}

export const useDiceRollModal = (dice: [Logic.Die, Logic.Die]) => useMemo(() => generateDiceRollModal(dice), [dice])
