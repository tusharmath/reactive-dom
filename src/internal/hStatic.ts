/**
 * Created by tushar on 03/05/18
 */

import {Observable} from 'observable-air'

export const hStatic = (text: string) => new Observable(observer => observer.next(text))
