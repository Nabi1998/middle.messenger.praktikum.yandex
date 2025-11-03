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
    super(props);
  }

  protected render(): string {
    return errorPageTemplate;
  }
}

export class errorPageTwo extends Block<ErrorProps> {
  constructor(props: ErrorProps) {
    super(props);
  }

  protected render(): string {
    return errorPageTwoTemplate;
  }
}
