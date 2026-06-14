import { useCallback } from "react";
import { useDialog } from "../../providers/dialog";
import { DialogSearchList } from "../dialog-serarch-list";
import type { SupportedChatModelId } from "@meow/shared";

type ModelDialogProps = {
  Models: SupportedChatModelId[];
  onSelect: (modelId: SupportedChatModelId) => void;
  currentModel: SupportedChatModelId;
};

export const ModelDialogContent = ({
  Models,
  onSelect,
  currentModel,
}: ModelDialogProps) => {
  const dialog = useDialog();
  const handleSelect = useCallback(
    (modelId: SupportedChatModelId) => {
      onSelect(modelId);
      dialog.close();
    },
    [dialog, onSelect],
  );

  return (
    <DialogSearchList
      items={Models}
      onSelect={handleSelect}
      filterFn={(modelId, query) =>
        modelId.toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(i, isSelected) => {
        return (
          <text selectable={false} fg={isSelected ? "black" : "white"}>
            {i === currentModel ? "\u0020\u25B6\u0020" : "\u0020\u0020\u0020"}
            {i}
          </text>
        );
      }}
      getKey={(i) => i}
      placeholder="Search models"
      emptyText="No matching models"
    />
  );
};
