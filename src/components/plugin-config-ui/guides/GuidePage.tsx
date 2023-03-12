import { VFC, Fragment } from "react";


import {marked} from "marked";
// import MarkDownIt from "markdown-it";
// import mdAttr from "markdown-it-attrs";
// import mdContainer from "markdown-it-container";
import { Focusable } from "decky-frontend-lib";

// const mdIt = new MarkDownIt({
//   html: true
// })
//   .use(mdAttr)
//   .use(mdContainer);

export const GuidePage: VFC<{ content: string }> = ({ content }) => {
  return (
    <>
      <Focusable dangerouslySetInnerHTML={{ __html: marked.parse(content) }}>

      </Focusable>
    </>
  );
}