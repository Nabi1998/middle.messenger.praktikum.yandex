import EventBus, { EventCallback } from './EventBus';
import Handlebars from 'handlebars';

export default abstract class Block<
  Props extends Record<string, any> = Record<string, any>
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
  protected lists: Record<string, any[]>;
  protected eventBus: () => EventBus;

  constructor(propsWithChildren: Props & Record<string, any> = {} as Props) {
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
    const { events = {} } = this.props as any;
    Object.keys(events).forEach((eventName) => {
      if (this._element) {
        this._element.addEventListener(eventName, events[eventName]);
      }
    });
  }

  private _removeEvents(): void {
    const { events = {} } = this.props as any;
    Object.keys(events).forEach((eventName) => {
      if (events[eventName] !== undefined && this._element) {
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
    console.warn('componentDidUpdate', oldProps, newProps);
    return true;
  }

  private _getChildrenPropsAndProps(propsAndChildren: Props & Record<string, any>): {
    children: Record<string, Block>;
    props: Partial<Props>;
    lists: Record<string, any[]>;
  } {
    const children: Record<string, Block> = {};
    const props: Partial<Props> = {};
    const lists: Record<string, any[]> = {};

    Object.entries(propsAndChildren).forEach(([key, value]) => {
      if (value instanceof Block) {
        children[key] = value;
      } else if (Array.isArray(value)) {
        lists[key] = value;
      } else {
        (props as any)[key] = value;
      }
    });

    return { children, props, lists };
  }

  protected addAttributes(): void {
    const { attr = {} } = this.props as any;
    Object.entries(attr).forEach(([key, value]) => {
      if (this._element) {
        this._element.setAttribute(key, value as string);
      }
    });
  }

  protected setAttributes(attr: Record<string, any>): void {
    Object.entries(attr).forEach(([key, value]) => {
      if (this._element) {
        this._element.setAttribute(key, value as string);
      }
    });
  }

  public setLists = (nextList: Record<string, any[]>): void => {
    if (!nextList) return;
    Object.assign(this.lists, nextList);
  };

  get element(): HTMLElement | null {
    return this._element;
  }

  private _render(): void {
    console.warn('Render');

    // удаляем старые события перед ререндером
    this._removeEvents();

    const propsAndStubs = { ...this.props };
    const tmpId = Math.floor(100000 + Math.random() * 900000);

    Object.entries(this.children).forEach(([key, child]) => {
      (propsAndStubs as any)[key] = `<div data-id="${child._id}"></div>`;
    });

    Object.entries(this.lists).forEach(([key]) => {
      (propsAndStubs as any)[key] = `<div data-id="__l_${tmpId}"></div>`;
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
          listCont.content.append(`${item}`);
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

  private _makePropsProxy(props: Record<string, any>): Record<string, any> {
    const self = this;

    return new Proxy(props, {
      get(target: any, prop: string) {
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set(target: any, prop: string, value: any) {
        const oldTarget = { ...target };
        target[prop] = value;
        self.eventBus().emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty() {
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
