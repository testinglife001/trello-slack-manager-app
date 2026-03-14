// /engine/spatial/QuadTree.js
export default class QuadTree {
  constructor(boundary, capacity = 50) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  insert(node) {
    if (!this.contains(node)) return false;

    if (this.points.length < this.capacity) {
      this.points.push(node);
      return true;
    }

    if (!this.divided) this.subdivide();

    return (
      this.northeast.insert(node) ||
      this.northwest.insert(node) ||
      this.southeast.insert(node) ||
      this.southwest.insert(node)
    );
  }

  query(range, found = []) {
    if (!this.intersects(range)) return found;

    for (const p of this.points) {
      if (range.contains(p)) found.push(p);
    }

    if (this.divided) {
      this.northeast.query(range, found);
      this.northwest.query(range, found);
      this.southeast.query(range, found);
      this.southwest.query(range, found);
    }

    return found;
  }
}
