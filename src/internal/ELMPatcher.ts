/**
 * Created by tushar on 04/05/18
 */

import {createElement} from './helpers/createElement'
import {objectDiff} from './helpers/objectDiff'
import {RDSet} from './RDSet'
import {RDAttributes, RDEventListeners, RDProps, RDStyles, VNode} from './VNode'

function getKey(vNode: VNode, i: number) {
  return vNode.sel + '.' + (vNode.key ? vNode.key : i.toString())
}

function vNodeReducer(p: any, c: VNode, i: number) {
  return {...p, [getKey(c, i)]: i}
}

function getChildrenIndexMap(children: Array<VNode>): {[p: string]: number} {
  return children.reduce(vNodeReducer, {})
}

/**
 * Provides low-level DOM APIs to update/mutate real dom nodes.
 */
export class ELMPatcher {
  private elm?: HTMLElement
  private vNode?: VNode

  private props = new Set<string>()
  private children: Array<VNode> = []
  private positions = new RDSet()
  private elmMap = new Map<number, ELMPatcher>()

  private setAttrs(attrs: RDAttributes) {
    const prevAttrs = this.vNode ? this.vNode.attrs : undefined
    const attrNames = Object.keys(attrs)

    if (prevAttrs) {
      const curr = new Set(attrNames)
      const prev = new Set(Object.keys(prevAttrs))
      const {add, del} = objectDiff(curr, prev)
      del.forEach(_ => this.getElm().removeAttribute(_))
      add.forEach(_ => this.getElm().setAttribute(_, attrs[_]))
    } else {
      attrNames.forEach(_ => this.getElm().setAttribute(_, attrs[_]))
    }
  }

  private setStyle(style: RDStyles) {
    const prevStyle = this.vNode ? this.vNode.style : undefined
    const stringNames = Object.keys(style)
    if (prevStyle) {
      const curr = new Set(stringNames)
      const prev = new Set(Object.keys(prevStyle))
      const {add, del, com} = objectDiff(curr, prev)
      del.forEach(_ => this.getElm().style.removeProperty(_))
      add
        .concat(com)
        .forEach(_ => this.getElm().style.setProperty(_, (style as any)[_]))
    } else {
      stringNames.forEach(_ =>
        this.getElm().style.setProperty(_, (style as any)[_])
      )
    }
  }

  private setProps(props: RDProps) {
    const curr = new Set(Object.keys(props))
    const elm = this.getElm() as any
    const {add, del, com} = objectDiff(curr, this.props)
    del.forEach(_ => delete elm[_])
    add.concat(com).forEach(_ => (elm[_] = props[_]))
    this.props = curr
  }

  private setListeners(on: RDEventListeners) {
    const prevEventListeners = this.vNode ? this.vNode.on : undefined
    const eventNames = Object.keys(on)
    if (prevEventListeners) {
      const curr = new Set(eventNames)
      const prev = new Set(Object.keys(prevEventListeners))
      const {add, del} = objectDiff(curr, prev)
      del.forEach(_ =>
        this.getElm().removeEventListener(_, prevEventListeners[_])
      )
      add.forEach(_ => this.getElm().addEventListener(_, on[_]))
    } else {
      eventNames.forEach(_ => this.getElm().addEventListener(_, on[_]))
    }
  }

  private getChildRDElm(node: VNode, id: number): ELMPatcher {
    return this.elmMap.has(id) &&
      (this.elmMap.get(id) as ELMPatcher).getVNode().sel === node.sel
      ? (this.elmMap.get(id) as ELMPatcher)
      : new ELMPatcher(node)
  }

  private init(vNode: VNode) {
    const sel = vNode.sel
    if (this.vNode && this.vNode.sel === sel) return
    if (this.elm) throw new Error('Element already initialized')
    this.elm = createElement(sel)
  }

  private patchChildren(children: Array<VNode>) {
    const curr = new Set(children.map(getKey))
    const prev = new Set(this.children.map(getKey))
    const {add, del, com} = objectDiff(curr, prev)
    const currentChildrenIndexMap = getChildrenIndexMap(children)
    const prevChildrenIndexMap = getChildrenIndexMap(this.children)
    del.forEach(_ => this.removeAt(prevChildrenIndexMap[_]))
    add.forEach(_ =>
      this.addAt(
        children[currentChildrenIndexMap[_]],
        currentChildrenIndexMap[_]
      )
    )
    com.forEach(_ =>
      this.patchAt(
        children[currentChildrenIndexMap[_]],
        currentChildrenIndexMap[_]
      )
    )
    this.children = children
  }

  private addAt(node: VNode, id: number): ELMPatcher {
    const rd = this.getChildRDElm(node, id)
    const child = rd.getElm()

    if (
      this.elmMap.has(id) &&
      (this.elmMap.get(id) as ELMPatcher).getVNode().sel !== node.sel
    ) {
      const oldRDElement = this.elmMap.get(id) as ELMPatcher
      this.getElm().replaceChild(child, oldRDElement.getElm())
      oldRDElement.setListeners({})
    } else if (
      this.elmMap.has(id) &&
      (this.elmMap.get(id) as ELMPatcher).getVNode().sel === node.sel
    ) {
      const child = this.elmMap.get(id) as ELMPatcher
      child.patch(node)
    } else if (Number.isFinite(this.positions.gte(id))) {
      const referenceNode = this.elmMap.get(
        this.positions.gte(id)
      ) as ELMPatcher
      this.getElm().insertBefore(child, referenceNode.getElm())
    } else {
      this.getElm().appendChild(child)
    }
    this.positions = this.positions.add(id)
    this.elmMap.set(id, rd)
    return rd
  }

  private patchAt(node: VNode, id: number) {
    const child = this.elmMap.get(id) as ELMPatcher
    child.patch(node)
  }

  private removeAt(id: number) {
    const node = this.elmMap.get(id)
    if (node) {
      this.getElm().removeChild(node.getElm())
      node.setListeners({})
      this.positions = this.positions.remove(id)
      this.elmMap.delete(id)
    }
  }

  private getVNode() {
    if (this.vNode) return this.vNode
    throw new Error('VNode has not been set')
  }

  constructor(node: VNode) {
    this.patch(node)
  }

  getElm() {
    if (this.elm) return this.elm
    throw new Error('Element has not be initialized')
  }

  patch(node: VNode) {
    this.init(node)
    if (node.attrs) this.setAttrs(node.attrs)
    if (node.props) this.setProps(node.props)
    if (node.style) this.setStyle(node.style)
    if (node.on) this.setListeners(node.on)
    else this.setListeners({})
    if (node.children) this.patchChildren(node.children)
    this.vNode = node
  }
}
