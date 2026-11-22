// Illustrator Smart Spacing Manager Pro
// UI/UIHelpers.jsx — ScriptUI widget helpers (ES3)
var SSM = SSM || {};
SSM.UIHelpers = (function () {
    function addGroup(parent, type, options) {
        options = options || {};
        var g = parent.add(type || "group");
        if (options.alignment) { g.alignment = options.alignment; }
        if (options.alignChildren) { g.alignChildren = options.alignChildren; }
        if (options.orientation) { g.orientation = options.orientation; }
        if (options.spacing !== undefined) { g.spacing = options.spacing; }
        if (options.margins) { g.margins = options.margins; }
        return g;
    }
    function addStaticText(parent, text, options) {
        options = options || {};
        var t = parent.add("statictext", undefined, text);
        if (options.width) { t.preferredSize.width = options.width; }
        if (options.height) { t.preferredSize.height = options.height; }
        if (options.alignment) { t.alignment = options.alignment; }
        if (options.multiline) { t.multiline = true; }
        return t;
    }
    function addButton(parent, text, options) {
        options = options || {};
        var b = parent.add("button", undefined, text);
        if (options.width) { b.preferredSize.width = options.width; }
        if (options.height) { b.preferredSize.height = options.height; }
        if (options.enabled !== undefined) { b.enabled = options.enabled; }
        return b;
    }
    function addCheckbox(parent, text, value, options) {
        options = options || {};
        var c = parent.add("checkbox", undefined, text);
        c.value = value !== undefined ? value : false;
        if (options.enabled !== undefined) { c.enabled = options.enabled; }
        return c;
    }
    function addDropdown(parent, items, selectedIndex, options) {
        options = options || {};
        var d = parent.add("dropdownlist", undefined, items);
        d.selection = selectedIndex !== undefined ? selectedIndex : 0;
        if (options.width) { d.preferredSize.width = options.width; }
        if (options.enabled !== undefined) { d.enabled = options.enabled; }
        return d;
    }
    function addEditText(parent, text, options) {
        options = options || {};
        var e = parent.add("edittext", undefined, text);
        if (options.width) { e.preferredSize.width = options.width; }
        if (options.height) { e.preferredSize.height = options.height; }
        if (options.enabled !== undefined) { e.enabled = options.enabled; }
        return e;
    }
    function addListBox(parent, items, options) {
        options = options || {};
        var l = parent.add("listbox", undefined, items);
        if (options.width) { l.preferredSize.width = options.width; }
        if (options.height) { l.preferredSize.height = options.height; }
        if (options.enabled !== undefined) { l.enabled = options.enabled; }
        return l;
    }
    function addRadioButton(parent, text, value, options) {
        options = options || {};
        var r = parent.add("radiobutton", undefined, text);
        r.value = value !== undefined ? value : false;
        if (options.enabled !== undefined) { r.enabled = options.enabled; }
        return r;
    }
    function addPanel(parent, title, options) {
        options = options || {};
        var p = parent.add("panel", undefined, title);
        if (options.alignment) { p.alignment = options.alignment; }
        if (options.margins) { p.margins = options.margins; }
        if (options.spacing !== undefined) { p.spacing = options.spacing; }
        return p;
    }
    function addTabbedPanel(parent, options) {
        options = options || {};
        var t = parent.add("tabbedpanel", undefined, undefined);
        if (options.alignment) { t.alignment = options.alignment; }
        return t;
    }
    function addTab(tabbedPanel, title, options) {
        options = options || {};
        var tab = tabbedPanel.add("tab", undefined, title);
        if (options.alignment) { tab.alignment = options.alignment; }
        return tab;
    }
    function setEnabled(widget, enabled) {
        if (widget && typeof widget.enabled !== "undefined") { widget.enabled = enabled; }
    }
    function setText(widget, text) {
        if (widget && typeof widget.text !== "undefined") { widget.text = text; }
    }
    return {
        addGroup: addGroup,
        addStaticText: addStaticText,
        addButton: addButton,
        addCheckbox: addCheckbox,
        addDropdown: addDropdown,
        addEditText: addEditText,
        addListBox: addListBox,
        addRadioButton: addRadioButton,
        addPanel: addPanel,
        addTabbedPanel: addTabbedPanel,
        addTab: addTab,
        setEnabled: setEnabled,
        setText: setText
    };
})();
