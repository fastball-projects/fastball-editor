export type ComponentInfo = {
    componentName: string
    children: ComponentInfo[]
    props?: Record<string, any>
}

export type MaterialInfo = {
    materialName: string
    npmPackage: string
    npmVersion: string
    metaUrl: string
    componentUrls: string[]
}