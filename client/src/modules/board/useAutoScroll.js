// 📁 useAutoScroll.js
export default function useAutoScroll() {
  const scroll = (e, container) => {
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const zone = 60;
    const speed = 15;

    if (e.clientY < rect.top + zone) container.scrollTop -= speed;
    if (e.clientY > rect.bottom - zone) container.scrollTop += speed;

    if (e.clientX < rect.left + zone) container.scrollLeft -= speed;
    if (e.clientX > rect.right - zone) container.scrollLeft += speed;
  };

  return scroll;
}
