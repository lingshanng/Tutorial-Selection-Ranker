var _activityColorMap = {}
var _classData = []

function createActivityColorMap(activities) { // remove
    var colorList = []; 

    $.each(['.sp-palette-row-3','.sp-palette-row-4', '.sp-palette-row-3', '.sp-palette-row-1'], function(i, selector) {
        var el = $(selector);
        if (el.length) {
            el.first().children().each(function() {
                colorList.push($(this).attr('title'));
            }); 
        }
    });
    
    colorList.reverse();
    activities.forEach((activity, i) => {
        var color = colorList.pop();
        _activityColorMap[activity] = color;
    })
}

$(function(){
    $('#hidden-picker').spectrum({
        type: "color",
        showPalette: "false",
        showPaletteOnly: "true",
        showAlpha: "false",
        showButtons: "false",
        allowEmpty: "false",    
    });

    chrome.storage.sync.get(function(data){
        console.log(data);
        if(!data.allData || !data.allData.classes) {
            chrome.storage.sync.set({'allData': {'classes': [],'activityColorMap': {}}})
        } else {
            _activityColorMap = data.allData.activityColorMap;
            _classData = data.allData.classes;
            updateTable(data.allData.classes, data.allData.activityColorMap);
        }
    })

    
    
    $('#scrape').click(function(){
        const url = "https://myedurec.nus.edu.sg/*";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            if(tabs && tabs.length !== 0) {
                console.log('tabs', tabs)
                chrome.tabs.sendMessage(tabs[0].id, {action: "clickScrape"});
            } else {
                console.log('wrong tab')
            }
        })
    });
    $('#reset').click(function(){
        chrome.storage.sync.set({'allData': {'classes': [], 'activityColorMap': {}}});
    })
    $('#compare').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {action: "compare"});
        })
    })
    $('#applyRanking').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {action: "applyRanking"});
        })
    })
    $('#openWindow').click(function(){
        chrome.tabs.create({url: chrome.extension.getURL('popup.html#window')});
    })
    $('#shiftDialog').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {action: "shiftDialog"});
        })
    })

    $('#classTable').on('reorder-row.bs.table', function (e, newRankedClasses){
        newRankedClasses.forEach((item, i) => {
            item.rank = i+1;
        })
        chrome.storage.sync.set({'allData': {'classes': newRankedClasses, 'activityColorMap': _activityColorMap}});
    });
});

function updateActivityColorMap(classData, activityColorMap) {
    const currActs = [...new Set(classData.map(d => d.activity))];
    const coloredActs = Object.keys(activityColorMap);
    const toRemove = coloredActs.filter(act => !currActs.includes(act));
    const toAdd = currActs.filter(act => !coloredActs.includes(act));
    if(toRemove === [] && toAdd === []) {
        return
    }
    toRemove.forEach(function(act) {
        delete activityColorMap[act];
    })
    
    var colorList = [];
    $.each(['.sp-palette-row-3','.sp-palette-row-4', '.sp-palette-row-3', '.sp-palette-row-1'], function(i, selector) {
        var el = $(selector);
        if (el.length) {
            el.first().children().each(function() {
                colorList.push($(this).attr('title'));
            }); 
        }
    });
  
    colorList.reverse() 
    const usedColors = Object.values(activityColorMap);
    console.log(usedColors)
    colorList = colorList.filter(c => !usedColors.includes(c));
    toAdd.forEach((activity, i) => {
        var color = colorList.pop();
        activityColorMap[activity] = color;
    })
    chrome.storage.sync.set({'allData': {'classes': classData, 'activityColorMap': activityColorMap}});
}

function updateTable(classData, activityColorMap) {
    $('#classTable').bootstrapTable('destroy');
    $('#classTable').bootstrapTable({data: classData, columns:[
        {
            field: 'classId',
            title: 'Class',
            width: 100
        },
        {
            field: 'activity',
            title: 'Module Activity',
            width: 100
        },
        {
            field: 'session',
            title: 'Session',
            width: 50
        },
        {
            field: 'vacancy',
            title: 'Vacancy',
            width: 50
        },
        {
            field: 'rank',
            title: 'Rank',
            width: 50
        },
        {
            field: 'color',
            title: 'Color',
            width: 50,
            formatter: colorPickerFormatter,
            cellStyle: colorColStyle,
        }],
        theadClasses: 'thead-dark'
    });

    $('.color-picker').spectrum({
        type: "color",
        showPalette: "false",
        showPaletteOnly: "true",
        showAlpha: "false",
        showButtons: "false",
        allowEmpty: "false",    
        change: function(color) {
            const colorHex = $(this).spectrum('get').toHexString()
            const i = $('.color-picker').index($(this))
            chrome.storage.sync.get(function(data){
                var activity = data.allData.classes[i].activity;
                data.allData.activityColorMap[activity] = colorHex;
                chrome.storage.sync.set({'allData': data.allData})
            })
        }
      });
    $('.color-picker').each(function(i, element) {
        $(element).spectrum("set", activityColorMap[classData[i].activity])
    })
}


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}

function textColor(hex) {
    const rgb = hexToRgb(hex);
    return rgb && (rgb.r*0.299 + rgb.g*0.587 + rgb.b*0.114) < 135
        ? "#ffffff"
        : "#000000"
}


function rowStyle(row, index) {
    var bgdColor = _activityColorMap[row.activity];
    return {
        css: {
            'background-color': bgdColor,
            color: textColor(bgdColor)
          }
    }
}

function colorColStyle(value, row, index) {
    return {
        css: {
            'background-color': '#ffffff',
          }
    }
}

function colorPickerFormatter(value, row, index) {
    return '<input class="color-picker" />'
}

chrome.storage.onChanged.addListener(function(changes, storageName){
    if(changes.allData.newValue) { 
        console.log('storage changed', changes.allData.newValue);
        _activityColorMap = changes.allData.newValue.activityColorMap;
        _classData = changes.allData.newValue.classes;
        updateActivityColorMap(changes.allData.newValue.classes, changes.allData.newValue.activityColorMap);
        updateTable(changes.allData.newValue.classes, changes.allData.newValue.activityColorMap);
    }
});
