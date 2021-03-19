import { useEffect, useMemo, useRef } from "react";
import { VisualEditorBlock, VisualEditorConfig } from "./VisualEditor.utils";
import { useUpdate } from './hook/useUpdate';

export const VisualEditorBlocks: React.FC<{
  block: VisualEditorBlock;
  config: VisualEditorConfig;
}> = (props) => {
  const blockRef = useRef({} as HTMLDivElement);
  const { update } = useUpdate();
  const blockStyles = useMemo(
    () => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      opacity: props.block.adjustPosition ? '0' : '', // 为了防止电脑性能差出现闪一下再调整位置的情况
    }),
    [JSON.stringify(props.block)]
  );

  const component = props.config.componentMap[props.block.componentKey];

  useEffect(() => {
    if (props.block.adjustPosition) {
      const { left, top } = props.block;
      const { width, height } = blockRef.current.getBoundingClientRect();
      props.block.adjustPosition = false;
      props.block.top = top - height / 2;
      props.block.left = left - width / 2;
      update();
    }
  }, []);

  return (
    <div className="visual-editor-block" style={blockStyles} ref={blockRef}>
      {component?.render()}
    </div>
  );
};
