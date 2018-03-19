import { h } from './dom.js'

const seconds = R.compose(O.scan(R.inc, 0), O.interval)
const sec1000$ = seconds(1000)
const sec100$ = seconds(100)
const together$ = O.sample(R.identity, O.interval(5000), [
  O.combine((a, b) => `${Math.min(a, 15)}-${Math.min(b, 100)}`, [
    sec1000$,
    sec100$
  ])
])

const view = e =>
  h('div', {}, [
    h('p', { on: { click: e.of('p').emit } }, ['AAAA']),
    h('div', { on: { click: e.of('div').emit } }, ['every 1000ms:', sec1000$]),
    h('div', { on: { click: e.of('div').emit } }, [
      'Pretty updated:',
      together$
    ]),
    h('h1', { on: { click: e.of('h1').emit } }, ['every 100ms:', sec100$])
  ])

const emitter = hoe.create(console.log)

O.forEach(el => document.body.appendChild(el), view(emitter))
