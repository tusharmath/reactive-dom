/**
 * Created by tushar on 26/03/18
 */

/* global O */
'use strict'

const {hh} = O.dom

const event$ = i => O.multicast(O.fromDOM(document, i))
const enter$ = O.filter(i => i.key === 'Enter', event$('keypress'))
const text$ = O.multicast(
  O.scan(
    (m, n) => ({id: m.id + 1, text: n}),
    {id: -1},
    O.map(i => i.target.value, enter$)
  )
)
const destroy$ = O.map(
  i => Number(i.target.dataset.id),
  O.filter(i => i.target.matches('.destroy'), event$('click'))
)

// O.forEach(console.log, destroy$)

const footer$ = hh('footer.info', {
  append: O.merge(
    hh('p', {append: O.of('Double-click to edit a todo')}),
    hh('p', {
      append: O.merge(
        O.of('Written by '),
        hh('a', {
          props: O.of({href: 'https://github.com/tusharmath'}),
          append: O.of('Tushar Mathur')
        })
      )
    }),
    hh('p', {
      append: O.merge(
        O.of('Part of '),
        hh('a', {
          props: O.of({href: 'http://todomvc.com'}),
          append: O.of('TodoMVC')
        })
      )
    })
  )
})
const todoList$ = O.flatMap(({text, id}) => {
  return hh('li', {
    append: O.merge(
      hh('input.toggle', {
        props: O.of({type: 'checkbox'})
      }),
      hh('label', {
        append: O.of(text.toString())
      }),
      hh('button.destroy', {
        attrs: O.of({
          ['data-id']: id
        })
      })
    )
  })
}, text$)

const view$ = hh('div', {
  append: O.merge(
    hh('section.todoapp', {
      append: O.merge(
        hh('header.header', {
          append: O.merge(
            hh('h1', {
              append: O.merge(O.of('todos'))
            }),
            hh('input.new-todo', {
              props: O.merge(
                O.of({placeholder: 'What needs to be done?'}),
                O.mapTo({value: ''}, text$)
              )
            })
          )
        }),
        hh('section.main', {
          append: O.merge(
            hh('ul.todo-list', {
              append: todoList$,
              removeAt: destroy$
            })
          )
        })
      )
    }),
    footer$
  )
})
document.addEventListener('DOMContentLoaded', () => {
  O.forEach(i => document.body.appendChild(i), view$)
})
