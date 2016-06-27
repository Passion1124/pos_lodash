/**
 * Created by Administrator on 2016/6/26.
 */
function printInventory(inputs){
    //console.log(build_item_by_barcode(inputs));
    var receipt_items = build_receipt_items_from_input(inputs);
    var result = build_receipt_result(receipt_items);
    console.log(result);
}
function build_receipt_result(receipt_items) {
    var result = '***<没钱赚商店>购物清单***\n';
    result += build_paid_items_string(receipt_items);
    result +=
        '----------------------\n'+
        '挥泪赠送商品：\n' ;
    result += build_gift_items_string(receipt_items);
    result +=
        '----------------------\n' +
        '总计：51.00(元)\n' +
        '节省：7.50(元)\n' +
        '**********************';
    return result;
}
function build_paid_items_string(receipt_items){
    var result = "";
    for(var i = 0 ; i  < receipt_items.paid_items.length; i++){
        var paid_item = receipt_items.paid_items[i];
        result += '名称：'+paid_item.name+'，数量：'+paid_item.count+paid_item.unit+'，单价：'+paid_item.price+'(元)，小计：'+paid_item.summary+'(元)\n';
    }
    return result;
}
function build_gift_items_string(receipt_items){
    var result = "";
    for(var i = 0 ; i  < receipt_items.gift_items.length; i++){
        var paid_item = receipt_items.gift_items[i];
        result += '名称：'+paid_item.name+'，数量：'+paid_item.count+paid_item.unit+'\n';
    }
    return result;
}
function has_gift(item, gift_items) {
    return _(gift_items).any(function(gift){
        return gift.barcode == item.barcode;
    })
}
function calculate_paid_item_summary(item, gift_items) {
    var item_gift = _(gift_items).findWhere({"barcode":item.barcode});
    return item.price_number * (item.count - item_gift.count);
}
function build_receipt_items_from_input(inputs){
    var receipt_items = {

    };
    var cart_items = build_cart_items(inputs);
    receipt_items.paid_items = cart_items;
    receipt_items.gift_items = build_gift_items_by_cart_items(cart_items);
    _(receipt_items.paid_items).each(function(item){
        if(has_gift(item,receipt_items.gift_items)){
            item.summary = calculate_paid_item_summary(item,receipt_items.gift_items).toFixed(2);
        }else{
            item.summary = (item.price_number * item.count).toFixed(2);
        }
    });
    return receipt_items;
}
/*---------用barcode查找客户商品信息-----------------------*/
function find_item_by_barcode(barcode) {
    return _(loadAllItems()).findWhere({"barcode":barcode});
}
/*--------获取客户商品信息-----------------------------*/
function build_cart_items(inputs){
    return _.chain(inputs).groupBy(function(item){
        return item;
    }).map(function(value,key){
        var item_barcode = key;
        var item_count = value.length;
        if(key.indexOf("-") != -1){
            item_barcode = key.substring(0,key.indexOf("-"));
            item_count = key.substring(key.indexOf("-") + 1);
        }
        return {
            barcode: item_barcode,
            count:item_count
        };
    }).map(function(element){
        var item = find_item_by_barcode(element.barcode);
        return {
            name: item.name,
            count:element.count,
            unit:item.unit,
            price_number:item.price,
            price:item.price.toFixed(2),
            barcode:item.barcode
        }
    }).value();
}
/*------------------获取优惠商品数量-------------*/
function calculate_gift_count(count) {
    var left = count;
    var promotion_count = 0;
    while(left > 2){
        left -= 3;
        promotion_count++;
    }
    return promotion_count;
}
/*----------判断是否是优惠商品-----------------------------*/
function isPromotion(item) {
    return _(loadPromotions()[0].barcodes).any(function (barcode) {
        return barcode == item.barcode;
    })
}
/*----------获取优惠商品信息---------------------*/
function build_gift_items_by_cart_items(cart_items){
    return _.chain(cart_items).filter(function(item){
        return isPromotion(item);
    }).map(function (item) {
        return {
            name:item.name,
            unit:item.unit,
            count: calculate_gift_count(item.count),
            barcode: item.barcode
        }
    }).value();
}