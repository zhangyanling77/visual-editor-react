import { useEffect, useMemo, useRef } from "react";
import { VisualEditorBlock, VisualEditorConfig } from "./VisualEditor.utils";
import { useUpdate } from "./hook/useUpdate";
import classNames from "classnames";

export const VisualEditorBlocks: React.FC<{
  block: VisualEditorBlock;
  config: VisualEditorConfig;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
}> = (props) => {
  const blockRef = useRef({} as HTMLDivElement);
  const { update } = useUpdate();
  const blockStyles = useMemo(
    () => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      opacity: props.block.adjustPosition ? "0" : "", // 为了防止电脑性能差出现闪一下再调整位置的情况
    }),
    [JSON.stringify(props.block)]
  );
  const blockClasses = useMemo(() => classNames([
    'visual-editor-block',
    {
      'visual-editor-block-focus': props.block.focus,
    }
  ]), [props.block.focus]);

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
    <div
      className={blockClasses}
      style={blockStyles}
      ref={blockRef}
      onMouseDown={props.onMouseDown}
    >
      {component?.render()}
    </div>
  );
};
