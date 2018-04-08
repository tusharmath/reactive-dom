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
    O.filter(i => i !== '', O.map(i => i.target.value, enter$))
  )
)
const destroy$ = O.map(i => {
  const target = i.target
  const node = document.getElementById(target.dataset.id)
  const id = Array.from(node.parentNode.childNodes).indexOf(node)
  console.log({node, id})
  return id
}, O.filter(i => i.target.matches('.destroy'), event$('click')))
const count$ = O.scan(
  (a, b) => a + b,
  0,
  O.merge(O.mapTo(1, text$), O.mapTo(-1, destroy$))
)

// O.forEach(console.log, destroy$)

const pageFooter$ = hh('footer.info', {
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
    props: O.of({id}),
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

const footer$ = count$ => {
  return hh('footer.footer', {
    append: O.merge(
      hh('span.todo-count', {text: O.map(i => `${i} items left`, count$)}),
      hh('div.filters', {
        append: O.merge(
          hh('a.selected', {props: O.of({href: '#/'}), append: O.of('All')}),
          hh('a', {
            props: O.of({href: '#/active'}),
            append: O.of('Active')
          }),
          hh('a', {
            props: O.of({href: '#/completed'}),
            append: O.of('Completed')
          })
        )
      }),
      hh('button.clear-completed', {append: O.of('Clear completed')})
    )
  })
}

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
            }),
            O.switchMap(
              _ => (_ ? footer$(count$) : O.of('')),
              O.skipRepeats((a, b) => a === b, O.map(i => i > 0, count$))
            )
          )
        })
      )
    }),
    pageFooter$
  )
})
document.addEventListener('DOMContentLoaded', () => {
  O.forEach(i => document.body.appendChild(i), view$)
})
