if (!window.multigraph) {
    window.multigraph = {};
}

if (!window.multigraph.Plot) {
    window.multigraph.Plot = {};
}

(function (ns) {
    "use strict";

    var Datatips,
        DatatipsVariable;

    if (ns.Plot.Datatips && ns.Plot.Datatips.Variable) {
        DatatipsVariable = ns.Plot.Datatips.Variable;
    }

    Datatips = new ns.ModelTool.Model( 'Datatips', function () {
        this.hasMany("variables").which.validatesWith(function (variable) {
            return variable instanceof ns.Plot.Datatips.Variable;
        });
        this.hasA("format").which.validatesWith(function (format) {
            return typeof(format) === 'string';
        });
        this.hasA("bgcolor").which.validatesWith(function (bgcolor) {
            return ns.utilityFunctions.validateColor(bgcolor);
        });
        this.hasA("bgalpha").which.validatesWith(function (bgalpha) {
            return typeof(bgalpha) === 'string';
        });
        this.hasA("border").which.validatesWith(function (border) {
            return ns.utilityFunctions.validateInteger(border);
        });
        this.hasA("bordercolor").which.validatesWith(function (bordercolor) {
            return ns.utilityFunctions.validateColor(bordercolor);
        });
        this.hasA("pad").which.validatesWith(function (pad) {
            return ns.utilityFunctions.validateInteger(pad);
        });

    });

    ns.Plot.Datatips = Datatips;

    if (DatatipsVariable) {
        ns.Plot.Datatips.Variable = DatatipsVariable;
    }

}(window.multigraph));