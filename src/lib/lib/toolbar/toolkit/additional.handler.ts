import { Observable, Subject } from 'rxjs';

import { HighlightState } from '../help';
import { Tool, ContextMenuConfig } from './help';
import { Keymap, KeymapAction } from '../../viewer/input';
import { Commander } from '../../core/commander';
import { Matcher } from '../matcher/matcher';

export interface AdditionalViewer<T = any> {
  elementRef: HTMLElement;
  onAction: Observable<T>;
  onDestroy: Observable<void>;

  destroy(): void;
}

/**
 * 按扭型工具的配置接口
 */
export interface AdditionalConfig<T = any> {
  /** 按扭控件点击后调用的命令 */
  commanderFactory(): Commander;

  /** 下拉控件展开后显示的内容 */
  menuFactory(): AdditionalViewer<T>;

  /** 设置上下文菜单 */
  contextMenu?: ContextMenuConfig[];
  /** 锚中节点的的匹配项配置 */
  matcher?: Matcher;
  /** 设置按扭显示的文字 */
  label?: string;
  /** 给按扭控件添加一组 css class 类 */
  classes?: string[];
  /** 当鼠标放在控件上的提示文字 */
  tooltip?: string;
  /** 当前按扭控件的快捷键配置 */
  keymap?: Keymap;
  /** 是否支持源代码编辑模式 */
  supportSourceCodeModel?: boolean;
}

export class AdditionalHandler<T = any> implements Tool<T> {
  readonly elementRef = document.createElement('button');
  onApply: Observable<T>;
  onShow: Observable<AdditionalViewer<T>>;
  keymapAction: KeymapAction;
  commander: Commander;
  private eventSource = new Subject<T>();
  private showEvent = new Subject<AdditionalViewer>();

  private set active(b: boolean) {
    b ? this.elementRef.classList.add('textbus-handler-active') :
      this.elementRef.classList.remove('textbus-handler-active');
  }

  constructor(private config: AdditionalConfig) {
    this.commander = config.commanderFactory();

    this.onShow = this.showEvent.asObservable();
    this.onApply = this.eventSource.asObservable();
    this.elementRef.type = 'button';
    this.elementRef.title = config.tooltip || '';
    this.elementRef.classList.add('textbus-handler');
    const inner = document.createElement('span');
    inner.innerText = config.label || '';
    inner.classList.add(...(config.classes || []));
    this.elementRef.appendChild(inner);

    if (config.keymap) {
      this.keymapAction = {
        keymap: config.keymap,
        action: () => {
          if (!this.elementRef.disabled) {
            this.show();
          }
        }
      };
      this.elementRef.dataset.keymap = JSON.stringify(config.keymap);
    }

    this.elementRef.addEventListener('click', () => {
      this.show();
    });
  }

  updateStatus(selectionMatchDelta: any): void {
    switch (selectionMatchDelta.state) {
      case HighlightState.Highlight:
        this.elementRef.disabled = false;
        break;
      case HighlightState.Normal:
        this.elementRef.disabled = false;
        break;
      case HighlightState.Disabled:
        this.elementRef.disabled = true;
        break
    }
  }

  private show() {
    this.active = true;
    const viewer = this.config.menuFactory();
    viewer.onAction.subscribe(params => {
      this.eventSource.next(params);
    })
    viewer.onDestroy.subscribe(() => {
      this.active = false;
    });
    this.showEvent.next(viewer);
  }
}
