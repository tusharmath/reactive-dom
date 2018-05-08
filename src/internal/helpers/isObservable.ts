/**
 * Created by tushar on 04/05/18
 */

import {IObservable} from 'observable-air'

export function isObservable(t: any): t is IObservable<any> {
  return typeof t.subscribe === 'function'
}
