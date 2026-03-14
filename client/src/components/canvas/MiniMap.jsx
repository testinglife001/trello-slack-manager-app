// MiniMap.jsx
import './MiniMap.css';

export default function MiniMap({ canvas }) {

  useEffect(() => {
    const mini = new fabric.StaticCanvas("mini");

    canvas.on("after:render", () => {
      mini.clear();

      canvas.getObjects().forEach(o => {
        mini.add(o.clone());
      });

      mini.renderAll();
    });
  }, []);

  return <canvas id="mini" width={200} height={120}/>;
}
