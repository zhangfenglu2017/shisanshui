"use strict";
cc._RFpush(module, 'c0b5azvmzNLQacfqQKNHMNQ', 'ListViewCtrl');
// scripts\ListViewCtrl.js

var Socket = require('socket');
var KQGlobalEvent = require('KQGlobalEvent');
cc.Class({
    'extends': cc.Component,

    properties: {
        item: { // item template to instantiate other items
            'default': null,
            type: cc.Node
        },
        scrollView: {
            'default': null,
            type: cc.ScrollView
        },
        spawnCount: 0, // how many items we actually spawn
        totalCount: 0, // how many items we need for the whole list
        spacing: 0, // space between each item
        bufferZone: 0, // when item is away from bufferZone, we relocate it
        //btnAddItem: cc.Button,
        //btnRemoveItem: cc.Button,
        //btnJumpToPosition: cc.Button,
        //lblJumpPosition: cc.Label,
        //lblTotalItems: cc.Label,
        daikaiList: null
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.content = this.scrollView.content;
        this.items = []; // array to store spawned items
        this._registerSocketEvent();
        Socket.sendGetDaiKaiFang(Socket.instance.userInfo.id);
        this.updateTimer = 0;
        this.updateInterval = 0.2;
        this.lastContentPosY = 0; // use this variable to detect if we are scrolling up or down
    },

    _registerSocketEvent: function _registerSocketEvent() {
        KQGlobalEvent.on(Socket.Event.ReceiveGetDaiKaiDesk, this._getDaikaiRoomSocketCallback, this);
    },

    _getDaikaiRoomSocketCallback: function _getDaikaiRoomSocketCallback(response) {
        console.log("JSON.stringify(response.data.daikaiList)=====" + JSON.stringify(response.data.daikaiList));
        if (response.result) {
            var jslength = 0;

            var daikaiList = response.data.daikaiList;
            this.daikaiList = daikaiList;
            for (var js2 in daikaiList) {
                this.daikaiList.id = jslength;
                jslength++;
            }
            this.totalCount = jslength;
            this.items = [];
            this.content.removeAllChildren(true);
            this.initialize();
        }
    },

    initialize: function initialize() {
        this.content.height = this.totalCount * (this.item.height + this.spacing) + this.spacing; // get total content height
        //for (let i = 0; i < this.spawnCount; ++i) { // spawn items, we only need to do this once
        for (var i = 0; i < this.totalCount; ++i) {
            // spawn items, we only need to do this once
            var item = cc.instantiate(this.item);
            this.content.addChild(item);
            if (this.daikaiList && this.daikaiList.length > 0) {
                item.setPosition(0, -item.height * (0.5 + i) - this.spacing * (i + 1));
                item.getComponent('Item').updateItem(this.daikaiList[i]);
                this.items.push(item);
            }
        }
    },

    getPositionInView: function getPositionInView(item) {
        // get item position in scrollview's node space
        // let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        var worldPos = item.convertToWorldSpaceAR(item.position);
        var viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        //return item.getPosition();

        return viewPos;
    },

    update: function update(dt) {
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return; // we don't need to do the math every frame
        this.updateTimer = 0;
        var items = this.items;
        var buffer = this.bufferZone;
        var isDown = this.scrollView.content.y < this.lastContentPosY; // scrolling direction
        var offset = (this.item.height + this.spacing) * items.length;
        for (var i = 0; i < items.length; ++i) {
            var viewPos = this.getPositionInView(items[i]);
            if (isDown) {
                // if away from buffer zone and not reaching top of content
                if (viewPos.y < -buffer && items[i].y + offset < 0) {
                    items[i].setPositionY(items[i].y + offset);
                    var item = items[i].getComponent('Item');
                    var itemId = item.itemID - items.length; // update item id
                    if (this.daikaiList && this.daikaiList.length > 0) {
                        item.updateItem(this.daikaiList[i]);
                    }
                }
            } else {
                // if away from buffer zone and not reaching bottom of content
                if (viewPos.y > buffer && items[i].y - offset > -this.content.height) {
                    items[i].setPositionY(items[i].y - offset);
                    var item = items[i].getComponent('Item');
                    var itemId = item.itemID + items.length;
                    if (this.daikaiList && this.daikaiList.length > 0) {
                        item.updateItem(this.daikaiList[i]);
                    }
                }
            }
        }
        // update lastContentPosY
        this.lastContentPosY = this.scrollView.content.y;
        //this.lblTotalItems.textKey = "Total Items: " + this.totalCount;
        // this.lblScrollEvent.string = "Total Items: " + items.length;
    },

    scrollEvent: function scrollEvent(sender, event) {
        //switch(event) {
        //    case 0:
        //       this.lblScrollEvent.string = "Scroll to Top";
        //       break;
        //    case 1:
        //       this.lblScrollEvent.string = "Scroll to Bottom";
        //       break;
        //    case 2:
        //       this.lblScrollEvent.string = "Scroll to Left";
        //       break;
        //    case 3:
        //       this.lblScrollEvent.string = "Scroll to Right";
        //       break;
        //    case 4:
        //       this.lblScrollEvent.string = "Scrolling";
        //       break;
        //    case 5:
        //       this.lblScrollEvent.string = "Bounce Top";
        //       break;
        //    case 6:
        //       this.lblScrollEvent.string = "Bounce bottom";
        //       break;
        //    case 7:
        //       this.lblScrollEvent.string = "Bounce left";
        //       break;
        //    case 8:
        //       this.lblScrollEvent.string = "Bounce right";
        //       break;
        //    case 9:
        //       this.lblScrollEvent.string = "Auto scroll ended";
        //       break;
        //}
    },

    addItem: function addItem() {
        this.content.height = (this.totalCount + 1) * (this.item.height + this.spacing) + this.spacing; // get total content height
        this.totalCount = this.totalCount + 1;
    },

    removeItem: function removeItem() {
        if (this.totalCount - 1 < 30) {
            cc.error("can't remove item less than 30!");
            return;
        }

        this.content.height = (this.totalCount - 1) * (this.item.height + this.spacing) + this.spacing; // get total content height
        this.totalCount = this.totalCount - 1;
    },

    scrollToFixedPosition: function scrollToFixedPosition() {
        this.scrollView.scrollToOffset(cc.p(0, 500), 2);
    }
});

cc._RFpop();