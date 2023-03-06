import { VFC, Fragment } from "react";

import MarkDownIt from "markdown-it";
import mdItAnchor from "markdown-it-anchor";
import mdItTOC from "markdown-it-toc-done-right";
import mdAttr from "markdown-it-attrs";
import mdContainer from "markdown-it-container";
import mdMultiTable from "markdown-it-multimd-table";

const mdIt = new MarkDownIt()
  .use(mdItAnchor)
  .use(mdItTOC)
  .use(mdAttr)
  .use(mdContainer)
  .use(mdMultiTable);

export const GuidePage: VFC<{ content: string }> = ({ content }) => {
  return (
    <>
      <div className="bash-shortcuts__guide-page" dangerouslySetInnerHTML={{ __html: mdIt.render(content) }}></div>
    </>
  );
}