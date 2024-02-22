import { VFC, Fragment } from "react";

import MarkDownIt from "markdown-it";
import { ScrollArea, Scrollable, scrollableRef } from "../utils/Scrollable";

const mdIt = new MarkDownIt({
  //try "commonmark"
  html: true,
});

export const GuidePage: VFC<{ content: string }> = ({ content }) => {
  const ref = scrollableRef();
  return (
    <>
      <style>{`
        .bash-shortcuts__guide-container table {
          border: 1px solid;
          border-collapse: collapse;
        }

        .bash-shortcuts__guide-container th {
          padding: 0 7px;
          border: 1px solid;
        }

        .bash-shortcuts__guide-container td {
          padding: 0 7px;
          border: 1px solid;
        }

        .bash-shortcuts__guide-container tr:nth-child(odd) {
          background-color: #1B2838;
        }
      `}</style>
      <div className="bash-shortcuts__guide-container">
        <Scrollable ref={ref}>
          <ScrollArea scrollable={ref}>
            <div dangerouslySetInnerHTML={{ __html: mdIt.render(content) }} />
          </ScrollArea>
        </Scrollable>
      </div>
    </>
  );
};
