import levelUpImage from './assets/level-up-px.png'
import mesoBagImage from './assets/meso-bag-px.png'
import powerCrystalImage from './assets/power-crystal-px.png'
import wisdomCrystalImage from './assets/wisdom-crystal-px.png'

import * as Logic from './logic.ts'

type CurrencyProps = {
  type: Logic.GainType
  amount: number
  textScale: number
}

export default function Currency({ type, amount, textScale }: CurrencyProps) {
  const src =
    type === 'meso'
      ? mesoBagImage
      : type === 'wisdom'
      ? wisdomCrystalImage
      : type === 'power'
      ? powerCrystalImage
      : type === 'level'
      ? levelUpImage
      : undefined

  return (
    <div className="relative aspect-square">
      <img src={src} className="relative w-full h-full" />

      <div className="absolute z-10 left-0 top-0 w-full h-full flex justify-center items-center">
        <div
          style={{
            transform: `scale(${textScale / 2})`,
          }}
        >
          <div
            className="relative text-5xl text-white font-damage"
            style={{
              textShadow: '-1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000, 1px 1px 1px #000',
            }}
          >
            {amount}
          </div>
        </div>
      </div>
    </div>
  )
}
