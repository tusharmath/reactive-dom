/**
 * Created by tushar on 26/03/18
 */

/* global O */
'use strict'

import * as O from 'observable-air'
import {IObservable} from 'observable-air'
import {h} from '../index'

/**
 * Real world data in an immutable format
 */
type Input = {
  inputText$: IObservable<string>
  storage$: IObservable<Array<string>>
}

/**
 * Represents the application state
 */
type State = {
  todo$: IObservable<Array<string>>
  inputProps$: IObservable<any>
  footerStyle$: IObservable<any>
}

/**
 * Takes in the real world mutable data and returns streams of immutable type
 * @param {Document} document
 * @returns {Input}
 */
const input = (document: Document): Input => {
  const inputText$ = O.multicast(
    O.map(
      (e: any) => e.target.value,
      O.filter<KeyboardEvent>(i => i.key === 'Enter', O.fromDOM(document as any, 'keypress'))
    )
  )
  const storage$ = new O.Observable(ob => {
    const OLD_DATA = localStorage.getItem('DATA')
    if (OLD_DATA) ob.next(JSON.parse(OLD_DATA))
    else ob.next([])
    ob.complete()
  })

  return {inputText$, storage$}
}

/**
 * Takes in real world immutable data and converts it into application state
 * @param {IObservable<string>} inputText$
 * @param {IObservable<Array<string>>} storage$
 * @returns {State}
 */
const update = ({inputText$, storage$}: Input): State => {
  const INPUT_PROPS = {placeholder: 'What need to be done?', autofocus: true, value: ''}
  const DISPLAY_NONE = {display: 'none'}

  const text$ = O.filter(_ => _ !== '', inputText$)
  const todo$ = O.merge(O.flatMap(todo => O.scan((data, i) => [i, ...data], todo, text$), storage$), storage$)
  const inputProps$ = O.concat(O.of(INPUT_PROPS), O.mapTo(INPUT_PROPS, text$))
  const footerStyle$ = O.map(_ => (_.length > 0 ? {display: ''} : DISPLAY_NONE), todo$)
  return {todo$, inputProps$, footerStyle$: footerStyle$}
}

/**
 * Converts the state into an actual functioning DOM tree
 * @param {IObservable<Array<string>>} todo$
 * @param {IObservable<any>} inputProps$
 * @param footerStyle$
 * @returns {hReturnType}
 */
const view = ({todo$, inputProps$, footerStyle$}: State) => {
  return h('div', [
    h('section.todoapp', [
      h('header.header', [
        h('h1', ['todos']),
        h('input.new-todo', {
          props: inputProps$
        })
      ]),
      h('section.main', [
        h('input.toggle-all', {props: {type: 'checkbox'}}),
        h('label.toggle-all', ['Mark all as complete']),
        O.switchMap(
          todo =>
            h(
              'ul.todo-list',
              todo.map(_ =>
                h('li', [h('input.toggle', {props: {type: 'checkbox'}}), h('label', [_]), h('button.destroy', [''])])
              )
            ),
          todo$
        )
      ]),
      h('footer.footer', {style: footerStyle$}, [
        h('span.todo-count', [O.map(_ => `${_.length} items left`, todo$)]),
        h('div.filters', [h('a.selected', ['All']), h('a', ['Active']), h('a', ['Completed'])]),
        h('button.clear-completed', ['Clear Completed'])
      ])
    ]),
    h('footer.info', [
      h('p', ['Double-click to edit a todo']),
      h('p', ['Written by', h('a', {props: {href: 'https://twitter.com/tusharmath'}}, ['Tushar Mathur'])]),
      h('p', ['Part of', h('a', {props: {href: 'http://todomvc.com'}}, ['TodoMVC'])])
    ])
  ])
}

const state = update(input(document))

document.addEventListener('DOMContentLoaded', () => {
  O.forEach(i => document.body.appendChild(i), view(state))
})

O.forEach(data => localStorage.setItem('DATA', JSON.stringify(data)), state.todo$)
