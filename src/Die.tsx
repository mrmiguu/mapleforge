import { useEffect, useMemo, useState } from 'react'

import { diceRollSound, dieRollSound } from './audio.ts'
import DieFace from './DieFace.tsx'
import * as Logic from './logic.ts'

const randomSymmetry = () => {
  return 4 * (Math.floor(3 * Math.random()) + 3)
}

const dieRotationByFace = {
  1: [0, 0, 0],
  2: [2, 3, 2],
  3: [1, 1, 1],
  4: [3, 3, 1],
  5: [2, 1, 2],
  6: [0, 2, 0],
}

type Face = keyof typeof dieRotationByFace

type DieProps = {
  faces: [Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace, Logic.DieFace]
  onRollDone: () => void
  debug?: boolean
}

const generateDie = () => {
  function Die({ faces, onRollDone }: DieProps) {
    const [face1, face2, face3, face4, face5, face6] = faces
    const dieSizePx = 150
    const textScale = 4.5
    const radiusPx = dieSizePx / 2

    const [rollStarted, setRollStarted] = useState(false)
    const [rollDone, setRollDone] = useState(false)
    const [facing, setFacing] = useState<Face>()
    const [minRotateX, minRotateY, minRotateZ] = facing ? dieRotationByFace[facing] : [0, 0, 0]
    const rotateX = useMemo(() => minRotateX + randomSymmetry(), [minRotateX])
    const rotateY = useMemo(() => minRotateY + randomSymmetry(), [minRotateY])
    const rotateZ = useMemo(() => minRotateZ + randomSymmetry(), [minRotateZ])
    const rotateXDeg = facing ? rotateX * 90 : 45
    const rotateYDeg = facing ? rotateY * 90 : 45
    const rotateZDeg = facing ? rotateZ * 90 : 45

    const rolled = rollStarted || rollDone

    const animationPlayState = rollDone ? 'paused' : 'running'

    useEffect(() => {
      if (facing) {
        const msg = `facing ${facing} => (rot) ${[rotateX, rotateY, rotateZ]} => (deg) ${[
          rotateXDeg,
          rotateYDeg,
          rotateZDeg,
        ]}`

        console.log(msg)
      }
    }, [rotateXDeg, rotateYDeg, rotateZDeg])

    Die.roll = (...otherDice: (typeof Die)[]) => {
      if (!rolled) {
        if (otherDice.length > 0) {
          diceRollSound.play()
        } else {
          dieRollSound.play()
        }
        setRollStarted(true)
        setFacing(((Math.floor(Math.random() * 6) % 6) + 1) as Face)
      }
      for (const die of otherDice) {
        die.roll()
      }
    }

    return (
      <div className="relative animate-bounce cursor-pointer" style={{ animationPlayState }}>
        <div
          className="relative z-20 transition-transform duration-[1.6s] ease-out"
          style={{
            width: `${dieSizePx}px`,
            height: `${dieSizePx}px`,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotateYDeg}deg) rotateX(${rotateXDeg}deg) rotateZ(${rotateZDeg}deg)`,
          }}
          onTransitionEnd={() => {
            setRollDone(true)
            onRollDone()
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
              transform: `translateX(-${radiusPx}px) rotateY(-90deg) rotateX(0)`,
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

  Die.roll = undefined as unknown as (...dice: (typeof Die)[]) => void

  return Die
}

export const useDie = () => useMemo(generateDie, [])
