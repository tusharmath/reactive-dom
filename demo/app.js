/**
 * Created by tushar on 26/03/18
 */

/* global O */
'use strict'

const {h} = O.dom
const timer$ = O.scan(i => i + 1, 0, O.interval(100))

const baseStyle = {
  backgroundColor: 'red',
  height: '100px',
  width: '100px'
}

const addTransform = i => ({
  ...baseStyle,
  transform: `translateX(${i}px)`,
  opacity: `${i / 100}`
})
const rectStyle$ = O.map(addTransform, timer$)

const view$ = h('div', [
  h('h1', ['Fenil']),
  h('p', [timer$]),
  h('div', {
    style: rectStyle$
  })
])

O.forEach(i => document.body.appendChild(i), view$)
