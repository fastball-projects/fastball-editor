import ReactDOM from 'react-dom';
import SamplePreview from './common';

const queryParams = new URLSearchParams(window.location.search)

const className = queryParams.get('className')

const proxyTarget: string | null = queryParams.get('proxyTarget')

const origanlFetch = fetch;

window.fetch = (input: RequestInfo | URL | string, init?: RequestInit): Promise<Response> => {
  if (!proxyTarget || typeof input === 'string' && input.startsWith('/fastball-editor/')) {
    return origanlFetch(input, init);
  }
  input = '/fastball-editor/proxy/' + input
  if (!init) {
    init = {};
  }
  if (!init.headers) {
    init.headers = {
      'Fastball-Proxy': proxyTarget
    }
  } else if (Array.isArray(init.headers)) {
    init.headers.push(['Fastball-Proxy', proxyTarget])
  } else if (init.headers instanceof Headers) {
    init.headers.set('Fastball-Proxy', proxyTarget)
  } else {
    init.headers['Fastball-Proxy'] = proxyTarget;
  }
  console.log('do proxy', input, init)
  return origanlFetch(input, init);
}

window.PreviewComponent = SamplePreview

ReactDOM.render(<SamplePreview componentClassName={className} />, document.getElementById('ice-container'));
