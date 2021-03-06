/*global describe, it, beforeEach, expect, xit, jasmine, waitsFor, runs */
/*jshint  laxbreak:true */

describe("Data parsing", function () {
    "use strict";

    var Data = window.multigraph.core.Data,
        ArrayData = window.multigraph.core.ArrayData,
        PeriodicArrayData = window.multigraph.core.PeriodicArrayData,
        CSVData = window.multigraph.core.CSVData,
        DataVariable = window.multigraph.core.DataVariable,
        NumberValue = window.multigraph.core.NumberValue,
        DataValue = window.multigraph.core.DataValue,
        DatetimeValue = window.multigraph.core.DatetimeValue,
        xmlString,
        $xml,
        data;

    beforeEach(function () {
        window.multigraph.parser.mixin.apply(window.multigraph, "parseXML");
    });

    it("Data model should have a parseXML method", function () {
        expect(typeof(Data.parseXML)).toBe("function");
    });

    describe("ArrayData -- <data> with <values> section", function () {

        var variable1IdString = "x",
            variable1ColumnString = "0",
            variable1TypeString = "number",
            variable2IdString = "y",
            variable2ColumnString = "1",
            variable2TypeString = "number",
            valuesString = ""
                + "3,4\n"
                + "5,6";

        beforeEach(function () {
            xmlString = ''
                + '<data>'
                +   '<variables>'
                +     '<variable'
                +         ' id="' + variable1IdString + '"'
                +         ' column="' + variable1ColumnString + '"'
                +         ' type="' + variable1TypeString + '"'
                +         '/>'
                +     '<variable'
                +         ' id="' + variable2IdString + '"'
                +         ' column="' + variable2ColumnString + '"'
                +         ' type="' + variable2TypeString + '"'
                +         '/>'
                +   '</variables>'
                +   '<values>'
                +     valuesString
                +   '</values>'
                + '</data>';
            $xml = window.multigraph.parser.stringToJQueryXMLObj(xmlString);
            data = Data.parseXML($xml);
        });

        it("parser should return an ArrayData instance", function () {
            expect(data).not.toBeUndefined();
            expect(data instanceof Data).toBe(true);
            expect(data instanceof ArrayData).toBe(true);
        });

        it("data columns should be correctly set up", function () {
            expect(data.columns().size()).toEqual(2);
            expect(data.columns().at(0) instanceof DataVariable).toBe(true);
            expect(data.columns().at(0).id()).toEqual(variable1IdString);
            expect(data.columns().at(0).type()).toEqual(DataValue.parseType(variable1TypeString));
            expect(data.columns().at(1) instanceof DataVariable).toBe(true);
            expect(data.columns().at(1).id()).toEqual(variable2IdString);
            expect(data.columns().at(1).type()).toEqual(DataValue.parseType(variable2TypeString));
        });

        it("stringArray should be correctly set up", function () {
            expect(data.stringArray()).not.toBeUndefined();
            expect(data.stringArray().length).toEqual(valuesString.match(/\n/g).length + 1);
            expect(data.stringArray().join("\n")).toEqual(valuesString);
            
        });

        // TODO : move this spec onto core or normalizer
        xit("getIterator() method should return an interator that behaves correctly", function () {
            var iter = data.getIterator(["x","y"], new NumberValue(3), new NumberValue(5));
            expect(iter).not.toBeUndefined();
            expect(iter.hasNext()).toBe(true);
            var values = iter.next();
            expect(values).not.toBeUndefined();
            expect(values.length).toEqual(2);
            expect(values[0].getRealValue()).toEqual(3);
            expect(values[1].getRealValue()).toEqual(4);
            expect(iter.hasNext()).toBe(true);
            values = iter.next();
            expect(values).not.toBeUndefined();
            expect(values.length).toEqual(2);
            expect(values[0].getRealValue()).toEqual(5);
            expect(values[1].getRealValue()).toEqual(6);
            expect(iter.hasNext()).toBe(false);
        });

    });

    describe("ArrayData with adpater attribute", function () {
        // define an adapter
        window.multigraph.adapters['drought'] = {
            textToStringArray : function (dataVariables, text) {
                var stringArray = [],
                    stringValuesThisRow,
                    lines = text.split("\n"),
                    i, j, year;
                for (i=0; i<lines.length; ++i) {
                    stringValuesThisRow = lines[i].split(",");
                    year = stringValuesThisRow[0];
                    for (j=1; j<stringValuesThisRow.length; ++j) {
                        stringArray.push([ sprintf("%s%02d", year, j), stringValuesThisRow[j] ]);
                    }
                }
                return stringArray;
            }
        };

        beforeEach(function() {
            xmlString = ''
                + '<data adapter="drought">'
                +   '<variables>'
                +     '<variable id="time" column="0" type="datetime"/>'
                +     '<variable id="pdsi" column="1" type="number"/>'
                +   '</variables>'
                +   '<values>'
                +     "1900,-3.12,-2.40,-2.60,-2.14,-2.38,2.33,-0.16,-0.73,0.01,0.36,0.77,-0.58\n"
                +     "1901,-0.70,-1.28,-1.56,-0.89,-0.72,-0.92,-1.87,0.99,1.19,-0.52,-1.27,0.51\n"
                +     "1902,0.47,0.23,0.87,-0.38,-0.98,-1.15,-2.30,-2.58,0.32,0.15,0.09,0.37\n"
                +     "1903,-0.49,1.21,1.05,1.30,1.36,1.68,-0.30,-0.48,-1.28,-1.71,-1.73,-1.90\n"
                +   '</values>'
                + '</data>';
            $xml = window.multigraph.parser.stringToJQueryXMLObj(xmlString);
            data = Data.parseXML($xml);
            data.normalize();
        });
        
        it("parser should return an ArrayData instance", function () {
            expect(data).not.toBeUndefined();
            expect(data instanceof Data).toBe(true);
            expect(data instanceof ArrayData).toBe(true);
        });
        
        it("data columns should be correctly set up", function () {
            expect(data.columns().size()).toEqual(2);
            expect(data.columns().at(0) instanceof DataVariable).toBe(true);
            expect(data.columns().at(0).id()).toEqual('time');
            expect(data.columns().at(0).type()).toEqual(DataValue.parseType('datetime'));
            expect(data.columns().at(1) instanceof DataVariable).toBe(true);
            expect(data.columns().at(1).id()).toEqual('pdsi');
            expect(data.columns().at(1).type()).toEqual(DataValue.parseType('number'));
        });

        it("getIterator() method should return an interator that behaves correctly", function () {
            var iter = data.getIterator(["time","pdsi"], DatetimeValue.parse('190001'), DatetimeValue.parse('190112'));
            expect(iter).not.toBeUndefined();
            expect(iter.hasNext()).toBe(true);
            var values = iter.next();
            expect(values).not.toBeUndefined();
            expect(values.length).toEqual(2);
            expect(values[0].getRealValue()).toEqual(DatetimeValue.parse('190001').getRealValue());
            expect(values[1].getRealValue()).toEqual(-3.12);
            expect(iter.hasNext()).toBe(true);
            values = iter.next();
            expect(values).not.toBeUndefined();
            expect(values.length).toEqual(2);
            expect(values[0].getRealValue()).toEqual(DatetimeValue.parse('190002').getRealValue());
            expect(values[1].getRealValue()).toEqual(-2.40);


            // skip over the next 22 values --- the values for 190003 through 190111
            var j;
            for (j=0; j<22; ++j) {
                expect(iter.hasNext()).toBe(true);
                values = iter.next();
            }

            // check the last value -- the one for 190112
            expect(values).not.toBeUndefined();
            expect(values.length).toEqual(2);
            expect(values[0].getRealValue()).toEqual(DatetimeValue.parse('190112').getRealValue());
            expect(values[1].getRealValue()).toEqual(0.51);

            // iterator should now be done
            expect(iter.hasNext()).toBe(false);

        });

    });

     describe("PeriodicArrayData -- <data> with <repeat> and <values> section", function () {

        beforeEach(function () {
            xmlString = ''
                + '<data>'
                +   '<variables>'
                +     '<variable id="time" column="0" type="datetime"/>'
                +     '<variable id="temp" column="1" type="number"/>'
                +   '</variables>'
                +   '<repeat period="1Y"/>'
                +   '<values>'
                +     '2010-01-01,1'
                +     '2010-05-01,5'
                +     '2010-10-01,10'
                +   '</values>'
                + '</data>';
            $xml = window.multigraph.parser.stringToJQueryXMLObj(xmlString);
            data = Data.parseXML($xml);
        });

        it("parser should return an PeriodicArrayData instance", function () {
            expect(data).not.toBeUndefined();
            expect(data instanceof Data).toBe(true);
            expect(data instanceof ArrayData).toBe(true);
            expect(data instanceof PeriodicArrayData).toBe(true);
        });

        it("the period should be correct", function () {
            expect(data.period().getRealValue()).toEqual(31536000000);
        });

    });


    describe("CSVData -- <data> with <csv> section", function () {

        var variable1IdString = "x",
            variable1ColumnString = "0",
            variable1TypeString = "number",
            variable2IdString = "y",
            variable2ColumnString = "1",
            variable2TypeString = "number",
            locationString = "../spec/parser/fixtures/test1.csv";

        beforeEach(function (done) {
            xmlString = ''
                + '<data>'
                +   '<variables>'
                +     '<variable'
                +         ' id="' + variable1IdString + '"'
                +         ' column="' + variable1ColumnString + '"'
                +         ' type="' + variable1TypeString + '"'
                +         '/>'
                +     '<variable'
                +         ' id="' + variable2IdString + '"'
                +         ' column="' + variable2ColumnString + '"'
                +         ' type="' + variable2TypeString + '"'
                +         '/>'
                +   '</variables>'
                +   '<csv'
                +       ' location="' + locationString + '"'
                +       '/>'
                + '</data>';
            $xml = window.multigraph.parser.stringToJQueryXMLObj(xmlString);
            data = Data.parseXML($xml);
            data.addListener('dataReady', done);
        });

        it("parser should return a CSVData instance", function () {
            expect(data).not.toBeUndefined();
            expect(data instanceof Data).toBe(true);
            expect(data instanceof ArrayData).toBe(true);
            expect(data instanceof CSVData).toBe(true);
        });

        it("filename attribute should be correctly set", function () {
            expect(data.filename()).toEqual(locationString);
        });

        it("data columns should be correctly set up", function () {
            expect(data.columns().size()).toEqual(2);
            expect(data.columns().at(0) instanceof DataVariable).toBe(true);
            expect(data.columns().at(0).id()).toEqual(variable1IdString);
            expect(data.columns().at(0).type()).toEqual(DataValue.parseType(variable1TypeString));
            expect(data.columns().at(1) instanceof DataVariable).toBe(true);
            expect(data.columns().at(1).id()).toEqual(variable2IdString);
            expect(data.columns().at(1).type()).toEqual(DataValue.parseType(variable2TypeString));
        });

        it("getIterator() method should return an interator that behaves correctly", function () {
            var iter = data.getIterator(["x","y"], new NumberValue(10), new NumberValue(12));
            expect(iter).not.toBeUndefined();
            expect(iter.hasNext()).toBe(true);
            var values = iter.next();
            expect(values).not.toBeUndefined();
            expect(values.length).toEqual(2);
            expect(values[0].getRealValue()).toEqual(10);
            expect(values[1].getRealValue()).toEqual(11);
            expect(iter.hasNext()).toBe(true);
            values = iter.next();
            expect(values).not.toBeUndefined();
            expect(values.length).toEqual(2);
            expect(values[0].getRealValue()).toEqual(12);
            expect(values[1].getRealValue()).toEqual(13);
            expect(iter.hasNext()).toBe(false);
        });

    });

});
