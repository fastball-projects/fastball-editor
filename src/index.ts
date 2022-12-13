import { init, plugins } from '@alilc/lowcode-engine';
import { createFetchHandler } from '@alilc/lowcode-datasource-fetch-handler'
import customPlugins from './plugins/';
import './global.scss';

async function registerPlugins() {
  customPlugins.forEach(async p => {
    await plugins.register(p)
  })
}

(async function main() {
  await registerPlugins();

  init(document.getElementById('lce-container')!, {
    enableCondition: true,
    enableCanvasLock: true,
    simulatorUrl: [
      'https://alifd.alicdn.com/npm/@alilc/lowcode-react-simulator-renderer@latest/dist/css/react-simulator-renderer.css',
      'https://alifd.alicdn.com/npm/@alilc/lowcode-react-simulator-renderer@latest/dist/js/react-simulator-renderer.js'
    ],
    requestHandlersMap: {
      fetch: createFetchHandler()
    },
  });
})();
