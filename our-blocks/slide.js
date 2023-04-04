import apiFetch from "@wordpress/api-fetch"
import { Button, PanelBody, PanelRow } from "@wordpress/components"
import { InnerBlocks, InspectorControls, MediaUpload, MediaUploadCheck } from "@wordpress/block-editor"
import { registerBlockType } from "@wordpress/blocks"
import { useEffect } from "@wordpress/element"

// Slide is very similar to banner.js, as they both have a background image, text headings, and buttons. You could create a class that both could inherit from, but we didn't bother in this case.

//to make additional slideshows - in the site editor - click the button showing three lines on the left side - expand the slideshow - copy the slide, then you can make more.

registerBlockType("ourblocktheme/slide", {
  title: "Slide",
  supports: {
    align: ["full"]
  },
  attributes: {
    themeimage: { type: "string" },
    align: { type: "string", default: "full" },
    imgID: { type: "number" },
    imgURL: { type: "string", default: banner.fallbackimage }
  },
  edit: EditComponent,
  save: SaveComponent
})

function EditComponent(props) {
  // If there's a themeimage on page load, then it will set imgURL to the path plus that image name. (slide.themeimagepath was set up in functions.php – php creates a JS variable that’s available on page load for the JS code to use. So here we use it to concat the full imageURL address.)
  useEffect(function () {
    if (props.attributes.themeimage) {
      props.setAttributes({ imgURL: `${slide.themeimagepath}${props.attributes.themeimage}` })
    }
  }, [])

  useEffect(
    function () {
      if (props.attributes.imgID) {
        async function go() {
          const response = await apiFetch({
            path: `/wp/v2/media/${props.attributes.imgID}`,
            method: "GET"
          })
          // Once we have a user-selected imgURL, we want to now ignore themeimage, so we set it to an empty string:
          props.setAttributes({ themeimage: "", imgURL: response.media_details.sizes.pageBanner.source_url })
        }
        go()
      }
    },
    [props.attributes.imgID]
  )

  function onFileSelect(x) {
    props.setAttributes({ imgID: x.id })
  }

  return (
    <>
      <InspectorControls>
        <PanelBody title="Background" initialOpen={true}>
          <PanelRow>
            <MediaUploadCheck>
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

      <div className="hero-slider__slide" style={{ backgroundImage: `url('${props.attributes.imgURL}')` }}>
        <div className="hero-slider__interior container">
          <div className="hero-slider__overlay t-center">
            <InnerBlocks allowedBlocks={["ourblocktheme/genericheading", "ourblocktheme/genericbutton"]} />
          </div>
        </div>
      </div>
    </>
  )
}

function SaveComponent() {
  return <InnerBlocks.Content />
}
