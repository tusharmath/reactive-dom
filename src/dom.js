const createELM = type => document.createElement(type)
const toNode = node =>
  typeof node === 'string' || typeof node === 'number'
    ? new Text(node.toString())
    : node

class DOMParentContainer {
  constructor(type, sink, sh) {
    this.sink = sink
    this.root = createELM(type)
    this.contentMap = {}
    sh.asap(() => this.sink.next(this.root))
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
  constructor(type, children$) {
    this.type = type
    this.children$ = children$
  }

  subscribe(observer, scheduler) {
    const parent = new DOMParentContainer(this.type, observer, scheduler)
    const subs = this.children$.map((child, i) =>
      child.subscribe(new DOMChildObserver(parent, i, observer), scheduler)
    )
    return () => subs.forEach(i => i())
  }
}

const Lazy = value =>
  new O.Observable(ob => {
    ob.next(value)
  })

export const h = (type, children$) => {
  return new DOMObservable(
    type,
    children$.map(i => (typeof i === 'string' ? Lazy(i) : i))
  )
}
