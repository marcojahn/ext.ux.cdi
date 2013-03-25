Ext.define('CDI.ioc.Injector', {
    alternateClassName: ['CDI.Injector'],
    requires: ['Ext.Component', 'CDI.log.Logger', 'CDI.ioc.DependencyProvider'],
    singleton: true,
    constructor: function () {
        this.providers = {};
        this.injectionStack = [];
        return this;
    },
    /**
     Configure the Injector.
     */

    configure: function (configuration) {
        var newProviders;
        CDI.Logger.log('Configuring the injector.');
        newProviders = {};
        Ext.Object.each(configuration, function (identifier, config) {
            var provider;
            CDI.Logger.log("Configuring dependency provider for '" + identifier + "'.");
            if (Ext.isString(config)) {
                provider = Ext.create('CDI.ioc.DependencyProvider', {
                    identifier: identifier,
                    className: config
                });
            } else {
                provider = Ext.create('CDI.ioc.DependencyProvider', Ext.apply({
                    identifier: identifier
                }, config));
            }
            this.providers[identifier] = provider;
            newProviders[identifier] = provider;
        }, this);
        Ext.Object.each(newProviders, function (identifier, provider) {
            if (provider.getEager()) {
                CDI.Logger.log("Eagerly creating '" + (provider.getIdentifier()) + "'.");
                provider.resolve();
            }
        }, this);
    },
    /**
     Reset the Injector.
     */

    reset: function () {
        CDI.Logger.log('Resetting the injector.');
        this.providers = {};
    },
    /**
     Indicates whether the Injector can resolve a dependency by the specified identifier with the corresponding object instance or value.
     */

    canResolve: function (identifier) {
        var provider;
        provider = this.providers[identifier];
        return provider != null;
    },
    /**
     Resolve a dependency (by identifier) with the corresponding object instance or value.

     Optionally, the caller may specify the target instance (to be supplied to the dependency provider's factory function, if applicable).
     */

    resolve: function (identifier, targetInstance) {
        var provider;
        provider = this.providers[identifier];
        if (provider != null) {
            return provider.resolve(targetInstance);
        } else {
            Ext.Error.raise({
                msg: "Error while resolving value to inject: no dependency provider found for '" + identifier + "'."
            });
        }
    },
    /**
     Inject dependencies (by their identifiers) into the target object instance.
     */

    inject: function (identifiers, targetInstance, targetInstanceIsInitialized) {
        var injectConfig, name, originalInitConfigFunction, setterFunctionName, stackMessage, targetClass, value;
        if (targetInstanceIsInitialized == null) {
            targetInstanceIsInitialized = true;
        }
        targetClass = Ext.getClassName(targetInstance);
        if (Ext.Array.contains(this.injectionStack, targetClass)) {
            stackMessage = this.injectionStack.join(" -> ");
            this.injectionStack = [];
            Ext.Error.raise({
                msg: "Error resolving dependencies for '" + targetClass + "'. A circular dependency exists in its injections: " + stackMessage + " -> *" + targetClass + "*"
            });
            return null;
        }
        this.injectionStack.push(targetClass);
        injectConfig = {};
        if (Ext.isString(identifiers)) {
            identifiers = [identifiers];
        }
        Ext.Object.each(identifiers, function (key, value) {
            var identifier, resolvedValue, targetProperty;
            targetProperty = Ext.isArray(identifiers) ? value : key;
            identifier = value;
            resolvedValue = this.resolve(identifier, targetInstance);
            if (targetProperty in targetInstance.config) {
                CDI.Logger.log("Injecting '" + identifier + "' into '" + targetProperty + "' config.");
                injectConfig[targetProperty] = resolvedValue;
            } else {
                CDI.Logger.log("Injecting '" + identifier + "' into '" + targetProperty + "' property.");
                targetInstance[targetProperty] = resolvedValue;
            }
        }, this);
        this.injectionStack = [];
        if (targetInstanceIsInitialized) {
            for (name in injectConfig) {
                value = injectConfig[name];
                setterFunctionName = 'set' + Ext.String.capitalize(name);
                targetInstance[setterFunctionName].call(targetInstance, value);
            }
        } else {
            if ((Ext.getVersion('extjs') != null) && targetInstance instanceof Ext.ClassManager.get('Ext.Component')) {
                targetInstance.injectConfig = injectConfig;
            } else if (Ext.isFunction(targetInstance.initConfig)) {
                originalInitConfigFunction = targetInstance.initConfig;
                targetInstance.initConfig = function (config) {
                    var result;
                    result = originalInitConfigFunction.call(this, Ext.Object.merge({}, config || {}, injectConfig));
                    return result;
                };
            }
        }
        return targetInstance;
    }
}, function () {
    if (Ext.getVersion('extjs') != null) {
        Ext.define('CDI.InjectableComponent', {
            override: 'Ext.Component',
            constructor: function (config) {
                config = Ext.Object.merge({}, config || {}, this.injectConfig || {});
                delete this.injectConfig;
                return this.callParent([config]);
            }
        });
    }
});