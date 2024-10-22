import { useContext, useEffect, useMemo, useState } from 'react'

import { DIE_ROLL_DURATION_MS, WAIT_AFTER_FIRST_PLAYER_DECIDED } from './animations.consts.ts'
import { clickSound } from './audio.ts'
import CashShop from './CashShop.tsx'
import { useDiceRollModal } from './DiceRollModal.tsx'
import { GameStateContext } from './GameState.context.tsx'
import { useElectState } from './hooks.ts'
import * as Logic from './logic.ts'
import { sleep } from './utils.ts'
import WorldMap from './WorldMap.tsx'

import dieIconImage from './assets/die-icon.png'
import mapleForgeMascot1Image from './assets/maple-forge-mascot-1.png'
import mapleForgeMascot2Image from './assets/maple-forge-mascot-2.png'
import mesoBagIconImage from './assets/meso-bag-icon.png'
import worldMapIconImage from './assets/world-map-icon.png'
import Currency from './Currency.tsx'

function RollToDecideWhoGoesFirstScreen() {
  const mapleForgeMascotImage = useMemo(
    () => (Math.random() < 0.5 ? mapleForgeMascot1Image : mapleForgeMascot2Image),
    [],
  )
  const { game, yourPlayerId } = useContext(GameStateContext)
  const totalOnline = Logic.totalOnline(game)

  const MyDiceRollModal = useDiceRollModal(Logic.StartingDice)

  const myDecidingRollElect = Logic.decidedRollSum(game, yourPlayerId)
  const myDecidingRoll = useElectState(myDecidingRollElect, DIE_ROLL_DURATION_MS)
  const firstPlayerElect = Logic.findFirstPlayer(game)
  const firstPlayer = useElectState(firstPlayerElect, DIE_ROLL_DURATION_MS)

  const [countdown, setCountdown] = useState<number>()
  useEffect(() => {
    if (!firstPlayer) {
      return
    }

    const go = async () => {
      for (let i = Math.floor(WAIT_AFTER_FIRST_PLAYER_DECIDED / 1000); i >= 1; i--) {
        setCountdown(i)
        await sleep(1000)
      }
    }
    go()
  }, [firstPlayer])

  useEffect(() => {}, [countdown])

  return (
    <div
      className="absolute w-full h-full flex flex-col gap-4 justify-center items-center bg-cover bg-center p-3"
      style={{ backgroundImage: `url(${mapleForgeMascotImage})` }}
    >
      <button
        className="w-full h-full max-w-48 max-h-48 p-4 bg-gradient-to-t from-amber-700 to-amber-600 rounded shadow-2xl outline outline-8 outline-amber-800 flex flex-col gap-2 justify-center items-center"
        onClick={async () => {
          clickSound.play()
          await MyDiceRollModal.waitForRoll()
        }}
      >
        <div className="flex flex-col justify-center items-center">
          <div className="text-amber-50 text-6xl font-bold text-center font-damage uppercase">
            {!myDecidingRoll && <>Roll!</>}
            {myDecidingRoll && !firstPlayer && <>{myDecidingRoll}</>}
            {countdown && <>{countdown}</>}
          </div>
          <div className="text-amber-50 text-xs text-center">
            {!myDecidingRoll && <>Decide who goes first</>}
            {myDecidingRoll && !firstPlayer && <>Waiting for other players</>}
            {countdown && <>Starting game in...</>}
          </div>
        </div>

        <img src={dieIconImage} className={`w-20 ${myDecidingRoll ? 'animate-spin' : 'animate-bounce'}`} />
      </button>

      <div className="absolute w-full h-full left-0 top-0 flex justify-end items-end p-4 pointer-events-none">
        <div className="px-3 rounded bg-white/20 backdrop-blur flex items-center gap-2 text-white">
          <span className="font-damage text-3xl uppercase">{totalOnline}</span> <span className="text-xs">Online</span>
        </div>
      </div>

      <MyDiceRollModal />
    </div>
  )
}

