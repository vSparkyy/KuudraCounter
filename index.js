import PersistentVariableFactory from 'PersistentVariables/index';
import { Setting, SettingsObject } from 'SettingsManager/SettingsManager';

const FACTORY = new PersistentVariableFactory('KuudraCounter');

const count = FACTORY.create('count', 0);

var session = {
    count: 0,
}

// ----------------------------------
// Helper

function in_dim(dim) {
    if(!(Scoreboard.getTitle().trim() != "" && Scoreboard.getLines().length > 0)) {
        return;
    }

    for(var i = 0; i < Scoreboard.getLines().length; i++) {
        var line = Scoreboard.getLines()[i]
        if(ChatLib.removeFormatting(line.getName()).includes(dim)) {
            return true;
        }
    }
    return false;
}

// ----------------------------------
// Settings

var settings = new SettingsObject("KuudraCounter", [
    {
        name: "Display",
        settings: [
            new Setting.Toggle("Global Toggle", true),
            new Setting.Toggle("Session Toggle", true),
            new Setting.ColorPicker("Text Color", [153, 0, 255]),
            new Setting.Slider("Text Alpha", 255, 0, 255),
            new Setting.Slider("x", 0.005, 0, 1).setHidden(true),
            new Setting.Slider("y", 0.135, 0, 1).setHidden(true),
            new Setting.Button("Move Display", "click", function() {
                move_gui.open()
            }),
            new Setting.Button("Reset Stats", "click", function() {
                reset()
            }),
            new Setting.Button("Reset Display", "click", function() {
                settings.reset()
                settings.load()
            })
        ]
    }
]).setCommand("kuudracounter").setSize(200, 130)

Setting.register(settings)

// ----------------------------------
// Gui

var move_gui = new Gui()

move_gui.registerDraw(() => {
    let text = "Drag to move KuudraCounter"
    let scale = 4
    let color = Renderer.color(255, 55, 55)
    new Text(text, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(text)*scale / 2, Renderer.screen.getHeight() / 2 - 50).setColor(color).setScale(scale).draw()
})

register("dragged", function(dx, dy) {
    if (!move_gui.isOpen())
        return

    display.setRenderLoc(
        display.getRenderX() + dx,
        display.getRenderY() + dy
    )

    settings.getSettingObject("Display", "x").value = MathLib.map(
        display.getRenderX(),
        0, Renderer.screen.getWidth(),
        0, 1
    )

    settings.getSettingObject("Display", "y").value = MathLib.map(
        display.getRenderY(),
        0, Renderer.screen.getHeight(),
        0, 1
    )
    settings.save()
})

// ----------------------------------
// Display

var display = new Display()

display.setRenderLoc(
    Renderer.screen.getWidth() * settings.getSetting("Display", "x"),
    Renderer.screen.getHeight() * settings.getSetting("Display", "y")
)

function make_line(str, opt) {
    var show_session = settings.getSetting("Display", "Session Toggle");

    var setting_color = settings.getSetting("Display", "Text Color");
    var setting_alpha = settings.getSetting("Display", "Text Alpha");

    var color = Renderer.color(setting_color[0], setting_color[1], setting_color[2], setting_alpha);

    var opt_str = `(${opt})`
    var final_str = `${str} ${show_session ? opt_str : ''}`
    return new DisplayLine(final_str).setAlign('left').setTextColor(color).setShadow(true);
}

register('renderOverlay', () => {
    if (!settings.getSetting("Display", "Global Toggle")) {
        display.shouldRender = false;
        return;
    }

    display.shouldRender = true;

    display.setRenderLoc(
        Renderer.screen.getWidth() * settings.getSetting("Display", "x"),
        Renderer.screen.getHeight() * settings.getSetting("Display", "y")
    );

    display.clearLines()
    display.addLine(make_line(`Kuudra's killed: ${count.get()} | This session`, session.count));
    display.render()
})

// ----------------------------------
// Commands

register('command', () => {
    move_gui.open()
}).setName('kuudramove')

function reset() {
    count.set(0)
    session.count = 0
}

register('command', reset).setName('kuudrareset')

// ----------------------------------

register('chat', event => {
	count.set(count.get() + 1)
	session.count++;
    cancel(event);
    ChatLib.chat(`&r&r&r                       &r&6&lYou finished a run!  (${count.get()})&r`);
}).setCriteria('&r&r&r                               &r&6&lKUUDRA DOWN!&r')