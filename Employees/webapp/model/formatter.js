sap.ui.define([],
    function () {
        function dateFormat(date) {
            //1 day
            var timeDate = 24 * 60 * 60 * 1000;

            if (date) {
                var dateNow = new Date();
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy/MM/dd" });
                var dateNowFormat = new Date(dateFormat.format(dateNow));
                //get i18n resource
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

                switch (true) {
                    //today
                    case date.getTime() === dateNowFormat.getTime():
                        return oResourceBundle.getText("today");
                    //tomorrow
                    case date.getTime() === dateNowFormat.getTime() + timeDate:
                        return oResourceBundle.getText("tomorrow");
                    //yesterday
                    case date.getTime() === dateNowFormat.getTime() - timeDate:
                        return oResourceBundle.getText("yesterday");

                    default:
                        return "";
                }
            }
        }
        return {
            dateFormat: dateFormat
        };
    });