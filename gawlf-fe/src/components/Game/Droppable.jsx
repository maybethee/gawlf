import React from "react";
import { useDroppable } from "@dnd-kit/core";

function Droppable(props) {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  const style = {
    backgroundColor: isOver ? "yellow" : "green",
    width: "100px",
    height: "100px",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}

export default Droppable;
