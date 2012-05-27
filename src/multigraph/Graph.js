if(!window.multigraph) {
    window.multigraph = {};
}

(function (ns) {
    "use strict";

    var Graph = new ns.ModelTool.Model( 'Graph', function () {

        this.hasA("window").which.validatesWith(function (window) {
                return window instanceof window.multigraph.Window;
        });
        this.hasMany("axes").which.validatesWith(function (axis) {
                return axis instanceof window.multigraph.Axis;
        });
        this.hasMany("plots").which.validatesWith(function (plot) {
                return plot instanceof window.multigraph.Plot;
        });

    });


    Graph.prototype.axisById = function(id) {
      // return a pointer to the axis for this graph that has the given id, if any
        var axes = this.axes();
        for (var i=0; i<axes.size(); ++i) {
            if (axes.get(i).id() === id) {
                return axes.get(i);
            }
        }
        return null;
    };


    ns.Graph = Graph;


}(window.multigraph));
