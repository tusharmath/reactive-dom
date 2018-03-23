import {h, whenFree} from './dom'
import {scale$, timer$} from './lib'
import {containerStyle, dotStyle} from './style'
import * as R from 'ramda'
import * as O from 'observable-air'

const ROWS = 20
const COLS = 80
const COLOR_YELLOW = {backgroundColor: 'yellow'}
const COLOR_DEFAULT = {backgroundColor: 'rgb(97, 218, 251)'}

const Dot = (row, timer$) => col => {
  const enableBG$ = O.subject()
  const style$ = O.skipRepeats(
    R.equals,
    O.map(i => (i ? COLOR_YELLOW : COLOR_DEFAULT), enableBG$)
  )
  return h(
    'div',
    {
      on: {
        mouseover: () => enableBG$.next(true),
        mouseout: () => enableBG$.next(false)
      },
      style: dotStyle(row, col),
      style$
    },
    [O.merge(timer$, O.of(0))]
  )
}

const view = timer$ => {
  const lazyTimer$ = whenFree(16, timer$)
  return h('div', {style$: O.slice(0, 100, scale$), style: containerStyle()}, [
    h(
      'div',
      R.flatten(R.times(row => R.times(Dot(row, lazyTimer$), COLS), ROWS))
    )
  ])
}

O.forEach(el => document.body.appendChild(el), view(timer$))
