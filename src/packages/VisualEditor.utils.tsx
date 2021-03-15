/* 容器内每个元素的数据类型 */
export interface VisualEditorBlock {
  componentKey: string, // component对象的key，通过这个来找到visual config中的component
  top: number, // block元素的top定位
  left: number, // block元素的left定位
}
/* 编辑器编辑的数据类型 */
export interface VisualEditorValue {
  container: {
    width: number, // 容器的宽度
    height: number, // 容器的高度
  },
  blocks: VisualEditorBlock[], 
}
/* 编辑器中预定义组件的类型 */
export interface VisualEditorCompnent {
  key: string, // 组件唯一标识
  name: string, // 组件预览显示名称
  preview: () => JSX.Element, // 组件预览内容
  render: () => JSX.Element, // 组件渲染内容
}
/* 创建一个编辑器预设配置对象信息 */
export function createVisualConfig() {
  /** 
   * 用于block数据，通过componentKey找到对应的component对象
   * 使用component对象的render属性渲染内容到container容器中
   */
  const componentMap: {[k: string]: VisualEditorCompnent} = {};
  /** 用户在menu中渲染预定义的组件列表 */
  const componentArray: VisualEditorCompnent[] = [];
  /**
   * 注册组件
   * @param key  唯一的标识
   */
  function registryComponent(key: string, option: Omit<VisualEditorCompnent, 'key'>){
    if (componentMap[key]) {
      const index = componentArray.indexOf(componentMap[key]);
      componentArray.slice(index, 1); // 去除已经存在的
    }
    const newComponent = { key,  ...option };
    componentArray.push(newComponent);
    componentMap[key] = newComponent;
  }
  return {
    componentMap,
    componentArray,
    registryComponent,
  };
}

export type VisualEditorConfig = ReturnType<typeof createVisualConfig>
