import { VFC } from "react";
import { Field, Focusable, PanelSection, PanelSectionRow } from "decky-frontend-lib";

import MarkDownIt from "markdown-it";
import { ScrollArea, Scrollable, scrollableRef } from "../utils/Scrollable";

const mdIt = new MarkDownIt({
  html: true
});

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