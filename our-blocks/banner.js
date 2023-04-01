import { InnerBlocks } from "@wordpress/block-editor"
import { registerBlockType } from "@wordpress/blocks" // instead of writing wp.blocks.registerBlockType, we are importing it instead.

registerBlockType("ourblocktheme/banner", {
  title: "Banner",
  supports: {
    align: ["full"]
    // Becuase in theme.json we are setting an 840px width for the layout in the post/page editor, we are overriding that for the banner block so it can take up the full-screen.
  },
  attributes: {
    align: { type: "string", default: "full" }
  },
  edit: EditComponent,
  save: SaveComponent
})

function EditComponent() {
  const useMeLater = (
    <>
      <h1 className="headline headline--large">Welcome!</h1>
      <h2 className="headline headline--medium">We think you&rsquo;ll like it here.</h2>
      <h3 className="headline headline--small">
        Why don&rsquo;t you check out the <strong>major</strong> you&rsquo;re interested in?
      </h3>
      <a href="#" className="btn btn--large btn--blue">
        Find Your Major
      </a>
    </>
  )

  return (
    <div className="page-banner">
      <div className="page-banner__bg-image" style={{ backgroundImage: "url('/wp-content/themes/fictional-block-theme/images/library-hero.jpg')" }}></div>
      <div className="page-banner__content container t-center c-white">
        <InnerBlocks allowedBlocks={["ourblocktheme/genericheading", "ourblocktheme/genericbutton"]} />
      </div>
    </div>
  )
}

// For this component we are now using banner.php for the save function. So the js save function only should save the content itself. (aka the string of text is coming from Innerblocks.Content) -- This is saved in the database for this post. So now the HTML will come from the php file and only the text content is saved to the database for each post this is added to.
function SaveComponent() {
  return <InnerBlocks.Content />
}
