const createELM = sel => {
  const [type, ...css] = sel.split('.')
  const el = document.createElement(type)
  css.forEach(i => el.classList.add(i))
  return el
}
const toNode = node =>
  typeof node === 'string' || typeof node === 'number'
    ? new Text(node.toString())
    : node

class DOMParentContainer {
  constructor(type, props, sink, sh) {
    this.sink = sink
    this.contentMap = {}
    this.disposables = []
    this.props = props
    sh.asap(() => {
      this.root = createELM(type)
      this.sink.next(this.root)
      this.attachEventListeners()
    })
  }

  attachEventListeners() {
    for (let event in this.props.on) {
      const listener = props.on[event]
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
}

class DOMChildObserver {
  constructor(parent, id, sink) {
    this.parent = parent
    this.id = id
    this.sink = sink
  }
  next(node) {
    if (this.node === node) {
      return
    }
    if (this.node) this.parent.removeAt(this.id)
    this.node = node
    this.parent.insertAt(this.id, toNode(this.node))
  }

  error(err) {
    this.sink.error(err)
  }

  complete() {
    this.parent.removeAt(this.id)
  }
}

class DOMObservable {
  constructor(type, props, children$) {
    this.type = type
    this.children$ = children$
    this.props = props
  }

  subscribe(observer, scheduler) {
    const parent = new DOMParentContainer(
      this.type,
      this.props,
      observer,
      scheduler
    )
    const subs = this.children$.map((child, i) =>
      child.subscribe(new DOMChildObserver(parent, i, observer), scheduler)
    )
    return () => {
      subs.forEach(i => i())
      parent.removeEventListeners()
    }
  }
}

const Lazy = value =>
  new O.Observable(ob => {
    ob.next(value)
  })

export const h = (...t) => {
  let [type, props, children$] = t
  if (t.length === 2 && Array.isArray(props)) {
    children$ = props
    props = {}
  } else if (t.length === 2 && !Array.isArray(props)) {
    children$ = []
  }

  console.log({ type, props, children$ })

  return new DOMObservable(
    type,
    props,
    children$.map(i => (typeof i === 'string' ? Lazy(i) : i))
  )
}
