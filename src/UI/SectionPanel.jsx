// Illustrator Smart Spacing Manager Pro
// UI/SectionPanel.jsx — Section Manager panel
var SSM = SSM || {};
SSM.UI.Section = (function () {
    var H = SSM.UIHelpers;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Section Manager", { margins: 12, spacing: 10 });
        H.addStaticText(panel, "Create and manage sections. Assign anchor and target objects per section.", { width: 300 });
        var top = H.addGroup(panel, "group", { alignChildren: "left", spacing: 8 });
        var edName = H.addEditText(top, "Section 1", { width: 140 });
        var ddType = H.addDropdown(top, ["heading", "content", "subheading", "illustration", "caption"], 0, { width: 120 });
        var btnCreate = H.addButton(top, "Create Section", { width: 120 });
        var list = H.addListBox(panel, [], { width: 320, height: 150 });
        var btnDel = H.addButton(panel, "Remove Selected Section", { width: 180 });
        var lbl = H.addStaticText(panel, "Sections: 0", { width: 150 });
        btnCreate.onClick = function () {
            var sm = SSM.SectionManager;
            var sec = sm.createSection(edName.text, ddType.selection ? ddType.selection.text : "content", null, null, "default");
            app.state.set("sections", sm.getAll());
            refreshList();
            app.actions.refreshDashboard();
        };
        btnDel.onClick = function () {
            var sel = list.selection;
            if (!sel) { return; }
            var sm = SSM.SectionManager;
            sm.removeSection(sel.text);
            app.state.set("sections", sm.getAll());
            refreshList();
            app.actions.refreshDashboard();
        };
        function refreshList() {
            var sm = SSM.SectionManager;
            var secs = sm.getAll();
            list.removeAll();
            for (var i = 0; i < secs.length; i++) { list.add("item", secs[i].name + " (" + secs[i].type + ")"); }
            lbl.text = "Sections: " + secs.length;
        }
        return { panel: panel, refreshList: refreshList };
    }
    return { build: build };
})();
