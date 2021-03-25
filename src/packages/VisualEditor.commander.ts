import { useRef } from "react";
import deepcopy from "deepcopy";
import { useCommander } from "./plugin/command.plugin";
import { VisualEditorBlock, VisualEditorValue } from "./VisualEditor.utils";
import { useCallbackRef } from "./hook/useCallbackRef";

export function useVisualEditorCommand({
  focusData,
  value,
  updateBlocks,
  dragstart,
  dragend,
}: {
  focusData: {
    focus: VisualEditorBlock[];
    unFocus: VisualEditorBlock[];
  },
  value: VisualEditorValue,
  updateBlocks: (blocks: VisualEditorBlock[]) => void,
  dragstart: { on: (cb: () => void) => void, off: (cb: () => void) => void },
  dragend: { on: (cb: () => void) => void, off: (cb: () => void) => void },
}) {
  const commander = useCommander();

  /** 删除命令 */
  commander.useRegistry({
    name: "delete",
    keyboard: ["delete", "ctrl+d", "backspace"],
    execute() {
      const data = {
        before: deepcopy(value.blocks),
        after: deepcopy(focusData.unFocus),
      };
      return {
        redo: () => {
          updateBlocks(deepcopy(data.after));
        },
        undo: () => {
          updateBlocks(deepcopy(data.before));
        },
      };
    },
  });

  /**
   * drag 命令适用于以下三种情况:
   * 1.从菜单拖拽组件到容器
   * 2.在容器中拖拽组件调整位置
   * 3.拖拽调整组件的宽度和高度
   */
  (() => {
    const dragData = useRef({ before: null as null | VisualEditorBlock[] });
    const handler = {
      dragstart: useCallbackRef(() => dragData.current.before = deepcopy(value.blocks)),
      dragend: useCallbackRef(() => commander.state.commands.drag()),
    };

    commander.useRegistry({
      name: 'drag',
      init() {
        dragData.current = { before: null };
        dragstart.on(handler.dragstart);
        dragend.on(handler.dragend);
        return () => {
          dragstart.off(handler.dragstart);
          dragend.off(handler.dragend);
        };
      },
      execute() {
        const data = {
          before: deepcopy(dragData.current.before!),
          after: deepcopy(value.blocks),
        };
        console.log('drag data: ', data)
        return {
          redo: () => {
            updateBlocks(deepcopy(data.after));
          },
          undo: () => {
            updateBlocks(deepcopy(data.before));
          },
        }
      }
    });
  })();

  /** 清空命令 */
  commander.useRegistry({
    name: 'clear',
    execute: () => {
      const data = {
        before: deepcopy(value.blocks),
        after: deepcopy([]),
      };
      return {
        redo: () => {
          updateBlocks(deepcopy(data.after));
        },
        undo: () => {
          updateBlocks(deepcopy(data.before));
        },
      }
    },
  });

  commander.useInit();

  return {
    undo: () => commander.state.commands.undo(),
    redo: () => commander.state.commands.redo(),
    delete: () => commander.state.commands.delete(),
    clear: () => commander.state.commands.clear(),
  }
}
