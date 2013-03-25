Ext.define('CDI.mixin.Injectable', {}, function () {
    var createInjectionInterceptor;
    createInjectionInterceptor = function () {
        return function () {
            if (!this.$injected) {
                CDI.Injector.inject(this.inject, this, false);
                this.$injected = true;
            }
            return this.callParent(arguments);
        };
    };
    CDI.Class.registerPreprocessor('inject', function (Class, data, hooks, callback) {
        var dataInjectObject, identifier, _i, _len, _ref;
        if (Ext.isString(data.inject)) {
            data.inject = [data.inject];
        }
        if (Ext.isArray(data.inject)) {
            dataInjectObject = {};
            _ref = data.inject;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                identifier = _ref[_i];
                dataInjectObject[identifier] = identifier;
            }
            data.inject = dataInjectObject;
        }
        CDI.Class.hookOnClassCreated(hooks, function (Class) {
            Class.override({
                constructor: createInjectionInterceptor()
            });
        });
        CDI.Class.hookOnClassExtended(data, function (Class, data, hooks) {
            var _ref1;
            CDI.Class.hookOnClassCreated(hooks, function (Class) {
                Class.override({
                    constructor: createInjectionInterceptor()
                });
            });
            if ((_ref1 = data.inject) == null) {
                data.inject = {};
            }
            Ext.applyIf(data.inject, Class.superclass.inject);
        });
    }, 'before', 'extend');
});