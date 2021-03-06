import { Observable } from 'rxjs';

/**
 * 工具条控件的显示状态
 */
export enum HighlightState {
  Highlight = 'Highlight',
  Normal = 'Normal',
  Disabled = 'Disabled'
}

export interface EventDelegate {
  dispatchEvent(type: string): Observable<string>
}
