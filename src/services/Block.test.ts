import { expect } from 'chai';
import sinon from 'sinon';
import Block from './Block';

describe('Block', () => {
  let ComponentClass: typeof Block;

  before(() => {
    ComponentClass = class extends Block {
      protected render(): string {
        return '<div id="test-element">{{text}}</div>';
      }
    };
  });

  it('should create component with props', () => {
    const text = 'Hello World';
    const component = new ComponentClass({ text });

    const element = component.getContent();

    expect(element.innerHTML).to.eq(text);
  });

  it('should be reactive', () => {
    const text = 'Hello World';
    const component = new ComponentClass({ text });

    const newText = 'New Text';
    component.setProps({ text: newText });

    const element = component.getContent();

    expect(element.innerHTML).to.eq(newText);
  });

  it('should fire init event on initialization', () => {
    class SpyComponent extends Block {
      constructor(props: any) {
        super(props);
      }
      protected render(): string {
        return '<div></div>';
      }
    }

    const component = new SpyComponent({});
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(component.getContent()).to.not.be.null;
  });

  it('should add events to element', () => {
    const handler = sinon.spy();
    const component = new ComponentClass({
      events: {
        click: handler
      }
    });

    const element = component.getContent();
    element.click();

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(handler.called).to.be.true;
  });

  it('should call componentDidMount', () => {
    const clock = sinon.useFakeTimers();

    class MountComponent extends Block {
      componentDidMount() {
        super.componentDidMount();
      }
    }

    const component = new MountComponent({});
    const spy = sinon.spy(component, 'componentDidMount');

    component.dispatchComponentDidMount();

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(spy.called).to.be.true;

    clock.restore();
  });
});
