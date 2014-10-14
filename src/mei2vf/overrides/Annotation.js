/**
 * Changes:
 * 1 let left justified notes align with note heads on the left
 */

define([
  'vexflow',
  'vex'
], function (VF, Vex, undefined) {

  VF.Annotation.prototype.setMeiElement = function (element) {
    this.meiElement = element;
    return this;
  };

  VF.Annotation.prototype.getMeiElement = function () {
    return this.meiElement;
  };


  VF.Annotation.prototype.draw = function () {

    // START ADDITION
    var Annotation = VF.Annotation;
    var Modifier = VF.Modifier;
    // END ADDITION

    if (!this.context) throw new Vex.RERR("NoContext", "Can't draw text annotation without a context.");
    if (!this.note) throw new Vex.RERR("NoNoteForAnnotation", "Can't draw text annotation without an attached note.");

    var start = this.note.getModifierStartXY(Modifier.Position.ABOVE, this.index);

    // We're changing context parameters. Save current state.
    this.context.save();
    this.context.setFont(this.font.family, this.font.size, this.font.weight);
    var text_width = this.context.measureText(this.text).width;

    // Estimate text height to be the same as the width of an 'm'.
    //
    // This is a hack to work around the inability to measure text height
    // in HTML5 Canvas (and SVG).
    var text_height = this.context.measureText("m").width;
    var x, y;

    if (this.justification == Annotation.Justify.LEFT) {
      // START MODIFIFICATION
      //x = start.x;
      x = this.note.getAbsoluteX();
      // END MODIFICATION
    } else if (this.justification == Annotation.Justify.RIGHT) {
      x = start.x - text_width;
    } else if (this.justification == Annotation.Justify.CENTER) {
      x = start.x - text_width / 2;
    } else /* CENTER_STEM */ {
      x = this.note.getStemX() - text_width / 2;
    }

    var stem_ext, spacing;
    var has_stem = this.note.hasStem();
    var stave = this.note.getStave();

    // The position of the text varies based on whether or not the note
    // has a stem.
    if (has_stem) {
      stem_ext = this.note.getStem().getExtents();
      spacing = stave.getSpacingBetweenLines();
    }

    if (this.vert_justification == Annotation.VerticalJustify.BOTTOM) {
      // START MODIFICATION
      y = stave.getYForBottomText(this.text_line * 2);
      // END MODIFICATION
      if (has_stem) {
        var stem_base = (this.note.getStemDirection() === 1 ? stem_ext.baseY : stem_ext.topY);
        y = Math.max(y, stem_base + (spacing * ((this.text_line * 2) + 2)));
      }

    } else if (this.vert_justification == Annotation.VerticalJustify.CENTER) {
      var yt = this.note.getYForTopText(this.text_line*2) - 1;
      var yb = stave.getYForBottomText(this.text_line*2);
      y = yt + ( yb - yt ) / 2 + text_height / 2;

    } else if (this.vert_justification == Annotation.VerticalJustify.TOP) {
      // START MODIFICATION
      y = Math.min(stave.getYForTopText(this.text_line * 2), this.note.getYs()[0] - 10);
      // END MODIFICATION
      if (has_stem) {
        y = Math.min(y, (stem_ext.topY - 5) - (spacing * this.text_line*2));
      }
    } else /* CENTER_STEM */{
      var extents = this.note.getStemExtents();
      y = extents.topY + (extents.baseY - extents.topY) / 2 + text_height / 2;
    }


    // START ADDITION
    this.x = x;
    this.y = y;
    this.text_height = text_height;
    this.text_width = text_width;
    // END ADDITION


    this.context.fillText(this.text, x, y);
    this.context.restore();
  };


});