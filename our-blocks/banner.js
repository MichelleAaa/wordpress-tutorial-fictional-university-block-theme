import apiFetch from "@wordpress/api-fetch"
import { Button, PanelBody, PanelRow } from "@wordpress/components"
import { InnerBlocks, InspectorControls, MediaUpload, MediaUploadCheck } from "@wordpress/block-editor"
import { registerBlockType } from "@wordpress/blocks" // instead of writing wp.blocks.registerBlockType, we are importing it instead.
import { useEffect } from "@wordpress/element"

registerBlockType("ourblocktheme/banner", {
  title: "Banner",
  supports: {
    align: ["full"]
    // Becuase in theme.json we are setting an 840px width for the layout in the post/page editor, we are overriding that for the banner block so it can take up the full-screen.
  },
  attributes: {
    align: { type: "string", default: "full" },
    imgID: { type: "number" },
    imgURL: { type: "string", default: banner.fallbackimage }
    //Sometimes a user may install wp in a sub-folder on their domain, so in some cases if you hardcode a default image location it may not work. 
    // banner.fallbackimage was set up in functions.php. We could say window.banner.fallbackimage, but it's implied in this case, which is why we didn't.
  },
  edit: EditComponent,
  save: SaveComponent
})

function EditComponent(props) {
  // apiFetch is used to retreive data. In this case, we are using it to get the data regarding the image id.
  // note that we didn't have to include the base part of our url in the path, but if you want to view it in the browser then you would.
  useEffect(
    function () {
      if (props.attributes.imgID) {
        async function go() {
          const response = await apiFetch({
            path: `/wp/v2/media/${props.attributes.imgID}`,
            method: "GET"
          })
        // We are targeting pageBanner's source_url as pageBanner is our custom image size for a banner that was set up in functions.php. 
          props.setAttributes({ imgURL: response.media_details.sizes.pageBanner.source_url })
        }
        go()
      }
    },
    [props.attributes.imgID] 
    // this will trigger everytime the imgID is changed.
  )

  function onFileSelect(x) {
    props.setAttributes({ imgID: x.id })
  } //Becuase our custom pageBanner image size (added in functions.php) is not avialble in the x object (it only has standard sizes) we are just going to get the id of the image selected.

  return (
    <>
      <InspectorControls>
        <PanelBody title="Background" initialOpen={true}>
          <PanelRow>
            {/* MediaUploadCheck will see if the current logged-in user has permissions to upload media. */}
            <MediaUploadCheck>
              {/* Render= returns JSX that will appear in the right sidebar panel. In this case, a button will display. When the button is clicked, it will show the typical media upload screen. -- you can choose a pre-existing image or upload.
              After the user clicks the select button after highlighting the image, onSelect will trigger.*/}
              <MediaUpload
                onSelect={onFileSelect}
                value={props.attributes.imgID}
                render={({ open }) => {
                  return <Button onClick={open}>Choose Image</Button>
                }}
              />
            </MediaUploadCheck>
          </PanelRow>
        </PanelBody>
      </InspectorControls>
      <div className="page-banner">
        <div className="page-banner__bg-image" style={{ backgroundImage: `url('${props.attributes.imgURL}')` }}></div>
        <div className="page-banner__content container t-center c-white">
          <InnerBlocks allowedBlocks={["ourblocktheme/genericheading", "ourblocktheme/genericbutton"]} />
        </div>
      </div>
    </>
  )
}

// For this component we are now using banner.php for the save function. So the js save function only should save the content itself. (aka the string of text is coming from Innerblocks.Content) -- This is saved in the database for this post. So now the HTML will come from the php file and only the text content is saved to the database for each post this is added to.
function SaveComponent() {
  return <InnerBlocks.Content />
}
