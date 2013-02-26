window.multigraph.util.namespace("window.multigraph.graphics.raphael", function (ns) {
    "use strict";

    ns.mixin.add(function (ns) {

        var Axis = ns.Axis;

        Axis.hasAn("axisElem");
        Axis.hasAn("gridElem");
        Axis.hasAn("tickmarkElem");
        Axis.hasMany("labelElems");

        var computeGridPath = function (axis, graph) {
            var path,
                currentLabeler = axis.currentLabeler(),
                perpOffset     = axis.perpOffset(),
                orientation    = axis.orientation(),
                plotBox        = graph.plotBox(),
                a, v;

            while (currentLabeler.hasNext()) {
                v = currentLabeler.next();
                a = axis.dataValueToAxisValue(v);
                if (orientation === Axis.HORIZONTAL) {
                    path += "M" + a + "," + perpOffset +
                        "L" + a + "," + (plotBox.height() - perpOffset);
                } else {
                    path += "M" + perpOffset + "," + a +
                        "L" + (plotBox.width() - perpOffset) + "," + a;
                }
            }
            return path;
        };

        var computeAxisPath = function (axis) {
            // NOTE: axes are drawn relative to the graph's plot area (plotBox); the coordinates
            //   below are relative to the coordinate system of that box.
            if (axis.orientation() === ns.Axis.HORIZONTAL) {
                return "M " + axis.parallelOffset() + ", " + axis.perpOffset() +
                    " l " + axis.pixelLength() + ", 0";
            } else {
                return "M " + axis.perpOffset() + ", " + axis.parallelOffset() +
                    " l 0, " + axis.pixelLength();
            }
        };

        var computeTickmarkPath = function (axis, value) {
            var perpOffset = axis.perpOffset();

            if (axis.orientation() === ns.Axis.HORIZONTAL) {
                return "M" + value + "," + (perpOffset + axis.tickmax()) +
                    "L" + value + "," + (perpOffset + axis.tickmin());
            } else {
                return "M" + (perpOffset + axis.tickmin()) + "," + value +
                    "L" + (perpOffset + axis.tickmax()) + "," + value;
            }
        };

        Axis.respondsTo("renderGrid", function (graph, paper, set) {
            var text = paper.text(-8000, -8000, "foo");

            this.prepareRender(text);

            // draw the grid lines
            if (this.hasDataMin() && this.hasDataMax()) { // skip if we don't yet have data values
                if (this.grid().visible()) { // skip if grid lines aren't turned on
                    if (this.labelers().size() > 0 && this.currentLabelDensity() <= 1.5) {
                        this.currentLabeler().prepare(this.dataMin(), this.dataMax());
                        var grid = paper.path(computeGridPath(this, graph))
                                .attr({
                                    "stroke-width" : 1,
                                    "stroke"       : this.grid().color().getHexString("#")
                                });
                        
                        this.gridElem(grid);
                        set.push(grid);
                    }
                }
            }

            text.remove();
        });

        Axis.respondsTo("redrawGrid", function (graph, paper) {
            var text = paper.text(-8000, -8000, "foo");

            this.prepareRender(text);

            // redraw the grid lines
            if (this.hasDataMin() && this.hasDataMax()) { // skip if we don't yet have data values
                if (this.grid().visible()) { // skip if grid lines aren't turned on
                    if (this.labelers().size() > 0 && this.currentLabelDensity() <= 1.5) {
                        this.currentLabeler().prepare(this.dataMin(), this.dataMax());
                        this.gridElem().attr("path", computeGridPath(this, graph));
                    }
                }
            }

            text.remove();
        });

        Axis.respondsTo("render", function (graph, paper, set) {
            var text = paper.text(-8000, -8000, "foo"),
                tickmarkPath = "";

            //
            // Render the axis line
            //
            var axis = paper.path(computeAxisPath(this))
                           .attr("stroke", this.color().getHexString("#"));

            this.axisElem(axis);
            set.push(axis);

            //
            // Render the tick marks and labels
            //
            if (this.hasDataMin() && this.hasDataMax()) { // but skip if we don't yet have data values
                if (this.currentLabeler()) {
                    var v, a;
                    this.currentLabeler().prepare(this.dataMin(), this.dataMax());
                    while (this.currentLabeler().hasNext()) {
                        v = this.currentLabeler().next();
                        a = this.dataValueToAxisValue(v);
                        tickmarkPath += computeTickmarkPath(this, a);
                        this.currentLabeler().renderLabel({ "paper"    : paper,
                                                            "set"      : set,
                                                            "textElem" : text
                                                          }, v);
                    }
                    var tickmarks = paper.path(tickmarkPath)
                        .attr("stroke",
                              (this.tickcolor() !== undefined && this.tickcolor() !== null) ?
                                  this.tickcolor().getHexString('#') :
                                  "#000"
                             );

                    this.tickmarkElem(tickmarks);
                    set.push(tickmarks);
                }
            }

            //
            // Render the title
            //
            if (this.title()) {
                this.title().render(paper, set);
            }

            text.remove();
        });

        Axis.respondsTo("redraw", function (graph, paper) {
            var text = paper.text(-8000, -8000, "foo"),
                tickmarkPath = "";

            //
            // Render the axis line
            //
            this.axisElem().attr("path", computeAxisPath(this));

            //
            // Render the tick marks and labels
            //
            if (this.hasDataMin() && this.hasDataMax()) { // but skip if we don't yet have data values
                if (this.currentLabeler()) {
                    var v, a;
                    this.currentLabeler().prepare(this.dataMin(), this.dataMax());
                    while (this.currentLabeler().hasNext()) {
                        v = this.currentLabeler().next();
                        a = this.dataValueToAxisValue(v);
                        tickmarkPath += computeTickmarkPath(this, a);
/*
                        this.currentLabeler().renderLabel({ "paper"    : paper,
                                                            "set"      : set,
                                                            "textElem" : text
                                                          }, v);
*/
                    }
                    this.tickmarkElem().attr("path", tickmarkPath);
                }
            }

            //
            // Redraw the title
            //
            if (this.title()) {
                this.title().redraw();
            }
            text.remove();
        });

    });

});
