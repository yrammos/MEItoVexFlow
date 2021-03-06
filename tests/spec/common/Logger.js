define([
  'common/Logger',
  'common/RuntimeError'
], function (Logger, RuntimeError, undefined) {

  describe("Logger", function () {

    var levels = ['warn', 'error','info', 'debug'];
    var len = levels.length;
    var i;

    var newAppender = {};

    for (i=0;i<len;i++) {
      newAppender[levels[i]] = function () {
        return 'new';
      };
    }

    it('is defined', function () {
      expect(Logger).toBeDefined();
    });

    it('has debug(), info(), warn() and error() methods', function () {
      for (i=0;i<len;i++) {
        expect(typeof Logger[levels[i]]).toEqual('function');
      }
    });

    it('has debug(), info(), warn() and error() methods in the appender object', function () {
      for (i=0;i<len;i++) {
        expect(typeof Logger.appender[levels[i]]).toEqual('function');
      }
    });

    describe('setAppender', function () {
      it('raises an error if the parameter is not an object', function () {
        expect(function () {
          Logger.setAppender();
        }).toThrow(new RuntimeError('Parameter is not an object'));
      });
      it('raises an error if not all four appender methods are implemented in the parameter object', function () {
        expect(function () {
          Logger.setAppender({warn : function () {
          }});
        }).toThrow(new RuntimeError('Parameter object does not contain the expected appender methods.'));
        expect(function () {
          Logger.setAppender({
            warn : 'notafunction',
            error : 'notafunction',
            info : 'notafunction'
          });
        }).toThrow(new RuntimeError('Parameter object does not contain the expected appender methods.'));
      });

      it('sets "appender" to the parameter object if a valid object is passed', function () {
        Logger.setAppender(newAppender);
        expect(Logger.appender).toBe(newAppender);
      });
    });

    describe('setLevel', function () {

      it('activates all logging on true or "debug"', function () {
        Logger.setAppender(newAppender);
        Logger.setLevel(true);

        for (i=0;i<len;i++) {
          expect(Logger[levels[i]]()).toEqual(Logger.appender[levels[i]]());
        }
        Logger.setAppender(newAppender);
        Logger.setLevel('debug');

        for (i=0;i<len;i++) {
          expect(Logger[levels[i]]()).toEqual(Logger.appender[levels[i]]());
        }
      });

      it('activates logging only for "info", warn" and "error" on "info"', function () {
        Logger.setAppender(newAppender);
        Logger.setLevel('info');

        expect(Logger['error']()).toEqual(Logger.appender['error']());
        expect(Logger['warn']()).toEqual(Logger.appender['warn']());
        expect(Logger['info']()).toEqual(Logger.appender['info']());
        expect(Logger['debug']()).not.toEqual(Logger.appender['debug']());
      });


      it('deactivates logging on false', function () {
        Logger.setAppender(newAppender);
        Logger.setLevel(false);

        for (i=0;i<len;i++) {
          expect(Logger[levels[i]]()).not.toEqual(Logger.appender[levels[i]]());
        }
      });

    });


  });


});