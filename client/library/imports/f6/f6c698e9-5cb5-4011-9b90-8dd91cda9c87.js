cc.Class({
    'extends': cc.Component,

    properties: {
        nodes: [cc.Node],
        //selectedIndex: 0,
        _selected: 1
    },

    /*####*/
    onLoad: function onLoad() {
        var self = this;
        this._select = true;
        var daikai = 0;
        if (cc.set) {
            daikai = cc.set.setting9;
            this._selected = this._select = daikai;
        }

        for (var i = 0; i < this.nodes.length; i++) {
            var active = this._select;
            this._selected = this._select;
            this.nodes[i].getComponent('select').setSelected(active);
            var title = this.nodes[i].getChildByName('title');
            if (self._select) {
                title.color = new cc.Color(13, 210, 222);
            } else {
                title.color = new cc.Color(255, 255, 255);
            }
        }

        for (var i = 0; i < this.nodes.length; i++) {
            var tComp = this.nodes[i].getComponent('select');
            tComp.index = i;
            tComp.clickAction = function () {
                this.setSelected(self._selected = self._select = !self._select);
                var title = this.node.getChildByName("title");
                if (self._select) {
                    title.color = new cc.Color(13, 210, 222);
                } else {
                    title.color = new cc.Color(255, 255, 255);
                }
                self.onSelectChange(this.index);
            };
        }
        if (this.node._name == "orders" && cc.set) {
            //this.remember_set(overTime);
        }
    },
    remember_set: function remember_set(obj) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].getComponent('select').setSelected(obj);
            this.nodes[i].getChildByName('title').color = new cc.Color(255, 255, 255);
            if (obj) {
                var title = this.nodes[0].getChildByName('title');
                title.color = new cc.Color(13, 210, 222);
            }
        }
    },

    onSelectChange: function onSelectChange(selectIndex) {
        //cc.log(selectIndex);
    }

});