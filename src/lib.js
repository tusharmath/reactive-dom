import * as O from 'observable-air'
import * as R from 'ramda'

const seconds = R.compose(
  O.multicast,
  O.scan(i => (i === 9 ? 0 : i + 1), 0),
  O.interval
)

const MAX_RANGE = 100
const getINC = (n, i) =>
  (n === MAX_RANGE && i > 0) || (n === 0 && i < 0) ? -i : i

const containerScale = i => ({
  transform: `scaleX(${1 - i / MAX_RANGE * 10}) scaleY(1) translateZ(0.1px)`
})

/**
 * Time stream which is emitted when there is time :P
 */
export const timer$ = seconds(1000)

/**
 * Scale animation stream which is emitted when we have the capability to render
 */
export const scale$ = R.compose(
  O.map(R.compose(containerScale, R.divide(R.__, MAX_RANGE), R.nth(0))),
  O.scan(([n, i]) => [n + getINC(n, i), getINC(n, i)], [0, 1]),
  R.always(O.multicast(O.frames()))
)()
