import { PlayerId } from 'dusk-games-sdk/multiplayer'
import { Howl } from 'howler'
import { useEffect, useState } from 'react'

import * as Logic from './logic.ts'
import { useRollDiceView } from './RollDiceView.tsx'

import dieIconImage from './assets/die-icon.png'
import victoriaIslandImage from './assets/victoria-island.png'
import CashShop from './CashShop.tsx'

import clickSoundAudio from './assets/maple-click.mp3'

const clickSound = new Howl({ src: clickSoundAudio })

function App() {
  const [game, setGame] = useState<Logic.GameState>()
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>()
  const [showUi, setShowUi] = useState(false)

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
      {playerState.viewing === 'worldMap' && <img src={victoriaIslandImage} className="max-w-none h-screen" />}
      {playerState.viewing === 'cashShop' && <CashShop cashShop={cashShop} />}

      <div className={`pointer-events-none fixed w-full h-full z-40 transition-all ${!showUi && 'opacity-0'}`}>
        <div className="absolute w-full h-full">
          <div className="absolute w-full bottom-0 p-4 flex justify-end bg-gradient-to-b from-transparent to-black/50">
            <button
              className={`pointer-events-auto ${!rollDone && 'animate-bounce'}`}
              onClick={() => {
                clickSound.play()
                RollDiceView.show()
                setShowUi(false)
              }}
            >
              <img
                src={dieIconImage}
                className="h-16"
                style={{
                  imageRendering: 'auto',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      <RollDiceView
        onHide={() => {
          setShowUi(true)
        }}
        onRollDone={() => {
          setRollDone(true)
        }}
      />
    </>
  )
}

export default App
