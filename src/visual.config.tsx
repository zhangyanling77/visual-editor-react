import { createVisualConfig } from './packages/VisualEditor.utils';
import { Button, Input } from 'antd';

export const visualConfig = createVisualConfig();
// 注册文本
visualConfig.registryComponent('text', {
  name: '文本',
  preview: () => <span>预览文本</span>,
  render: () => <span>渲染文本</span>,
});
// 注册按钮
visualConfig.registryComponent('button', {
  name: '按钮',
  preview: () => <Button type="primary">预览按钮</Button>,
  render: () => <Button type="primary">渲染按钮</Button>,
});
// 注册输入框
visualConfig.registryComponent('input', {
  name: '输入框',
  preview: () => <Input placeholder="预览输入框" />,
  render: () => <Input placeholder="渲染输入框" />,
});
