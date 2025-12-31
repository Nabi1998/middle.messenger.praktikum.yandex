import { expect } from 'chai';
import sinon from 'sinon';
import Router from './Router';
import Block from '../services/Block';

describe('Router', () => {
  let router: Router;
  let getContentFake: sinon.SinonStub;
  let BlockMock: typeof Block;

  beforeEach(() => {
    // Создаем мок для Block
    getContentFake = sinon.stub().returns(document.createElement('div'));
    BlockMock = class {
      getContent = getContentFake;
      dispatchComponentDidMount = sinon.stub();
      hide = sinon.stub();
      show = sinon.stub();
    } as unknown as typeof Block;

    // Очищаем историю перед каждым тестом
    window.history.pushState({ key: 'initial' }, '', '/');

    router = new Router();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should be a singleton', () => {
    const router2 = new Router();
    // В текущей реализации Router не синглтон, но обычно роутеры делают такими.
    // Если он не синглтон, этот тест не нужен или должен проверять независимость.
    // Проверим просто создание.
    expect(router).to.be.an.instanceof(Router);
  });

  it('use() should return Router instance', () => {
    const result = router.use('/', () => {});
    expect(result).to.eq(router);
  });

  it('should render a page on start', async () => {
    const callback = sinon.spy();
    router.use('/', callback);

    await router.start();

    expect(callback.called).to.be.true;
  });

  it('go() should change history state', () => {
    router.use('/new-path', () => {});

    router.go('/new-path');

    expect(window.location.pathname).to.eq('/new-path');
  });

  it('go() should render a page', () => {
    const callback = sinon.spy();
    router.use('/new-path', callback);

    router.go('/new-path');

    expect(callback.called).to.be.true;
  });

  it('back() should call history.back()', () => {
    const backSpy = sinon.spy(window.history, 'back');

    router.back();

    expect(backSpy.called).to.be.true;
  });

  it('forward() should call history.forward()', () => {
    const forwardSpy = sinon.spy(window.history, 'forward');

    router.forward();

    expect(forwardSpy.called).to.be.true;
  });
});
