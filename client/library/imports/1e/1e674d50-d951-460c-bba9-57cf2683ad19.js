"use strict";
cc._RFpush(module, '1e6741Q2VFGDLupV88mg60Z', 'hall');
// scripts\hall.js

var manager = require('manager');
var Socket = require('socket');
var KQGlobalEvent = require('KQGlobalEvent');
var AudioManager = require('AudioManager');
var KQNativeInvoke = require('KQNativeInvoke');
var Playback = require('Playback');

var hall = cc.Class({
    'extends': cc.Component,

    properties: {

        //productNodes:[cc.Node],
        shopAlertNode: cc.Node,
        createNode: cc.Node,
        joinNode: cc.Node,
        gengxin: cc.Node,
        alertPrefab: cc.Prefab,
        tsSingleSelect: [cc.Node], // 创建房间信息，单选
        tsCheckSeclect: [cc.Node], // 创建房间信息，复选
        selectMoShi: cc.Node, // 创建房间信息，模式（庄家模式和无特殊牌）
        selectGuiPai: cc.Node, // 创建房间信息，模式（庄家模式和无特殊牌）
        overTime: cc.Node, // 超时出牌
        daikai: cc.Node, //代开房
        my_room: cc.Node, //代开窗口
        zhongtujinru: cc.Node, //中途进入
        //labelNotice: cc.Label,      // 公告
        labelBanner: cc.Label, // banner label
        recordNode: cc.Node,
        waitingPrefab: cc.Prefab,
        setting: cc.Node,
        //用户信息
        avatarNode: cc.Node,
        nickNameLabel: cc.Label,
        cardNumberLabel: cc.Label,
        userIdLabel: cc.Label,
        codeLabel: cc.Label,
        //phone:cc.Label,
        // userInfoMsgNode:cc.Node,
        logoutNode: cc.Node,
        //战绩
        recordMsgNode: cc.Node,
        feedbackEditBox: cc.EditBox, //反馈
        feedbackNode: cc.Node,
        wxshare: cc.Node,
        _userId: 0,
        _openId: null,
        _help: null,
        _close: null,
        iosUrl: null,
        aUrl: null

    },

    statics: {
        lastHallInfo: null, // 上一次收到的大厅信息
        cacheImageInfo: null
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.keyBackListen();
        if (cc.sys.isBrowser) {
            if (window.shareToTimeLine) {
                window.shareToTimeLine();
            }
            if (window.shareToSession) {
                window.shareToSession();
            }
        }
        cc.sys.localStorage.removeItem("timestamp");
        var bg = this.node.getChildByName("room_bg");
        var windowP = cc.director.getWinSizeInPixels();
        var scaleX = windowP.width / bg.width;
        var scaleY = windowP.height / bg.height;
        var scale = Math.max(scaleX, scaleY);
        bg.scaleX = scale;
        bg.scaleY = scale;
        this.clearLocalStorage();
        cc.from = {};
        cc.from.isUseMa = true;
        cc.from.ma = 0;
        cc.isRoomViewShow = false;
        this._btn = this.node.getChildByName("btn");
        this._buttons = this.node.getChildByName("buttons");
        var volume = cc.sys.localStorage.getItem("bgVolume");
        if (volume != null && parseInt(volume)) {
            AudioManager.instance.playMusic();
        }

        var bgSound = cc.sys.localStorage.getItem("bgSound");
        if (bgSound == 0) {
            var audioManager = cc.find('AudioManager');
            audioManager = audioManager.getComponent('AudioManager');
            audioManager.setEffectMusicVolum(bgSound);
        }
        Playback.instance.removePlaybackDatas();

        hall.cacheImageInfo = hall.cacheImageInfo || {};

        this._registerSocketEvent();
        this._startBannerAnimation();
        this._initJoinRoom();

        this._userId = Socket.instance.userInfo.id;
        this._openId = Socket.instance.userInfo.openId;
        this._inviteCode = Socket.instance.userInfo.inviteCode; //邀请码
        var self = this;
        this.socket = cc.find('GameSocket').getComponent('socket');
        this.socket.receviceMessage = function (response) {
            var data = JSON.parse(response);
        };

        this.socket.connectionSuccess = function () {
            self.hiddenNetworkMessage();
            self.hiddenCheckMessage();
        };
        this.socket.connectionDisconnect = function () {
            self.showNetworkMessage('网络链接断开，重新连接中...');
        };
        this.socket.checkNetworkNow = function () {
            self.showCheckMessage('检查网络中...');
        };
        this.socket.checkNetworkEnd = function () {
            self.hiddenCheckMessage();
            self.hiddenNetworkMessage();
        };

        //  /*设置用户信息*/
        this.updateUserInfo();
        /*刷新用户信息*/
        Socket.sendGetUserInfo(this._userId, this._openId);
        /*定时刷新用户信息*/
        this.schedule((function () {
            Socket.sendGetUserInfo(this._userId, this._openId);
        }).bind(this), 10); //10s一次
        Socket.sendGetHallInfo(this.socket.userInfo.id);
        if (hall.lastHallInfo) {
            this.updateBanner(hall.lastHallInfo.info);
        }
        cc.onShareWXResp = null;
        cc.director.preloadScene('play', function () {
            cc.director.preloadScene('login');
        });
        if (cc.joinDesk != null) {
            if (!cc.joinDesk.result) {
                var reason = cc.joinDesk.reason;
                this.alertMessage(reason);
            }
            cc.joinDesk = null;
        }
        if (cc.qingli != null) {
            this.alertMessage("您被房主请出房间");
            cc.qingli = null;
        }
        //var creatAnima = this.node.getChildByName("create_room");
    },

    keyBackListen: function keyBackListen() {
        var _this = this;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (e) {
            if (e.keyCode == cc.KEY.back) {
                if (!KQNativeInvoke.isNativeIOS()) {
                    jsb.reflection.callStaticMethod(KQNativeInvoke.ANDRIODClassName, "backToDesk", "()V");
                }
            }
        }, this);
    },

    clickWxShare: function clickWxShare() {
        if (!cc.sys.isNative) {
            console.log("clickWxShare");
            this.wxshare.active = true;
        } else {
            console.log("clickWxShare native");
            var title = cc.sys.localStorage.getItem('shareTitle');
            var description = cc.sys.localStorage.getItem('desc');
            var recordId = cc.sys.localStorage.getItem('recordId');
            var id = '';
            if (recordId) {
                id = 'recordId=' + recordId;
            }

            if (KQNativeInvoke.isNativeIOS()) {
                jsb.reflection.callStaticMethod(KQNativeInvoke.IOSClassName, "wxShareFriend", id, description, title);
            } else {
                //Android
                var str = "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V";
                jsb.reflection.callStaticMethod(KQNativeInvoke.ANDRIODClassName, "wxShareFriend", str, id, description, title);
            }
        }
    },

    //分享到朋友圈
    shareHallTimeline: function shareHallTimeline() {
        if (!cc.sys.isNative) {
            this.wxshare.active = true;
        } else {
            var title = cc.sys.localStorage.getItem('shareTitle');
            var description = cc.sys.localStorage.getItem('desc');
            var recordId = cc.sys.localStorage.getItem('recordId');
            var id = '';
            if (recordId) {
                id = 'recordId=' + recordId;
            }

            if (KQNativeInvoke.isNativeIOS()) {
                jsb.reflection.callStaticMethod(KQNativeInvoke.IOSClassName, "wxShareHallTimeline", id, description, title);
            } else {
                //Android
                var str = "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V";
                jsb.reflection.callStaticMethod(KQNativeInvoke.ANDRIODClassName, "wxShareHallTimeline", str, id, description, title);
            }
        }
    },

    shareBg: function shareBg() {
        if (!cc.sys.isNative) {
            this.wxshare.active = false;
        } else {
            // if (KQNativeInvoke.isNativeIOS()) {
            //     jsb.reflection.callStaticMethod(KQNativeInvoke.IOSClassName,"wxShareHallTimeline",id, description,title);
            // }
            // else {//Android
            //     var str = "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V";
            //     jsb.reflection.callStaticMethod(KQNativeInvoke.ANDRIODClassName, "wxShareHallTimeline", str,id, description,title);
            // }
        }
    },

    clearLocalStorage: function clearLocalStorage() {
        var shareTitle = '开房玩[大众十三水]';
        var desc = '开好房了，就等你们一起来[大众十三水]啦！晚了位置就没了哟~';
        cc.sys.localStorage.removeItem('roomId');
        cc.sys.localStorage.setItem('shareTitle', shareTitle);
        cc.sys.localStorage.setItem('desc', desc);
    },

    onDestroy: function onDestroy() {
        this.socket.receviceMessage = function () {};
        this.socket.connectionSuccess = function () {};
        this.socket.connectionDisconnect = function () {};
        this.socket.checkNetworkNow = function () {};
        this.socket.checkNetworkEnd = function () {};

        KQGlobalEvent.offTarget(this);
    },

    _registerSocketEvent: function _registerSocketEvent() {
        //KQGlobalEvent.on(Socket.Event.ReceiveGetDaiKaiDesk, this._getDaikaiRoomSocketCallback, this);
        KQGlobalEvent.on(Socket.Event.ReceiveDaiKaiDesk, this._daikaiRoomSocketCallback, this);
        KQGlobalEvent.on(Socket.Event.JoinDesk, this._jiinRoomSocketCallback, this);
        KQGlobalEvent.on(Socket.Event.ReceiveDeskInfo, this._jiinRoomSocketCallback, this);
        KQGlobalEvent.on(Socket.Event.ReceiveCreateDesk, this._createRoomSocketCallback, this);
        KQGlobalEvent.on(Socket.Event.ReceiveHallInfo, this._socketReceiveHallInfo, this);
        KQGlobalEvent.on(Socket.Event.ReceiveGetUserInfo, this._socketReceiveUserInfo, this);
        KQGlobalEvent.on(Socket.Event.SocketDisconnect, this._socketDisconnect, this);
        //KQGlobalEvent.on(Socket.Event.ReceiveInviteCode, this._socketReceiveInviteCode, this);
        KQGlobalEvent.on(Socket.Event.SocketConnectSuccessed, this._socketConnected, this);
        //KQGlobalEvent.on(Socket.Event.ReceiveSharePng, this._socketSharePng, this);
    },

    // 跳转到公众号
    guanzhu: function guanzhu() {
        // var url = "http://www.honggefeng.cn/gzh/index.html";
        // cc.sys.openURL(url)
    },
    _startBannerAnimation: function _startBannerAnimation() {
        var anim = this.labelBanner.getComponent(cc.Animation);
        anim.play('banner');
    },
    downLoad: function downLoad() {
        var url = 'https://fir.im/5tne';
        cc.sys.openURL(url);

        //window.location.href = "http://www.baidu.com";
        //console.log("？？？？？？？？");
    },

    _initJoinRoom: function _initJoinRoom() {
        var self = this;
        var joinRoom = this.joinNode.getComponent('joinRoom');

        joinRoom.callbackJoinRoom = function (number) {
            // self.joinNode.getComponent('alert').dismissAction();
            // self.showWaitingMessage('加入中...');
            // self.scheduleOnce(function() {
            //     self.hiddenWaitingMessage();
            // }, 2.0);

            /*加入房间请求*/
            var userId = Socket.instance.userInfo.id;
            Socket.sendJoinDesk(number, userId);
        };
    },

    _jiinRoomSocketCallback: function _jiinRoomSocketCallback(response) {
        var _this2 = this;

        if (cc.isRoomViewShow) {
            return;
        }
        this.hiddenWaitingMessage();

        if (response.result) {
            (function () {
                if (cc.from == null) {
                    cc.from = {};
                }
                var joinRoom = _this2.joinNode.getComponent('joinRoom');

                _this2.joinNode.getComponent('alert').setAlertCallbck(function () {
                    joinRoom.clickClear();
                });
                cc.from.ma = response.data.maPai;
                cc.director.loadScene('play');
            })();
        } else {
            var reasonInfo = this._joinReasonMap(response.data.reason);
            this.alertMessage(reasonInfo);
        }
    },

    _daikaiRoomSocketCallback: function _daikaiRoomSocketCallback(response) {
        if (response.result)
            //this.showWaitingMessage(JSON.stringify(response.data.daikai));
            this.alertMessage(JSON.stringify(response.data.daikai));
    },
    //_getDaikaiRoomSocketCallback:function(response){
    //    //console.log("JSON.stringify(response.data.daikaiList)=====");
    //    if (response.result) {
    //        var daikaiList = JSON.stringify(response.data.daikaiList);
    //        cc.log(daikaiList,"接受到代开房数据：-----------------");
    //    }
    //    if(response.result)
    //    //this.showWaitingMessage(JSON.stringify(response.data.daikai));
    //        this.alertMessage(JSON.stringify(response.data));
    //},

    _socketReceiveHallInfo: function _socketReceiveHallInfo(response) {
        if (cc.isRoomViewShow) {
            return;
        }
        if (!response.result) {
            return;
        }
        var data = response.data;
        hall.lastHallInfo = data;
        var isIOS = data.isIOS;
        var isAndroid = data.isA;
        var vIOS = data.vIOS;
        var vA = data.vA;
        this.iosUrl = data.iosUrl;
        this.aUrl = data.aUrl;
        if (cc.sys.isNative) {
            if (KQNativeInvoke.isNativeIOS()) {
                if (isIOS == 1) {
                    if (vIOS != '1.0.3') {
                        this.gengxin.active = true;
                    }
                }
            } else {
                //Android
                if (isAndroid == 1) {
                    if (vA != '1.0.4') {
                        this.gengxin.active = true;
                    }
                }
            }
        }
        var notice = data.broadcast;
        var banner = data.info;
        //this.updateNotice(notice);
        this.updateBanner(banner);
    },
    downloadNewVersion: function downloadNewVersion() {
        if (KQNativeInvoke.isNativeIOS()) {
            cc.sys.openURL(this.iosUrl);
            // jsb.reflection.callStaticMethod(KQNativeInvoke.IOSClassName, "downloadNewVersion:", this.iosUrl);
        } else {
                //Android
                cc.sys.openURL(this.aUrl);
                // jsb.reflection.callStaticMethod(KQNativeInvoke.ANDRIODClassName, "downloadNewVersion", "(Ljava/lang/String;)V", this.aUrl);
            }
    },

    //分享也面
    clickOpenShare: function clickOpenShare() {
        if (!cc.sys.isNative) {
            var shareBg = cc.find("Canvas/shere_bg");
            shareBg.active = true;
            //var wxBg = this.shareBg.getChildByName("wx");
            //var pyqBg = this.shareBg.getChildByName("PYQ");
            //wxBg.active = true;
            //pyqBg.active = false;
            //this.shareBg.active = true;
        }
    },
    //关闭分享页面
    clickCloseShare: function clickCloseShare() {
        if (!cc.sys.isNative) {
            var shareBg = cc.find("Canvas/shere_bg");
            shareBg.active = false;
            //var wxBg = this.shareBg.getChildByName("wx");
            //var pyqBg = this.shareBg.getChildByName("PYQ");
            //wxBg.active = true;
            //pyqBg.active = false;
            //this.shareBg.active = true;
        }
    },
    _createRoomSocketCallback: function _createRoomSocketCallback(response) {
        if (cc.isRoomViewShow) {
            return;
        }
        this.hiddenWaitingMessage();

        if (response.result) {
            cc.director.loadScene('play');
        }
        /*如果钻石不足，则提示*/
        else {
                this.alertMessage("您的钻石不足");
            }
    },

    _joinReasonMap: function _joinReasonMap(reason) {
        var reasonInfo = {
            notExist: "房间不存在!",
            cardNumber: "您房卡不足!"
        };

        var info = reasonInfo[reason] || "房间已满!";
        return info;
    },

    /*shop*/
    shopAction: function shopAction() {
        var comp = this.shopAlertNode.getComponent('alert');
        comp.alert();
    },
    /*提示*/
    alertMessage: function alertMessage(msg) {
        var node = cc.instantiate(this.alertPrefab);
        this.node.addChild(node);
        var comp = node.getComponent('alert');
        comp.setMessage(msg);
        comp.alert();
    },

    //updateNotice: function (notice) {
    //    if(this.labelNotice == null){
    //        return;
    //    }
    //  this.labelNotice.string = notice || "";
    //},

    updateBanner: function updateBanner() {
        var banner = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

        if (this.labelBanner == null) {
            return;
        }
        this.labelBanner.string = banner;
    },

    /*#####
     * setting1 局数  (0 | 1 | 2 )
     * setting2 人数  (0 | 1 | 2 | 3)
     * setting3 玩法  (0 | 1 | 2 | 3 | 4)
     * setting4 AA制收取房费  (0 | 1 | 2 )
     * setting5 其他  (0)
     * setting6
     * setting7
     * */
    createDoneAction: function createDoneAction() {
        var info = {};
        var self = this;
        var key = ['setting1', 'setting2', 'setting4', 'setting5'];
        for (var i = 0; i < this.tsSingleSelect.length; i++) {
            var tsIndex = self.tsSingleSelect[i].getComponent('singleSelect').selectedIndex;
            info[key[i]] = tsIndex;
        }

        info['setting3'] = this.selectMoShi.getComponent('selectMoShi')._select;
        info['setting6'] = this.overTime.getComponent('overTime')._selected;
        info['setting9'] = this.daikai.getComponent('daikai')._selected;
        info['setting10'] = this.zhongtujinru.getComponent('zhongtujinru')._selected;
        //console.log( info['setting6'] );
        if (!info['setting3'][3]) {
            // 玩法 [疯狂场,鬼牌,比花色,坐庄,马牌] info['setting3'][3]第三项表示坐庄模式，非坐庄模式的倍率是1倍
            info['setting5'] = 0; // 倍率 (0~1) == (1~3倍)
        }
        info['setting8'] = null;

        info['setting7'] = this.selectMoShi.getComponent('change_mapai')._cards;
        cc.set = info;
        info['userId'] = this.socket.userInfo.id; //用户Id
        this.socket.sendMessage('createDesk', info);

        this.createNode.getComponent('alert').dismissAction();

        //let self = this;
        //this.showWaitingMessage('创建中...');
        this.scheduleOnce(function () {
            self.hiddenWaitingMessage();
        }, 2.0);
    },

    // 随机场
    /*clickRandRoom: function () {
     cc.director.loadScene('randRoom');
     },*/

    clickRecord: function clickRecord() {
        var comp = this.recordNode.getComponent('alert');
        comp.alert();
        Socket.sendGetRecrod(Socket.instance.userInfo.id);
    },

    clickGetDaiKai: function clickGetDaiKai() {
        // Socket.sendGetDaiKaiFang(Socket.instance.userInfo.id);
        Socket.sendGetDaiKaiFang(Socket.instance.userInfo.id);
        this.my_room.active = true;
    },

    clickPlayRule: function clickPlayRule() {
        //cc.director.loadScene('rule');
        this.help = this.node.getChildByName("help");
        var comp = this.help.getComponent('alert');
        comp.alert();
    },

    dismissComplete: function dismissComplete() {
        this.node.getChildByName("my_room").active = false;
    },

    clickPlay: function clickPlay() {
        if (cc.clickOut) cc.director.loadScene('play');
    },

    /*切换账号*/
    clickCancelLation: function clickCancelLation() {
        this.logoutNode.getComponent('alert').alert();
    },

    logoutAction: function logoutAction() {
        //manager.setUserInfo('');
        cc.director.loadScene('login');
        hall.cacheImageInfo = null;
    },

    exitAction: function exitAction() {
        //manager.setUserInfo('');
        if (!cc.sys.isNative) {
            cc.director.loadScene('login');
            hall.cacheImageInfo = null;
            return;
        }

        if (KQNativeInvoke.isNativeIOS()) {
            jsb.reflection.callStaticMethod(KQNativeInvoke.IOSClassName, "exitApp");
        } else if (KQNativeInvoke.isNativeAndroid()) {
            //Android com.lling.qianjianglzg
            jsb.reflection.callStaticMethod(KQNativeInvoke.ANDRIODClassName, "exitApp", "()V");
        }
        cc.director.end();
    },

    //接收处理用户数据
    _socketReceiveUserInfo: function _socketReceiveUserInfo(response) {
        if (cc.isRoomViewShow) {
            return;
        }
        if (!this.socket.userInfo) {
            cc.error("this.socket.userInfo 为空!!!");
            return;
        }
        //console.log(response,"----------------------用户信息");
        //this.phone.string = response.data.phone ? response.data.phone : "无";
        this.setting.getComponent('Setting')._phone = response.data.phone ? response.data.phone : null;
        this.setting.getComponent('Setting').phone.string = response.data.phone ? response.data.phone : '无';
        this.nickNameLabel.string = response.data.nickname; // 用户名
        this.userIdLabel.string = 'ID: ' + response.data.id; // ID
        this.cardNumberLabel.string = response.data.cardNumber;
        var sprite = this.avatarNode.getComponent(cc.Sprite);
        cc.loader.load({ url: response.data.avatarUrl, type: "jpg" }, function (err, tex) {
            if (!err) {
                var frame = new cc.SpriteFrame(tex);
                sprite.spriteFrame = frame;
            }
        });
    },

    _socketDisconnect: function _socketDisconnect() {
        this.showNetworkMessage("网络链接断开，重新连接中...");
    },

    _socketConnected: function _socketConnected() {
        this.hiddenNetworkMessage();
    },

    //更新用户信息
    updateUserInfo: function updateUserInfo() {
        var info = this.socket.userInfo;
        if (!info) {
            cc.error("this.socket.userInfo 为空!!!");
            return;
        }

        this.nickNameLabel.string = info.nickname;
        this.userIdLabel.string = 'ID: ' + info.id;
        this.cardNumberLabel.string = info.cardNumber;

        var avatarUrl = info.avatarUrl + ".jpg";
        var sprite = this.avatarNode.getComponent(cc.Sprite);
        var texture = hall.cacheImageInfo[avatarUrl];
        if (texture) {
            var frame = new cc.SpriteFrame(texture);
            if (frame) {
                //cc.log("从缓存中加载头像");
                sprite.spriteFrame = frame;
                return;
            }
        }

        cc.loader.load({ url: info.avatarUrl, type: "jpg" }, function (err, tex) {
            if (!err) {
                var frame = new cc.SpriteFrame(tex);
                sprite.spriteFrame = frame;

                hall.cacheImageInfo[avatarUrl] = tex;
            }
        });
    },

    /*提交意见*/
    feedbackAcion: function feedbackAcion() {
        var userId = this.socket.userInfo.id;
        var text = this.feedbackEditBox.string;
        if (text.length > 0) {
            this.feedbackNode.getComponent('alert').dismissAction();
            Socket.sendFeedback(userId, text);
            this.feedbackEditBox.string = '';
        }
    },

    showWaitingMessage: function showWaitingMessage(msg) {
        if (this.waitingNode != null && cc.sys.isNative && cc.sys.isObjectValid(this.waitingNode)) {
            this.waitingNode.destory();
            this.waitingNode = null;
        }
        this.waitingNode = cc.instantiate(this.waitingPrefab);
        this.node.addChild(this.waitingNode);
        var comp = this.waitingNode.getComponent('alert');
        comp.setMessage(msg);
        comp.alert();
    },

    hiddenWaitingMessage: function hiddenWaitingMessage() {
        if (this.waitingNode != null) {
            this.waitingNode.getComponent('alert').dismissAction();
        }
    },

    //network
    showNetworkMessage: function showNetworkMessage(msg) {
        if (this.networkNode && this.networkNode.active) {
            var _alert = this.networkNode.getComponent('alert');
            if (_alert.getMessage() == msg) {
                return;
            }
        }

        if (this.networkNode != null) {
            var removeSelfAction = cc.removeSelf();
            this.networkNode.runAction(removeSelfAction);
            this.networkNode = null;
        }
        this.networkNode = cc.instantiate(this.waitingPrefab);
        this.node.addChild(this.networkNode);
        var comp = this.networkNode.getComponent('alert');
        var self = this;
        comp.onDismissComplete = function () {
            self.networkNode = null;
        };
        comp.setMessage(msg);
        comp.alert();
    },

    hiddenNetworkMessage: function hiddenNetworkMessage() {
        if (this.networkNode != null) {
            this.networkNode.getComponent('alert').dismissAction();
        }
    },

    //checkNode
    showCheckMessage: function showCheckMessage(msg) {
        if (!(this.checkNode && this.checkNode.active)) {} else {
            var _alert2 = this.checkNode.getComponent('alert');
            if (_alert2.getMessage() == msg) {
                return;
            }
        }

        if (this.checkNode != null) {
            var removeSelfAction = cc.removeSelf();
            this.checkNode.runAction(removeSelfAction);
            this.checkNode = null;
        }
        this.checkNode = cc.instantiate(this.waitingPrefab);
        this.node.addChild(this.checkNode);
        var comp = this.checkNode.getComponent('alert');
        var self = this;
        comp.onDismissComplete = function () {
            self.checkNode = null;
        };
        comp.setMessage(msg);
        comp.alert();
    },

    hiddenCheckMessage: function hiddenCheckMessage() {
        if (this.checkNode != null) {
            this.checkNode.getComponent('alert').dismissAction();
        }
    },
    onBtnClick: function onBtnClick() {
        if (this._buttons.active) {
            this._buttons.active = false;
        } else {
            this._buttons.active = true;
        }
    }

});

// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },
module.exports = hall;

cc._RFpop();