/**
 * Created by tushar on 04/05/18
 */

import {createElement} from './helpers/createElement'
import {objectDiff} from './helpers/objectDiff'
import {RDSet} from './RDSet'
import {
  AnyVNode,
  RDAttributes,
  RDEventListeners,
  RDProps,
  RDStyles,
  VNode
} from './VNode'

const isVNode = (elm: any): elm is VNode => {
  return !(typeof elm === 'string' || typeof elm === 'number')
}
function getKey(vNode: AnyVNode, i: number): string {
  return isVNode(vNode)
    ? vNode.sel + '.' + (vNode.key ? vNode.key : i.toString())
    : vNode.toString()
}

function vNodeReducer(p: any, c: AnyVNode, i: number) {
  return {...p, [getKey(c, i)]: i}
}

function getChildrenIndexMap(children: Array<AnyVNode>): {[p: string]: number} {
  return children.reduce(vNodeReducer, {})
}

export interface IPatcher {
  patch(node: AnyVNode): void
  getElm(): Node
  canPatch(node: AnyVNode): boolean
  dispose(): void
}

export class TextPatcher implements IPatcher {
  private elm?: Text
  constructor(elm: string | number) {
    this.patch(elm)
  }
  patch(node: string | number) {
    this.elm = document.createTextNode(node.toString())
  }

  getElm() {
    if (this.elm) return this.elm
    throw new Error('Uninitialized Patcher')
  }

  canPatch(node: AnyVNode): boolean {
    return true
  }

  dispose(): void {}
}

/**
 * Provides low-level DOM APIs to update/mutate real dom nodes.
 */
export class ELMPatcher implements IPatcher {
  private elm?: Node
  private vNode?: VNode

  private positions = new RDSet()
  private childPatchers = new Map<number, IPatcher>()

  private setAttrs(attrs: RDAttributes, prevAttrs: RDAttributes) {
    const attrNames = Object.keys(attrs)
    const curr = new Set(attrNames)
    const prev = new Set(Object.keys(prevAttrs))
    const {add, del} = objectDiff(curr, prev)
    del.forEach(_ => this.getElm().removeAttribute(_))
    add.forEach(_ => this.getElm().setAttribute(_, attrs[_]))
  }

  private setStyle(style: RDStyles, prevStyle: RDStyles) {
    const stringNames = Object.keys(style)
    const curr = new Set(stringNames)
    const prev = new Set(Object.keys(prevStyle))
    const {add, del, com} = objectDiff(curr, prev)
    del.forEach(_ => this.getElm().style.removeProperty(_))
    add
      .concat(com)
      .forEach(_ => this.getElm().style.setProperty(_, (style as any)[_]))
  }

  private setProps(props: RDProps, prevProps: RDProps) {
    const curr = new Set(Object.keys(props))
    const prev = new Set(Object.keys(prevProps))
    const elm = this.getElm() as any
    const {add, del, com} = objectDiff(curr, prev)
    del.forEach(_ => delete elm[_])
    add.concat(com).forEach(_ => (elm[_] = props[_]))
  }

  private setListeners(
    on: RDEventListeners,
    prevEventListeners: RDEventListeners
  ) {
    const eventNames = Object.keys(on)
    const curr = new Set(eventNames)
    const prev = new Set(Object.keys(prevEventListeners))
    const {add, del} = objectDiff(curr, prev)
    del.forEach(_ =>
      this.getElm().removeEventListener(_, prevEventListeners[_])
    )
    add.forEach(_ => this.getElm().addEventListener(_, on[_]))
  }

  private getChildRDElm(node: AnyVNode, id: number): IPatcher {
    return isVNode(node)
      ? this.childPatchers.has(id) &&
        (this.childPatchers.get(id) as ELMPatcher).getVNode().sel === node.sel
        ? (this.childPatchers.get(id) as ELMPatcher)
        : new ELMPatcher(node)
      : new TextPatcher(node)
  }

  private init(vNode: AnyVNode) {
    if (isVNode(vNode)) {
      const sel = vNode.sel
      if (this.vNode && this.vNode.sel === sel) return
      if (this.elm) throw new Error('Element already initialized')
      this.elm = createElement(sel)
    } else {
      this.elm = document.createTextNode(vNode.toString())
    }
  }

  private patchChildren(
    children: Array<AnyVNode>,
    previousChildren: Array<AnyVNode>
  ) {
    const curr = new Set(children.map(getKey))
    const prev = new Set(previousChildren.map(getKey))
    const {add, del, com} = objectDiff(curr, prev)
    const currentChildrenIndexMap = getChildrenIndexMap(children)
    const prevChildrenIndexMap = getChildrenIndexMap(previousChildren)
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
  }

  private addAt(node: AnyVNode, id: number): IPatcher {
    const rd = this.getChildRDElm(node, id)
    const child = rd.getElm()
    const childPatcher = this.childPatchers.get(id)

    if (childPatcher && childPatcher.canPatch(node)) {
      this.getElm().replaceChild(child, childPatcher.getElm())
      childPatcher.dispose()
    } else if (childPatcher && !childPatcher.canPatch(node)) {
      childPatcher.patch(node)
    } else if (Number.isFinite(this.positions.gte(id))) {
      const referenceNode = this.childPatchers.get(
        this.positions.gte(id)
      ) as ELMPatcher
      this.getElm().insertBefore(child, referenceNode.getElm())
    } else {
      this.getElm().appendChild(child)
    }
    this.positions = this.positions.add(id)
    this.childPatchers.set(id, rd)
    return rd
  }

  private patchAt(node: AnyVNode, id: number) {
    const child = this.childPatchers.get(id) as IPatcher
    child.patch(node)
  }

  private removeAt(id: number) {
    const node = this.childPatchers.get(id)
    if (node) {
      this.getElm().removeChild(node.getElm())
      node.dispose()
      this.positions = this.positions.remove(id)
      this.childPatchers.delete(id)
    }
  }

  private getVNode() {
    if (this.vNode) return this.vNode
    throw new Error('VNode has not been set')
  }

  constructor(node: VNode) {
    this.patch(node)
  }

  getElm(): HTMLElement {
    // TODO: typecasting should be removed
    if (this.elm) return this.elm as HTMLElement
    throw new Error('Element has not be initialized')
  }

  patch(node: VNode) {
    this.init(node)

    const {style = {}, attrs = {}, props = {}, children = [], on = {}} = this
      .vNode
      ? this.vNode
      : {}

    this.setAttrs(node.attrs || {}, attrs)
    this.setProps(node.props || {}, props)
    this.setStyle(node.style || {}, style)
    this.setListeners(node.on || {}, on)
    if (node.children) this.patchChildren(node.children, children)
    this.vNode = node
  }

  canPatch(node: AnyVNode): boolean {
    return isVNode(node) && this.getVNode().sel !== node.sel
  }

  dispose(): void {
    const {on = {}} = this.vNode ? this.vNode : {}
    this.setListeners({}, on)
  }
}
