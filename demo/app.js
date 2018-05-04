/**
 * Created by tushar on 26/03/18
 */

/* global O */
'use strict'

const {h} = O.dom
const event$ = i => O.multicast(O.fromDOM(document, i))
const enter$ = O.filter(i => i.key === 'Enter', event$('keypress'))
const text$ = O.multicast(
  O.scan((m, n) => ({id: m.id + 1, text: n}), {id: -1}, O.filter(i => i !== '', O.map(i => i.target.value, enter$)))
)
const destroy$ = O.map(i => {
  const target = i.target
  const node = document.getElementById(target.dataset.id)
  const id = Array.from(node.parentNode.childNodes).indexOf(node)
  console.log({node, id})
  return id
}, O.filter(i => i.target.matches('.destroy'), event$('click')))
const count$ = O.scan((a, b) => a + b, 0, O.merge(O.mapTo(1, text$), O.mapTo(-1, destroy$)))

const ONCE = data => new O.Observable(i => i.next(data))
const EMPTY = [ONCE('')]

const view$ = h('div', [
  h('section.todoapp', [
    h('header.header', [
      h('h1', ['todos']),
      h('input.new-todo', {attr: {placeholder: 'What need to be done?', autofocus: true}})
    ]),
    h('section.main', [
      h('input.toggle-all', {prop: {type: 'checkbox'}}),
      h('label.toggle-all', ['Mark all as complete']),
      h('ul.todo-list', [
        h('li', [
          h('input.toggle', {prop: {type: 'checkbox'}}),
          h('label', ['Things I do and Things I dont']),
          h('button.destroy', EMPTY)
        ]),
        h('li', [
          h('input.toggle', {prop: {type: 'checkbox'}}),
          h('label', ['Things I do and Things I dont']),
          h('button.destroy', EMPTY)
        ]),
        h('li', [
          h('input.toggle', {prop: {type: 'checkbox'}}),
          h('label', ['Things I do and Things I dont']),
          h('button.destroy', EMPTY)
        ])
      ])
    ]),
    h('footer.footer', [
      h('div.filters', [h('a.selected', ['All']), h('a', ['Active']), h('a', ['Completed'])]),
      h('button.clear-completed', ['Clear Completed'])
    ])
  ])
])

document.addEventListener('DOMContentLoaded', () => {
  O.forEach(i => document.body.appendChild(i), view$)
})
