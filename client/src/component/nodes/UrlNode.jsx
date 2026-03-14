// UrlNode.jsx
export default function UrlNode({ meta }) {
  return (
    <iframe
      src={meta.url}
      style={{ width: "100%", height: "100%", border: 0 }}
    />
  );
}
