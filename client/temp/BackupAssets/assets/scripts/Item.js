
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
    
    // onLoad: function () {
    //     this.node.on('touchend', function () {
    //         console.log("Item " + this.itemID + ' clicked');
    //     }, this);
    // },

    updateItem: function(eachList) {
        this.itemID = eachList.id;
        this.gametypeStr.textKey =  eachList.gameType;
        this.roomidStr.textKey =  eachList.roomId;
        this.playernumStr.textKey =  eachList.createUserId;
    },
});
