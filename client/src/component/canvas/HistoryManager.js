// 📁 HistoryManager.js

export default function HistoryManager(canvas) {
  let history = [];
  let index = -1;

  const save = () => {
    history = history.slice(0, index + 1);
    history.push(JSON.stringify(canvas.toJSON()));
    index++;
  };

  canvas.on("object:added", save);
  canvas.on("object:modified", save);
  canvas.on("object:removed", save);

  canvas.undo = () => {
    if (index <= 0) return;
    index--;
    canvas.loadFromJSON(history[index], canvas.renderAll.bind(canvas));
  };

  canvas.redo = () => {
    if (index >= history.length - 1) return;
    index++;
    canvas.loadFromJSON(history[index], canvas.renderAll.bind(canvas));
  };
}





