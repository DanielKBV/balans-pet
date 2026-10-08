import { createCn } from "cn/config"

// Teach class merging about design-system utilities from globals.css,
// otherwise `text-small` is treated as a colour and dropped next to `text-muted-foreground`.
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "title", "heading", "body", "small", "axis"] }],
      h: [{ h: ["control"] }],
      size: [{ size: ["control"] }],
    },
  },
})
