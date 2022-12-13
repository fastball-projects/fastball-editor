import { project } from '@alilc/lowcode-engine';
import { TransformStage } from '@alilc/lowcode-types';
import { Message, Dialog } from '@alifd/next';

import packages from './common-package.json';

import { ComponentInfo, MaterialInfo } from '../../types'

const queryParams = new URLSearchParams(window.location.search)

const className = queryParams.get('className')

export const loadAssets = async () => {
    const response = await fetch('/fastball-editor/api/assets');
    const materials: MaterialInfo[] = await response.json();
    const assets = {
        packages: [],
        components: []
    }
    materials.forEach(({ materialName, npmPackage, npmVersion, metaUrl, componentUrls }) => {
        const pkg = {
            package: npmPackage,
            version: npmVersion,
            library: materialName,
            urls: componentUrls,
        }
        const component = {
            "exportName": `${materialName}Meta`,
            "npm": {
                "package": npmPackage,
                "version": npmVersion,
            },
            "url": metaUrl,
        }
        assets.packages.push(pkg);
        assets.components.push(component);
    })

    return assets;
}

export const saveSchema = async () => {
    // need save component is fisrt child....
    const componentSchema = project.exportSchema(TransformStage.Save)?.componentsTree?.[0]?.children[0];
    const response = await fetch(`/fastball-editor/api/save-view?className=${className}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(componentSchema)
    });
    Message.success('成功保存' + response.json());
}

export const resetSchema = async () => {
    try {
        await new Promise<void>((resolve, reject) => {
            Dialog.confirm({
                content: '确定要重置吗？您所有的修改都将消失！',
                onOk: () => {
                    resolve();
                },
                onCancel: () => {
                    reject()
                },
            })
        })
    } catch (err) {
        return;
    }
    const pageSchema = await getPageSchema()
    project.getCurrentDocument()?.importSchema(pageSchema);
    project.simulatorHost?.rerender();
    Message.success('成功重置页面');
}

export const getComponentSchema = async () => {
    const loadConfigResp = await fetch(`/fastball-editor/api/load-view?className=${className}`);
    const schema = await loadConfigResp.json();
    return schema;
}

export const getPageSchema = async () => {
    const componentSchema = await getComponentSchema();
    const pageSchema: ComponentInfo = {
        "componentName": "Page",
        "children": [componentSchema]
    }
    return pageSchema;
}

export const getCodeGenSchema = async () => {
    const componentSchema = await getComponentSchema();
    const pageSchema = {
        "componentName": "Page",
        "children": [componentSchema],
    }
    const { npmPackage, npmVersion } = componentSchema.material

    const componentsMap = [{
        package: npmPackage,
        version: npmVersion,
        exportName: componentSchema.componentName,
        componentName: componentSchema.componentName,
        destructuring: true
    }]

    return {
        version: "1.0.0",
        componentsTree: [pageSchema],
        componentsMap
    }
}

export const getPreviewSchema = async () => {
    const componentSchema = await getComponentSchema();
    const schema: ComponentInfo = {
        "componentName": "Page",
        "children": [componentSchema],
        "props": {},
    }
    const { materialName, npmPackage, npmVersion, componentUrls } = componentSchema.material

    const componentsMap: Record<string, any> = {
        Page: {
            devMode: "lowCode",
            componentName: "Page"
        }
    }

    componentsMap[componentSchema.componentName] = {
        package: npmPackage,
        version: npmVersion,
        exportName: componentSchema.componentName,
        componentName: componentSchema.componentName,
        destructuring: true
    }

    const libraryMap: Record<string, any> = {}

    const libraryAsset: any[] = [];

    packages.forEach(({ package: _package, library, urls, renderUrls }) => {
        libraryMap[_package] = library;
        if (renderUrls) {
            libraryAsset.push(renderUrls);
        } else if (urls) {
            libraryAsset.push(urls);
        }
    });

    libraryMap[npmPackage] = materialName
    libraryAsset.push(componentUrls);

    return { componentsMap, schema, libraryAsset, libraryMap };
}



