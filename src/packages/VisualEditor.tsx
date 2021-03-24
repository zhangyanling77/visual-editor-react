import { useMemo, useRef, useState } from "react";
import { useCallbackRef } from "./hook/useCallbackRef";
import {
  VisualEditorConfig,
  VisualEditorValue,
  VisualEditorCompnent,
  createVisualBlock,
  VisualEditorBlock,
} from "./VisualEditor.utils";
import { VisualEditorBlocks } from "./VisualEditorBlock";
import { notification, Tooltip } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useVisualEditorCommand } from './VisualEditor.commander';
import { createEvent } from "./plugin/event";
import "./VisualEditor.scss";

export const VisualEditor: React.FC<{
  value: VisualEditorValue;
  onChange: (val: VisualEditorValue) => void;
  config: VisualEditorConfig;
}> = (props) => {
  const [preview, setPreview] = useState(false); // 当前是画布否为预览状态
  const [editing, setEditing] = useState(false); // 当前画布是否为编辑状态
  const [dragstart] = useState(() => createEvent());
  const [dragend] = useState(() => createEvent());
  // 设置画布的宽高
  const containerStyles = useMemo(
    () => ({
      width: `${props.value.container.width}px`,
      height: `${props.value.container.height}px`,
    }),
    [JSON.stringify(props.value.container)]
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
  // 拖拽菜单block的处理
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
  // 选中容器中block的处理
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
      setTimeout(() => blockDraggier.mousedown(e), 0);
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
  // 拖拽容器中的block的处理
  const blockDraggier = (() => {
    const dragData = useRef({
      startX: 0, // 拖拽开始时，鼠标的left
      startY: 0, // 拖拽开始时，鼠标的top
      startPosArray: [] as { top: number, left: number }[], // 拖拽开始时，所有选中的block的top及left
    });

    const mousedown = useCallbackRef((e: React.MouseEvent<HTMLDivElement>) => {
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);
      dragData.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosArray: focusData.focus.map(({ top, left }) => ({ top, left })),
      }
    });

    const mousemove = useCallbackRef((e: MouseEvent) => {
      const { startX, startY, startPosArray } = dragData.current;
      const { clientX: moveX, clientY: moveY } = e;
      const durX = moveX - startX;
      const durY = moveY - startY;
      focusData.focus.forEach((block, index) => {
        const { top, left } = startPosArray[index];
        block.top = top + durY;
        block.left = left + durX;
      });
      methods.updateBlocks(props.value.blocks);
    });

    const mouseup = useCallbackRef((e: MouseEvent) => {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    });

    return { mousedown };
  })();
  // 命令对象
  const commander = useVisualEditorCommand({
    value: props.value,
    focusData,
    updateBlocks: methods.updateBlocks,
    dragstart,
    dragend,
  });
  // 操作按钮
  const buttons: {
    label: string | (() => string),
    icon: string | (() => string),
    tip?: string | (() => string),
    handler: () => void,
  }[] = [
    { label: '撤销', icon: 'icon-back', handler: commander.undo, tip: 'ctrl+z' },
    { label: '重做', icon: 'icon-forward', handler: commander.redo, tip: 'ctrl+y, ctrl+shift+z' },
    {
      label: () => preview ? '编辑' : '预览',
      icon: () => preview ? 'icon-edit' : 'icon-browse',
      handler: () => {
        if (!preview) {
          methods.clearFocus();
        }
        setPreview(!preview);
      },
    },
    {
      label: '导入',
      icon: 'icon-import',
      handler: async () => {
        // const text = await $$dialog.textarea('', { title: '请输入导入的JSON字符串' });
        try {
          // const data = JSON.parse(text || '');
          // commander.updateValue(data);
        } catch (err) {
          console.error(err);
          notification.open({
            message: '导入失败！',
            description: '导入的数据格式不正确，请检查输入！'
          })
        }
      },
    },
    {
      label: '导出',
      icon: 'icon-export',
      handler: () => {
        // $$dialog.textarea(JSON.stringify(props.value), { editReadOnly: true, title: '导出JSON数据' });
      },
    },
    { label: '置顶', icon: 'icon-place-top', handler: () => {
      // commander.placeTop();
    }, tip: 'ctrl+up' },
    { label: '置底', icon: 'icon-place-bottom', handler: () => {
      // commander.placeBottom();
    }, tip: 'ctrl+down' },
    { label: '删除', icon: 'icon-delete', handler: () => commander.delete(), tip: 'ctrl+d, backspace, delete' },
    { label: '清空', icon: 'icon-reset', handler: () => commander.clear() },
    {
      label: '关闭',
      icon: 'icon-close',
      handler: () => {
        methods.clearFocus();
        setEditing(false);
      },
    },
  ];

  return (
    <div className="visual-editor">
      <div className="visual-editor-menu">
        <div className="visual-editor-menu-title">
          <MenuOutlined />
          <span>组件总览</span>
        </div>
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
      <div className="visual-editor-head">
        {
          buttons.map((btn, index) => {
            const label = typeof btn.label === 'function' ? btn.label() : btn.label;
            const icon = typeof btn.icon === 'function' ? btn.icon() : btn.icon;
            const content = (
              <div className="visual-editor-head-button" key={index} onClick={btn.handler}>
                <i className={`iconfont ${icon}`} />
                <span>{label}</span>
              </div>
            )
            return !btn.tip ? content : <Tooltip key={index} placement="bottom" title={btn.tip}>
              {content}
            </Tooltip>
          })
        }
      </div>
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
