/*
 * MEItoVexFlow, Util class
 *
 * Author: Alexander Erhard
 *
 * Copyright © 2014 Richard Lewis, Raffaele Viglianti, Zoltan Komives,
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
var MEI2VF = ( function(m2v, MeiLib, VF, $, undefined) {

    /**
     * @class MEI2VF.Util
     * @singleton
     * @private
     */
    m2v.Util = {

      /**
       *
       */
      attsToObj : function(element) {
        var i, obj = {};
        if (element.hasAttributes()) {
          i = element.attributes.length;
          while (i--) {
            obj[element.attributes[i].nodeName] = element.attributes[i].nodeValue;
          }
        }
        return obj;
      },

      /**
       *
       */
      serializeElement : function(element) {
        var result = '<' + element.localName, i, j, atts, att;
        if (element.hasAttributes()) {
          atts = element.attributes;
          for ( i = 0, j = atts.length; i < j; i += 1) {
            att = atts.item(i);
            result += ' ' + att.nodeName + '="' + att.nodeValue + '"';
          }
        }
        return result + '>';
      }
    };

    return m2v;

  }(MEI2VF || {}, MeiLib, Vex.Flow, jQuery));
