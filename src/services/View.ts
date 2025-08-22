import Block from './Block';

export interface ViewProps {
  [key: string]: any;
}

export default abstract class View extends Block {
  protected abstract template(): string;
  protected abstract getData(): ViewProps;

  protected render(): string {
    return this.template();
  }

  public show(): void {
    super.show();
    this.afterRender();
  }

  protected afterRender(): void {
    // Hook for post-render logic
  }

  protected getElement(): HTMLElement | null {
    return this._element;
  }

  public get element(): HTMLElement | null {
    return this._element;
  }

  // Public methods for external access
  public getTemplate(): string {
    return this.template();
  }

  public getViewData(): ViewProps {
    return this.getData();
  }

  public setupAfterRender(): void {
    this.afterRender();
  }
}
