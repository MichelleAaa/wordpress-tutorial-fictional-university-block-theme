import ourColors from "../inc/ourColors"
import { link } from "@wordpress/icons"
import { ToolbarGroup, ToolbarButton, Popover, Button, PanelBody, PanelRow, ColorPalette } from "@wordpress/components"
import { RichText, InspectorControls, BlockControls, __experimentalLinkControl as LinkControl, getColorObjectByColorValue } from "@wordpress/block-editor"
import { registerBlockType } from "@wordpress/blocks"
import { useState } from "@wordpress/element"

registerBlockType("ourblocktheme/genericbutton", {
  title: "Generic Button",
  attributes: {
    text: { type: "string" },
    size: { type: "string", default: "large" },
    linkObject: { type: "object", default: { url: "" } },
    // linkObject is for the URL of the button. -- the LinkControl stores multiple peices of data, which is why we have to set the data type as an object.
    //We set a default value becuase the button won't show up on the front-end if the person forgot to enter a url if there's no props.attributes.linkObject.url
    colorName: { type: "string", default: "blue" }
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

  //If the color name being looped over matches our attribute colorName, then it's included, and we pull out the color value (such as blue).
  const currentColorValue = ourColors.filter(color => {
    return color.name == props.attributes.colorName
  })[0].color

  function handleColorChange(colorCode) {
    // from the hex value that the color palette gives us, we need to find its color name
    // getColorObjectByColorValue - first param - the array of colors, second is the color code that was just passed in (the hex code) -- it will return the entire object from the first param that matches the second. Then we destructure out the property of name (such as blue, orange, etc. -- whichever one matches)
    const { name } = getColorObjectByColorValue(ourColors, colorCode)
    props.setAttributes({ colorName: name })
  }

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
      {/* This creates a Color option in the right sidebar */}
      <InspectorControls>
        <PanelBody title="Color" initialOpen={true}>
          <PanelRow>
            {/* Colors is an array of colors the users can choose between. */}
            <ColorPalette disableCustomColors={true} clearable={false} colors={ourColors} value={currentColorValue} onChange={handleColorChange} />
            {/* disableCustomColors={true} ensure the user can't choose a color outside of our palette. clearable={false} removes the clear button */}
          </PanelRow>
        </PanelBody>
      </InspectorControls>
      <RichText allowedFormats={[]} tagName="a" className={`btn btn--${props.attributes.size} btn--${props.attributes.colorName}`} value={props.attributes.text} onChange={handleTextChange} />
      {/* If the link picker is visible, the popover will be visible so the user can see an entry area to enter the link or search for a page on the website by name. */}
      {isLinkPickerVisible && (
        <Popover position="middle center" onFocusOutside={() => setIsLinkPickerVisible(false)}>
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
    <a href={props.attributes.linkObject.url} className={`btn btn--${props.attributes.size} btn--${props.attributes.colorName}`}>
      {props.attributes.text}
    </a>
  )
}
