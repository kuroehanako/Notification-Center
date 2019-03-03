const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Metadata = Extension.metadata;
const _ = Gettext.domain("notification-center").gettext;

function init()
{
	initTranslations()
}

function buildPrefsWidget() 
{
	let widget 	=  new NotificationCenterPrefs();
    	let switcher 	=  new Gtk.StackSwitcher({halign: Gtk.Align.CENTER, visible: true, stack: widget});
    	Mainloop.timeout_add(0, () => {	widget.get_toplevel().get_titlebar().custom_title = switcher;	return false; });
    	widget.show_all();

   	return widget;
}

const 	NotificationCenterPrefs = new GObject.Class({
    	Name: 		'NotificationCenterPrefs',
    	Extends: 	Gtk.Stack,
    
    	_init: function() 
	{
        	this.parent({ transition_type: 0, transition_duration: 500 });
        	this.add_titled(new Prefs1()		,'prefs',_('Preferences'));
       		this.add_titled(new AboutPage()	,'about'	,_('About'));
    	}
});

const 	Prefs1 = 	new GObject.Class({
    	Name: 		'Prefs1',

    	_init: function(params) 
	{
        	this.parent();
	
		settings	= new Gio.Settings({ 	settings_schema: Gio.SettingsSchemaSource.new_from_directory(Extension.path + "/schemas", 							Gio.SettingsSchemaSource.get_default(), false).lookup(Extension.metadata['settings-schema'], true) });
    		this.grid 	= new Gtk.Grid({ column_spacing: 20, halign: Gtk.Align.CENTER, margin: 20, row_spacing: 20 });
    		this.grid.set_border_width(20);

		this.prefSwitch(_('AutoHide notification indicator on panel')			,'autohide'	,0);
		this.prefSwitch(_('Show Dots or Counts till all notifications are cleared')	,'show-label'	,1);
		this.prefSwitch(_('Blink bell icon on new notifications ')			,'blink-icon'	,2);
		this.prefCombo(_('Show Do Not Disturb menu entry ')		,'dnd-position'	   ,3 ,['none','top','bottom']   ,[_("Don't Show"),_('On Top'),_('At Bottom')]);
		this.prefCombo(_('Notification Banner Position')		,'banner-pos'	   ,4 ,['left','center','right'] ,[_('Left'),_('Center'),_('Right')]);
		this.prefCombo(_('Notification Center indicator position')	,'indicator-pos'   ,5 ,['left','center','right'] ,[_('Left'),_('Center'),_('Right')]);
		this.prefCombo(_('When new notification arrives')		,'new-notification',6,['none','dot','count'] ,[_('Show Nothing'),_('Show Dot'),_('Show Count')]);

		return this.grid;
	},

	prefCombo: function(LABEL,KEY,pos,options,items)
	{
		let SettingLabel 	= new Gtk.Label({xalign: 1, label: LABEL,halign: Gtk.Align.START });
		let SettingCombo 	= new Gtk.ComboBoxText();
        	SettingCombo.append(options[0], 	items[0]);
        	SettingCombo.append(options[1], 	items[1]);
        	SettingCombo.append(options[2], 	items[2]);
            	SettingCombo.set_active(options.indexOf(settings.get_string(KEY)));
            	SettingCombo.connect('changed', Lang.bind (this, function(widget) {settings.set_string(KEY, options[widget.get_active()]);  }));
		this.grid.attach(SettingLabel,      0, pos, 1, 1);
		this.grid.attach(SettingCombo,      1, pos, 8, 1);
	},

	prefSwitch: function(LABEL,KEY,pos)
	{
		let SettingLabel 	= new Gtk.Label({ xalign: 1, label: LABEL,halign: Gtk.Align.START });
    		let SettingSwitch 	= new Gtk.Switch({hexpand: false,active: settings.get_boolean(KEY),halign:Gtk.Align.END});
    		SettingSwitch.connect("notify::active", function(button) {settings.set_boolean(KEY, button.active);});		
    		this.grid.attach(SettingLabel,      0, pos, 1, 1);
		this.grid.attach(SettingSwitch,     1, pos, 8, 1);
	},
});

const	AboutPage = 	new GObject.Class({
    	Name: 		'AboutPage',
    	Extends: 	Gtk.ScrolledWindow,

    	_init: function(params) 
	{
        	this.parent();
        
        	let vbox	= new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin: 30 });
        	let imageBox	= new Gtk.Box();
        	let image 	= new Gtk.Image({ file: Extension.dir.get_child('eicon.png').get_path(), pixel_size: 96 });
       	 	let textBox	= new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        	let text 	= new Gtk.Label({ wrap: true, justify: 2, use_markup: true,
                                  		  label: "<big><b>" + Metadata.name + "</b></big>" + "\n" +"<small>Version" + " " + Metadata.version +"</small>\n\n" +
                                         	  (Metadata.description) + "\n\n\n\n\n\n" +"<span size=\"small\">This program comes with ABSOLUTELY NO WARRANTY.\nSee the "+ 						  "<a href=\"https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\">GNU General Public License, version 2 or later</a>"+ 	 							  "for details.</span>"+ "\n" });
		imageBox.set_center_widget(image);
        	vbox.pack_start(imageBox, false, false, 0);
        	textBox.pack_start(text, false, false, 0);
        	vbox.pack_start(textBox, false, false, 0);
		this.add(vbox);
    	}  
});

function initTranslations()
{
    	let localeDir = Extension.dir.get_child("locale");
	Gettext.bindtextdomain("notification-center", localeDir.query_exists(null)?localeDir.get_path():Config.LOCALEDIR);
}