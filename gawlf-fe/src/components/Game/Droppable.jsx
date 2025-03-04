// import React from "react";
// import { useDroppable } from "@dnd-kit/core";

// function Droppable(props) {
//   const { isOver, setNodeRef, active } = useDroppable({
//     id: "droppable",
//   });

//   console.log("Droppable isOver:", isOver, "Active ID:", active?.id);

//   const style = {
//     backgroundColor: isOver ? "yellow" : "green",
//     width: "100px",
//     height: "100px",
//     border: "2px solid black",
//   };

//   return (
//     <div ref={setNodeRef} style={style}>
//       {props.children}
//     </div>
//   );
// }

import React from "react";
import { useDroppable } from "@dnd-kit/core";

function Droppable(props) {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  const style = {
    backgroundColor: isOver ? "green" : "yellow",
    height: "100px",
    width: "100px",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}

export default Droppable;
