(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/zhuanNumCtrl.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '1b0dfWuicJLYJDmjjT1lmQc', 'zhuanNumCtrl', __filename);
// scripts/zhuanNumCtrl.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        zhuanNumLabel: cc.Label,
        jushu: cc.Node,
        AA: cc.Node,
        _selectedPeopleIndex: null,
        _selectedJushuIndex: null,
        _selectedAAIndex: null
    },

    onLoad: function onLoad() {
        this._ctrl();
    },

    clickPeopleAction: function clickPeopleAction() {
        this._ctrl();
    },

    clickAAAction: function clickAAAction() {
        this._ctrl();
    },

    clickJushuAction: function clickJushuAction() {
        this._ctrl();
    },

    _ctrl: function _ctrl() {
        this._selectedPeopleIndex = this.node.getComponent("singleSelect").selectedIndex;
        this._selectedJushuIndex = this.jushu.getComponent("singleSelect").selectedIndex;
        this._selectedAAIndex = this.AA.getComponent("checkSelect").selectedIndex;
        //人数选2人时且没选上AA制收费
        var renShu = 2;
        if (this._selectedPeopleIndex == 0) {
            renShu = 2;
        } else if (this._selectedPeopleIndex == 1) {
            renShu = 3;
        } else if (this._selectedPeopleIndex == 2) {
            renShu = 4;
        } else if (this._selectedPeopleIndex == 3) {
            renShu = 5;
        }
        var zhuangShi = 20;
        if (this._selectedJushuIndex == 0) {
            zhuangShi = 20;
        } else if (this._selectedJushuIndex == 1) {
            zhuangShi = 40;
        } else if (this._selectedJushuIndex == 2) {
            zhuangShi = 80;
        } else if (this._selectedJushuIndex == 3) {
            zhuangShi = 10;
        }
        //AA
        if (this._selectedAAIndex != null) {
            zhuangShi = Math.ceil(zhuangShi / renShu);
        }
        this.zhuanNumLabel.string = zhuangShi;
        //if(this._selectedPeopleIndex == 0){
        //    if(this._selectedAAIndex == null){
        //局数选10局时
        //if(this._selectedJushuIndex == 0){
        //    this.zhuanNumLabel.string = "10";
        //}
        ////局数选20局时
        //if(this._selectedJushuIndex == 1){
        //    this.zhuanNumLabel.string = "30";
        //}
        ////局数选30局时
        //if(this._selectedJushuIndex == 2){
        //    this.zhuanNumLabel.string = "80";
        //}
        //}
        //    else{
        //        //局数选10局时
        //        if(this._selectedJushuIndex == 0){
        //            this.zhuanNumLabel.string = "8";
        //        }
        //        //局数选20局时
        //        if(this._selectedJushuIndex == 1){
        //            this.zhuanNumLabel.string = "15";
        //        }
        //        //局数选30局时
        //        if(this._selectedJushuIndex == 2){
        //            this.zhuanNumLabel.string = "23";
        //        }
        //    }
        //
        //}
        //人数选3人
        //else if(this._selectedPeopleIndex == 1){
        //    //没选上AA制收费
        //    if(this._selectedAAIndex == null){
        //        //局数选10局时
        //        if(this._selectedJushuIndex == 0){
        //            this.zhuanNumLabel.string = "21";
        //        }
        //        //局数选20局时
        //        if(this._selectedJushuIndex == 1){
        //            this.zhuanNumLabel.string = "42";
        //        }
        //        //局数选30局时
        //        if(this._selectedJushuIndex == 2){
        //            this.zhuanNumLabel.string = "60";
        //        }
        //    }
        //    //选了AA收费
        //    else{
        //        //局数选10局时
        //        if(this._selectedJushuIndex == 0){
        //            this.zhuanNumLabel.string = "7";
        //        }
        //        //局数选20局时
        //        if(this._selectedJushuIndex == 1){
        //            this.zhuanNumLabel.string = "14";
        //        }
        //        //局数选30局时
        //        if(this._selectedJushuIndex == 2){
        //            this.zhuanNumLabel.string = "20";
        //        }
        //    }
        //
        //}
        ////人数选4人且没选上AA制收费
        //else{
        //    if(this._selectedAAIndex == null){
        //        //局数选10局时
        //        if(this._selectedJushuIndex == 0){
        //            this.zhuanNumLabel.string = "28";
        //        }
        //        //局数选20局时
        //        if(this._selectedJushuIndex == 1){
        //            this.zhuanNumLabel.string = "56";
        //        }
        //        //局数选30局时
        //        if(this._selectedJushuIndex == 2){
        //            this.zhuanNumLabel.string = "84";
        //        }
        //    }
        //    //AA制收费选上了
        //    else{
        //        //局数选10局时
        //        if(this._selectedJushuIndex == 0){
        //            this.zhuanNumLabel.string = "7";
        //        }
        //        //局数选20局时
        //        if(this._selectedJushuIndex == 1){
        //            this.zhuanNumLabel.string = "14";
        //        }
        //        //局数选30局时
        //        if(this._selectedJushuIndex == 2){
        //            this.zhuanNumLabel.string = "21";
        //        }
        //    }
        //}
    }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=zhuanNumCtrl.js.map
        