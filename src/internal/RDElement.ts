/**
 * Created by tushar on 04/05/18
 */

import {createElement} from './helpers/createElement'
import {objectDiff} from './helpers/objectDiff'
import {RDSet} from './RDSet'
import {RDAttributes, RDEventListeners, RDProps, RDStyles, VNode} from './VNode'

/**
 * Provides low-level DOM APIs to update/mutate real dom nodes.
 */
export class RDElement {
  private elm?: HTMLElement
  private set = new RDSet()
  private elmMap = new Map<number, RDElement>()
  private style?: RDStyles
  private attrs?: RDAttributes
  private on?: RDEventListeners
  private sel?: string

  private setAttrs(attrs: RDAttributes) {
    const {add, del} = objectDiff(attrs, this.attrs)
    del.forEach(_ => this.getElm().removeAttribute(_))
    add.forEach(_ => this.getElm().setAttribute(_, attrs[_]))
    this.attrs = attrs
  }

  private setStyle(style: RDStyles) {
    const {add, del} = objectDiff(style, this.style)
    del.forEach(_ => this.getElm().style.removeProperty(_))
    add.forEach(_ => this.getElm().style.setProperty(_, (style as any)[_]))
    this.style = style
  }

  private setProps(props: RDProps) {
    const elm = this.getElm() as any
    const {add, del} = objectDiff(props, elm)
    del.forEach(_ => delete elm[_])
    add.forEach(_ => (elm[_] = props[_]))
  }

  private setListeners(on: RDEventListeners) {
    const {add, del} = objectDiff(on, this.on)
    del.forEach(_ => {
      if (this.on) return this.getElm().removeEventListener(_, this.on[_])
    })

    add.forEach(_ => this.getElm().addEventListener(_, on[_]))
    this.on = on
  }

  private getChildRDElm(node: VNode, id: number): RDElement {
    return this.elmMap.has(id) && (this.elmMap.get(id) as RDElement).sel === node.sel
      ? (this.elmMap.get(id) as RDElement)
      : new RDElement(node)
  }
  private init(sel: string) {
    if (this.sel === sel) return
    if (this.elm) throw new Error('Element already initialized')
    this.elm = createElement(sel)
    this.sel = sel
  }

  constructor(node: VNode) {
    this.patch(node)
  }
  getElm() {
    if (this.elm) return this.elm
    throw new Error('Element has not be initialized')
  }

  addAt(node: VNode, id: number) {
    const rd = this.getChildRDElm(node, id)
    const child = rd.getElm()

    if (this.elmMap.has(id) && (this.elmMap.get(id) as RDElement).sel !== node.sel) {
      const oldRDElement = this.elmMap.get(id) as RDElement
      this.getElm().replaceChild(child, oldRDElement.getElm())
      oldRDElement.setListeners({})
    } else if (this.elmMap.has(id) && (this.elmMap.get(id) as RDElement).sel === node.sel) {
      const child = this.elmMap.get(id) as RDElement
      child.patch(node)
    } else if (Number.isFinite(this.set.gte(id))) {
      const referenceNode = this.elmMap.get(this.set.gte(id)) as RDElement
      this.getElm().insertBefore(child, referenceNode.getElm())
    } else {
      this.getElm().appendChild(child)
    }
    this.set = this.set.add(id)
    this.elmMap.set(id, rd)
  }

  removeAt(id: number) {
    const node = this.elmMap.get(id)
    if (node) {
      this.getElm().removeChild(node.getElm())
      node.setListeners({})
    }
  }

  patch(node: VNode) {
    this.init(node.sel)
    if (node.attrs) this.setAttrs(node.attrs)
    if (node.props) this.setProps(node.props)
    if (node.style) this.setStyle(node.style)
    if (node.on) this.setListeners(node.on)
    return this
  }
}
