Ext.define('CDI.log.Logger', {
    alternateClassName: ['CDI.Logger'],
    singleton: true,
    log: function(message, priority) {
        if (priority == null) {
            priority = 'info';
        }
    },
    error: function(message) {
        this.log(message, 'error');
    },
    info: function(message) {
        this.log(message, 'info');
    },
    verbose: function(message) {
        this.log(message, 'verbose');
    },
    warn: function(message) {
        this.log(message, 'warn');
    },
    deprecate: function(message) {
        this.log(message, 'deprecate');
    }
}, function() {
    var _ref;
    if (Ext.getVersion('extjs') != null) {
        this.log = function(message, priority) {
            if (priority == null) {
                priority = 'info';
            }
            if (priority === 'verbose') {
                priority === 'info';
            }
            if (priority === 'deprecate') {
                priority = 'warn';
            }
            Ext.log({
                msg: message,
                level: priority
            });
        };
    } else {
        if (Ext.isFunction((_ref = Ext.Logger) != null ? _ref.log : void 0)) {
            this.log = Ext.bind(Ext.Logger.log, Ext.Logger);
        }
    }
});