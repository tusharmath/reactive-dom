# reactive-dom [![Build Status](https://travis-ci.org/tusharmath/reactive-dom.svg?branch=master)](https://travis-ci.org/tusharmath/reactive-dom) 
Write views declaratively without creating a virtual DOM.

## Links
- [Usage](#usage)
- [Example](#example)
- [Wish List](#wishlist)
- [Demo](https://github.com/tusharmath/reactive-dom/tree/master/demo)
- [Hyperscript](#hyperscript)


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
import * as O from 'observable-dom'
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

**Element with children**
Children are passed as an array to the `h` function.
```js
h('div', [
  h('div', [
    'Hello World'
  ])
])
```


**Element with an observable content**
Children can take both `string` and `observable` type.
```js
const timer$ = O.scan(i => i + 1, 0, O.interval())
h('div', [
  timer$
])
```

**Element with an observable style/attrs**
Each element can take `attrs` or `style` to set the element's internal properties.
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
- Applying CSS classes conditionally.
- Refactor public API to add custom plugins.
- Figure out event handling.
