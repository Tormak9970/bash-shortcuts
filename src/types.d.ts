declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "markdown-it-attrs" {
  const mdAttr: MarkdownIt.PluginWithOptions<any>;
  export default mdAttr;
}

declare module "markdown-it-container" {
  const mdContainer: MarkdownIt.PluginWithOptions<any>;
  export default mdContainer;
}
