//@ts-nocheck
sap.ui.define([
    "sap/ui/core/Control"
],

    /**
     * @param {typeof sap.ui.core.Control} Control
     */
    function (Control) {
        return Control.extend("logaligroup.Employees.controller.Signature", {

            metadata: {
                properties: {
                    "width": {
                        type: "sap.ui.core.CSSSize",
                        defaultvalue: "400px"
                    },
                    "height": {
                        type: "sap.ui.core.CSSSize",
                        defaultvalue: "100px"
                    },
                    "bgcolor": {
                        type: "sap.ui.core.CSSColor",
                        defaultvalue: "white"
                    }
                }
            },

            onInit: function () {

            },

            //renderer manager to draw signature box
            renderer: function (oRM, oControl) {
                oRM.write("<div");
                oRM.addStyle("width", oControl.getProperty("width"));
                oRM.addStyle("height", oControl.getProperty("height"));
                oRM.addStyle("background-color", oControl.getProperty("bgcolor"));
                oRM.addStyle("border", "1px solid black");
                oRM.writeStyles();
                oRM.write(">");

                oRM.write("<canvas width='" + oControl.getProperty("width") + "' " +
                    "height='" + oControl.getProperty("height") + "'");
                oRM.write("></canvas>");
                oRM.write("</div>");
            },

            //after load component
            onAfterRendering: function () {
                var canvas = document.querySelector("canvas");

                //to catch errors
                try {
                    //instance signature pad from standar library
                    this.signaturePad = new SignaturePad(canvas);
                    this.signaturePad.fill = false;

                    //activate listener for the event mousedown
                    canvas.addEventListener("mousedown", function () {
                        //set property value to true when stop mouse action
                        this.signaturePad.fill = true;
                    }.bind(this));

                } catch (error) {
                    console.error(error);
                }
            },

            //clear signature box content
            clear: function () {
                this.signaturePad.clear();
                this.signaturePad.fill = false;
            },

            //check if the box is not empty before call odata service
            isFill: function () {
                return this.signaturePad.fill;
            },

            //get binary of signature image (png)
            getSignature: function () {
                return this.signaturePad.toDataURL();
            },

            //get signature from backend to show in the front
            setSignature: function (signature) {
                this.signaturePad.fromDataURL(signature);
            }
        });
    }
);