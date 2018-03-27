# reactive-dom [![Build Status](https://travis-ci.org/tusharmath/reactive-dom.svg?branch=master)](https://travis-ci.org/tusharmath/reactive-dom)

**Reactive DOM** is an **observable** based library for building high performance user interfaces.

It uses observables to setup the pipes initially between various data sources and DOM elements. Whenever the data changes, all the relevant DOM elements get updated automatically.

## Links
- [Usage](#usage)
- [Virtual DOM vs Reactive DOM](#virtualdomvsreactivedom)
- [Example](#example)
- [Wish List](#wishlist)
- [Demo](https://github.com/tusharmath/reactive-dom/tree/master/demo)
- [Hyperscript](#hyperscript)

## Virtual DOM vs Reactive DOM

Feature | Virtual DOM | Reactive DOM
---     |---          | ---
**Semantics**| Declarative using `jsx` or `hyperscript` | Declarative using `hyperscript`
**Memory** | Usage is **high** because of a lot of intermediatory virtual DOM elements are created every time the DOM updates. The number of elements are also linearly proportional to size of the DOM tree. | Usage is very **low** because once the data pipeline is set, on every update the data is converted into a tiny `DOM Mutation Object` which has very basic information about what to update.
**CPU** | Its **high** because a lot of time is spent in calculating diff and figuring out what has changed, this is again mostly linearly proportional to the total number of DOM elements in the view.| It's **low** as no diff is required. The DOM Elements subscribe to only the part of the data that is needed for rendering that particular element's props/styles/attributes or children and updates whenever the data changes.
**Scheduling** | Once the diff phase starts the dom updating is left to the library. Prioritizing certain DOM updates over others isn't that simple. | Using observables, features such as `batch`, `throttle` or `delay` become extremely simple.
**Initialization** | Need manually to bind to hooks such as `componentWillMount()` and `componentWillUnmount()`. This makes resource allocation and disposal a manual process. | Evaluation is lazy ie. unless an element is inserted into the DOM nothing gets initialized. The resources are automatically released when the element is not visible any more.

## Usage

**CommonJS**
```js
const {h} = require('reactive-dom')
```
**ES6 or Typescript**
```ts
import {h} from 'reactive-dom'
```

**HTML**
```html
<!-- import observable-air as a peer-dependency -->
<script src="https://unpkg.com/observable-air/.dist/observable-air.umd.min.js"></script>
<script src="https://unpkg.com/reactive-dom/.dist/reactive-dom.umd.min.js"></script>
```


## Example
```js
import * as O from 'observable-air'
import {h} from 'reactive-dom'

// A timer stream which emits a value every 1000ms
const timer$ = O.scan(i => i + 1, 0, O.interval(1000))

// A DOM stream that emits the DOM node only once
const view$ = h('div', [  // Specify children in an array
  h('h1', [timer$]),      // node h1, automatically gets updated with text
  h('p', ['Hi'])          // node p, works with non-observable values also
])

O.forEach(i => document.body.appendChild(i), view$)
```

## Hyperscript
Hyperscript or `h` is a helper function that helps in writing views in a declarative manner.

**Element with children:**
Children are passed as an array to the `h` function. They can be of type `observable` or `string`.
```js
h('div', [
  h('div', [
    'Hello World'
  ])
])
```


**Element with an observable content:**

Children can be of `observable` type.
```js
const timer$ = O.scan(i => i + 1, 0, O.interval())
h('div', [
  timer$
])
```

**Element with an observable style/attrs:**

Each element can take `attrs` or `style` to set the element's internal properties. The values for `attrs` and `style` can be either an observable or an object.
```js
const timer$ = O.scan(i => i + 1, 0, O.interval())
const color = i => ({color: `rgba(0, 0, 0, ${i})`})
const style$ = O.map(i => color, timer$)

h('div', {style: style$}, [
  timer$,
  h('a', {attrs: {href: '/home'}}, [
    'Home'
  ])
])
```

## Wish List
- Server Side Rendering.
- Apply CSS classes conditionally (easy).
- Refactor public API to add custom plugins.
- Figure out event handling.
