import { useMemo, useRef } from "react";
import { useCallbackRef } from "./hook/useCallbackRef";
import "./VisualEditor.scss";
import {
  VisualEditorConfig,
  VisualEditorValue,
  VisualEditorCompnent,
  createVisualBlock,
} from "./VisualEditor.utils";
import { VisualEditorBlocks } from "./VisualEditorBlock";

export const VisualEditor: React.FC<{
  value: VisualEditorValue;
  onChange: (val: VisualEditorValue) => void;
  config: VisualEditorConfig;
}> = (props) => {
  // 设置画布的宽高
  const containerStyles = useMemo(
    () => ({
      width: `${props.value.container.width}px`,
      height: `${props.value.container.height}px`,
    }),
    [props.value.container.width, props.value.container.height]
  );
  const containerRef = useRef({} as HTMLDivElement);
  // 拖拽
  const menuDraggier = (() => {
    const dragData = useRef({
      dragComponent: null as null | VisualEditorCompnent,
    })
    const block = {
      dragstart: useCallbackRef((e: React.DragEvent<HTMLDivElement>, dragComponent: VisualEditorCompnent) => {
        containerRef.current.addEventListener("dragenter", container.dragenter);
        containerRef.current.addEventListener("dragover", container.dragover);
        containerRef.current.addEventListener("dragleave", container.dragleave);
        containerRef.current.addEventListener("drop", container.drop);
        // 记录拖拽的是哪一个组件
        dragData.current.dragComponent = dragComponent;
      }),
      dragend: useCallbackRef((e: React.DragEvent<HTMLDivElement>) => {
        containerRef.current.removeEventListener(
          "dragenter",
          container.dragenter
        );
        containerRef.current.removeEventListener(
          "dragover",
          container.dragover
        );
        containerRef.current.removeEventListener(
          "dragleave",
          container.dragleave
        );
        containerRef.current.removeEventListener("drop", container.drop);
      }),
    };
    const container = {
      dragenter: useCallbackRef(
        (e: DragEvent) => (e.dataTransfer!.dropEffect = "move")
      ),
      dragover: useCallbackRef((e: DragEvent) => e.preventDefault()),
      dragleave: useCallbackRef(
        (e: DragEvent) => (e.dataTransfer!.dropEffect = "none")
      ),
      drop: useCallbackRef((e: DragEvent) => {
        props.onChange({
          ...props.value,
          blocks: [
            ...props.value.blocks,
            createVisualBlock({
              top: e.offsetY,
              left: e.offsetX,
              component: dragData.current.dragComponent!,
            }),
          ],
        });
      }),
    };

    return block;
  })();

  return (
    <div className="visual-editor">
      <div className="visual-editor-menu">
        {props.config.componentArray.map(
          (component: VisualEditorCompnent, index: number) => (
            <div
              key={index}
              className="visual-editor-menu-item"
              draggable
              onDragStart={e => menuDraggier.dragstart(e, component)}
              onDragEnd={menuDraggier.dragend}
            >
              {component.preview()}
              <div className="visual-editor-menu-item-name">
                {component.name}
              </div>
            </div>
          )
        )}
      </div>
      <div className="visual-editor-head">head</div>
      <div className="visual-editor-operator">operator</div>
      <div className="visual-editor-body">
        <div
          className="visual-editor-container"
          style={containerStyles}
          ref={containerRef}
        >
          {props.value.blocks.map((block, index) => (
            <VisualEditorBlocks
              config={props.config}
              block={block}
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
