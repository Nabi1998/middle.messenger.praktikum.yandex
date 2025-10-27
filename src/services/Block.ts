import EventBus, { EventCallback } from './EventBus';
import Handlebars from 'handlebars';

export default abstract class Block<
  Props extends Record<string, unknown> = Record<string, unknown>
> {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_CDU: 'flow:component-did-update',
    FLOW_RENDER: 'flow:render',
  };

  protected _element: HTMLElement | null = null;
  protected _id: number = Math.floor(100000 + Math.random() * 900000);
  protected props: Props;
  protected children: Record<string, Block>;
  protected lists: Record<string, unknown[]>;
  protected eventBus: () => EventBus;

  constructor(propsWithChildren: Props & Record<string, unknown> = {} as Props) {
    const eventBus = new EventBus();
    const { props, children, lists } = this._getChildrenPropsAndProps(propsWithChildren);

    this.props = this._makePropsProxy({ ...props }) as Props;
    this.children = children;
    this.lists = this._makePropsProxy({ ...lists });
    this.eventBus = () => eventBus;

    this._registerEvents(eventBus);
    eventBus.emit(Block.EVENTS.INIT);
  }

  private _addEvents(): void {
    const { events = {} } = this.props as { events?: Record<string, EventListener> };
    Object.keys(events).forEach((eventName) => {
      if (this._element) {
        this._element.addEventListener(eventName, events[eventName]);
      }
    });
  }

  private _removeEvents(): void {
    const { events = {} } = this.props as { events?: Record<string, EventListener> };
    Object.keys(events).forEach((eventName) => {
      if (events[eventName] && this._element) {
        this._element.removeEventListener(eventName, events[eventName]);
      }
    });
  }

  private _registerEvents(eventBus: EventBus): void {
    eventBus.on(Block.EVENTS.INIT, this.init.bind(this) as EventCallback);
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this) as EventCallback);
    eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this) as EventCallback);
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this) as EventCallback);
  }

  protected init(): void {
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  private _componentDidMount(): void {
    this.componentDidMount();
    Object.values(this.children).forEach((child) => {
      child.dispatchComponentDidMount();
    });
  }

  protected componentDidMount(): void {}

  public dispatchComponentDidMount(): void {
    this.eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  private _componentDidUpdate(oldProps: Props, newProps: Props): void {
    const response = this.componentDidUpdate(oldProps, newProps);
    if (!response) return;
    this._render();
  }

  protected componentDidUpdate(oldProps: Props, newProps: Props): boolean {
    console.error('componentDidUpdate', oldProps, newProps);
    return true;
  }

  private _getChildrenPropsAndProps(
    propsAndChildren: Props & Record<string, unknown>
  ): {
    children: Record<string, Block>;
    props: Partial<Props>;
    lists: Record<string, unknown[]>;
  } {
    const children: Record<string, Block> = {};
    const props: Partial<Props> = {};
    const lists: Record<string, unknown[]> = {};

    Object.entries(propsAndChildren).forEach(([key, value]) => {
      if (value instanceof Block) {
        children[key] = value;
      } else if (Array.isArray(value)) {
        lists[key] = value;
      } else {
        (props as Record<string, unknown>)[key] = value;
      }
    });

    return { children, props, lists };
  }

  protected addAttributes(): void {
    const { attr = {} } = this.props as { attr?: Record<string, string> };
    Object.entries(attr).forEach(([key, value]) => {
      this._element?.setAttribute(key, value);
    });
  }

  protected setAttributes(attr: Record<string, string>): void {
    Object.entries(attr).forEach(([key, value]) => {
      this._element?.setAttribute(key, value);
    });
  }

  public setLists(nextList: Record<string, unknown[]>): void {
    if (!nextList) return;
    Object.assign(this.lists, nextList);
  }

  get element(): HTMLElement | null {
    return this._element;
  }

  private _render(): void {
    this._removeEvents();

    const propsAndStubs = { ...this.props };
    const tmpId = Math.floor(100000 + Math.random() * 900000);

    Object.entries(this.children).forEach(([key, child]) => {
      (propsAndStubs as Record<string, unknown>)[key] = `<div data-id="${child._id}"></div>`;
    });

    Object.entries(this.lists).forEach(([key]) => {
      (propsAndStubs as Record<string, unknown>)[key] = `<div data-id="__l_${tmpId}"></div>`;
    });

    const fragment = this._createDocumentElement('template');
    fragment.innerHTML = Handlebars.compile(this.render())(propsAndStubs);

    Object.values(this.children).forEach((child) => {
      const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
      if (stub) stub.replaceWith(child.getContent());
    });

    Object.entries(this.lists).forEach(([, child]) => {
      const listCont = this._createDocumentElement('template');
      child.forEach((item) => {
        if (item instanceof Block) {
          listCont.content.append(item.getContent());
        } else {
          listCont.content.append(String(item));
        }
      });
      const stub = fragment.content.querySelector(`[data-id="__l_${tmpId}"]`);
      if (stub) stub.replaceWith(listCont.content);
    });

    const newElement = fragment.content.firstElementChild as HTMLElement;
    if (this._element && newElement) this._element.replaceWith(newElement);
    this._element = newElement;

    this._addEvents();
    this.addAttributes();
  }

  protected abstract render(): string;

  public getContent(): HTMLElement {
    if (!this._element) throw new Error('Element is not created');
    return this._element;
  }

  private _makePropsProxy(props: Record<string, unknown>): Record<string, unknown> {
    return new Proxy(props, {
      get: (target, prop: string) => {
        const value = target[prop as keyof typeof target];
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set: (target, prop: string, value: unknown) => {
        const oldTarget = { ...target };
        target[prop as keyof typeof target] = value;
        this.eventBus().emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty: () => {
        throw new Error('No access');
      },
    });
  }

  private _createDocumentElement(tagName: string): HTMLTemplateElement {
    return document.createElement(tagName) as HTMLTemplateElement;
  }

  public show(): void {
    const content = this.getContent();
    if (content) content.style.display = 'block';
  }

  public hide(): void {
    const content = this.getContent();
    if (content) content.style.display = 'none';
  }

  public setProps(newProps: Partial<Props>): void {
    if (!newProps) return;
    Object.assign(this.props, newProps);
  }
}
