/**
 * Created by tushar on 04/05/18
 */

import {createElement} from './helpers/createElement'
import {objectDiff} from './helpers/objectDiff'
import {RDSet} from './RDSet'
import {RDAttributes, RDEventListeners, RDProps, RDStyles, VNode} from './VNode'

export class RDElement {
  private elm?: HTMLElement
  private set = new RDSet()
  private elmMap = new Map<number, Node>()
  private style?: any
  private attrs?: any
  private on?: RDEventListeners

  getElm() {
    if (this.elm) return this.elm
    throw new Error('Element has not be initialized')
  }

  init(sel: string) {
    this.elm = createElement(sel)
  }

  addChild(elm: Node, id: number) {
    const child = elm
    if (this.set.has(id)) this.getElm().replaceChild(child, this.getElm().childNodes[id])
    else if (Number.isFinite(this.set.gte(id)))
      this.getElm().insertBefore(child, this.elmMap.get(this.set.gte(id)) as Node)
    else this.getElm().appendChild(child)
    this.set = this.set.add(id)
    this.elmMap.set(id, child)
  }

  removeChild(id: number) {
    const node = this.elmMap.get(id)
    if (node) this.getElm().removeChild(node)
  }

  setAttrs(attrs: RDAttributes) {
    const {add, del} = objectDiff(attrs, this.attrs)
    del.forEach(_ => this.getElm().removeAttribute(_))
    add.forEach(_ => this.getElm().setAttribute(_, attrs[_]))
    this.attrs = attrs
  }

  setStyle(style: RDStyles) {
    const {add, del} = objectDiff(style, this.style)
    del.forEach(_ => this.getElm().style.removeProperty(_))
    add.forEach(_ => this.getElm().style.setProperty(_, (style as any)[_]))
    this.style = style
  }

  setProps(props: RDProps) {
    const elm = this.getElm() as any
    const {add, del} = objectDiff(props, elm)
    del.forEach(_ => delete elm[_])
    add.forEach(_ => (elm[_] = props[_]))
  }

  setListeners(on: RDEventListeners) {
    const {add, del} = objectDiff(on, this.on)
    del.forEach(_ => {
      if (this.on) return this.getElm().removeEventListener(_, this.on[_])
    })

    add.forEach(_ => this.getElm().addEventListener(_, on[_]))
    this.on = on
  }

  patch(node: VNode) {
    if (!this.elm) this.init(node.sel)
    if (node.attrs) this.setAttrs(node.attrs)
    if (node.props) this.setProps(node.props)
    if (node.style) this.setStyle(node.style)
    if (node.on) this.setListeners(node.on)
  }
}
