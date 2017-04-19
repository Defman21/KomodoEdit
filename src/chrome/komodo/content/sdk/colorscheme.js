(function() {
    
    const {Cc, Ci}  = require("chrome");
    
    const schemeService = Cc['@activestate.com/koScintillaSchemeService;1'].getService();
    const koDirSvc = Cc["@activestate.com/koDirs;1"].getService();
    const koFile = require("ko/file");
    const prefs = require("ko/prefs");
    
    const interfaceMapping = {
        'font': ['window', 'face'],
        'size': ['window', 'size'],
        'background': ['window', 'back'],
        'foreground': ['window', 'fore'],
        'contrast': ['contrast', 'back'],
        'border': ['border', 'back'],
        'selected': ['selected', 'back'],
        'selected-foreground': ['selected', 'fore'],
        'button': ['button', 'back'],
        'button-foreground': ['button', 'fore'],
        'icons': ['icons', 'fore'],
        'textbox': ['textbox', 'back'],
        'textbox-foreground': ['textbox', 'fore'],
        'caption': ['caption', 'fore'],
        'special': ['special', 'back'],
        'secondary-special': ['secondary special', 'fore'],
        'foreground-special': ['special', 'fore'],
        'contrast-special': ['special contrast', 'back'],
        'textbox-special': ['textbox special', 'back'],
        'textbox-foreground-special': ['textbox special', 'fore'],
        'icons-special': ['icons special', 'fore'],
        'scc-ok': ['scc ok', 'fore'],
        'scc-new': ['scc new', 'fore'],
        'scc-modified': ['scc modified', 'fore'],
        'scc-deleted': ['scc deleted', 'fore'],
        'scc-sync': ['scc sync', 'fore'],
        'scc-conflict': ['scc conflict', 'fore'],
        'state-error': ['state error', 'back'],
        'state-warning': ['state warning', 'back'],
        'state-info': ['state info', 'back'],
        'state-ok': ['state ok', 'back'],
        'state-foreground': ['state foreground', 'fore'],
        'window-button-close': ['window button close', 'back'],
        'window-button-maximize': ['window button maximize', 'back'],
        'window-button-minimize': ['window button minimize', 'back']
    }
        
    const interfaceMappingWidgets = {
        'widget': ['widget', 'back'],
        'foreground-widget': ['widget', 'fore'],
        'contrast-widget': ['contrast widget', 'back'],
        'special-widget': ['special widget', 'back'],
        'special-foreground-widget': ['special widget', 'fore'],
        'textbox-widget': ['textbox widget', 'back'],
        'textbox-foreground-widget': ['textbox widget', 'fore'],
        'icons-widget': ['icons widget', 'fore'],
    }
    
    var currentScheme = {
        'editor-scheme': null,
        'interface-scheme': null,
        'widget-scheme': null
    };
    
    var colorCache = {};
    
    var init = () =>
    {
        var observer = {observe: () =>
        {
            currentScheme = {
                'editor-scheme': null,
                'interface-scheme': null,
                'widget-scheme': null
            };
            colorCache = {};
        }};
        
        prefs.prefObserverService.addObserverForTopics(
            observer, [3], ['editor-scheme', 'interface-scheme', 'widget-scheme'], false
        );
    };
    
    this.get = (name) =>
    {
        if ( ! currentScheme[name])
            currentScheme[name] = schemeService.getScheme(prefs.getStringPref(name));
        
        return currentScheme[name];
    };
    
    this.editor = this.get.bind(null, "editor-scheme");
    this.interface = this.get.bind(null, "interface-scheme");
    this.widget = this.get.bind(null, "widget-scheme");
    
    this.getInterfaceColor = (property, schemeName = "interface") =>
    {
        if ( ! (schemeName in colorCache))
            colorCache[schemeName] = {};
            
        if ( ! (property in colorCache[schemeName]))
        {
            var scheme = this[schemeName]();
            var mapping = interfaceMapping[property];
            colorCache[schemeName][property] = scheme.getInterfaceStyle(mapping[0], mapping[1]);
        }
            
        return colorCache[schemeName][property];
    };
    
    this.applyEditor = (name) =>
    {
        prefs.setString("editor-scheme", name);
        var observerSvc = Cc["@mozilla.org/observer-service;1"].
                            getService(Ci.nsIObserverService);
        observerSvc.notifyObservers(null, 'scheme-changed', name);
    }
    
    this.applyInterface = (name, noDelay = false) =>
    {
        prefs.setString("interface-scheme", name);
        
        var timers = require("sdk/timers");
        timers.clearTimeout(_applyInterface.timer);
        
        if (noDelay)
            _applyInterface();
        else
            _applyInterface.timer = timers.setTimeout(_applyInterface, 50);
    }
    
    this.applyWidgets = (name, noDelay = false) =>
    {
        prefs.setString("widget-scheme", name);
        
        var timers = require("sdk/timers");
        timers.clearTimeout(_applyInterface.timer);
        
        if (noDelay)
            _applyInterface();
        else
            _applyInterface.timer = timers.setTimeout(_applyInterface, 50);
    }
    
    var _applyInterface = () =>
    {
        var style = "";
        
        var name = prefs.getString("interface-scheme");
        var scheme = schemeService.getScheme(name);
        
        // Write interfaceChrome.less
        path = koFile.join(koDirSvc.userDataDir, "interfaceChrome.less");
        fp = koFile.open(path, "w");
        style = scheme.getInterfaceStyle("css", "code") || "";
        fp.write(style);
        fp.close();
        
        var defer = prefs.getBoolean("interface-font-defer");
        var font = prefs.getString("interface-font");
        var size = prefs.getString("interface-font-size");
        
        // Write colors.less
        style = "";
        var path = koFile.join(koDirSvc.userDataDir, "colors.less");
        var fp = koFile.open(path, "w");
        var _apply = (scheme, mapping) =>
        {
            for (let k in mapping)
            {
                // Defer font to global pref
                if ( ! defer && k == "font")
                {
                    style += `@${k}: ${font};` + "\n";
                    continue;
                }
                
                // Defer font size to global pref
                if ( ! defer && k == "size")
                {
                    style += `@${k}: ${size};` + "\n";
                    continue;
                }
                
                let v = mapping[k];
                let value = scheme.getInterfaceStyle(v[0], v[1]);
                
                if (value && value.length)
                    style += `@${k}: ${value};` + "\n";
            }
        };
        
        _apply(scheme, interfaceMapping);
        
        scheme = schemeService.getScheme(prefs.getString('widget-scheme'));
        _apply(scheme, interfaceMappingWidgets);
        
        fp.write(style);
        fp.close();
        
        require("ko/less").reload(true);
        
        var observerSvc = Cc["@mozilla.org/observer-service;1"].
                            getService(Ci.nsIObserverService);
        observerSvc.notifyObservers(null, 'interface-scheme-changed', name);
    }
    _applyInterface.timer = null;
    
    init();
    
}).apply(module.exports);