/**
 * Created by tushar on 12/05/18
 */

export type RDAttributes = {
  [key: string]: string
}

export type RDProps = {
  [key: string]: any
}

export type RDStyles = {[key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[key]}

export type RDEventListeners = {
  [key: string]: EventListener
}

export type VNode = {
  sel: string
  key?: string
  attrs?: RDAttributes
  props?: RDProps
  style?: RDStyles
  on?: RDEventListeners
  children?: Array<VNode>
}
