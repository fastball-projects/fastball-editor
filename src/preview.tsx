import ReactDOM from 'react-dom';
import React, { useState } from 'react';
import { Loading } from '@alifd/next';
import { buildComponents, AssetLoader } from '@alilc/lowcode-utils';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import { injectComponents } from '@alilc/lowcode-plugin-inject';

import { getPreviewSchema } from './services';


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

const SamplePreview = ({ componentClassName, ...props }) => {
  const [data, setData] = useState({});

  async function init() {

    const { schema, componentsMap, libraryAsset, libraryMap } = await getPreviewSchema(componentClassName);
    const assetLoader = new AssetLoader();
    await assetLoader.load(libraryAsset);
    const components = await injectComponents(buildComponents(libraryMap, componentsMap));
    setData({
      schema,
      components,
    });
  }

  const { schema, components } = data;

  if (!schema || !components) {
    init();
    return <Loading fullScreen />;
  }

  console.log(componentClassName, schema)

  if(schema.children[0]?.props) {
    Object.assign(schema.children[0].props, props)
  }

  return (
    <div className="lowcode-plugin-sample-preview">
      <ReactRenderer
        className="lowcode-plugin-sample-preview-content"
        schema={schema}
        components={components}
      />
    </div>
  );
};

window.PreviewComponent = SamplePreview

ReactDOM.render(<SamplePreview componentClassName={className}/>, document.getElementById('ice-container'));
