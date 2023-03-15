import { VFC } from "react";

import MarkDownIt from "markdown-it";
import { ScrollArea, Scrollable, scrollableRef } from "../utils/Scrollable";

const mdIt = new MarkDownIt({ //try "commonmark"
  html: true
})

export const GuidePage: VFC<{ content: string }> = ({ content }) => {
  const ref = scrollableRef();
  return (
    <Scrollable ref={ref}>
      <ScrollArea scrollable={ref}>
        <div dangerouslySetInnerHTML={{ __html: mdIt.render(content) }} />
      </ScrollArea>
    </Scrollable>
  );
}