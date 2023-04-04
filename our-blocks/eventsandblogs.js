wp.blocks.registerBlockType("ourblocktheme/eventsandblogs", {
  title: "Events and Blogs",
  edit: function () {
    return wp.element.createElement("div", { className: "our-placeholder-block" }, "Events and Blogs Placeholder")
  },
  // First parameter is the html element type, second is the props for it (you could give it a prop called style, className, etc.), third is the content or children that should be nested inside of the element.
  // Instead of JSX we are using a wp alias for React's createElement.
  save: function () {
    return null
  }
// We are returning null for the save function as we want 100% php processing for the save return for the front-end.
})

//Above we aren't using the package to use registerBlockType directly, instead, we are just accessing it through wp.blocks.