/*
 * (C)opyright 2013 Marco Jahn
 */

/**
 *
 * @author Marco Jahn
 */
Ext.define('CDI.core.Class', {
    alternateClassName: ['CDI.Class'],
    statics: {
        registerPreprocessor: function (name, fn, position, relativeTo) {
            Ext.Class.registerPreprocessor(name, function (Class, data, hooks, callback) {
                return fn.call(this, Class, data, hooks, callback);
            }, [name], position, relativeTo);
        },
        hookOnClassCreated: function (hooks, fn) {
            Ext.Function.interceptBefore(hooks, 'onCreated', fn);
        },
        hookOnClassExtended: function (data, fn) {
            var onClassExtended;
            onClassExtended = fn;
            if (data.onClassExtended != null) {
                Ext.Function.interceptBefore(data, 'onClassExtended', onClassExtended);
            } else {
                data.onClassExtended = onClassExtended;
            }
        },

        /**
         * Returns true if the passed class name is a superclass of the passed Class reference.
         */
        extendsClass: function (className, currentClass) {
            try {
                if (Ext.getClassName(currentClass) === className) {
                    return true;
                }
                if (currentClass != null ? currentClass.superclass : void 0) {
                    if (Ext.getClassName(currentClass.superclass) === className) {
                        return true;
                    } else {
                        return Deft.Class.extendsClass(className, Ext.getClass(currentClass.superclass));
                    }
                } else {
                    return false;
                }
            } catch (error) {
                return false;
            }
        }
    }
});