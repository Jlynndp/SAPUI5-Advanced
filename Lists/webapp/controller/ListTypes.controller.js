//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        function onInit() {
            var oJSONModel = new sap.ui.model.json.JSONModel();
            var oView = this.getView();

            //load model from file
            oJSONModel.loadData("./localService/mockdata/ListData.json");
            oView.setModel(oJSONModel);

            //show loaded model
            console.log(JSON.stringify(oJSONModel.getData()));
        };

        function getGroupHeader(oGroup) {
            var groupHeaderListItem = new sap.m.GroupHeaderListItem({
                title : oGroup.key,
                upperCase : true
            });

            return groupHeaderListItem;
        };

        function onShowSelectedRow(){
            //get element
            var standardList = this.getView().byId("standardList");

            //get selected items
            var selectedItems = standardList.getSelectedItems();

            //get key values
            var i18nModel = this.getView().getModel("i18n").getResourceBundle();
            if (selectedItems.length === 0){
                sap.m.MessageToast.show(i18nModel.getText("noSelection"));
            } else {
                var textMessage = i18nModel.getText("selection");

                //for every selected item
                for( var item in selectedItems){
                    //get context
                    var context = selectedItems[item].getBindingContext();
                    var oContext = context.getObject();
                    textMessage = textMessage + " - " + oContext.Material;
                }
                sap.m.MessageToast.show(textMessage);
            }
        };

        function onDeleteSelectedRow() {
            var standardList = this.getView().byId("standardList");
            var selectedItems = standardList.getSelectedItems();

            //get key values
            var i18nModel = this.getView().getModel("i18n").getResourceBundle();
            if (selectedItems.length === 0) {
                sap.m.MessageToast.show(i18nModel.getText("noSelection"));
            } else {
                var textMessage = i18nModel.getText("selection");

                //controller(this)- View - Model
                var model = this.getView().getModel();
                var products = model.getProperty("/Products");
                var arrayId = [];

                //for every selected item
                for( var item in selectedItems){
                    var context = selectedItems[item].getBindingContext();
                    var oContext = context.getObject(); 
                    
                    arrayId.push(oContext.Id);
                    textMessage = textMessage + " - " + oContext.Material;
                }
                products = products.filter(function(p) {
                    return !arrayId.includes(p.Id);
                })
                //update model with filter
                model.setProperty("/Products", products);
                //delete user selection
                standardList.removeSelections();
                sap.m.MessageToast.show(textMessage);
            }
        };

        function onDeleteRow(oEvent) {
            var selectedRow = oEvent.getParameter("listItem");
            var context = selectedRow.getBindingContext();
            var splitPath = context.getPath().split("/");
            var indexSelectedRow = splitPath[splitPath.length-1];

            var model = this.getView().getModel();
            var products = model.getProperty("/Products");
            //delete 1 item from index indexSelectedRow
            products.splice(indexSelectedRow,1);
            model.refresh();
        }

        //prototype
        var Main = Controller.extend("logaligroup.Lists.controller.ListTypes", {});
        Main.prototype.onInit = onInit;
        Main.prototype.getGroupHeader = getGroupHeader;
        Main.prototype.onShowSelectedRow = onShowSelectedRow;
        Main.prototype.onDeleteSelectedRow = onDeleteSelectedRow;
        Main.prototype.onDeleteRow = onDeleteRow;
        return Main;

        // return Controller.extend("logaligroup.Lists.controller.ListTypes", {
        //     onInit: function () {
        //     }
    });