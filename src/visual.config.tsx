import { createVisualConfig } from "./packages/VisualEditor.utils";
import {
  Button,
  Input,
  InputNumber,
  Radio,
  Checkbox,
  DatePicker,
  Select,
  Switch,
} from "antd";

export const visualConfig = createVisualConfig();
// 注册文本
visualConfig.registryComponent("text", {
  name: "文本",
  preview: () => <span>预览文本</span>,
  render: () => <span>渲染文本</span>,
});
// 注册按钮
visualConfig.registryComponent("button", {
  name: "按钮",
  preview: () => <Button type="primary">预览按钮</Button>,
  render: () => <Button type="primary">渲染按钮</Button>,
});
// 注册输入框
visualConfig.registryComponent("input", {
  name: "输入框",
  preview: () => <Input placeholder="输入框" />,
  render: () => <Input placeholder="输入框" />,
});

// InputNumber
visualConfig.registryComponent("inputNumber", {
  name: "数字输入框",
  preview: () => <InputNumber placeholder="输入框" />,
  render: () => <InputNumber placeholder="输入框" />,
});

// Radio
visualConfig.registryComponent("radio", {
  name: "单选框",
  preview: () => <Radio>单选</Radio>,
  render: () => <Radio>单选</Radio>,
});

// Checkbox
visualConfig.registryComponent("checkbox", {
  name: "多选框",
  preview: () => <Checkbox>多选框</Checkbox>,
  render: () => <Checkbox>多选框</Checkbox>,
});

// DatePicker
visualConfig.registryComponent("datePicker", {
  name: "日期选择框",
  preview: () => <DatePicker placeholder="请选择" />,
  render: () => <DatePicker placeholder="请选择" />,
});

// Select
visualConfig.registryComponent("select", {
  name: "选择器",
  preview: () => (
    <Select style={{ width: 150, textAlign: 'left' }} placeholder="请选择">
      <Select.Option value="1">1</Select.Option>
      <Select.Option value="2">2</Select.Option>
    </Select>
  ),
  render: () => (
    <Select style={{ width: 150, textAlign: 'left' }} placeholder="请选择">
      <Select.Option value="1">1</Select.Option>
      <Select.Option value="2">2</Select.Option>
    </Select>
  ),
});

// Switch 
visualConfig.registryComponent("switch", {
  name: "开关",
  preview: () => <Switch />,
  render: () => <Switch />,
});
