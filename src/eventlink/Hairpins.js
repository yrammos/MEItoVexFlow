define([
  'jquery',
  'vexflow',
  'm2v/core/Logger',
  'm2v/core/RuntimeError',
  'm2v/core/Tables',
  'm2v/eventlink/EventLinkCollection'
], function ($, VF, Logger, RuntimeError, Tables, EventLinkCollection, undefined) {

  /**
   * @class MEI2VF.Hairpins
   * @extend MEI2VF.EventLinkCollection
   * @private
   *
   * @constructor
   */
  var Hairpins = function (systemInfo, unresolvedTStamp2) {
    this.init(systemInfo, unresolvedTStamp2);
  };

  Vex.Inherit(Hairpins, EventLinkCollection, {

    init : function (systemInfo, unresolvedTStamp2) {
      Hairpins.superclass.init.call(this, systemInfo, unresolvedTStamp2);
    },

    validateAtts : function (atts) {
      if (!atts.form) {
        throw new RuntimeError('MEI2VF.RERR.BadArguments:createInfos', '@form is mandatory in <hairpin> - make sure the xml is valid.');
      }
    },

    createVexFromInfos : function (notes_by_id) {
      var me = this, f_note, l_note, vex_options;
      vex_options = {
        height : 10,
        y_shift : 0,
        left_shift_px : 0,
        r_shift_px : 0
      };
      $.each(me.allModels, function () {
        f_note = notes_by_id[this.getFirstId()] || {};
        l_note = notes_by_id[this.getLastId()] || {};

        if (f_note.system !== undefined && l_note.system !== undefined && f_note.system !== l_note.system) {
        } else {
          me.createSingleHairpin(f_note, l_note, this.params, vex_options);
        }

      });
      return this;
    },

    createSingleHairpin : function (f_note, l_note, params, vex_options) {
      var me = this, place, type, hairpin;
      place = Tables.positions[params.place];
      type = Tables.hairpins[params.form];

      if (f_note.vexNote && l_note.vexNote) {
        hairpin = new VF.StaveHairpin({
          first_note : f_note.vexNote,
          last_note : l_note.vexNote
        }, type);

        hairpin.setRenderOptions(vex_options);
        hairpin.setPosition(place);

        me.allVexObjects.push(hairpin);
      } else {
        Logger.log('warn', 'Missing targets', 'Target elements of hairpin could not be found: ');
        console.log(arguments);
      }

    }
  });


  return Hairpins;

});