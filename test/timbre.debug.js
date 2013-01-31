var fs   = require("fs");
var path = require("path");

var SRC_DIR = path.normalize(__dirname + "/../src");

require.from = function(dirpath) {
    var list = fs.readdirSync(dirpath);
    list = list.filter(function(x) {
        return /.*\.js$/.test(x);
    });
    list.sort()

    for (var i = 0; i < list.length; i++) {
        var filepath = dirpath + "/" + list[i];
        require(filepath);
    }
};

require("../src/core.js");
require.from(SRC_DIR + "/modules");
require.from(SRC_DIR + "/objects");

function DummyPlayer(sys) {
    this.maxSamplerate     = 48000;
    this.defaultSamplerate = 44100;
    this.env = "node";

    var tid = 0;

    this.play = function() {
        if (tid) {
            clearInterval(tid);
        }
        
        tid = setInterval(function() {
            var n = sys.streamsize / sys.cellsize;
            while (n--) {
                sys.process();
            }
        }.bind(this), 5);
    };

    this.pause = function() {
        clearInterval(tid);
    };
}

timbre.bind(DummyPlayer);

function CellNode(_args) {
    timbre.Object.call(this, _args);
}
timbre.fn.extend(CellNode);
timbre.fn.register("cell", CellNode);

timbre.fn.register("cell.sin", function(_args) {
    var instance = new CellNode(_args);
    var cell = instance.cell;
    for (var i = 0; i < cell.length; i++) {
        cell[i] = Math.cos(2 * Math.PI * (i / cell.length));
    }
    return instance;
});

timbre.fn.register("cell.pulse", function(_args) {
    var instance = new CellNode(_args);
    var cell = instance.cell;
    for (var i = 0; i < cell.length; i++) {
        cell[i] = (i / cell.length) < 0.5 ? +1 : -1;
    }
    return instance;
});

timbre.fn.register("cell.tri", function(_args) {
    var instance = new CellNode(_args);
    var cell = instance.cell;
    for (var x, i = 0; i < cell.length; i++) {
        x = (i / cell.length) - 0.25;
        cell[(i + 16) % cell.length] = 1.0 - 4.0 * Math.abs(Math.round(x) - x);
    }
    return instance;
});

module.exports = timbre;
