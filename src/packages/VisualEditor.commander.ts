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
      const before = deepcopy(value.blocks);
      const after = deepcopy(focusData.unFocus);
      return {
        redo: () => {
          updateBlocks(deepcopy(after));
        },
        undo: () => {
          updateBlocks(deepcopy(before));
        },
      };
    },
  });
}
