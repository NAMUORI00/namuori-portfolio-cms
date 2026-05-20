# Cover Thumbnail Preview Design

**Approved scope:** The main portfolio page should keep cover images visually secondary by rendering them as small right-side thumbnails beside research/project text. Users can intentionally enlarge an image through hover/focus affordance and a click/tap action that opens a large preview overlay.

**Layout:** Research and project entries with `coverImage` use a text-first grid: content on the left, thumbnail on the right. The thumbnail is square-ish and compact on desktop, then moves under the copy on narrow screens.

**Interaction:** The thumbnail is a real button with a zoom cursor, keyboard focus styling, and localized aria labels. Hover/focus only emphasizes the thumbnail slightly. Click, tap, Enter, or Space opens a centered image dialog. Backdrop click, close button, or Escape closes it.

**Constraints:** Entries without `coverImage` keep the current text-only layout. The feature must not interfere with project hover behavior that highlights the knowledge graph. The overlay must respect dark/light color contrast and avoid in-card explanatory text.

**Testing:** Add a focused test for localized preview payload generation, then run the full test, TypeScript, build, and in-app browser smoke checks.
