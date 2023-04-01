import { link } from "@wordpress/icons"
import { ToolbarGroup, ToolbarButton, Popover, Button } from "@wordpress/components"
import { RichText, BlockControls, __experimentalLinkControl as LinkControl } from "@wordpress/block-editor"
import { registerBlockType } from "@wordpress/blocks"
import { useState } from "@wordpress/element"

registerBlockType("ourblocktheme/genericbutton", {
  title: "Generic Button",
  attributes: {
    text: { type: "string" },
    size: { type: "string", default: "large" },
    linkObject: { type: "object" }
    // linkObject is for the URL of the button. -- the LinkControl stores multiple peices of data, which is why we have to set the data type as an object.
  },
  edit: EditComponent,
  save: SaveComponent
})

function EditComponent(props) {
  const [isLinkPickerVisible, setIsLinkPickerVisible] = useState(false)
  //We are using react state instead of using an attribute becuase it's so small, whether the link button is clicked or not. 

  function handleTextChange(x) {
    props.setAttributes({ text: x })
  }

  function buttonHandler() {
    setIsLinkPickerVisible(prev => !prev)
    //For toggling - set to the opposite.
  }

  function handleLinkChange(newLink) {
    props.setAttributes({ linkObject: newLink })
  } //the LinkControl creates an object for the post/page that's sepected.  -- You can view the object in Adminer - wp_posts - Go to the last page and view the last item. It will list the linkObject details.

  return (
    <>
      <BlockControls>
        <ToolbarGroup>
            {/* This las the link icon for the link url to be added for the button: */}
          <ToolbarButton onClick={buttonHandler} icon={link} />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarButton isPressed={props.attributes.size === "large"} onClick={() => props.setAttributes({ size: "large" })}>
            Large
          </ToolbarButton>
          <ToolbarButton isPressed={props.attributes.size === "medium"} onClick={() => props.setAttributes({ size: "medium" })}>
            Medium
          </ToolbarButton>
          <ToolbarButton isPressed={props.attributes.size === "small"} onClick={() => props.setAttributes({ size: "small" })}>
            Small
          </ToolbarButton>
        </ToolbarGroup>
      </BlockControls>
      <RichText allowedFormats={[]} tagName="a" className={`btn btn--${props.attributes.size} btn--blue`} value={props.attributes.text} onChange={handleTextChange} />
      {/* If the link picker is visible, the popover will be visible so the user can see an entry area to enter the link or search for a page on the website by name. */}
      {isLinkPickerVisible && (
        <Popover position="middle center">
            {/* This creates a field where someone can enter a URL or they can search the wordpress site for a page: */}
          <LinkControl settings={[]} value={props.attributes.linkObject} onChange={handleLinkChange} />
          {/* This is the close button, after they finish updating the link: */}
          <Button variant="primary" onClick={() => setIsLinkPickerVisible(false)} style={{ display: "block", width: "100%" }}>
            Confirm Link
          </Button>
        </Popover>
      )}
    </>
  )
}

function SaveComponent(props) {
  return (
    <a href={props.attributes.linkObject.url} className={`btn btn--${props.attributes.size} btn--blue`}>
      {props.attributes.text}
    </a>
  )
}
