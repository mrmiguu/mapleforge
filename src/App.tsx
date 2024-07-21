import { PlayerId } from 'dusk-games-sdk/multiplayer'
import { useEffect, useState } from 'react'

import victoriaIslandImage from './assets/victoria-island.png'

import Currency from './Currency.tsx'
import Die from './Die.tsx'
import DieFace from './DieFace.tsx'
import * as Logic from './logic.ts'

type CashShopItemCardProps = {
  priceIndex: number
  item: Logic.CashShopItem
  price: number
}

function CashShopItemCard({ priceIndex, item: { face, bought }, price }: CashShopItemCardProps) {
  return (
    <div
      className={`w-full h-32 m-1 bg-[#A9CCEF] rounded-sm outline outline-1 border p-2 flex gap-2 ${
        bought && 'brightness-50 contrast-50 pointer-events-none'
      }`}
    >
      <div className="h-full aspect-square bg-gradient-to-br from-red-500 to-red-700 shadow-lg rounded-3xl p-3 outline outline-1">
        <DieFace {...face} textScale={3} />
      </div>

      <div className="w-full flex flex-col gap-2">
        <div className="w-full h-full flex gap-1 justify-center items-center">
          <Currency type="meso" amount={price} textScale={1.1} />
        </div>

        <div className="h-full">
          <button
            className="w-full h-full bg-gradient-to-b from-white via-[#AAAABC] to-white text-[#002156] text-base font-bold rounded-sm uppercase outline outline-1 border"
            onClick={() => Dusk.actions.buyCashShopItem({ price, priceIndex })}
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  )
}

function CashShop({ cashShop: { itemsByPrice } }: { cashShop: Logic.CashShop }) {
  return (
    <div className="absolute w-full h-full flex justify-center">
      <div className="fixed left-0 top-0 w-full h-full bg-[#3064AC]" />

      <div className="w-[393px] h-full flex flex-col">
        {Object.entries(itemsByPrice).map(([price, items]) =>
          [...Array(Math.ceil(items.length / 2))].map((_, r) => (
            <div key={r} className="relative w-full flex">
              <CashShopItemCard priceIndex={r * 2 + 0} item={items[r * 2 + 0]} price={parseInt(price)} />
              <CashShopItemCard priceIndex={r * 2 + 1} item={items[r * 2 + 1]} price={parseInt(price)} />
            </div>
          )),
        )}
      </div>
    </div>
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

        // if (action && action.name === 'claimCell') selectSound.play()
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

      <div className="fixed z-50 w-full h-full flex justify-center items-center">
        <div className="absolute w-full h-full bg-black opacity-50" />

        <Die
          faces={[
            { gain: ['meso', 6] },
            { gain: ['wisdom', 1] },
            { gain: ['wisdom', 2] },
            { gain: ['power', 1] },
            { gain: ['power', 2] },
            { gain: ['level', 3] },
          ]}
        />
      </div>
    </>
  )
}

export default App
