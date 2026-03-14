// /engine/rendering/WebGLRenderer.js
import * as PIXI from "pixi.js";

export class WebGLRenderer {
  constructor(container) {
    this.app = new PIXI.Application({
      resizeTo: container,
      antialias: true,
    });

    container.appendChild(this.app.view);
    this.stage = this.app.stage;
  }

  drawNode(node) {
    const g = new PIXI.Graphics();

    g.beginFill(0x3498db);
    g.drawRoundedRect(node.x, node.y, node.w, node.h, 8);
    g.endFill();

    this.stage.addChild(g);
  }
}
