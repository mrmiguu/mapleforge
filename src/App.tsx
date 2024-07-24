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

function App() {
  const [game, setGame] = useState<Logic.GameState>()
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>()

  const RollDiceView = useRollDiceView()
  const [rollDone, setRollDone] = useState(false)

  useEffect(() => {
    Dusk.initClient({
      onChange: ({ game, yourPlayerId }) => {
        setGame(game)
        setYourPlayerId(yourPlayerId)

        // if (action && action.name === 'claimCell') clickSound.play()
      },
    })
  }, [])

  if (!game || !yourPlayerId) {
    // Dusk only shows your game after an onChange() so no need for loading screen
    return
  }

  const { playerStateById, cashShop } = game
  const playerState = playerStateById[yourPlayerId]

  return (
    <>
      {playerState.viewing === 'worldMap' && <WorldMap />}
      {playerState.viewing === 'cashShop' && <CashShop cashShop={cashShop} />}

      <div className="pointer-events-none fixed w-full h-full z-40">
        <div className="absolute w-full h-full">
          <div className="absolute w-full h-16 bottom-0">
            <div className="absolute w-full h-full bg-gradient-to-b from-slate-200 via-slate-400 to-slate-400 border-t border-slate-50 outline outline-1 outline-slate-500" />

            <div className="absolute w-full h-full p-1 flex gap-1">
              <div className="grow pointer-events-auto px-4 rounded bg-gradient-to-b from-gray-500 via-gray-700 to-gray-700"></div>

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
      />
    </>
  )
}

export default App
