import { h } from './dom.js'

const seconds = R.compose(
  O.multicast,
  O.scan(i => (i === 9 ? 0 : i + 1), 0),
  O.interval
)
const MAX_RANGE = 100
const getINC = (n, i) =>
  (n === MAX_RANGE && i > 0) || (n === 0 && i < 0) ? -i : i

const translate = R.compose(
  O.multicast,
  O.slice(0, 20000),
  O.map(R.compose(R.divide(R.__, MAX_RANGE), R.nth(0))),
  O.scan(([n, i]) => [n + getINC(n, i), getINC(n, i)], [0, 1]),
  O.frames
)

const translate$ = translate()

const transform = cnt => i => ({
  transform: `translateX(${cnt * i * 100}px)`
})
const timer$ = seconds(1000)
const Dot = cnt => {
  const style = O.map(transform(cnt), translate$)
  return h('div.element', { style }, [timer$])
}

const Triangle = () => {
  return h('div.triangle', R.times(Dot, 10))
}

const view = e => h('div', [Triangle()])

const emitter = hoe.create(console.log)

O.forEach(el => document.body.appendChild(el), view(emitter))

// O.forEach(console.log, O.slice(0, 20, translate$))
