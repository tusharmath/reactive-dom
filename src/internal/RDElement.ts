/**
 * Created by tushar on 04/05/18
 */

import {createElement} from './createElement'
import {RDSet} from './RDSet'

export class RDElement {
  readonly elm: HTMLElement
  private set = new RDSet()
  private elmMap = new Map<number, Node>()
  private _prevStyle?: any
  private _prevProps?: any

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

  setAttrs(attrs: {[k: string]: string}) {
    // remove old ones
    for (var i = 0; i < this.elm.attributes.length; i++) {
      const attr = this.elm.attributes.item(i)
      if (!attrs[attr.name]) this.elm.removeAttribute(attr.name)
    }

    // add new ones
    for (var k in attrs) if (attrs[k] !== this.elm.getAttribute(k)) this.elm.setAttribute(k, attrs[k])
  }

  setStyle(style: any) {
    const elmStyle: any = this.elm.style

    // remove old ones
    if (this._prevStyle) for (let i in this._prevStyle) if (!style[i]) elmStyle.removeProperty(i)

    // add new ones
    for (let i in style) if (elmStyle[i] !== style[i]) elmStyle[i] = style[i]

    this._prevStyle = style
  }

  setProps(props: any) {
    const elm: any = this.elm

    // remove old ones
    if (this._prevProps) for (let i in this._prevProps) if (!props[i]) delete elm[i]

    // add new ones
    for (let i in props) if (props[i] !== elm[i]) elm[i] = props[i]

    this._prevProps = props
  }
}
