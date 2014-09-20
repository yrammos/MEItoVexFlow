define([
  'jquery',
  'vexflow',
  'm2v/core/Logger',
  'm2v/core/RuntimeError',
  'm2v/eventlink/EventLinkCollection',
  'm2v/eventlink/EventLink'
], function ($, VF, Logger, RuntimeError, EventLinkCollection, EventLink, undefined) {


  /**
   * @class MEI2VF.Slurs
   * @extend MEI2VF.EventLinkCollection
   * @private
   *
   * @constructor
   */

  var Slurs = function (systemInfo, unresolvedTStamp2) {
    this.init(systemInfo, unresolvedTStamp2);
  };

  Vex.Inherit(Slurs, EventLinkCollection, {

    init : function (systemInfo, unresolvedTStamp2) {
      Slurs.superclass.init.call(this, systemInfo, unresolvedTStamp2);
    },

    validateAtts : function () {
      return;
    },

    // NB called from slur attributes elements
    startSlur : function (startid, linkCond) {
      var eventLink = new EventLink(startid, null);
      eventLink.setParams({
        linkCond : linkCond
      });
      this.allModels.push(eventLink);
    },

    terminateSlur : function (endid, linkCond) {
      var me = this, cmpLinkCond, found, i, slur;

      var allModels = this.getModels();

      cmpLinkCond = function (lc1, lc2) {
        return lc1.nesting_level === lc2.nesting_level;
      };

      found = false;
      for (i = 0; i < allModels.length; ++i) {
        slur = allModels[i];
        if (slur && !slur.getLastId() && cmpLinkCond(slur.params.linkCond, linkCond)) {
          slur.setLastId(endid);
          found = true;
          break;
        }
      }
      if (!found) {
        me.addModel(new EventLink(null, endid));
      }
    },

    createVexFromInfos : function (notes_by_id) {
      var me = this, f_note, l_note;
      $.each(me.allModels, function () {
        var keysInChord;
        f_note = notes_by_id[this.getFirstId()] || {};
        l_note = notes_by_id[this.getLastId()] || {};


        if (!f_note.vexNote && !l_note.vexNote) {
          Logger.log('warn', 'Slur could not be rendered', 'Neither xml:id could be found: "' + this.getFirstId() +
                                                           '" / "' + this.getLastId() + '"');
          return true;
        }

        if (!this.params.curvedir) {
          var layerDir = f_note.layerDir || l_note.layerDir;
          if (layerDir) {
            // calculate default curve direction based on the relative layer
            this.params.curvedir = layerDir === -1 ? 'below' : layerDir === 1 ? 'above' : undefined;
          } else {
            // if the slur links to a note in a chord, let the outer slurs of the
            // chord point outwards
            if (f_note.vexNote) {
              keysInChord = f_note.vexNote.keys.length;
              if (keysInChord > 1) {
                this.params.curvedir =
                (+f_note.index === 0) ? 'below' : (+f_note.index === keysInChord - 1) ? 'above' : undefined;
              }
            } else if (l_note.vexNote) {
              keysInChord = l_note.vexNote.keys.length;
              if (keysInChord > 1) {
                this.params.curvedir =
                +l_note.index === 0 ? 'below' : (+l_note.index === keysInChord - 1) ? 'above' : undefined;
              }
            }
          }
        }

        if (f_note.system !== undefined && l_note.system !== undefined && f_note.system !== l_note.system) {
          me.createSingleSlur(f_note, {}, this.params);
          if (!this.params.curvedir) {
            this.params.curvedir = (f_note.vexNote.getStemDirection() === -1) ? 'above' : 'below';
          }
          me.createSingleSlur({}, l_note, this.params);
        } else {
          me.createSingleSlur(f_note, l_note, this.params);
        }
      });
      return this;
    },

    // TODO auch noch unvollständige slurs testen

    createSingleSlur : function (f_note, l_note, params) {
      var me = this, vexSlur, bezier, cps;

      var slurOptions = {
        y_shift_start : +params.startvo || undefined,
        y_shift_end : +params.endvo || undefined

      };

      bezier = params.bezier;

      // ignore bezier for now!
      bezier = null;

      if (bezier) {
        slurOptions.cps = me.bezierStringToCps(bezier);
      } else {

        // if one of the notes is in multi-voice staff ...
        if (f_note.layerDir || l_note.layerDir) {
          // invert the slur so it points outwards
          slurOptions.invert = true;

          if (f_note.vexNote && l_note.vexNote && f_note.vexNote.hasStem() && l_note.vexNote.hasStem()) {
            slurOptions.position = VF.Curve.Position.NEAR_TOP; // = 2 STEM END POSITION

            if (f_note.vexNote.getStemDirection() !== l_note.vexNote.getStemDirection()) {
              slurOptions.position_end = VF.Curve.Position.NEAR_HEAD;
            }

          }
        } else {
          if (f_note.vexNote && l_note.vexNote &&
              f_note.vexNote.getStemDirection() !== l_note.vexNote.getStemDirection()) {
            slurOptions.invert = true;
            slurOptions.position_end = VF.Curve.Position.NEAR_TOP;
          }
        }


        //        vexSlur = new VF.Curve(f_note.vexNote, l_note.vexNote, {
        //          position : 2
        //        });
        //        vexSlur = new VF.StaveTie({
        //          first_note : f_note.vexNote,
        //          last_note : l_note.vexNote,
        //          first_indices : f_note.index,
        //          last_indices : l_note.index
        //        });
        //        vexSlur.setDir(params.curvedir);
        //        if (f_note.vexNote instanceof VF.GraceNote) {
        //          vexSlur.render_options.first_x_shift = -5;
        //        }
      }

      vexSlur = new VF.Curve(f_note.vexNote, l_note.vexNote, slurOptions);

      me.allVexObjects.push(vexSlur);
    },

    bezierStringToCps : function (str) {
      var cps = [], xy, bezierArray = str.split(' ');

      var regex = /(\-?\d+)\s+(\-?\d+)/g;
      var matched = null;
      console.log('matched:');
      console.log(matched);
      while (matched = regex.exec(str)) {
        console.log(matched[1] + ' " ' + matched[2]);
        cps.push({
          x : +matched[1],
          y : +matched[2]
        });
      }

      // TODO allow less and more than two set of cps in VexFlow
      if (!cps[1]) cps[1] = cps[0];

      return cps;
    }
  });

  return Slurs;


});