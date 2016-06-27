//TODO: Please write code in this file.
function printInventory(inputs){
    var changeInputs = ChangeInpus(inputs);
    var buyedBarcodes = ItemCount(changeInputs);
    var buyedItems = BuyedItems(buyedBarcodes);
    var gifts = Gifts(buyedItems);
    var paidItems = PaidItem(buyedItems,gifts);
    var summer = Summer(paidItems,gifts);
    var receipt = Receipt(paidItems,gifts,summer);
    var receiptText = ReceiptText(receipt);
    console.log(receiptText);
}
function ChangeInpus(inputs){
    var result = [];
    for(var i = 0; i < inputs.length; i++){
        if(inputs[i].length != 10){
            var changeinput = inputs[i].split("-");
            for(var j = 0; j < changeinput[1]; j++){
                result.push(changeinput[0]);
            }
        }else{
            result.push(inputs[i]);
        }
    }
    return result;
}
function ItemCount(ChangeInputs){
    var barcords = _.countBy(ChangeInputs);
    var result = [];
    _.forIn(barcords,function(value,key){
        result.push({barcode:key,count:value});
    });
    return result;
}
function BuyedItems(buyedBarcodes){
    var items = loadAllItems();
    var result = [];
    for(var i = 0; i < buyedBarcodes.length; i++){
        for(var j = 0; j < items.length; j++){
            if(buyedBarcodes[i].barcode == items[j].barcode){
                result.push({
                        name:items[j].name,
                        unit:items[j].unit,
                        count:buyedBarcodes[i].count,
                        price:items[j].price,
                        barcode:buyedBarcodes[i].barcode
                })
            }
        }
    }
    return result;
}
function Gifts(buyedItems){
    var promotionItems = loadPromotions();
    var result = [];
    for(var i = 0; i < buyedItems.length; i++){
        for(var j = 0; j < promotionItems[0].barcodes.length; j++){
            if(buyedItems[i].barcode == promotionItems[0].barcodes[j]){
                result.push({
                    name:buyedItems[i].name,
                    unit:buyedItems[i].unit,
                    count:1
                })
            }
        }
    }
    return result;
}
function PaidItem(buyedItems,gifts){
    var result = [];
    for(var i = 0; i < buyedItems.length; i++){
        result.push({
            name:buyedItems[i].name,
            unit:buyedItems[i].unit,
            count:buyedItems[i].count,
            price:buyedItems[i].price,
            subtotal:buyedItems[i].count * buyedItems[i].price
        });
        for(var j = 0; j < gifts.length; j++){
            if(buyedItems[i].name == gifts[j].name){
                result[i].subtotal = (buyedItems[i].count - 1) * buyedItems[i].price;
                break;
            }
        }
    }
    return result;
}
function Summer(paidItems,gifts){
    var result = {};
    for(var i = 0; i < paidItems.length; i++){
        if(!result['total']){
            result['total'] = 0;
        }
        result['total'] += paidItems[i].subtotal;
        for(var j = 0; j < gifts.length; j++){
            if(paidItems[i].name == gifts[j].name){
                if(!result['saved']){
                    result['saved'] = 0;
                }
                result['saved'] += paidItems[i].price;
                break;
            }
        }
    }
    return result;
}
function Receipt(paidItems,gifts,summer){
    var result = {
        paidItems:paidItems,
        gifts:gifts,
        summer:summer
    };
    return result;
}
function ReceiptText(receipt){
    var result = '***<没钱赚商店>购物清单***\n';
    for(var i = 0; i < receipt.paidItems.length; i++){
        result += '名称：'+receipt.paidItems[i].name+'，数量：'+receipt.paidItems[i].count+receipt.paidItems[i].unit+'，单价：'+receipt.paidItems[i].price.toFixed(2)+'(元)，小计：'+receipt.paidItems[i].subtotal.toFixed(2)+'(元)\n'
    }
    result +=
        '----------------------\n'+
        '挥泪赠送商品：\n' ;
    for(var i = 0 ; i < receipt.gifts.length; i++){
        result += '名称：'+receipt.gifts[i].name+'，数量：'+receipt.gifts[i].count+receipt.gifts[i].unit+'\n';
    }
    result +=
        '----------------------\n' +
        '总计：'+receipt.summer.total.toFixed(2)+'(元)\n' +
        '节省：'+receipt.summer.saved.toFixed(2)+'(元)\n' +
        '**********************';
    return result;
}