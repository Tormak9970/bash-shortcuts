import { VFC, Fragment } from "react";

import MarkDownIt from "markdown-it";
import mdAttr from "markdown-it-attrs";
import mdContainer from "markdown-it-container";

const mdIt = new MarkDownIt()
  .use(mdAttr)
  .use(mdContainer);

export const GuidePage: VFC<{ content: string }> = ({ content }) => {
  return (
    <>
      <div className="bash-shortcuts__guide-page" dangerouslySetInnerHTML={{ __html: mdIt.render(content) }}></div>
    </>
  );
}