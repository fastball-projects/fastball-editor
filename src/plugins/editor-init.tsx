import { ILowCodePluginContext } from '@alilc/lowcode-engine';
import { injectAssets } from '@alilc/lowcode-plugin-inject';
import commonPackage from '../services/common-package.json';
import { getPageSchema, loadAssets, saveSchema } from '../services';
const EditorInitPlugin = (ctx: ILowCodePluginContext) => {
  return {
    async init() {
      const { material, project, hotkey } = ctx;
      const assets = await loadAssets();
      assets.packages.forEach(p => commonPackage.push(p))
      assets.packages = commonPackage;
      // 设置物料描述
      const ast = await injectAssets(assets);
      await material.setAssets(ast);
      const schema = await getPageSchema();
      project.openDocument(schema);

      hotkey.bind('command+s', (e) => {
        e.preventDefault();
        saveSchema();
      });
    },
  };
}
EditorInitPlugin.pluginName = 'EditorInitPlugin';
export default EditorInitPlugin;