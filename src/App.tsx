import { PlayerId } from 'dusk-games-sdk/multiplayer'
import { useEffect, useState } from 'react'

import * as Logic from './logic.ts'
import { useRollDiceView } from './RollDiceView.tsx'

import dieIconImage from './assets/die-icon.png'
import mesoBagIconImage from './assets/meso-bag-icon.png'
import worldMapIconImage from './assets/world-map-icon.png'
import { clickSound } from './audio.ts'
import CashShop from './CashShop.tsx'
import WorldMap from './WorldMap.tsx'

type AppWithGameProps = {
  game: Logic.GameState
  yourPlayerId: PlayerId
}

function AppWithGame({ game, yourPlayerId }: AppWithGameProps) {
  const { playerStateById, cashShop } = game
  const playerState = playerStateById[yourPlayerId]

  const RollDiceView = useRollDiceView(playerState.dice)
  const [rollDone, setRollDone] = useState(false)

  useEffect(() => {
    if (playerState.showDiceRoll) {
      RollDiceView.show()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerState.showDiceRoll])

  return (
    <>
      {playerState.viewing === 'worldMap' && <WorldMap />}
      {playerState.viewing === 'cashShop' && <CashShop cashShop={cashShop} />}

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
                onClick={() => {
                  clickSound.play()
                  RollDiceView.show()
                }}
              >
                <img
                  src={dieIconImage}
                  className={`w-10 ${!rollDone && 'animate-bounce'}`}
                  style={{ imageRendering: 'auto' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <RollDiceView
        onRollDone={() => {
          setRollDone(true)
        }}
        onHide={() => {
          Dusk.actions.showDiceRoll({ show: false })
        }}
      />
    </>
  )
}

function App() {
  const [game, setGame] = useState<Logic.GameState>()
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>()

  useEffect(() => {
    Dusk.initClient({
      onChange: ({ game, yourPlayerId }) => {
        setGame(game)
        setYourPlayerId(yourPlayerId)
      },
    })
  }, [])

  if (!game || !yourPlayerId) {
    // Dusk only shows your game after an onChange() so no need for loading screen
    return
  }

  return <AppWithGame game={game} yourPlayerId={yourPlayerId} />
}

export default App
