// 2️⃣ TimelineThumbnailGenerator.jsx (NEW)

import html2canvas from "html2canvas";

export async function generateThumbnail(canvasRef) {
  if (!canvasRef.current) return null;

  const canvas = await html2canvas(canvasRef.current, {
    backgroundColor: "#ffffff",
    scale: 0.3
  });

  return canvas.toDataURL("image/png");
}
