// nodes/nodeRegistry.js
import TextNode from "../nodes/TextNode";
import TaskNode from "../nodes/TaskNode";
import FileNode from "../nodes/FileNode";
import UrlNode from "../nodes/UrlNode";

export default {
  text: TextNode,
  task: TaskNode,
  file: FileNode,
  url: UrlNode,
};
