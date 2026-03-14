// /plugins/pluginAPI.js
export const PluginAPI = {
  registerNode(type, renderer) {
    window.canvasPlugins[type] = renderer;
  },

  createNode(type, data) {
    return {
      id: crypto.randomUUID(),
      type,
      data
    };
  }
};
