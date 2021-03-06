
<script>

    function CardManager() {

        this.description = function () {
            console.log('description');
        };

        /*获取牌*/
        this.getCards = function () {

        };
    }

    /*洗牌
     v要洗的牌
     */
    CardManager.shuffle = function (v) {
        for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    };


    /*判断是否是顺子*/
    CardManager.isShunZi = function (cards, minLength) {
        if (cards.length < minLength) {
            return false;
        }

        var points = cards.map(function (card) {
            return card.number;
        }).sort(function (n1, n2) {
            return n1 - n2;
        });

        var point = points[0];
        for (var index in points) {
            var e = points[index];
            if (e != point) {
                return false;
            }

            point = point + 1;
        }

        return true;
    };

    /*牌去重*/
    CardManager.GetRepeatFwxmmc = function (ary1,type){

        if(type) {

            ary1.sort(function(a,b){return a.number - b.number;});//数组排序

        }
        else {

            ary1.sort(function(a,b){return b.number - a.number;});//数组排序

        }

        var newCard = [],

                cardNumber = []; //红心

        for(var i = 0; i < ary1.length; i++){

            if(ary1[i]){

                if(cardNumber.indexOf(ary1[i].number) == -1){

                    cardNumber.push(ary1[i].number);

                    newCard.push(ary1[i]);

                }
            }

        }

        return newCard;

    }

    /*根据点数寻找牌索引*/
    CardManager._findNumberLength = function (cards, length) {

        if (cards.length < length) return [];

        var obj = cards.reduce(function(obj, card, index) {

            var pointIndexs = obj[card.number] || [];

            obj[card.number] = pointIndexs;

            pointIndexs.push(index);

            return obj;

        }, {});

        var result = [];

        for (var prop in obj) {

            var pointIndexs = obj[prop];

            while(pointIndexs.length > length){//有多的分割多个数组

                var splices = pointIndexs.splice(0,length);

                if (splices.length >= length) result.push(splices);

            }

            if (pointIndexs.length >= length) result.push(pointIndexs);

        }

        CardManager.shuffle (result);//洗牌

        return result.length > 0 ? result : [];
    };

    /*根据花色寻找牌索引*/
    CardManager._findSuitLength = function (cards) {

        var obj = cards.reduce(function(obj, card, index) {

            var pointIndexs = obj[card.suit] || [];

            obj[card.suit] = pointIndexs;

            pointIndexs.push(index);

            return obj;

        }, {});

        var result = [];

        for (var prop in obj) {

            var pointIndexs = obj[prop] || [];

            if (pointIndexs.length >= 3){

                CardManager.shuffle(pointIndexs);

                result.push(pointIndexs);

            }
        }

        CardManager.shuffle(result);
        //result.sort(function(a,b){return b.length - a.length;});
        return result.length > 0 ? result : [];
    };

    /*根据索引寻找牌*/
    CardManager._findCards = function (indexs,cards) {

        var cardsAyy = [];

        for(var i = 0; i < indexs.length; i++){

            var index = indexs[i];

            if(cards[index]) cardsAyy.push(cards[index]);

        }

        return cardsAyy;
    };

    /*从所有牌中删除手牌
     * cardsAyy array 持有牌
     * cards array 所有牌
     * */
    CardManager._delCards = function (cardsAyys,card) {
        cardsAyys = cardsAyys || [];
        if(cardsAyys.length == 0 ) return card;

        var cards = card.filter(function(i){return i;});

        var cardsAyy = cardsAyys.filter(function(i){return i;});

        for(var i = 0; i < cardsAyy.length; i++){//从所有牌中删除取出的牌

            var id = cardsAyy[i].id;

            for(var j = 0; j < cards.length; j++){

                var cardsId = cards[j].id;

                if(cardsId == id){

                    cards.splice(j,1)

                    break;
                }

            }

        }

        return cards || [];
    };

    /*寻找牌复数牌*/
    CardManager._findFuShuCard = function (cards,length) {

        var re = [];

        var index = CardManager._findNumberLength(cards, length);

        if(index.length >= 1) re = index.slice(0, 1)[0];

        if(re.length >= length){

            var result = CardManager._findCards(re,cards);

            return result;

        }else{

            return [];

        }

    };

    /*寻找牌对子*/
    CardManager._findDuiZi = function (cards) {
        var length = 2;

        var result = CardManager._findFuShuCard(cards,length);

        return result.length >= length ? result : [];
    };

    /*寻找牌三条*/
    CardManager._findSanTiao = function (cards) {
        var length = 3;

        var result = CardManager._findFuShuCard(cards,length);

        return result.length >= length ? result : [];
    };

    /*寻找牌顺子*/
    CardManager._findShunZi = function (cards,length, sortType) {

        if(cards.length < length) return [];

        var uniqueCards = CardManager.GetRepeatFwxmmc(cards, sortType);

        for (var start = 0; (start + length) <= uniqueCards.length; ++start) {//顺子

            var subCards = uniqueCards.slice(start, start + length).filter(function(asdf){ return asdf;});

            if (CardManager.isShunZi(subCards, length)) {


                return subCards;

            }

        }

        return [];
    };

    /*寻找牌葫芦*/
    CardManager._findHuLu = function (cards) {

        var result = [],
                SanTiao = CardManager._findFuShuCard(cards,3);

        if(SanTiao.length >= 3){

            cards = CardManager._delCards(SanTiao,cards) || [];

            var Liang = CardManager._findFuShuCard(cards,2);

            if(Liang.length >= 2){

                result = SanTiao.concat(Liang);

                return result;

            }else{
                return [];
            }
        }
        else{
            return [];
        }

    };

    /*寻找牌铁支*/
    CardManager._findTieZhi = function (cards) {
        var length = 4;

        var result = CardManager._findFuShuCard(cards,length);
        //console.log(result)
        return result.length >= length ? result : [];
    };

    /*寻找牌同花顺*/
    CardManager._findTongHuaShun = function (cards, length) {
        if(!length) length = 5;

        if(cards.length < length) return [];

        var cardsIndex = CardManager._findSuitLength(cards);

        for(var q = 0; q < cardsIndex.length; q++){

            var cardIndex = cardsIndex[q] || [];

            var cardsAyy = [];//这是同花的牌

            for(var i = 0; i < cardIndex.length; i++){

                var index = cardIndex[i];

                cardsAyy.push(cards[index]);

            }

            var resule = CardManager._findShunZi(cardsAyy, length);

            if(resule.length == length) return resule;
        }

        return [];

    };

    /*寻找牌五同*/
    CardManager._findWuTong = function (cards) {
        var length = 5;

        var result = CardManager._findFuShuCard(cards,length);

        return result.length >= length ? result : [];
    };

    /*寻找牌六对半*/
    CardManager._findLiuDuiBan = function (cards) {

        var liuDuiBanIndex = [],
                length = 12;

        if(parseInt(Math.random() * 2) == 1){//铁支 铁支 对子 三条 50%
            var t1 = CardManager._findTieZhi(cards);

            cards = CardManager._delCards(t1,cards) || [];

            var t2 = CardManager._findTieZhi(cards);

            cards = CardManager._delCards(t2,cards) || [];

            var d = CardManager._findDuiZi(cards);

            cards = CardManager._delCards(d,cards) || [];

            var s = CardManager._findSanTiao(cards);

            cards = CardManager._delCards(s,cards) || [];

            liuDuiBanIndex = t1.concat(t2).concat(d).concat(s);

            return liuDuiBanIndex.length >= length ? liuDuiBanIndex : [];
        }

        else{

            if(parseInt(Math.random() * 2) == 1){//铁支 铁支 对子 对子 25%

                var t1 = CardManager._findTieZhi(cards);

                cards = CardManager._delCards(t1,cards) || [];

                var t2 = CardManager._findTieZhi(cards);

                cards = CardManager._delCards(t2,cards) || [];

                var d1 = CardManager._findDuiZi(cards);

                cards = CardManager._delCards(d1,cards) || [];

                var d2 = CardManager._findDuiZi(cards);

                cards = CardManager._delCards(d2,cards) || [];

                liuDuiBanIndex = t1.concat(t2).concat(d1).concat(d2);

                return liuDuiBanIndex.length >= length ? liuDuiBanIndex : [];
            }
            else{//双同花顺
                var t1 = CardManager._findTongHuaShun(cards,6);

                cards = CardManager._delCards(t1,cards) || [];

                var t2 = CardManager._findTongHuaShun(cards,6);

                cards = CardManager._delCards(t2,cards) || [];

                var retule = [];

                if(t1.length + t2.length == length){

                    if(t1[0].number == t2[0].number) retule = t1.concat(t2)

                }

                if(retule.length >= length){

                    return retule;

                }
                else{//普通六对半
                    var duiZis = CardManager._findNumberLength(cards, 2);

                    if(duiZis.length >= 6){//六对半

                        while(liuDuiBanIndex.length < 12){

                            var s = duiZis.splice(0,1)[0];

                            liuDuiBanIndex = liuDuiBanIndex.concat(s);

                        }

                        liuDuiBanIndex = liuDuiBanIndex.slice(0,12);
                    }

                    var result = CardManager._findCards(liuDuiBanIndex,cards) || [];

                    return result;

                }
            }

        }

        return [];

    };

    /*寻找牌三同花*/
    CardManager._findSanTongHua = function (cards) {
        if (cards.length < 13) return [];
        var Tong = [];

        if(parseInt(Math.random() * 5) == 1){//同花顺

            Tong = CardManager._findTongHuaShun(cards,5);

            cards = CardManager._delCards(Tong,cards) || [];

            if(parseInt(Math.random() * 10) == 1) {

                Tong = Tong.concat(CardManager._findTongHuaShun(cards,5));

                cards = CardManager._delCards(Tong,cards) || [];

            }

        }

        var cardsIndex = CardManager._findSuitLength(cards),
                result = [];

        if(cardsIndex.length == 2){

            for(var i=0;i<cardsIndex.length;i++) {
                if(cardsIndex[i].length >= 8){
                    result = result.concat(cardsIndex[i].slice(0,5));
                    cardsIndex.splice(i,1);
                    break;
                }
            }

            for(var i=0;i<cardsIndex.length;i++) {
                if(cardsIndex[i].length >= 5){
                    result = result.concat(cardsIndex[i].slice(0,5));
                    cardsIndex.splice(i,1);
                    break;
                }
            }
        }
        else if(cardsIndex.length == 1){

            result = result.concat(cardsIndex[0].slice(0,13));

        }
        else{
            for(var i=0;i<cardsIndex.length;i++) {
                if(cardsIndex[i].length >= 5){
                    result = result.concat(cardsIndex[i].slice(0,5));
                    cardsIndex.splice(i,1);
                    break;
                }
            }

            for(var i=0;i<cardsIndex.length;i++) {
                if(cardsIndex[i].length >= 5){
                    result = result.concat(cardsIndex[i].slice(0,5));
                    cardsIndex.splice(i,1);
                    break;
                }
            }

            for(var i=0;i<cardsIndex.length;i++) {
                if(cardsIndex[i].length >= 3){
                    result = result.concat(cardsIndex[i].slice(0,3));
                    cardsIndex.splice(i,1);
                    break;
                }
            }
        }

        if(result.length == 13){
            result =  CardManager._findCards(result,cards);

            result = result.concat(Tong)

            while(result.length > 13){//同花顺
                result.splice(0,1);
            }
            //var resultsCard = CardManager._findCards(result,cards);
            return result;
        }else{
            return [];
        }

    };

    /*寻找牌三顺子*/
    CardManager._findSanShunZi = function (card) {

        if (card.length < 13) return [];

        var cards = card.filter(function(q){return q;});

        var resule = [];

        if(parseInt(Math.random() * 2) != 1){
            resule = resule.concat(CardManager._findShunZi(cards,5));
        }else{
            resule = resule.concat(CardManager._findTongHuaShun(cards,5));
        }

        cards = CardManager._delCards(resule,cards) || [];

        if(parseInt(Math.random() * 2) != 1){
            resule = resule.concat(CardManager._findShunZi(cards, 5, true));
        }else{
            resule = resule.concat(CardManager._findTongHuaShun(cards, 5));
        }

        cards = CardManager._delCards(resule,cards) || [];

        resule = resule.concat(CardManager._findShunZi(cards,3));

        cards = CardManager._delCards(resule,cards) || [];

        if(resule.length == 13){

            return resule;

        }else{

            return [];

        }
        //resule.length == 13 ? return resule: return [];

    };

    /*所有牌的类型*/
    CardManager._getAllTypeCard = function (cards) {

        var findFuncs = [
            CardManager._findWuTong,
            CardManager._findTongHuaShun,
            CardManager._findTieZhi,
            CardManager._findHuLu,
            CardManager._findSanTiao
        ];
        if(parseInt(Math.random() * 15) == 1){
            var findFuncs1 = [
                CardManager._findLiuDuiBan,
                CardManager._findSanTongHua,
                CardManager._findSanShunZi
            ];
            findFuncs = findFuncs.concat(findFuncs1);
        }
        else{
            var findFuncs1 = [
                CardManager._findWuTong,
                CardManager._findTongHuaShun,
                CardManager._findTieZhi,
                CardManager._findHuLu,
                CardManager._findSanTiao
            ];
            findFuncs = findFuncs.concat(findFuncs1);
        }

        CardManager.shuffle(findFuncs);

        var result = [];

        // //先来一发至尊青龙吧
        // if(parseInt(Math.random() * 50) == 7){

        //     var qLong = CardManager._findTongHuaShun(cards,13);

        //     if(qLong.length > 1) result.push(qLong);

        //     cards = CardManager._delCards(qLong,cards) || [];

        // }

        // //再来一发一条龙吧
        // else if(parseInt(Math.random() * 50) == 0){

        //     var long = CardManager._findShunZi(cards,13);

        //     if(long.length > 1) result.push(long);

        //     cards = CardManager._delCards(long,cards) || [];

        // }

        for (var i = 0; i < findFuncs.length; ++i) {

            var re6 = [];

            var func = findFuncs[i];

            re6 = (func.bind(CardManager))(cards);

            cards = CardManager._delCards(re6,cards) || [];

            if(re6.length > 1) result.push(re6);

        }

        CardManager.shuffle(result);

        //var asdf = [];
        //for (var i = 0; i < result.length; ++i) {
        //    var func = result[i];
        //    asdf = asdf.concat(func);
        //}
        //asdf.sort(function(a,b){
        //    return a.id - b.id;
        //})
        //var qwe = [];
        //var qwe1 = [];
        //for (var i = 0; i < asdf.length; ++i) {
        //    var func = asdf[i];
        //    if(qwe.indexOf(func.id) == -1){
        //        qwe.push(func.id);
        //    }else{
        //        qwe1.push(func.id);
        //    }
        //}
        //console.log(result)
        //console.log(asdf)
        //console.log(1)

        return result;

    };

    /* 3 5 5 */
    CardManager._find100 = function (cards) {
        var findFuncs = [
            CardManager._findWuTong,
            CardManager._findWuTong,
            CardManager._findSanTiao,
        ];
        var result = [];
        CardManager.shuffle(findFuncs);
        for (var i = 0; i < findFuncs.length; ++i) {

            var re6 = [];

            var func = findFuncs[i];

            re6 = (func.bind(CardManager))(cards);

            cards = CardManager._delCards(re6,cards) || [];

            if(re6.length > 1) result = result.concat(re6);

        }

        if(result.length > 13){
            return CardManager._findLiuDuiBan(cards);
        }

        return result;
    };

    /* 特殊牌或者 3 4 5  */
    CardManager._find8090 = function (cards) {
        var findFuncs = [
            CardManager._findSanShunZi,
            CardManager._findSanTongHua,
            CardManager._findLiuDuiBan,
        ];

        CardManager.shuffle(findFuncs);

        if(parseInt(Math.random() * 6) == 0){
            findFuncs = findFuncs.slice(0,1);
        }else{
            findFuncs = [
                CardManager._findWuTong,
                CardManager._findTieZhi,
                CardManager._findSanTiao,
            ];
        }

        var result = [];
        for (var i = 0; i < findFuncs.length; ++i) {

            var re6 = [];

            var func = findFuncs[i];

            re6 = (func.bind(CardManager))(cards);

            cards = CardManager._delCards(re6,cards) || [];

            if(re6.length > 1) result = result.concat(re6);

        }
        console.log(result)
        return result;
    };

    /* 4 4 或者 4 同花顺  */
    CardManager._find70 = function (cards) {
        var findFuncs = [];

        if(parseInt(Math.random() * 2) == 0){
            findFuncs = [
                CardManager._findTieZhi,
                CardManager._findTieZhi,
            ];

        }else{
            findFuncs = [
                CardManager._findTieZhi,
                CardManager._findTongHuaShun,
            ];
        }
        CardManager.shuffle(findFuncs);
        var result = [];
        for (var i = 0; i < findFuncs.length; ++i) {

            var re6 = [];

            var func = findFuncs[i];

            re6 = (func.bind(CardManager))(cards);

            cards = CardManager._delCards(re6,cards) || [];

            if(re6.length > 1) result = result.concat(re6);

        }
        //console.log(result)
        //console.log(findFuncs)
        return result;
    };

    /* 葫芦 葫芦 对子 或者 三条 葫芦 对子  */
    CardManager._find60 = function (cards) {
        var findFuncs = [];

        if(parseInt(Math.random() * 2) == 0){
            findFuncs = [
                CardManager._findHuLu,
                CardManager._findHuLu,
                CardManager._findDuiZi,

            ];

        }else{
            findFuncs = [
                CardManager._findSanTiao,
                CardManager._findHuLu,
                CardManager._findDuiZi,
            ];
        }
        CardManager.shuffle(findFuncs);
        var result = [];
        for (var i = 0; i < findFuncs.length; ++i) {

            var re6 = [];

            var func = findFuncs[i];

            re6 = (func.bind(CardManager))(cards);

            cards = CardManager._delCards(re6,cards) || [];

            if(re6.length > 1) result = result.concat(re6);

        }
        return result;
    };

    /* 5 2 或者 2 同花顺  */
    CardManager._find50 = function (cards) {
        var findFuncs = [];

        if(parseInt(Math.random() * 2) == 0){
            findFuncs = [
                CardManager._findWuTong,
                CardManager._findDuiZi,
            ];

        }else{
            findFuncs = [
                CardManager._findTongHuaShun,
                CardManager._findDuiZi,
            ];
        }
        CardManager.shuffle(findFuncs);
        var result = [];
        for (var i = 0; i < findFuncs.length; ++i) {

            var re6 = [];

            var func = findFuncs[i];

            re6 = (func.bind(CardManager))(cards);

            cards = CardManager._delCards(re6,cards) || [];

            if(re6.length > 1) result = result.concat(re6);

        }
        return result;
    };

    /* 4 2 或者 4 */
    CardManager._find40 = function (cards) {
        var findFuncs = [
            CardManager._findTieZhi,
        ];

        if(parseInt(Math.random() * 2) == 0){

            findFuncs.push(CardManager._findDuiZi);

        }
        var result = [];
        for (var i = 0; i < findFuncs.length; ++i) {

            var re6 = [];

            var func = findFuncs[i];

            re6 = (func.bind(CardManager))(cards);

            cards = CardManager._delCards(re6,cards) || [];

            if(re6.length > 1) result = result.concat(re6);

        }
        return result;
    };

    /* 4 */
    CardManager._find30 = function (cards) {
        var findFuncs = [
            CardManager._findTieZhi,
        ];
        var result = [];
        for (var i = 0; i < findFuncs.length; ++i) {

            var re6 = [];

            var func = findFuncs[i];

            re6 = (func.bind(CardManager))(cards);

            cards = CardManager._delCards(re6,cards) || [];

            if(re6.length > 1) result = result.concat(re6);

        }
        return result;
    };

    /* 葫芦 */
    CardManager._find20 = function (cards) {
        var findFuncs = [
            CardManager._findHuLu,
        ];
        var result = [];
        for (var i = 0; i < findFuncs.length; ++i) {

            var re6 = [];

            var func = findFuncs[i];

            re6 = (func.bind(CardManager))(cards);

            cards = CardManager._delCards(re6,cards) || [];

            if(re6.length > 1) result = result.concat(re6);

        }
        return result;
    };

    /* 3 */
    CardManager._find10 = function (cards) {
        var findFuncs = [
            CardManager._findSanTiao,
        ];
        var result = [];
        for (var i = 0; i < findFuncs.length; ++i) {

            var re6 = [];

            var func = findFuncs[i];

            re6 = (func.bind(CardManager))(cards);

            cards = CardManager._delCards(re6,cards) || [];

            if(re6.length > 1) result = result.concat(re6);

        }
        return result;
    };

    /***
     * 先按照几率分配
     */
    CardManager._assignCard = function (players,  cards) {
        //var findFuncs = [
        //    CardManager._find10,//0
        //    CardManager._find20,//1
        //    CardManager._find30,//2
        //    CardManager._find40,//3
        //    CardManager._find50,//4
        //    CardManager._find60,//5
        //    CardManager._find70,//6
        //    CardManager._find8090,//7
        //    CardManager._find8090,//8
        //    CardManager._find100,//9
        //];
        //
        //for (var i = 0;i < players.length;i++) {
        //    /*清空用记手上的牌*/
        //    players[i].cards = [];
        //    // players[i].hong = 10;
        //
        //    var chanceIndex = parseInt(parseInt(players[i].hong) / 10) - 1;
        //
        //    if(chanceIndex >= 0){
        //
        //        var func = findFuncs[chanceIndex];
        //
        //        var re6 = (func.bind(CardManager))(cards);
        //
        //        players[i].cards = re6;
        //
        //        cards = CardManager._delCards(re6,cards) || [];
        //    }
        //
        //}
        //
        //return cards || [];


        var suitColorMap = new Array(4)
        suitColorMap['s'] = 4;
        suitColorMap['h'] = 3;
        suitColorMap['c'] = 2;
        suitColorMap['d'] = 1;

        var cardNames = cards.map(function (card) {
            var cardNumber = card.number;
            var color = suitColorMap[card.suit];
            var number = Math.max(Math.min(cardNumber, 13), 1);
            return color + '_' + number;
        });

        for(var i = 0; i < players.length; i++){
            var player = players[i];
            var waiGuaCardNames = player.cardsZuoBi/*.map(function (card) {
             var cardNumber = card.number;
             var color = suitColorMap[card.suit];
             var number = Math.max(Math.min(cardNumber, 13), 1);
             return color + '_' + number;
             });*/
            player.cards = player.cardsZuoBi.map(function (cardName) {
                var cardNumber = card.number;
                var color = suitColorMap[card.suit];
                var number = Math.max(Math.min(cardNumber, 13), 1);
                var str = cardName.split("_");

                return color + '_' + number;
            });
            for(var i = 0; i < waiGuaCardNames.length;i++){//删除选中的牌
                var s = waiGuaCardNames[i];
                var indexs = cardNames.indexOf(s);
                cards.splice(indexs,1);
                cardNames.splice(indexs,1);
            }
        }



        return cards || [];

    };

    CardManager.faPai = function (players,cards) {

        for (var i = 0;i < players.length;i++) {

            if(players[i].cards.length < 13){

                players[i].cards.push(cards.splice(0,1)[0]);

                CardManager.faPai(players,cards);

            }
        }

    };

    CardManager.deal = function (cards) {

        /*CardManager._findWuTong,五同
         CardManager._findTongHuaShun,三同花顺
         CardManager._findTieZhi,铁支
         CardManager._findHuLu,葫芦
         CardManager._findSanTiao三条

         CardManager._findLiuDuiBan,六对半
         CardManager._findSanTongHua,三同花
         CardManager._findSanShunZi三顺子
         CardManager._findTongHuaShun(cards,13);//先来一发至尊青龙
         CardManager._findShunZi(cards,13)一条龙*/

        var suitColorMap = new Array(4);

        suitColorMap['s'] = 4;

        suitColorMap['h'] = 3;

        suitColorMap['c'] = 2;

        suitColorMap['d'] = 1;
        var re1 = CardManager._findLiuDuiBan(cards).map(function (card) {

            var cardNumber = card.number;

            var color = suitColorMap[card.suit];

            var number = Math.max(Math.min(cardNumber, 13), 1);

            return color + '_' + number;

        });

        console.log(re1);
        return re1;

    };


    CardManager.Card = function () {
        function Card() {
            this.suit = '';//花色
            this.number = 0;//数字
            this.id = 0;//数字
        }

        var cards = [],
                id = 0,
                type = ['s','h','c','d','d'];
        for (var i = 0;i < type.length;i++) {
            for (var j = 1;j< 14;j++) {
                var card = new Card();
                card.suit = type[i];
                card.number = j;
                card.id = id;
                cards.push(card);
                id++;
            }
        }
        return cards;
    };

    var cards = CardManager.Card();

    CardManager.deal(cards);

</script>





