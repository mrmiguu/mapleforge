import { useContext, useEffect, useMemo, useState } from 'react'

import { clickSound, kpqSound } from './audio.ts'
import CashShop from './CashShop.tsx'
import { useDiceRollModal } from './DiceRollModal.tsx'
import { GameStateContext } from './GameState.context.tsx'
import * as Logic from './logic.ts'
import { usePlayMusic } from './Music.hooks.ts'
import WorldMap from './WorldMap.tsx'

import dieIconImage from './assets/die-icon.png'
import mapleForgeMascot1Image from './assets/maple-forge-mascot-1.png'
import mapleForgeMascot2Image from './assets/maple-forge-mascot-2.png'
import mesoBagIconImage from './assets/meso-bag-icon.png'
import worldMapIconImage from './assets/world-map-icon.png'

function InstructionsScreenRollToDecideWhoGoesFirst() {
  const mapleForgeMascotImage = useMemo(
    () => (Math.random() < 0.5 ? mapleForgeMascot1Image : mapleForgeMascot2Image),
    [],
  )
  const MyDiceRollModal = useDiceRollModal(Logic.StartingDice)
  const [rolled, setRolled] = useState<[Logic.DieFace, Logic.DieFace]>()
  const [rollSum, setRollSum] = useState<number>()

  useEffect(() => {
    if (!rolled) {
      return
    }

    const [face1, face2] = rolled
    if ('op' in face1 || 'op' in face2) {
      throw new Error('Starting dice must not contain any or/and faces')
    }

    const rollSum = face1.gain[1] + face2.gain[1]
    setRollSum(rollSum)
  }, [rolled])

  return (
    <div
      className="bg-gradient-to-tr from-lime-300 to-emerald-600 absolute w-full h-full flex flex-col gap-4 justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${mapleForgeMascotImage})` }}
    >
      <button
        className="w-2/3 h-1/2 p-4 bg-gradient-to-t from-amber-700 to-amber-600 rounded shadow-2xl outline outline-8 outline-amber-800 flex flex-col gap-4 justify-center items-center"
        onClick={async () => {
          clickSound.play()
          setRolled(await MyDiceRollModal.waitForRoll())
        }}
      >
        <div className="flex flex-col justify-center items-center">
          <div className="text-amber-50 text-6xl font-bold text-center font-damage uppercase">
            {!rolled && <>Roll!</>}
            {rolled && <>{rollSum}</>}
          </div>
          <div className="text-amber-50 text-xs text-center">
            {!rolled && <>Decide who goes first</>}
            {rolled && <>Waiting for other players</>}
          </div>
        </div>
        <img
          src={dieIconImage}
          className={`w-20 ${rolled ? 'animate-spin' : 'animate-bounce'}`}
          style={{ imageRendering: 'auto' }}
        />
      </button>

      <MyDiceRollModal />
    </div>
  )
}

function App() {
  usePlayMusic(kpqSound)
  const { game, yourPlayerId } = useContext(GameStateContext)
  const { playerStateById, playerOrder, cashShop } = game
  const playerState = playerStateById[yourPlayerId]

  const MyDiceRollModal = useDiceRollModal(playerState.dice)
  const [rolled, setRolled] = useState<[Logic.DieFace, Logic.DieFace]>()

  useEffect(() => {
    if (!playerState.showDiceRoll) {
      return
    }

    const roll = async () => {
      setRolled(await MyDiceRollModal.waitForRoll())
    }
    roll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerState.showDiceRoll])

  const showInstructionsScreenRollToDecideWhoGoesFirst = !(yourPlayerId in playerOrder)

  return (
    <>
      {showInstructionsScreenRollToDecideWhoGoesFirst && <InstructionsScreenRollToDecideWhoGoesFirst />}
      {playerState.viewing === 'worldMap' && <WorldMap />}
      {playerState.viewing === 'cashShop' && <CashShop cashShop={cashShop} />}

      {playerState.viewing && (
        <div className="pointer-events-none fixed w-full h-full z-40">
          <div className="absolute w-full h-full">
            <div className="absolute w-full h-16 bottom-0">
              <div className="absolute w-full h-full bg-gradient-to-b from-slate-200 via-slate-400 to-slate-400 border-t border-slate-50 outline outline-1 outline-slate-500" />

              <div className="absolute w-full h-full p-1 flex gap-1">
                <div className="grow flex p-1 justify-start items-center rounded bg-gradient-to-b from-gray-500 via-gray-700 to-gray-700">
                  <div className="h-full px-3 flex justify-start items-center rounded bg-gradient-to-br from-gray-700 via-black to-black">
                    <div className="text-white text-3xl font-bold">LV.</div>
                    <div className="p-2 rounded flex justify-start items-center gap-0.5">
                      {playerState.level
                        .toString()
                        .split('')
                        .map((char, i) => (
                          <div key={i} className="font-mono font-bold text-white px-1 bg-orange-500 rounded">
                            {char}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {playerState.viewing === 'worldMap' && (
                  <button
                    className="pointer-events-auto px-4 rounded bg-gradient-to-r from-red-500 to-red-700 border outline outline-1 outline-red-700"
                    onClick={() => {
                      clickSound.play()
                      Dusk.actions.switchView({ view: 'cashShop' })
                    }}
                  >
                    <img src={mesoBagIconImage} className="w-10" style={{ imageRendering: 'auto' }} />
                  </button>
                )}

                {playerState.viewing === 'cashShop' && (
                  <button
                    className="pointer-events-auto px-4 rounded bg-gradient-to-r from-blue-500 to-blue-700 border outline outline-1 outline-blue-700"
                    onClick={() => {
                      clickSound.play()
                      Dusk.actions.switchView({ view: 'worldMap' })
                    }}
                  >
                    <img src={worldMapIconImage} className="w-10" style={{ imageRendering: 'auto' }} />
                  </button>
                )}

                <button
                  className="pointer-events-auto px-4 rounded bg-gradient-to-r from-green-500 to-green-700 border outline outline-1 outline-green-700"
                  onClick={async () => {
                    clickSound.play()
                    await MyDiceRollModal.waitForRoll()
                  }}
                >
                  <img
                    src={dieIconImage}
                    className={`w-10 ${!rolled && 'animate-bounce'}`}
                    style={{ imageRendering: 'auto' }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MyDiceRollModal />
    </>
  )
}

export default App
