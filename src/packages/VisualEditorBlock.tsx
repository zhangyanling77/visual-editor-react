import { useMemo } from "react";
import { VisualEditorBlock, VisualEditorConfig } from "./VisualEditor.utils";

export const VisualEditorBlocks: React.FC<{
  block: VisualEditorBlock;
  config: VisualEditorConfig;
}> = (props) => {
  const blockStyles = useMemo(
    () => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
    }),
    [props.block.top, props.block.left]
  );

  const component = props.config.componentMap[props.block.componentKey];

  return (
    <div className="visual-editor-block" style={blockStyles}>
      {component?.render()}
    </div>
  );
};
