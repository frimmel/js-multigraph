window.multigraph.util.namespace("window.multigraph.core", function (ns) {
    "use strict";

    var utilityFunctions = window.multigraph.utilityFunctions,
        defaultValues    = utilityFunctions.getDefaultValuesFromXSD(),
        attributes       = utilityFunctions.getKeys(defaultValues.plot);

    ns.ConstantPlot = new window.jermaine.Model("ConstantPlot", function () {
        this.isA(ns.Plot);
        this.hasA("constantValue").which.validatesWith(ns.DataValue.isInstance);

        this.isBuiltWith("constantValue");

        utilityFunctions.insertDefaults(this, defaultValues.plot, attributes);

        this.respondsTo("render", function (graph, graphicsContext) {
            // graphicsContext is an optional argument passed to ConstantPlot.render() by the
            // graphics driver, and used by that driver's implementation of Renderer.begin().
            // It can be any object used by the driver -- usually some kind of graphics
            // context object.  It can also be omitted if a driver does not need it.

            var haxis = this.horizontalaxis(),
                renderer = this.renderer(),
                constantValue = this.constantValue();

            if (!haxis.hasDataMin() || !haxis.hasDataMax()) {
                return;
            }

            renderer.setUpMissing(); //TODO: this is awkward -- figure out a better way!
            renderer.begin(graphicsContext);
            renderer.dataPoint([ haxis.dataMin(), constantValue ]);
            renderer.dataPoint([ haxis.dataMax(), constantValue ]);
            renderer.end();

        });

    });

});
