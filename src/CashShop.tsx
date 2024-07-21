import Currency from './Currency.tsx'
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

export default function CashShop({ cashShop: { itemsByPrice } }: { cashShop: Logic.CashShop }) {
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
