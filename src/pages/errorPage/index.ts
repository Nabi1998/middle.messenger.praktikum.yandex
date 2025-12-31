// pages/error/index.ts
import Block from '../../services/Block';
import errorPageRaw from './errorPage.hbs?raw';
import errorPageTwoRaw from './errorPageTwo.hbs?raw';

const errorPageTemplate = errorPageRaw as unknown as string;
const errorPageTwoTemplate = errorPageTwoRaw as unknown as string;

interface ErrorProps {
  errorCode: string;
  errorText: string;
  [key: string]: unknown;
}

export class errorPage extends Block<ErrorProps> {
  constructor(props: ErrorProps) {
    super({
      ...props,
      events: {
        click: (e: Event) => this.onClick(e),
      },
    });
  }

  protected render(): string {
    return errorPageTemplate;
  }

  private onClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('href') === '/messenger') {
      e.preventDefault();
      const app = (window as any).app;
      if (app && app.getRouter) {
        app.getRouter().go('/messenger');
      } else {
        location.hash = 'chat';
      }
    }
  }
}

export class errorPageTwo extends Block<ErrorProps> {
  constructor(props: ErrorProps) {
    super({
      ...props,
      events: {
        click: (e: Event) => this.onClick(e),
      },
    });
  }

  protected render(): string {
    return errorPageTwoTemplate;
  }

  private onClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('href') === '/messenger') {
      e.preventDefault();
      const app = (window as any).app;
      if (app && app.getRouter) {
        app.getRouter().go('/messenger');
      } else {
        location.hash = 'chat';
      }
    }
  }
}
