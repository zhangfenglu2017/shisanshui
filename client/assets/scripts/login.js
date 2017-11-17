var manager = require('manager');
const KQCard = require('KQCard');
const Socket = require('socket');
const KQCardFindTypeExtension = require('KQCardFindTypeExtension');
const KQGlobalEvent = require('KQGlobalEvent');
const AudioManager = require('AudioManager');
const KQNativeInvoke = require('KQNativeInvoke');
const KQGlabolSocketEventHander = require('KQGlabolSocketEventHander');

var APPID = 'wxe8993f468b16fa5d';
var ROOMID = '';
//授权地址
//正式地址
// var REDIRECT_URI = "http%3A%2F%2Fwww.honggefeng.cn%2FsszWeb%2Findex.php";
// 测试地址
var REDIRECT_URI = "http%3a%2f%2fo1o2.cn";

let HREF = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+APPID+"&redirect_uri="+REDIRECT_URI+"&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";


cc.Class({

    extends: cc.Component,
    properties: {
        //selectNode:cc.Node,
        alertPrefab:cc.Prefab,
        canvasNode:cc.Node,
        loadingNode:cc.Node,
        //err:cc.Node,
        waitingPrefab:cc.Prefab,
        recordInfo:cc.Prefab,
        label:cc.Label,
    },

    goUpdateAction:function() {
        if (KQNativeInvoke.isNativeIOS()) {
            jsb.reflection.callStaticMethod("AppController","downloadNewVersion:",this.iosUrl);
        }
        else {//Android
            jsb.reflection.callStaticMethod("com/gongpa/ssz/AppActivity", "downloadNewVersion", "(Ljava/lang/String;)V", this.androidUrl);
        }
    },

    checkVersion:function(vData) {
        //var version = vData.version;
        cc.info1 = vData.version;
        this.iosUrl = vData.iosUrl;
        this.androidUrl = vData.androidUrl;
        //if (manager.version != version) {//更新版本
        //    this.versionEnable = false;
        //    this.goUpdateAction();
        //    //this.versionLabel.string = '请到服务器更新到最新版本';
        //}
        //else {
            //this.versionLabel.string = '当前版本 ' + manager.version;
            if(KQNativeInvoke.isNativeIOS()) {
                // if(iosVersion != manager.version) {
                //     this.versionEnable = false;
                //     var updateAlert = cc.find("Canvas/update").getComponent("alert");
                //     updateAlert.alert();
                // }
                // else {
                    this.versionEnable = true;
                    var self = this;
                    var info = manager.getUserInfo();
                    if (info.length == 0) {
                        this.loginEnable = true;
                    }
                    this.scheduleOnce(function(){
                        if (info.length > 0) {
                            this.loginEnable = true;
                            self.loginAction();
                        }
                    },0.5);
                //}
            }
            else if(KQNativeInvoke.isNativeAndroid()) {
                // if(androidVersion != manager.version) {
                //     this.versionEnable = false;
                //     var updateAlert = cc.find("Canvas/update").getComponent("alert");
                //     updateAlert.alert();
                // }
                // else {
                    this.versionEnable = true;
                    var self = this;
                    var info = manager.getUserInfo();
                    if (info.length == 0) {
                        this.loginEnable = true;
                    }
                    this.scheduleOnce(function(){
                        if (info.length > 0) {
                            this.loginEnable = true;
                            self.loginAction();
                        }
                    },0.5);
                //}
            }
            else{
              this.versionEnable = true;
              var self = this;
              // var info = manager.getUserInfo();
              // if (info.length == 0) {
              //     this.loginEnable = true;
              // }
              this.scheduleOnce(function(){
                  if(!cc.sys.isNative){
                      var recordId = self.getQueryString('recordId');
                      if(recordId){
                        Socket.sendGetRecrodFromId(recordId);
                        return;
                      }
                      var roomId = self.getQueryString("roomId");
                      if(roomId){
                          var info = manager.getUserInfo();
                          if (info.length > 0) {
                            var data = JSON.parse(info);
                            if(!data.errcode){
                              self.sendLoginRequest(data);
                            }else{
                              manager.setUserInfo("");
                            }
                            return;
                          }else{
                            self._get_HREF(roomId);
                          }
                      }
                  }
                  var info = manager.getUserInfo();
                  if (info.length > 0) {
                    var data = null;
                    try {
                      data = JSON.parse(info);
                    }
                    catch (e){
                      manager.setUserInfo("");
                      data = null;
                    }
                    if(!data || data.errcode){
                      manager.setUserInfo("");
                    }else{
                      this.loginEnable = true;
                      self.loginAction();
                    }
                  }
                  else{
                    if(!cc.sys.isNative){
                        var code = self.getQueryString("code");
                        var roomId = self.getQueryString("roomId");
                        if( roomId ){
                            var info = manager.getUserInfo();
                            if (info.length > 0) {
                              var data = JSON.parse(info);
                              if(!data.errcode){
                                self.sendLoginRequest(data);
                              }else{
                                manager.setUserInfo("");
                              }
                              return;
                            }else{
                              self._get_HREF(roomId);
                            }
                        }
                        if( code ){
                            try{
                                var obj = new XMLHttpRequest();  // XMLHttpRequest对象用于在后台与服务器交换数据
                                var url = "./get_token.php";       
                                obj.open("POST", url, true);
                                obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");  // 添加http头，发送信息至服务器时内容编码类型
                                obj.onreadystatechange = function() {
                                  if (obj.readyState == 4 && (obj.status == 200 || obj.status == 304)) {  // 304未修改
                                      //alert(obj.responseText);
                                      var data = JSON.parse( obj.responseText );
                                      if(!data.errcode){
                                          manager.setUserInfo( obj.responseText );
                                          self.sendLoginRequest( data );
                                      }
                                  }
                                };
                                obj.send("code="+code);
                            }catch(e){
                                //alert(e);
                            }
                        }
                    }
                  }
              },0.5);
            }
        //}
    },
    keyBackListen:function () {
        var _this = this;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,function(e) {
            if(e.keyCode == cc.KEY.back) {
                if(!KQNativeInvoke.isNativeIOS()){
                    jsb.reflection.callStaticMethod(KQNativeInvoke.ANDRIODClassName, "backToDesk", "()V");
                }
            }
        },this);
    },
    //随机生成 num 位 的随机数 含大小写字母及数字
    getRandomAccount:function(num)
    {
        /**
         * 返回一个字母
         */
        function getCharacter(flag){
            var character = "";
            if(flag === "lower"){
                character = String.fromCharCode(Math.floor( Math.random() * 26) + "a".charCodeAt(0));
            }
            if(flag === "upper"){
                character = String.fromCharCode(Math.floor( Math.random() * 26) + "A".charCodeAt(0));
            }
            return character;
        }

        var str = "";
        for(var i=0;i<num;i++)
        {
            var flag = "lower" ;
            var random = Math.floor(Math.random() * 3);
            if(random == 0)
            {
                flag = "upper" ;
                str += getCharacter(flag);
            }else if(random == 1)
            {
                str += getCharacter(flag);
            }else
            {
                str += Math.floor(Math.random() * 10);
            }
        }
        return str;
    },
    getGuestUserInfo:function(){
        let search = window.location.search;
        var openid = "guest_" + this.getRandomAccount(8);
        var unionid = 'guest_' + this.getRandomAccount(8);
        var nickname = this.getRandomAccount(8);
        var testData = '{"openid":"'+openid+'","nickname":"'+nickname+'","unionid":"'+unionid+'","sex":1,"language":"zh_CN","city":"Changsha","province":"Hunan","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/8D8dOtAcDic5Sichv3lxtMXYJgmunTLOLvTT5AFM4zaqKEthZibv8xdWkgjN9Yb4AQnwvSurz27UB29xx81XORwx55XanxqctdD\/0","privilege":[]}';
        return testData;
    },
    onLoad: function () {
        this.keyBackListen();
        if(!cc.sys.isNative && cc.sys.isMobile){
            var canvas = cc.find("Canvas");
            var cvs = canvas.getComponent(cc.Canvas);
        }
        KQGlabolSocketEventHander.start();
        this.socket = cc.find('GameSocket').getComponent('socket');
        var self = this;
        this.loginEnable = false;
        this.socket.receviceMessage = function(response) {
            var data = JSON.parse(response);
            //console.log(data)
            if (data.action == 'checkVersion') {
              try{
                self.checkVersion(data.data);
              }catch(e){
                //this.err.string = e;
              }
            }
            else if (data.action == 'login') {
               if (data.result) {//成功
                   self.socket.userInfo = data.data;//运行时态信息
                   if(!cc.sys.isNative){
                      var roomId = self.getQueryString("roomId");
                      //console.log(roomId);
                      if(roomId){
                        var userId = data.data.id;
                        var exitInRoom = data.data.roomId;
                        if(exitInRoom != ""){
                          roomId = exitInRoom;
                        }
                        Socket.sendLoginJoin(roomId, userId);
                        return;
                      }
                    }
                    self._loadingLabel("登录中");
                   if (data.data.roomId.length > 0) {
                        cc.director.loadScene('play');
                   }
                   else {
                        cc.director.loadScene('hall');
                   }
               }
               else {
                  // self.alertMessage('登录失败!');
               }
           }
        };
        this._registerSocketEvent();

        this.socket.getWxInfo = function(info) {
           manager.setUserInfo(info);//保存本地
           var data = JSON.parse(info);//str -> json(obj)
           self.scheduleOnce(function(){//延迟执行 1s
               self.sendLoginRequest(data);//登录请求
           },1);
        };
        this.getOnlyUserInfoByBrowser();
        //cc.sys.localStorage.removeItem("userinfo");
        // let search = window.location.search;
        // var openid = "JzIwMTcvNi8xNiDkuIrljYgxMMzowOCc=";
        // var unionid = '8dOtAcDic5Sichv3lxtMXYJgmunTLOLv';
        // var nickname = "哇哈哈";


        //var openid = "JzIwMTcvNi8xNiDkuIrljYgxMMzowOCc=";
        //var openid = "guest_" + this.getRandomAccount(8);
        //var unionid = '8dOtAcDic5Sichv3lxtMXYJgmunTLOLv';
        //var unionid = 'guest_' + this.getRandomAccount(8);
        //var nickname = this.getRandomAccount(8);


         //if (search) {
         //    var url = window.location.search;
         //    var loc = url.substring(url.lastIndexOf('=') + 1, url.length);
         //    if (loc == 1) {
         //        openid = 'JzIwMTctNi0xNiAwOTo0NTo1OSc=';
         //        unionid = 'JzIwMTctNi0xNiAwOTo0NTo1OSc';
         //        nickname = loc;
         //    }
         //    else if (loc == 2) {
         //        openid = 'JzIwMTcvNi8xNiDkuIrljYg5OjM4OjMzJw==';
         //        unionid = 'JzIwMTcvNi8xNiDkuIrljYg5OjM4OjMzJw';
         //        nickname = loc;
         //    }
         //    else if (loc == 3) {
         //        openid = 'JzIwMTctNi0xNiAwOTo0NToc=';
         //        unionid = '8dOtAcDic5Sichv3lxtMXYmunTLOLv';
         //        nickname = loc;
         //    }
         //    else if (loc == 4) {
         //        openid = 'ozlXIwgv_QJT0ykdUihaABmsWp2A';
         //        unionid = 'o-3911qWsQsW3wUodqFfUtbsAeNk';
         //        nickname = loc;
         //    }
         //    else if (loc == 5) {
         //        openid = 'JzIwMTcvNi8xNiDkuIrljYgxMDowMzowOCc=';
         //         unionid = 'o-JzIwMTcvNi8xNiDkuIrljYgxMDowM';
         //        nickname = loc;
         //    }else if(loc == 6){
         //        openid = 'JzIwMTcvNi8xNiDkuIrljYgxMMzoc=';
         //         unionid = 'o-zIwMTcvNi8xNiDkuIrl';
         //        nickname = loc;
         //    }
         //
         //}
        // var testData = '{"openid":"'+openid+'","nickname":"'+nickname+'","unionid":"'+unionid+'","sex":1,"language":"zh_CN","city":"Changsha","province":"Hunan","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/8D8dOtAcDic5Sichv3lxtMXYJgmunTLOLvTT5AFM4zaqKEthZibv8xdWkgjN9Yb4AQnwvSurz27UB29xx81XORwx55XanxqctdD\/0","privilege":[]}';


         //if (!cc.sys.isNative){
         //    var info = manager.getUserInfo();
         //    if (info.length > 0) {
         //        //this.showWaitingMessage('已存有账号=====');
         //        //return;
         //    }else
         //    {
         //        //this.showWaitingMessage('新账号=====');
         //        var userInfo = this.getGuestUserInfo();
         //        manager.setUserInfo(userInfo);
         //    }
         //}
    },

    getOnlyUserInfoByBrowser:function()
    {
        var openid = "";
        var unionid = "";
        var nickname = "";

        var testData = "";
        var userInfo = manager.getUserInfo();

        let search = window.location.search;
        if(userInfo.length > 0)
        {
            openid = userInfo.openId;
            unionid = userInfo.unionid;
            nickname = userInfo.nickname;
        }

        if (search) {
            var url = window.location.search;
            var loc = url.substring(url.lastIndexOf('=') + 1, url.length);
            if (loc == 1) {
                openid = 'JzIwMTctNi0xNiAwOTo0NTo1OSc=';
                unionid = 'JzIwMTctNi0xNiAwOTo0NTo1OSc';
                nickname = "guest_1";
                testData = '{"openid":"'+openid+'","nickname":"'+nickname+'","unionid":"'+unionid+'","sex":1,"language":"zh_CN","city":"Changsha","province":"Hunan","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/8D8dOtAcDic5Sichv3lxtMXYJgmunTLOLvTT5AFM4zaqKEthZibv8xdWkgjN9Yb4AQnwvSurz27UB29xx81XORwx55XanxqctdD\/0","privilege":[]}';
            }
            else if (loc == 2) {
                openid = 'JzIwMTcvNi8xNiDkuIrljYg5OjM4OjMzJw==';
                unionid = 'JzIwMTcvNi8xNiDkuIrljYg5OjM4OjMzJw';
                nickname = "guest_2";
                testData = '{"openid":"'+openid+'","nickname":"'+nickname+'","unionid":"'+unionid+'","sex":1,"language":"zh_CN","city":"Changsha","province":"Hunan","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/8D8dOtAcDic5Sichv3lxtMXYJgmunTLOLvTT5AFM4zaqKEthZibv8xdWkgjN9Yb4AQnwvSurz27UB29xx81XORwx55XanxqctdD\/0","privilege":[]}';
            }
            else if (loc == 3) {
                openid = 'JzIwMTctNi0xNiAwOTo0NToc=';
                unionid = '8dOtAcDic5Sichv3lxtMXYmunTLOLv';
                nickname = "guest_3";
                testData = '{"openid":"'+openid+'","nickname":"'+nickname+'","unionid":"'+unionid+'","sex":1,"language":"zh_CN","city":"Changsha","province":"Hunan","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/8D8dOtAcDic5Sichv3lxtMXYJgmunTLOLvTT5AFM4zaqKEthZibv8xdWkgjN9Yb4AQnwvSurz27UB29xx81XORwx55XanxqctdD\/0","privilege":[]}';
            }
            else if (loc == 4) {
                openid = 'ozlXIwgv_QJT0ykdUihaABmsWp2A';
                unionid = 'o-3911qWsQsW3wUodqFfUtbsAeNk';
                nickname = "guest_4";
                testData = '{"openid":"'+openid+'","nickname":"'+nickname+'","unionid":"'+unionid+'","sex":1,"language":"zh_CN","city":"Changsha","province":"Hunan","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/8D8dOtAcDic5Sichv3lxtMXYJgmunTLOLvTT5AFM4zaqKEthZibv8xdWkgjN9Yb4AQnwvSurz27UB29xx81XORwx55XanxqctdD\/0","privilege":[]}';
            }
            else if (loc == 5) {
                openid = 'JzIwMTcvNi8xNiDkuIrljYgxMDowMzowOCc=';
                 unionid = 'o-JzIwMTcvNi8xNiDkuIrljYgxMDowM';
                nickname = "guest_5";
                testData = '{"openid":"'+openid+'","nickname":"'+nickname+'","unionid":"'+unionid+'","sex":1,"language":"zh_CN","city":"Changsha","province":"Hunan","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/8D8dOtAcDic5Sichv3lxtMXYJgmunTLOLvTT5AFM4zaqKEthZibv8xdWkgjN9Yb4AQnwvSurz27UB29xx81XORwx55XanxqctdD\/0","privilege":[]}';
            }else if(loc == 6){
                openid = 'JzIwMTcvNi8xNiDkuIrljYgxMMzoc=';
                 unionid = 'o-zIwMTcvNi8xNiDkuIrl';
                nickname = "guest_6";
                testData = '{"openid":"'+openid+'","nickname":"'+nickname+'","unionid":"'+unionid+'","sex":1,"language":"zh_CN","city":"Changsha","province":"Hunan","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/8D8dOtAcDic5Sichv3lxtMXYJgmunTLOLvTT5AFM4zaqKEthZibv8xdWkgjN9Yb4AQnwvSurz27UB29xx81XORwx55XanxqctdD\/0","privilege":[]}';
            }
        }
         if(testData && testData.length > 0)
         {
             if (!cc.sys.isNative){
                 manager.setUserInfo(testData);
             }
         }
    },
    _registerSocketEvent:function(){
        KQGlobalEvent.on(Socket.Event.ReceiveLoginJoin, this._LoginJoin, this);
        KQGlobalEvent.on(Socket.Event.ReceiveRecordId, this._ReceiveRecordId, this);
        KQGlobalEvent.on(Socket.Event.ReceiveNoUionid, this._ReceiveNoUionid, this);
    }, 
    _get_HREF:function(roomId){
      if(roomId != ROOMID){
        ROOMID = roomId;
        roomId = "%3froomId%3d"+roomId ;
        REDIRECT_URI = REDIRECT_URI+roomId;
        HREF = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+APPID+"&redirect_uri="+REDIRECT_URI+"&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";
      }
    },
    _ReceiveNoUionid:function(response){
      manager.setUserInfo("");
      var self = this;
      var roomId = this.getQueryString("roomId");
      if(roomId){
        //roomId = "%3froomId%3d"+roomId ;
        //REDIRECT_URI = REDIRECT_URI+roomId;
        this._get_HREF(roomId);
      }
      setTimeout(function(){
        self.loadingNode.parent.active = false;
        self.loadingNode.stopAllActions();
      },2000)
      this._loadingLabel("登录失败，请重新登录");
    },
    _ReceiveRecordId:function(response){
        var data = response.data;
        if(data.recordMsg.length>0){
          var record = data.recordMsg[0];
          var playersInfo = JSON.parse(record.playersInfo).players;
          var recordNode = cc.instantiate(this.recordInfo);
          let totalGameResult = recordNode.getComponent("TotalGameResult");
          playersInfo.sort(function(a,b){return b.totalScore-a.totalScore});  // 排序
          totalGameResult.setPlayerInfos(playersInfo,record);
          totalGameResult._clickBtn();
          recordNode.getComponent('alert').alert();
          this.node.addChild(recordNode);
        }
    },
    _LoginJoin: function(response){
        this._loadingLabel("进入房间，正在为您请求数据");
        if (response.result){
            if(cc.from == null) {
                cc.from = {};
            }
            cc.from.ma = response.data.maPai;
            cc.director.loadScene('play');
        } else {
            cc.joinDesk = {};
            cc.director.loadScene('hall');
            let reasonInfo = this._joinReasonMap(response.data.reason);
            cc.joinDesk.result = response.result;
            cc.joinDesk.reason = reasonInfo;
        }
    },
    _joinReasonMap: function (reason) {
      let reasonInfo = {
        notExist: "房间不存在!",
        cardNumber: "您房卡不足!",
      };
      let info = reasonInfo[reason] || "房间已满!";
      return info;
    },

    getQueryString: function(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
        var r = window.location.search.substr(1).match(reg); 
        if (r != null) return unescape(r[2]); return null; 
    },

    agreements: function () {
        this.agreementNode.active = true;
        //this.agreementLabel.string = cc.info1;
        this.agreementLabel.node.y = 0;
    },

    onDestroy: function () {
      this.socket.receviceMessage = function () {};
    },

    _loadingLabel:function(label){
        this.label.string = label;
    },

    sendLoginRequest:function(data) {
        //this.showWaitingMessage('登录中...');
        this.loadingNode.parent.active = true;
        this.loadingNode.runAction(cc.repeatForever(cc.rotateBy(2, 360)));
        //return;
        this.socket.sendMessage('login',data);
    },

    loginAction:function() {
        if (!cc.sys.isNative){
            var info = manager.getUserInfo();
            if (info.length > 0) {
                //this.showWaitingMessage('已存有账号=====');
                //return;
            }else
            {
                //this.showWaitingMessage('新账号=====');
                var userInfo = this.getGuestUserInfo();
                manager.setUserInfo(userInfo);
            }
        }

        var info = manager.getUserInfo();
        if (info.length > 0) {
          var data = JSON.parse(info);
          this.sendLoginRequest(data);
          return;
        }
        if (!cc.sys.isNative){
            // cc.sys.openURL(HREF);
            window.location.href = HREF;
        }else{
          if (KQNativeInvoke.isNativeIOS()) {
            jsb.reflection.callStaticMethod(KQNativeInvoke.IOSClassName,"wxLogin");//IOS
          } else if (KQNativeInvoke.isNativeAndroid()) {//Android
            jsb.reflection.callStaticMethod(KQNativeInvoke.ANDRIODClassName, "wxLogin", "()V");
          }
        }
        
    },

    changeGuestUserInfo:function()
    {
        manager.setUserInfo('');
        this.loginAction();
    },

    loginYkAction:function() {
        //var comp = this.selectNode.getComponent('select');
        //if (!comp.selected) {
        //    this.showMsg = cc.instantiate(this.alertPrefab);
        //    this.canvasNode.addChild(this.showMsg);
        //    let comp = this.showMsg.getComponent('alert');
        //    comp.setMessage('请同意用户协议');
        //    return;
        //}
        var testDate = new Date();
        var time = "'"+testDate.toLocaleString()+"'";
        var openid = new Buffer(time).toString('base64');
        var testData = '{"openid":"'+openid+'","nickname":"游客","sex":1,"language":"zh_CN","city":"Changsha","province":"Hunan","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/BVyz4R8q6puJibEv1hrsaTmIKQhkaTS9FyvcevvC5hlxFnfOuspDjicG0GtzyJXOhNT7g1WZDeCDQhnRdEOgz3QMnP0F9iboQGy\/0","privilege":[]}';
        var data = JSON.parse(testData);
        this.sendLoginRequest(data);

    },

    showWaitingMessage:function(msg) {
        if (this.waitingNode != null && cc.sys.isNative && cc.isValid(this.waitingNode)) {
          if (msg == this.waitingNode.getComponent('alert').getMessage()) {
            return;
          }
            this.waitingNode.removeFromParent();
            this.waitingNode = null;
        }
        this.waitingNode = cc.instantiate(this.waitingPrefab);
        this.canvasNode.addChild(this.waitingNode);
        var comp = this.waitingNode.getComponent('alert');
        //console.log(comp);

        comp.setMessage(msg);
        comp.alert();
    },

    hiddenWaitingMessage:function() {
        if (this.waitingNode != null) {
            this.waitingNode.getComponent('alert').dismissAction();
        }
    },

    protocolAction:function() {
        cc.log('protocol action');
    },
});
