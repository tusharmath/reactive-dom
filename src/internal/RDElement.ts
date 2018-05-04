/**
 * Created by tushar on 04/05/18
 */

import {createElement} from './createElement'
import {objectDiff} from './objectDiff'
import {RDSet} from './RDSet'

export class RDElement {
  readonly elm: HTMLElement
  private set = new RDSet()
  private elmMap = new Map<number, Node>()
  private _prevStyle?: any
  private _prevAttrs?: any

  constructor(private sel: string) {
    this.elm = createElement(sel)
  }

  addChild(elm: Node, id: number) {
    const child = elm
    if (this.set.has(id)) this.elm.replaceChild(child, this.elm.childNodes[id])
    else if (Number.isFinite(this.set.gte(id))) this.elm.insertBefore(child, this.elmMap.get(this.set.gte(id)) as Node)
    else this.elm.appendChild(child)
    this.set = this.set.add(id)
    this.elmMap.set(id, child)
  }

  removeChild(id: number) {
    this.elm.removeChild(this.elmMap.get(id) as Node)
  }

  setAttrs(attrs: any) {
    const {add, del} = objectDiff(attrs, this._prevAttrs)
    del.forEach(_ => this.elm.removeAttribute(_))
    add.forEach(_ => this.elm.setAttribute(_, attrs[_]))
    this._prevAttrs = attrs
  }

  setStyle(style: any) {
    const {add, del} = objectDiff(style, this._prevStyle)
    del.forEach(_ => this.elm.style.removeProperty(_))
    add.forEach(_ => this.elm.style.setProperty(_, style[_]))
    this._prevStyle = style
  }

  setProps(props: any) {
    const elm = this.elm as any
    const {add, del} = objectDiff(props, this.elm)
    del.forEach(_ => delete elm[_])
    add.forEach(_ => (elm[_] = props[_]))
  }
}
