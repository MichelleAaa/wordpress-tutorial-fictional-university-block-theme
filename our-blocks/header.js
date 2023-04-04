wp.blocks.registerBlockType("ourblocktheme/header", {
  title: "Fictional University Header",
//   Title shows up in the block editor's block name search, which is why we are making is so distinct, as there's already a Header block.
  edit: function () {
    return wp.element.createElement("div", { className: "our-placeholder-block" }, "Header Placeholder")
  },
  save: function () {
    return null
  }
})
