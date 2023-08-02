sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel,DateFormat) {
        "use strict";

        return Controller.extend("tradefast.controller.TradeView", {
            onInit: function () {
                var AppConfig = {
                    "profit": "",
                    "Quantity":"",
                    "EnableTrade":false,
                    "trading_symbol":"BANKNIFTY22O2040700CE",
                    "AuthToken": "enctoken BLvXLe9Bc9Sj/sbszkSVW4QG6VRsY5EIVYzfDwfZksy8DFuHteQWDsXGD4mBE/0fod81M33kmPd1i9ui4FLc2Xj3Qs+jcSE7oYdx7u7ewt337zOI+r+jEw=="
                }
                var oModel = new JSONModel(AppConfig);
                this.getView().setModel(oModel, "AppConfig");

                var TradeStatus = [];
                

                var oModel = new JSONModel(TradeStatus);
                this.getView().setModel(oModel, "TradeStatus");


            },
            OnRefresh:function(){
                location.reload();
            },
            PushTradeData:function(TradeObj){

            },
            OnTrade: function () {
                var oDateFormat = DateFormat.getDateTimeInstance();
                var TradeObj = {
                    "Time":"",
                    "BUY_AMT":"",
                    "SELL_AMT":""
                };
                var AppConfigData = this.getView().getModel("AppConfig").getData();
                var TradeStatusData = this.getView().getModel("TradeStatus").getData();
                TradeStatusData.push(TradeObj);
                this.getView().getModel("TradeStatus").setData(TradeStatusData);
                TradeObj.Time = oDateFormat.format(new Date());
                var BuyFlag = true;
                var OrderCheckFlag = true;
                var SellFlag = true;
                var payload = {
                    variety: "regular",
                    exchange: "NFO",
                    tradingsymbol: AppConfigData.trading_symbol,
                    transaction_type: "BUY",
                    order_type: "MARKET",
                    quantity: AppConfigData.Quantity,
                    price: "0",
                    product: "MIS",
                    validity: "DAY",
                    disclosed_quantity: "0",
                    trigger_price: "0",
                    squareoff: "0",
                    stoploss: "0",
                    trailing_stoploss: "0",
                    user_id: "EBF672"
                }

                var sPayload = "variety=" + payload.variety + "&" +
                    "exchange=" + payload.exchange + "&" +
                    "tradingsymbol=" + payload.tradingsymbol + "&" +
                    "transaction_type=" + payload.transaction_type + "&" +
                    "order_type=" + payload.order_type + "&" +
                    "quantity=" + payload.quantity + "&" +
                    "price=" + payload.price + "&" +
                    "product=" + payload.product + "&" +
                    "validity=" + payload.validity + "&" +
                    "disclosed_quantity=" + payload.disclosed_quantity + "&" +
                    "trigger_price=" + payload.trigger_price + "&" +
                    "squareoff=" + payload.squareoff + "&" +
                    "stoploss=" + payload.stoploss + "&" +
                    "trailing_stoploss=" + payload.trailing_stoploss + "&" +
                    "user_id=" + payload.user_id;
                var xhttp = new XMLHttpRequest();
                var that = this;
                xhttp.onreadystatechange = function () {
                    var AppConfigData = that.getView().getModel("AppConfig").getData();
                    AppConfigData.ErrorText = this.responseText;
                    that.getView().getModel("AppConfig").setData(AppConfigData);
                    
                    if (this.responseText != "") {
                        var order_id = JSON.parse(this.response).data.order_id;
                        if (order_id != "") {
                            var xhttp2 = new XMLHttpRequest();
                            xhttp2.onreadystatechange = function () {
                                if (this.responseText != "") {
                                    var order_data = JSON.parse(this.response).data;
                                    var order_status = order_data[order_data.length -1].status;
                                    if(order_status == "COMPLETE"){

                                
                                        var av_price = order_data[order_data.length -1].average_price;
                                        var sell_price = (parseFloat(AppConfigData.profit) + parseFloat(av_price)).toFixed(1);
                                        
                                        TradeObj.BUY_AMT =  av_price;

                                        var payload2 = {
                                            variety: "regular",
                                            exchange: "NFO",
                                            tradingsymbol: AppConfigData.trading_symbol,
                                            transaction_type: "SELL",
                                            order_type: "LIMIT",
                                            quantity: AppConfigData.Quantity,
                                            price: sell_price,
                                            product: "MIS",
                                            validity: "DAY",
                                            disclosed_quantity: "0",
                                            trigger_price: "0",
                                            squareoff: "0",
                                            stoploss: "0",
                                            trailing_stoploss: "0",
                                            user_id: "EBF672"
                                        }
                                        var sPayload2 = "variety=" + payload2.variety + "&" +
                                        "exchange=" + payload2.exchange + "&" +
                                        "tradingsymbol=" + payload2.tradingsymbol + "&" +
                                        "transaction_type=" + payload2.transaction_type + "&" +
                                        "order_type=" + payload2.order_type + "&" +
                                        "quantity=" + payload2.quantity + "&" +
                                        "price=" + payload2.price + "&" +
                                        "product=" + payload2.product + "&" +
                                        "validity=" + payload2.validity + "&" +
                                        "disclosed_quantity=" + payload2.disclosed_quantity + "&" +
                                        "trigger_price=" + payload2.trigger_price + "&" +
                                        "squareoff=" + payload2.squareoff + "&" +
                                        "stoploss=" + payload2.stoploss + "&" +
                                        "trailing_stoploss=" + payload2.trailing_stoploss + "&" +
                                        "user_id=" + payload2.user_id;

                                        var xhttp3 = new XMLHttpRequest();
                                        xhttp3.onreadystatechange = function () {
                                            TradeObj.SELL_AMT =  sell_price;
                                        };
                                        xhttp3.open("POST", "https://kite.zerodha.com/oms/orders/regular", true);
                                        xhttp3.setRequestHeader("Authorization", AppConfigData.AuthToken);
                                        xhttp3.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                                        xhttp3.send(sPayload2);




                                    }
                                }
                            };
                            xhttp2.open("GET", "https://kite.zerodha.com/oms/orders/"+order_id, true);
                            xhttp2.setRequestHeader("Authorization", AppConfigData.AuthToken);
                            xhttp2.send();

                        }
                    }
                };
                var that = this;
                xhttp.onerror = function(oEvent){
                    var AppConfigData = that.getView().getModel("AppConfig").getData();
                    AppConfigData.ErrorText = JSON.stringify(oEvent);
                    that.getView().getModel("AppConfig").setData(AppConfigData);
                    
                }
                xhttp.open("POST", "https://kite.zerodha.com/oms/orders/regular", true);
                xhttp.setRequestHeader("Authorization", AppConfigData.AuthToken);
                xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                BuyFlag = true;
                xhttp.send(sPayload);

            }
        });
    });
