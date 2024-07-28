import { useMemo, useState } from 'react'

import { buySound, cashShopSound, clickSound } from './audio.ts'
import Currency from './Currency.tsx'
import DieFace from './DieFace.tsx'
import * as Logic from './logic.ts'
import { usePlayMusic } from './Music.hooks.ts'

function ConfirmBuyModal() {
  const [dieFace, setDieFace] = useState<Logic.DieFace>()
  const [hidden, hide] = useState(true)

  const [modalInstanceId, setModalInstanceId] = useState(Math.random())
  const {
    promise: confirmPromise,
    resolve: confirm,
    reject: cancel,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  } = useMemo(() => Promise.withResolvers<void>(), [modalInstanceId])

  ConfirmBuyModal.waitForConfirmation = async (face: Logic.DieFace) => {
    try {
      setDieFace(face)
      hide(false)
      await confirmPromise
    } finally {
      hide(true)
      setModalInstanceId(Math.random())
    }
  }

  return (
    <div
      className={`fixed z-50 left-0 top-0 w-full h-full p-8 flex justify-center items-center transition-all ${
        hidden && 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute w-full h-full bg-black opacity-50" />

      <div className="relative p-3 bg-gray-300 flex flex-col gap-3 rounded outline outline-1 outline-black border text-white">
        <div className="p-3 bg-blue-400 rounded outline outline-1 border-black border flex justify-center items-center gap-3">
          <div className="aspect-square h-16 grow">{dieFace && <DieFace {...dieFace} textScale={2.2} />}</div>

          <div>Are you sure you want to buy this item?</div>
        </div>

        <div className="flex justify-end gap-3 text-xs">
          <button
            className="bg-gradient-to-b from-orange-700 to-orange-400 py-1 px-3 outline outline-1 border outline-black rounded uppercase"
            onClick={() => {
              buySound.play()
              confirm()
            }}
          >
            Ok
          </button>

          <button
            className="bg-gradient-to-b from-orange-700 to-orange-400 py-1 px-3 outline outline-1 border outline-black rounded uppercase"
            onClick={() => {
              clickSound.play()
              cancel()
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

ConfirmBuyModal.waitForConfirmation = undefined as unknown as (face: Logic.DieFace) => Promise<unknown>

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
        <div className="w-full h-full">
          <Currency type="meso" amount={price} textScale={1.8} />
        </div>

        <div className="h-full">
          <button
            className="w-full h-full bg-gradient-to-b from-white via-[#AAAABC] to-white text-[#002156] text-base font-bold rounded-sm uppercase outline outline-1 border"
            onClick={async () => {
              clickSound.play()

              await ConfirmBuyModal.waitForConfirmation(face)

              Logic.actions.buyCashShopItem({ price, priceIndex })
            }}
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CashShop({ cashShop: { itemsByPrice } }: { cashShop: Logic.CashShop }) {
  usePlayMusic(cashShopSound)

  return (
    <div className="absolute w-full h-full flex justify-center">
      <div className="fixed left-0 top-0 w-full h-full bg-[#3064AC]" />

      <div className="w-[393px] h-full flex flex-col">
        {Object.entries(itemsByPrice).map(([price, items]) =>
          [...Array(Math.ceil(items.length / 2))].map((_, r) => (
            <div key={r} className="relative w-full flex">
              <CashShopItemCard priceIndex={r * 2 + 0} item={items[r * 2 + 0]!} price={parseInt(price)} />
              <CashShopItemCard priceIndex={r * 2 + 1} item={items[r * 2 + 1]!} price={parseInt(price)} />
            </div>
          )),
        )}

        <div
        // Padding at bottom
        >
          <div className="h-16" />
        </div>
      </div>

      <ConfirmBuyModal />
    </div>
  )
}
