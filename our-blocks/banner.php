<?php

// fallback if there's no imgURL selected.
if (!isset($attributes['imgURL'])) {
  $attributes['imgURL'] = get_theme_file_uri('/images/library-hero.jpg');
}

?>

<div class="page-banner">
      <div class="page-banner__bg-image" style="background-image: url('<?php echo $attributes['imgURL'] ?>')"></div>
      <div class="page-banner__content container t-center c-white">
        <!-- the content is the same as InnerBlocks.content, from the js save file: -->
        <?php echo $content; ?>
      </div>
    </div>