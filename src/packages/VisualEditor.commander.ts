import { useRef } from 'react';
import deepcopy from 'deepcopy';
import { useCommander } from './plugin/command.plugin';
import { VisualEditorBlock, VisualEditorValue } from './VisualEditor.utils';
import { useCallbackRef } from './hook/useCallbackRef';

export function useVisualEditorCommand({
  focusData,
  onChange,
  value,
  updateBlocks,
  dragstart,
  dragend,
}: {
  focusData: {
    focus: VisualEditorBlock[];
    unFocus: VisualEditorBlock[];
  };
  onChange: (val: VisualEditorValue) => void;
  value: VisualEditorValue;
  updateBlocks: (blocks: VisualEditorBlock[]) => void;
  dragstart: { on: (cb: () => void) => void; off: (cb: () => void) => void };
  dragend: { on: (cb: () => void) => void; off: (cb: () => void) => void };
}) {
  const commander = useCommander();

  /** 删除命令 */
  commander.useRegistry({
    name: 'delete',
    keyboard: ['delete', 'ctrl+d', 'backspace'],
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
      dragstart: useCallbackRef(
        () => (dragData.current.before = deepcopy(value.blocks)),
      ),
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
      };
    },
  });

  /** 全选命令 */
  commander.useRegistry({
    name: 'selectAll',
    keyboard: ['ctrl+a'],
    followQueue: false,
    execute: () => {
      return {
        redo: () => {
          value.blocks.forEach((block) => (block.focus = true));
          updateBlocks(deepcopy(value.blocks));
        },
      };
    },
  });

  /** 置顶命令 */
  commander.useRegistry({
    name: 'placeTop',
    keyboard: 'ctrl+up',
    execute: () => {
      const data = {
        before: deepcopy(value.blocks),
        after: deepcopy(
          (() => {
            const { focus, unFocus } = focusData;
            const maxZIndex =
              unFocus.reduce(
                (prev, block) => Math.max(prev, block.zIndex),
                -Infinity,
              ) + 1;
            focus.forEach((block) => (block.zIndex = maxZIndex));
            return value.blocks;
          })(),
        ),
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

  /** 置底命令 */
  commander.useRegistry({
    name: 'placeBottom',
    keyboard: 'ctrl+down',
    execute: () => {
      const data = {
        before: deepcopy(value.blocks),
        after: deepcopy(
          (() => {
            const { focus, unFocus } = focusData;
            let minZIndex =
              unFocus.reduce(
                (prev, block) => Math.min(prev, block.zIndex),
                Infinity,
              ) - 1;
            if (minZIndex < 0) {
              const dur = Math.abs(minZIndex);
              unFocus.forEach((block) => (block.zIndex += dur));
              minZIndex = 0;
            }
            focus.forEach((block) => (block.zIndex = minZIndex));
            return deepcopy(value.blocks);
          })(),
        ),
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

  /** 更新值 */
  commander.useRegistry({
    name: 'updateValue',
    execute: (newModelValue: VisualEditorValue) => {
      const data: {
        before: undefined | VisualEditorValue;
        after: undefined | VisualEditorValue;
      } = {
        before: undefined,
        after: undefined,
      };
      return {
        redo: () => {
          if (!data.before && !data.after) {
            data.before = deepcopy(value);
            onChange(deepcopy(newModelValue));
            data.after = deepcopy(newModelValue);
          } else {
            onChange(deepcopy(data.after!));
          }
        },
        undo: () => onChange(deepcopy(data.before!)),
      };
    },
  });

  commander.useInit();

  return {
    undo: () => commander.state.commands.undo(),
    redo: () => commander.state.commands.redo(),
    delete: () => commander.state.commands.delete(),
    clear: () => commander.state.commands.clear(),
    placeTop: () => commander.state.commands.placeTop(),
    placeBottom: () => commander.state.commands.placeBottom(),
    updateValue: (newModelValue: VisualEditorValue) =>
      commander.state.commands.updateValue(newModelValue),
  };
}