function App() {
  const { game, yourPlayerId } = useContext(GameStateContext)
  const { playerStateById, whoseTurn: whoseTurnElect, cashShop } = game
  const playerState = playerStateById[yourPlayerId]!

  const whoseTurn = useElectState(whoseTurnElect, DIE_ROLL_DURATION_MS + WAIT_AFTER_FIRST_PLAYER_DECIDED)

  const MyDiceRollModal = useDiceRollModal(playerState.dice)
  // const [rolled, setRolled] = useState<[Logic.DieFace, Logic.DieFace]>()

  useEffect(() => {
    if (whoseTurnElect && whoseTurn === yourPlayerId) {
      Logic.actions.startGame()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whoseTurnElect, whoseTurn])

  if (!whoseTurn) {
    return <RollToDecideWhoGoesFirstScreen />
  }

  return (
    <div className="absolute w-full h-full flex flex-col justify-center items-center">
      <div
        // View portal
        className="relative grow w-full h-full overflow-auto bg-black"
      >
        {playerState.viewing === 'worldMap' && <WorldMap />}
        {playerState.viewing === 'cashShop' && <CashShop cashShop={cashShop} />}
      </div>

      <div
        // UI bottom bar
        className="relative w-full h-14"
      >
        <div className="absolute w-full h-full bg-gradient-to-b from-slate-200 via-slate-400 to-slate-400 border-t border-slate-50 outline outline-1 outline-slate-500" />

        <div className="absolute w-full h-full p-1 flex gap-1">
          <div className="grow flex p-1 justify-start items-center gap-1 rounded bg-gradient-to-b from-gray-500 via-gray-700 to-gray-700">
            <div
              // Level
              className="h-full px-1 flex justify-start items-center gap-1 rounded bg-gradient-to-br from-gray-700 via-black to-black"
            >
              <div className="text-white text-xs font-bold">LV.</div>
              <div className="p-0 rounded flex justify-start items-center gap-0.5">
                {playerState.level
                  .toString()
                  .split('')
                  .map((char, i) => (
                    <div key={i} className="font-mono font-bold text-white px-0.5 bg-orange-500 rounded">
                      {char}
                    </div>
                  ))}
              </div>
            </div>

            <div
              // Mesos
              className="h-full p-1 flex justify-start items-center gap-1 rounded bg-gradient-to-br from-gray-700 via-black to-black"
            >
              <div className="w-full h-full flex justify-center">
                <Currency type="meso" amount={playerState.mesos} textScale={1} />
              </div>
            </div>

            <div
              // Power crystals
              className="h-full p-1 flex justify-start items-center gap-1 rounded bg-gradient-to-br from-gray-700 via-black to-black"
            >
              <div className="w-full h-full flex justify-center">
                <Currency type="power" amount={playerState.powerCrystals} textScale={1} />
              </div>
            </div>

            <div
              // Wisdom crystals
              className="h-full p-1 flex justify-start items-center gap-1 rounded bg-gradient-to-br from-gray-700 via-black to-black"
            >
              <div className="w-full h-full flex justify-center">
                <Currency type="wisdom" amount={playerState.wisdomCrystals} textScale={1} />
              </div>
            </div>
          </div>

          {playerState.viewing === 'worldMap' && (
            <button
              className="pointer-events-auto px-4 rounded bg-gradient-to-r from-red-500 to-red-700 border outline outline-1 outline-red-700"
              onClick={() => {
                clickSound.play()
                Logic.actions.switchView({ view: 'cashShop' })
              }}
            >
              <img src={mesoBagIconImage} className="w-8" />
            </button>
          )}

          {playerState.viewing === 'cashShop' && (
            <button
              className="pointer-events-auto px-4 rounded bg-gradient-to-r from-blue-500 to-blue-700 border outline outline-1 outline-blue-700"
              onClick={() => {
                clickSound.play()
                Logic.actions.switchView({ view: 'worldMap' })
              }}
            >
              <img src={worldMapIconImage} className="w-8" />
            </button>
          )}

          {/* <button
                className="pointer-events-auto px-4 rounded bg-gradient-to-r from-green-500 to-green-700 border outline outline-1 outline-green-700"
                onClick={async () => {
                  clickSound.play()
                  await MyDiceRollModal.waitForRoll()
                }}
              >
                <img
                  src={dieIconImage}
                  className={`w-10 ${!rolled && 'animate-bounce'}`}
                />
              </button> */}
        </div>
      </div>

      <MyDiceRollModal />
    </div>
  )
}

export default App
