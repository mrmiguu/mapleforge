import { useContext, useMemo, useState } from 'react'

import { DIE_ROLL_DURATION_MS } from './animations.consts.ts'
import { diceRollSound, dieRollSound } from './audio.ts'
import DieFace from './DieFace.tsx'
import { GameStateContext } from './GameState.context.tsx'
import * as Logic from './logic.ts'

const randomSymmetryWithTilt = (onlyTilt?: boolean) => {
  const symmetricalRotation = onlyTilt ? 0 : 4 * (Math.floor(3 * Math.random()) + 3)
  const randomTilt = symmetricalRotation + (Math.random() - 0.5) * 0.5
  return randomTilt
}

const dieRotationByFaceNum: { [faceNum in Logic.DieFaceNum]: [number, number, number] } = {
  1: [0, 0, 0],
  2: [2, 3, 2],
  3: [1, 1, 1],
  4: [3, 3, 1],
  5: [2, 1, 2],
  6: [0, 2, 0],
} as const

type DieProps = {
  which: Logic.WhichDie
  faces: [Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace]
  onRollEnd: () => void
}

const generateDie = () => {
  function Die({ which, faces, onRollEnd }: DieProps) {
    const {
      game: { playerStateById },
      yourPlayerId,
    } = useContext(GameStateContext)
    const { rolledNums } = playerStateById[yourPlayerId]!
    const rolledNum = rolledNums[which - 1]

    const [face1, face2, face3, face4, face5, face6] = faces
    const dieSizePx = 150
    const textScale = 4.5
    const radiusPx = dieSizePx / 2

    const [rollStarted, setRollStarted] = useState(false)
    const [rollDone, setRollDone] = useState(false)
    const [minRotateX, minRotateY, minRotateZ] = rolledNum ? dieRotationByFaceNum[rolledNum] : [0, 0, 0]
    const rotateX = useMemo(() => minRotateX + randomSymmetryWithTilt(!rolledNum), [minRotateX, rolledNum])
    const rotateY = useMemo(() => minRotateY + randomSymmetryWithTilt(!rolledNum), [minRotateY, rolledNum])
    const rotateZ = useMemo(() => minRotateZ + randomSymmetryWithTilt(!rolledNum), [minRotateZ, rolledNum])
    const rotateXDeg = rotateX * 90
    const rotateYDeg = rotateY * 90
    const rotateZDeg = rotateZ * 90

    const rolled = rollStarted || rollDone

    const dieFace = rolledNum ? faces[Number(rolledNum) - 1] : undefined

    const animationPlayState = rollDone ? 'paused' : 'running'

    Die.roll = (...otherDice: (typeof Die)[]) => {
      if (!rolled) {
        if (otherDice.length > 0) {
          diceRollSound.play()
        } else {
          dieRollSound.play()
        }
        setRollStarted(true)
        Logic.actions.rollDie({ which })
      }
      for (const die of otherDice) {
        die.roll()
      }
    }

    return (
      <div className="relative animate-bounce cursor-pointer" style={{ animationPlayState }}>
        <div
          className="relative z-20 transition-transform ease-out"
          style={{
            width: `${dieSizePx}px`,
            height: `${dieSizePx}px`,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotateYDeg}deg) rotateX(${rotateXDeg}deg) rotateZ(${rotateZDeg}deg)`,
            transitionDuration: `${DIE_ROLL_DURATION_MS}ms`,
          }}
          onTransitionEnd={() => {
            if (!dieFace) {
              throw new Error('Die not rolled')
            }
            setRollDone(true)
            onRollEnd()
          }}
        >
          <div
            className="bg-red-700 absolute w-full h-full flex justify-center items-center"
            style={{
              transform: `translateZ(${radiusPx}px)`,
            }}
          >
            <div
              className={`h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black transition-all duration-700 ${
                rollDone && rolledNum !== 1 && 'brightness-50'
              }`}
            >
              <DieFace {...face1} textScale={textScale} />
            </div>
          </div>

          <div
            className="bg-red-700 absolute w-full h-full flex justify-center items-center"
            style={{
              transform: `translateX(-${radiusPx}px) rotateY(-90deg) rotateX(0)`,
            }}
          >
            <div
              className={`h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black transition-all duration-700 ${
                rollDone && rolledNum !== 2 && 'brightness-50'
              }`}
            >
              <DieFace {...face2} textScale={textScale} />
            </div>
          </div>

          <div
            className="bg-red-700 absolute w-full h-full flex justify-center items-center"
            style={{
              transform: `translateY(${radiusPx}px) rotateX(90deg) rotateX(180deg)`,
            }}
          >
            <div
              className={`h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black transition-all duration-700 ${
                rollDone && rolledNum !== 3 && 'brightness-50'
              }`}
            >
              <DieFace {...face3} textScale={textScale} />
            </div>
          </div>

          <div
            className="bg-red-700 absolute w-full h-full flex justify-center items-center"
            style={{
              transform: `translateY(-${radiusPx}px) rotateX(90deg)`,
            }}
          >
            <div
              className={`h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black transition-all duration-700 ${
                rollDone && rolledNum !== 4 && 'brightness-50'
              }`}
            >
              <DieFace {...face4} textScale={textScale} />
            </div>
          </div>

          <div
            className="bg-red-700 absolute w-full h-full flex justify-center items-center"
            style={{
              transform: `translateX(${radiusPx}px) rotateY(90deg)`,
            }}
          >
            <div
              className={`h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black transition-all duration-700 ${
                rollDone && rolledNum !== 5 && 'brightness-50'
              }`}
            >
              <DieFace {...face5} textScale={textScale} />
            </div>
          </div>

          <div
            className="bg-red-700 absolute w-full h-full flex justify-center items-center"
            style={{
              transform: `translateZ(-${radiusPx}px) rotateY(180deg)`,
            }}
          >
            <div
              className={`h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-3 border border-black transition-all duration-700 ${
                rollDone && rolledNum !== 6 && 'brightness-50'
              }`}
            >
              <DieFace {...face6} textScale={textScale} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  Die.roll = undefined as unknown as (...dice: (typeof Die)[]) => void

  return Die
}

export const useDie = () => useMemo(generateDie, [])
