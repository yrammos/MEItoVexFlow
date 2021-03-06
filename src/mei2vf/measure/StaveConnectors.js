/*
 * StaveConnector.js Author: Zoltan Komives (zolaemil@gmail.com) Created:
 * 24.07.2013
 *
 * Copyright © 2012, 2013 Richard Lewis, Raffaele Viglianti, Zoltan Komives,
 * University of Maryland
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/*
 * Contributor: Alexander Erhard
 */
define([
  'vexflow'
], function (VF) {

  /**
   * @class MEI2VF.Connectors
   * Handles stave connectors
   * @private
   *
   * @constructor
   * @param {Object} config the config object
   */
  var StaveConnectors = function (config) {
    var me = this;
    me.allVexConnectors = [];
    if (config) {
      me.init(config);
    }
  };

  StaveConnectors.prototype = {

    vexTypes : {
      'line' : VF.StaveConnector.type.SINGLE_LEFT,
      'brace' : VF.StaveConnector.type.BRACE,
      'bracket' : VF.StaveConnector.type.BRACKET,
      'none' : null,
      'singleright' : VF.StaveConnector.type.SINGLE_RIGHT
    },

    vexTypesBarlineRight : {
      'single' : VF.StaveConnector.type.SINGLE_RIGHT,
      'dbl' : VF.StaveConnector.type.THIN_DOUBLE,
      'end' : VF.StaveConnector.type.BOLD_DOUBLE_RIGHT,
      'rptend' : VF.StaveConnector.type.BOLD_DOUBLE_RIGHT,
      'invis' : null
    },

    vexTypesBarlineLeft : {
      'single' : VF.StaveConnector.type.SINGLE_LEFT,
      'dbl' : VF.StaveConnector.type.THIN_DOUBLE,
      'end' : VF.StaveConnector.type.BOLD_DOUBLE_LEFT,
      'rptstart' : VF.StaveConnector.type.BOLD_DOUBLE_LEFT,
      'invis' : null
    },

    init : function (config) {
      var me = this, vexType, topStave, bottomStave, vexConnector, label, labelMode, i, model, leftBarline, rightBarline;
      var models = config.models;
      var staves = config.staves;
      if (config.barlineInfo) {
        leftBarline = config.barlineInfo.leftBarline;
        rightBarline = config.barlineInfo.rightBarline;
      }
      var system_n = config.system_n;
      labelMode = config.labelMode;

      for (i in models) {
        model = models[i];

        vexType = (rightBarline) ? me.vexTypesBarlineRight[rightBarline] : me.vexTypes[model.symbol];
        topStave = staves[model.top_stave_n];
        bottomStave = staves[model.bottom_stave_n];

        if (typeof vexType === 'number' && topStave && bottomStave) {
          vexConnector = new VF.StaveConnector(topStave, bottomStave);
          vexConnector.setType(vexType);

          // TODO implement offset in VexFlow
          // offset nested connectors
          //if (model.ancestorSymbols) {
          //console.log(model.ancestorSymbols);
          //vexConnector.x_shift = -30;
          //}

          me.allVexConnectors.push(vexConnector);
          if (labelMode === 'full') {
            label = (system_n === 0) ? model.label : model.labelAbbr;
          } else if (labelMode === 'abbr') {
            label = model.labelAbbr;
          }
          if (label) {
            vexConnector.setText(label);
          }
        }

        if (leftBarline) {
          vexType = me.vexTypesBarlineLeft[leftBarline];
          if (typeof vexType === 'number' && topStave && bottomStave) {
            vexConnector = new VF.StaveConnector(topStave, bottomStave);
            vexConnector.setType(vexType);
            if (vexType === VF.StaveConnector.type.BOLD_DOUBLE_LEFT) {
              vexConnector.checkShift = true;
            }
            me.allVexConnectors.push(vexConnector);
          }
        }

      }
    },

    getAll : function () {
      return this.allVexConnectors;
    },

    setContext : function (ctx) {
      this.ctx = ctx;
      return this;
    },

    draw : function () {
      var me = this, i, j, conn, shift;
      for (i = 0, j = me.allVexConnectors.length; i < j; i += 1) {
        conn = me.allVexConnectors[i];
        if (conn.checkShift) {
          shift = conn.top_stave.getModifierXShift();
          if (shift > 0) {
            conn.setXShift(shift);
          }
        }
        conn.setContext(me.ctx).draw();
      }
    }
  };

  return StaveConnectors;

});
