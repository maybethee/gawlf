import React from "react";
import { useDraggable } from "@dnd-kit/core";

function Draggable({ id, children }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
  });

  return (
    <div
      style={{ width: "80px", height: "80px" }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

export default Draggable;
