import { useMemo, useRef } from "react";
import { useCallbackRef } from "./hook/useCallbackRef";
import "./VisualEditor.scss";
import {
  VisualEditorConfig,
  VisualEditorValue,
  VisualEditorCompnent,
  createVisualBlock,
  VisualEditorBlock,
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
  // 计算当前编辑的数据中，哪些block是被选中的，哪些是未选中的
  const focusData = useMemo(() => {
    const focus: VisualEditorBlock[] = [];
    const unFocus: VisualEditorBlock[] = [];
    props.value.blocks.forEach((block) => {
      (block.focus ? focus : unFocus).push(block);
    });
    return { focus, unFocus };
  }, [props.value.blocks]);

  const containerRef = useRef({} as HTMLDivElement);
  // 对外暴露方法
  const methods = {
    // 更新blocks，触发重新渲染
    updateBlocks: (blocks: VisualEditorBlock[]) => {
      props.onChange({
        ...props.value,
        blocks: [...blocks],
      });
    },
    // 清空选中的元素
    clearFocus: (external?: VisualEditorBlock) => {
      (!!external
        ? focusData.focus.filter((item) => item !== external)
        : focusData.focus
      ).forEach((block) => {
        block.focus = false;
      });
      methods.updateBlocks(props.value.blocks);
    },
  };
  // 拖拽block的处理
  const menuDraggier = (() => {
    const dragData = useRef({
      dragComponent: null as null | VisualEditorCompnent,
    });
    const block = {
      dragstart: useCallbackRef(
        (
          e: React.DragEvent<HTMLDivElement>,
          dragComponent: VisualEditorCompnent
        ) => {
          containerRef.current.addEventListener(
            "dragenter",
            container.dragenter
          );
          containerRef.current.addEventListener("dragover", container.dragover);
          containerRef.current.addEventListener(
            "dragleave",
            container.dragleave
          );
          containerRef.current.addEventListener("drop", container.drop);
          // 记录拖拽的是哪一个组件
          dragData.current.dragComponent = dragComponent;
        }
      ),
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
  // 选中block的处理
  const focusHandler = (() => {
    const mousedownBlock = (e: React.MouseEvent<HTMLDivElement>, block: VisualEditorBlock) => {
      if (e.shiftKey) {
        // 如果按住了shift键，此时没有选中block，就选中该block，否则让这个block的选中状态取反
        if (focusData.focus.length <= 1) {
          block.focus = true;
        } else {
          block.focus = !block.focus;
        }
        methods.updateBlocks(props.value.blocks);
      } else {
        // 如果点击的这个block没有被选中，才清空这个其他选中的block，否则不做任何事；防止拖拽多个block，取消其他block的选中状态
        if (!block.focus) {
          block.focus = true;
          methods.clearFocus(block);
        }
      }
    };
    const mousedownContainer = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) {
        return;
      }
      if (!e.shiftKey) {
        methods.clearFocus();
      }
    };
    return {
      block: mousedownBlock,
      container: mousedownContainer,
    };
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
              onDragStart={(e) => menuDraggier.dragstart(e, component)}
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
          onMouseDown={focusHandler.container}
        >
          {props.value.blocks.map((block, index) => (
            <VisualEditorBlocks
              config={props.config}
              block={block}
              key={index}
              onMouseDown={e => focusHandler.block(e, block)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
