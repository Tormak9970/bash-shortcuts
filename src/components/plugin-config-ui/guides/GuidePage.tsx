import { VFC } from "react";

import MarkDownIt from "markdown-it";
import MultimdTable from "markdown-it-multimd-table";
import { ScrollArea, Scrollable, scrollableRef } from "../utils/Scrollable";

const mdIt = new MarkDownIt({
  html: true
}).use(MultimdTable);

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