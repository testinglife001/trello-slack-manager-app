// CommandPalette Component
export default function CommandPalette({
  open,
  onClose,
  canvas,
  addTextNode,
  groupSelected,
  autoLayoutVertical
}) {
  if (!open) return null;

  const commands = [
    { name: "Add Text", action: addTextNode },
    { name: "Group Selected", action: groupSelected },
    { name: "Auto Layout", action: autoLayoutVertical },
    { name: "Undo", action: () => canvas?.undo?.() }
  ];

  return (
    <div className="modal-overlay">
      <div className="palette-box">
        {commands.map((cmd) => (
          <div
            key={cmd.name}
            className="palette-item"
            onClick={() => {
              cmd.action?.();
              onClose();
            }}
          >
            {cmd.name}
          </div>
        ))}
      </div>
    </div>
  );
}
