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

const dom$ = h('div', [
  h('p', ['AAAA']),
  h('div', ['every 1000ms:', sec1000$]),
  h('div', ['Pretty updated:', together$]),
  h('h1', ['every 100ms:', sec100$])
])

O.forEach(el => document.body.appendChild(el), dom$)
