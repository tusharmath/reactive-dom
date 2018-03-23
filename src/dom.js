import * as O from 'observable-air'
import * as R from 'ramda'

const createELM = sel => {
  const [type, ...css] = sel.split('.')
  const el = document.createElement(type)
  css.forEach(i => el.classList.add(i))
  return el
}
const isNode = i => i instanceof Node
const toNode = node =>
  typeof node === 'string' || typeof node === 'number'
    ? new Text(node.toString())
    : node

class ElementContainer {
  constructor(type, props) {
    this.contentMap = {}
    this.disposables = []
    this.props = props
    this.root = createELM(type)
    this.attachEventListeners()
  }

  attachEventListeners() {
    for (let event in this.props.on) {
      const listener = this.props.on[event]
      this.root.addEventListener(event, listener)
      this.disposables.push(() =>
        this.root.removeEventListener(event, listener)
      )
    }
  }

  removeEventListeners() {
    this.disposables.forEach(i => i())
  }

  getKeys() {
    return Object.keys(this.contentMap).map(Number)
  }

  insertAt(id, node) {
    const keys = this.getKeys()
      .sort((a, b) => a - b)
      .filter(i => i > id)

    if (keys.length > 0) {
      this.root.insertBefore(node, this.contentMap[keys[0]])
    } else {
      this.root.appendChild(node)
    }
    this.contentMap[id] = node
  }

  findByID(id) {
    return this.getKeys().filter((_, i) => i === id)
  }

  removeAt(id) {
    const node = this.contentMap[id]
    node.parentNode.removeChild(node)
    delete this.contentMap[id]
  }

  updateStyle(style) {
    for (let i in style) {
      if (this.root.style[i] !== style[i]) {
        this.root.style[i] = style[i]
      }
    }
  }

  setTextContent(text) {
    this.root.textContent = text
  }
}

class DOMChildObserver {
  constructor(parent, id, sink) {
    this.parent = parent
    this.id = id
    this.sink = sink
  }
  next(node) {
    if (this.node === node) return
    if (isNode(node)) {
      if (this.node) this.parent.removeAt(this.id)
      this.parent.insertAt(this.id, toNode(node))
    } else {
      this.parent.setTextContent(node)
    }
    this.node = node
  }

  error(err) {
    this.sink.error(err)
  }

  complete() {
    if (isNode(this.node)) {
      this.parent.removeAt(this.id)
    } else {
      this.parent.setTextContent('')
    }
  }
}

const domObservable = (type, props, children$) => {
  const complete = () => {}
  return new O.Observable((observer, scheduler) => {
    let task = () => {
      const element = new ElementContainer(type, props, observer, scheduler)
      if (props.style) element.updateStyle(props.style)
      if (props.style$)
        subscriptions.push(
          props.style$.subscribe(
            {
              next: val => element.updateStyle(val),
              error: err => observer.error(err),
              complete: complete
            },
            scheduler
          )
        )

      subscriptions.push(
        ...children$.map((child, i) =>
          child.subscribe(new DOMChildObserver(element, i, observer), scheduler)
        )
      )

      observer.next(element.root)
    }
    const subscriptions = [scheduler.asap(task)]
    return () => {
      subscriptions.forEach(i => i.unsubscribe())
      parent.removeEventListeners()
    }
  })
}

export const h = (...t) => {
  let [type, props, children$] = t
  if (t.length === 2 && Array.isArray(props)) {
    children$ = props
    props = {}
  } else if (t.length === 2 && !Array.isArray(props)) {
    children$ = []
  }

  return domObservable(
    type,
    props,
    children$.map(i => (typeof i === 'string' ? just(i) : i))
  )
}

export const just = value =>
  new O.Observable(ob => {
    ob.next(value)
  })

const idle$ = new O.Observable(observer => {
  let _closed = false
  let id = 0

  const schedule = () => (id = requestIdleCallback(onEvent))

  const onEvent = obj => {
    observer.next(obj)
    if (!_closed) schedule()
  }
  schedule()
  return () => {
    cancelIdleCallback(id)
    _closed = true
  }
})
export const oncePerFrame = $ =>
  O.multicast(O.sample(R.identity, O.frames(), [$]))
export const whenFree = (budget, $) =>
  O.multicast(
    O.sample(
      R.identity,
      O.filter(i => {
        const timeRemaining = i.timeRemaining()
        return timeRemaining > budget
      }, idle$),
      [$]
    )
  )
