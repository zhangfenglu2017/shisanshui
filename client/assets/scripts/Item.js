var Socket = require('socket');

cc.Class({
    extends: cc.Component,

    properties: {
        roomidStr: {
            default: null,
            type: cc.Label
        },
        gametypeStr: {
            default: null,
            type: cc.Label
        },
        playernumStr: {
            default: null,
            type: cc.Label
        },
        btn_yaoqing:{
            default: null,
            type: cc.Button
        },
        btn_jinru:{
            default: null,
            type: cc.Button
        },
        itemID: 0
    },
    
     onLoad: function () {
         //this.node.on('touchend', function () {
         //    console.log("Item " + this.itemID + ' clicked');
         //}, this);
         //
         //this._registerSocketEvent();

     },


    updateItem: function(eachList) {
        console.log("各个代开房的数据：" + JSON.stringify(eachList));
        this.itemID = eachList.id;
        //this.gametypeStr.string =  eachList.gameType;
        this.gametypeStr.string ="十三水";
            this.roomidStr.string =  eachList.roomId;
        //this.playernumStr.string =  eachList.createUserId;
        this.playernumStr.string =  0;
    },

    jinruRoom: function () {
        var userId = Socket.instance.userInfo.id;

        var inviteNumber = parseInt(this.roomidStr.string);
        console.log(inviteNumber, "------------------------");
        console.log(userId, "------------------------");
        if (inviteNumber) {
            /*加入房间请求*/
            //var userId = Socket.instance.userInfo.id;
            Socket.sendJoinDesk(inviteNumber, parseInt(this.playernumStr.string));
        }
    }
});
