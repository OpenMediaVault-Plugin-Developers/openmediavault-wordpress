/**
 *
 * @license http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @copyright Copyright (c) 2013 OpenMediaVault Plugin Developers
 *
 * This file is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or any later version.
 *
 * This file is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this file. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/omv/WorkspaceManager.js")
// require("js/omv/workspace/form/Panel.js")
// require("js/omv/form/field/SharedFolderComboBox.js")

Ext.define("OMV.module.admin.service.wordpress.Settings", {
    extend : "OMV.workspace.form.Panel",

    plugins: [{
        ptype        : "linkedfields",
        correlations : [{
            name       : [
                "launch-blog-site"
            ],
            conditions : [{
                name  : "enable",
                value : true
            }],
            properties : "enabled"
        },{
            name       : [
                "installdb"
            ],
            conditions : [{
                name  : "enable",
                value : false
            }],
            properties : "!disabled"
        }]
    }],

    initComponent : function () {
        var me = this;

        me.on('load', function () {
            var checked = me.findField('enable').checked;
            var showtab = me.findField('showtab').checked;
            var parent = me.up('tabpanel');

            if (!parent)
                return;

            var blogPanel = parent.down('panel[title=' + _("blog") + ']');

            if (blogPanel) {
                checked ? blogPanel.enable() : blogPanel.disable();
                showtab ? blogPanel.tab.show() : blogPanel.tab.hide();
            }
        });

        me.callParent(arguments);
    },

    rpcService   : "Wordpress",
    rpcGetMethod : "getSettings",
    rpcSetMethod : "setSettings",

    getFormItems : function() {
        return [{
            xtype    : "fieldset",
            title    : _("General settings"),
            defaults : {
                labelSeparator:""
            },
            items    : [{
                xtype      : "checkbox",
                name       : "enable",
                fieldLabel : _("Enable"),
                checked    : false
            },{
                xtype      : "passwordfield",
                name       : "auth_key",
                fieldLabel : _("Auth Key"),
                allowBlank : false,
                minLength  : 8,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("Random key created at installation.  Must be at least 8 characters long.")
                }]
            },{
                xtype      : "passwordfield",
                name       : "secure_auth_key",
                fieldLabel : _("Secure Auth Key"),
                allowBlank : false,
                minLength  : 8,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("Random key created at installation.  Must be at least 8 characters long.")
                }]
            },{
                xtype      : "passwordfield",
                name       : "logged_in_key",
                fieldLabel : _("Logged In Key"),
                allowBlank : false,
                minLength  : 8,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("Random key created at installation.  Must be at least 8 characters long.")
                }]
            },{
                xtype      : "passwordfield",
                name       : "nonce_key",
                fieldLabel : _("Nonce Key"),
                allowBlank : false,
                minLength  : 8,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("Random key created at installation.  Must be at least 8 characters long.")
                }]
            },{
                xtype      : "passwordfield",
                name       : "auth_salt",
                fieldLabel : _("Auth salt"),
                allowBlank : false,
                minLength  : 8,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("Random salt created at installation.  Must be at least 8 characters long.")
                }]
            },{
                xtype      : "passwordfield",
                name       : "secure_auth_salt",
                fieldLabel : _("Secure Auth salt"),
                allowBlank : false,
                minLength  : 8,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("Random salt created at installation.  Must be at least 8 characters long.")
                }]
            },{
                xtype      : "passwordfield",
                name       : "logged_in_salt",
                fieldLabel : _("Logged In salt"),
                allowBlank : false,
                minLength  : 8,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("Random salt created at installation.  Must be at least 8 characters long.")
                }]
            },{
                xtype      : "passwordfield",
                name       : "nonce_salt",
                fieldLabel : _("Nonce salt"),
                allowBlank : false,
                minLength  : 8,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("Random salt created at installation.  Must be at least 8 characters long.")
                }]
            }]
        },{
            xtype    : "fieldset",
            title    : _("Database Settings"),
            defaults : {
                labelSeparator : ""
            },
            items    : [{
                xtype      : "textfield",
                name       : "db_host",
                fieldLabel : _("Hostname"),
                allowBlank : false
            },{
                xtype      : "textfield",
                name       : "db_name",
                fieldLabel : _("Database Name"),
                allowBlank : false
            },{
                xtype      : "textfield",
                name       : "db_user",
                fieldLabel : _("Username"),
                allowBlank : false
            },{
                xtype      : "passwordfield",
                name       : "db_pass",
                fieldLabel : _("Password"),
                allowBlank : false
            },{
                xtype      : "passwordfield",
                name       : "root_pass",
                fieldLabel : _("MySQL root Password"),
                allowBlank : true,
                plugins    : [{
                    ptype : "fieldinfo",
                    text  : _("Used only for installing Wordpress database and will not be saved.")
                }]
            },{
                border : false,
                html   : "<br />"
            },{
                xtype   : "button",
                name    : "installdb",
                text    : _("Install DB"),
                scope   : this,
                handler : function() {
                    var me = this;
                    OMV.MessageBox.show({
                        title   : _("Confirmation"),
                        msg     : _("Are you sure you want to install the Wordpress database?"),
                        buttons : Ext.Msg.YESNO,
                        fn      : function(answer) {
                            if (answer !== "yes")
                               return;

                            OMV.MessageBox.wait(null, _("Installing Wordpress database"));
                            OMV.Rpc.request({
                                scope   : me,
                                rpcData : {
                                    service : "Wordpress",
                                    method  : "doInstallDB",
                                    params  : {
                                        db_host   : me.getForm().findField("db_host").getValue(),
                                        db_name   : me.getForm().findField("db_name").getValue(),
                                        db_user   : me.getForm().findField("db_user").getValue(),
                                        db_pass   : me.getForm().findField("db_pass").getValue(),
                                        root_pass : me.getForm().findField("root_pass").getValue()
                                    }
                                },
                                success : function(id, success, response) {
                                    me.doReload();
                                    OMV.MessageBox.hide();
                                }
                            });
                        },
                        scope : me,
                        icon  : Ext.Msg.QUESTION
                    });
                }
            },{
                border : false,
                html   : "<br />"
            }]
        },{
            xtype    : "fieldset",
            title    : _("Blog site"),
            defaults : {
                labelSeparator : ""
            },
            items : [{
                xtype      : "checkbox",
                name       : "showtab",
                fieldLabel : _("Enable"),
                boxLabel   : _("Show tab containing blog frame."),
                checked    : false
            },{
                xtype      : "button",
                name       : "launch-blog-site",
                text       : _("Launch blog site"),
                disabled   : true,
                handler    : function() {
                    window.open("/wordpress/");
                }
            },{
                border: false,
                html: "<br />"
            }]
        }];
    }
});

OMV.WorkspaceManager.registerPanel({
    id: "settings",
    path: "/service/wordpress",
    text: _("Settings"),
    position: 10,
    className: "OMV.module.admin.service.wordpress.Settings"
});
