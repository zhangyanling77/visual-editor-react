import deepcopy from "deepcopy";
import { useCommander } from "./plugin/command.plugin";
import { VisualEditorBlock, VisualEditorValue } from "./VisualEditor.utils";

export function useVisualEditorCommand({
  focusData,
  value,
  updateBlocks,
}: {
  focusData: {
    focus: VisualEditorBlock[];
    unFocus: VisualEditorBlock[];
  };
  value: VisualEditorValue;
  updateBlocks: (blocks: VisualEditorBlock[]) => void;
}) {
  const commander = useCommander();

  // 删除命令
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

  commander.useInit();

  return {
    undo: () => commander.state.commands.undo(),
    redo: () => commander.state.commands.redo(),
    delete: () => commander.state.commands.delete(),
  }
}
