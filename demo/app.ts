/**
 * Created by tushar on 26/03/18
 */

/* global O */
'use strict'

import * as O from 'observable-air'
import {IObservable} from 'observable-air'
import {h, hStatic} from '../index'

type Input = {
  keyPress$: IObservable<KeyboardEvent>
  storage$: IObservable<Array<string>>
}

type State = {
  todo$: IObservable<Array<string>>
  inputProps$: IObservable<any>
  footerStyle$: IObservable<any>
}

const input = (document: Document): Input => {
  const event$ = <T extends Event>(i: string) => O.multicast<T>(O.fromDOM(document as any, i))
  const keyPress$ = O.filter(i => i.key === 'Enter', event$<KeyboardEvent>('keypress'))
  const OLD_DATA = localStorage.getItem('DATA')
  const storage$ = O.tap(console.log, O.of(OLD_DATA ? JSON.parse(OLD_DATA) : []))
  return {keyPress$, storage$}
}

const update = ({keyPress$, storage$}: Input): State => {
  const INPUT_PROPS = {placeholder: 'What need to be done?', autofocus: true, value: ''}
  const DISPLAY_NONE = {display: 'none'}

  const enter$ = O.filter(_ => _ !== '', O.map((_: any) => _.target.value, keyPress$))
  const todo$ = O.merge(O.flatMap(data => O.scan((data, i) => [i, ...data], data, enter$), storage$), storage$)
  const inputProps$ = O.concat(O.of(INPUT_PROPS), O.mapTo(INPUT_PROPS, enter$))
  const footerStyle$ = O.concat(O.of(DISPLAY_NONE), O.map(_ => (_.length > 0 ? {display: ''} : DISPLAY_NONE), todo$))
  return {todo$, inputProps$, footerStyle$}
}

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
        h('div', [O.map(_ => _.join(':'), todo$)]),
        O.switchMap(
          todo =>
            h(
              'ul.todo-list',
              todo.map(_ =>
                h('li', [
                  h('input.toggle', {props: {type: 'checkbox'}}),
                  h('label', [_]),
                  h('button.destroy', [hStatic('')])
                ])
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

document.addEventListener('DOMContentLoaded', () => {
  O.forEach(i => document.body.appendChild(i), view(update(input(document))))
})

O.forEach(data => localStorage.setItem('DATA', JSON.stringify(data)), update(input(document)).todo$)

// O.forEach(console.log, update(input(document)).todo$)
