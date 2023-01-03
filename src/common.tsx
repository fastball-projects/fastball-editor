import React, { useState } from 'react';
import { Loading } from '@alifd/next';
import { buildComponents, AssetLoader } from '@alilc/lowcode-utils';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import { injectComponents } from '@alilc/lowcode-plugin-inject';

import { getPreviewSchema } from './services';

const loadedAsset: Record<string, true> = {}
const loadedSchema: Record<string, any> = {}
const loadedComponents: Record<string, any> = {}

const SamplePreview = ({ componentClassName, ...props }) => {
    const [data, setData] = useState({});

    async function init() {
        if (loadedSchema[componentClassName]) {
            setData(loadedSchema[componentClassName])
            return
        }
        const { schema, componentsMap, libraryAsset, libraryMap } = await getPreviewSchema(componentClassName);
        const unloadAsset: string[] = []
        libraryAsset.forEach(asset => {
            if (!loadedAsset[asset]) {
                unloadAsset.push(asset);
            }
        });
        const assetLoader = new AssetLoader();
        await assetLoader.load(unloadAsset);
        unloadAsset.forEach(asset => loadedAsset[asset] = true)
        const components = await injectComponents(buildComponents(libraryMap, componentsMap));
        if (!components[schema.children[0].componentName]) {
            return
        }
        loadedSchema[componentClassName] = schema;
        Object.assign(loadedComponents, components)
        setData(schema);
    }

    const schema = data;

    if (!schema || !schema.children || !loadedComponents[schema.children[0].componentName]) {
        init();
        return <Loading fullScreen />;
    }

    if (schema.children[0]?.props) {
        Object.assign(schema.children[0].props, props)
    }

    console.log(componentClassName, schema)
    return (
        <div className="lowcode-plugin-sample-preview">
            <ReactRenderer
                className="lowcode-plugin-sample-preview-content"
                schema={schema}
                components={loadedComponents}
            />
        </div>
    );
};

export default SamplePreview;