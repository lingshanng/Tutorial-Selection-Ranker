// used in functions which can't use chrome.storage.sync.get e.g rowStyle

var _allData = { 'classes': [], 'removed':[], 'activityColorMap': {} };

$(function () {
    $('#hidden-picker').spectrum({
        type: "color",
        showPalette: "false",
        showPaletteOnly: "true",
        showAlpha: "false",
        showButtons: "false",
        allowEmpty: "false",
    });

    chrome.storage.sync.get(function (data) {
        console.log(data);
        if (!data.allData || !data.allData.classes) {
            chrome.storage.sync.set({ 'allData': { 'classes': [], 'removed': [], 'activityColorMap': {} } });
        } else {
            _activityColorMap = data.activityColorMap
            _allData = data.allData;
            initialiseTables();
            updateTable(data.allData.classes, data.allData.removed, data.allData.activityColorMap);
        }
    })


    $('#test').click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "test" });
        })
    });
    $('#scrape').click(function () {
        const url = "https://myedurec.nus.edu.sg/*";
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs && tabs.length !== 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "clickScrape" });
            } else {
                console.log('wrong tab')
            }
        })
    });
    $('#reset').click(function () {
        chrome.storage.sync.set({ 'allData': { 'classes': [], 'removed': [], 'activityColorMap': {} } });
    })
    $('#compare').click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "compare" });
        })
    })
    $('#applyRanking').click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "applyRanking" });
        })
    })
    $('#openWindow').click(function () {
        chrome.tabs.create({ url: chrome.extension.getURL('popup.html#window') });
    })
    $('#shiftDialog').click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "shiftDialog" });
        })
    })
    $('#applyColor').click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "applyColor" });
        })
    })

    $('#classTable').on('reorder-row.bs.table', function (e, newRankedClasses) {
        newRankedClasses.forEach((item, i) => {
            item.rank = i + 1;
        })
        _allData.classes = newRankedClasses;
        chrome.storage.sync.set({ 'allData': _allData });
    });
});


function updateActivityColorMap(classData, removedData, activityColorMap) {
    console.log('activityColorMap::',activityColorMap)
    const currActs = [...new Set(classData.concat(removedData).map(d => d.activity))];
    const coloredActs = Object.keys(activityColorMap);
    const toRemove = coloredActs.filter(act => !currActs.includes(act));
    const toAdd = currActs.filter(act => !coloredActs.includes(act));
    if (toRemove === [] && toAdd === []) {
        return
    }
    toRemove.forEach(function (act) {
        delete activityColorMap[act];
    })

    var colorList = [];
    $.each(['.sp-palette-row-3', '.sp-palette-row-4', '.sp-palette-row-3', '.sp-palette-row-1'], function (i, selector) {
        var el = $(selector);
        if (el.length) {
            el.first().children().each(function () {
                colorList.push($(this).attr('title'));
            });
        }
    });

    colorList.reverse()
    const usedColors = Object.values(activityColorMap);
    colorList = colorList.filter(c => !usedColors.includes(c));
    toAdd.forEach((activity, i) => {
        var color = colorList.pop();
        activityColorMap[activity] = color;
    })
    console.log(activityColorMap);
    _allData.activityColorMap = activityColorMap;
    chrome.storage.sync.set({ 'allData': _allData });
}

function initialiseTables() {
    $('#classTable').bootstrapTable('destroy').bootstrapTable({
        columns: [
            {
                field: 'classId',
                title: 'Class',
                width: 100,
                formatter: classIdFormatter,
                events: window.operateEvents,
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
                field: 'operate',
                title: '',
                width: 50,
                clickToSelect: false,
                events: window.operateEvents,
                formatter: operateFormatter,
                cellStyle: colorColStyle,
            }],
        theadClasses: 'thead-dark',
        rowStyle: rowStyle
    });

    $('#removedTable').bootstrapTable('destroy').bootstrapTable({
        columns: [
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
                width: 50,
                formatter: rankFormatter
            },
            {
                field: 'operate',
                title: 'Actions',
                width: 50,
                clickToSelect: false,
                events: window.operateEvents,
                formatter: removedOperateFormatter,
                cellStyle: colorColStyle,
            }],
        theadClasses: 'thead-dark',
        rowStyle: rowStyle
    });
}

function updateTable(classData, removedData, activityColorMap) {
    $('#classTable').bootstrapTable('load', classData);
    $('#removedTable').bootstrapTable('load', removedData);

    $('.color-picker').spectrum({
        type: "color",
        showPalette: "false",
        showPaletteOnly: "true",
        showAlpha: "false",
        showButtons: "false",
        allowEmpty: "false",
        change: function (color) {
            const colorHex = $(this).spectrum('get').toHexString()
            const i = $('.color-picker').index($(this))
            chrome.storage.sync.get(function (data) {
                var activity = data.allData.classes[i].activity;
                data.allData.activityColorMap[activity] = colorHex;
                chrome.storage.sync.set({ 'allData': data.allData })
            })
        }
    });
    $('.color-picker').each(function (i, el) {
        $(el).spectrum("set", activityColorMap[classData[i].activity])
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
    return rgb && (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) < 135
        ? "#ffffff"
        : "#000000"
}


function rowStyle(row, index) {
    var bgdColor = "white";
    if(_allData.activityColorMap && _allData.activityColorMap[row.activity]) {
        bgdColor = _allData.activityColorMap[row.activity];
    }
    return {
        css: {
            'background-color': bgdColor,
            color: textColor(bgdColor)
        }
    }
}

function removedRowStyle(row, index) {
    return {
        css: {
            'background-color': "white",
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

function classIdFormatter(value, row, index) {
    return ['<a class="open-descr" href="#" />'
        + value
        + '</a>'
    ].join('')
}

function rankFormatter(value, row, index) {
    return '✕'
}
function operateFormatter(value, row, index) {
    console.log('operate')
    return ['<div class="ops">'
        + '<input class="color-picker" />'
        + '<button type="button" class="btn btn-outline-danger btn-xs del-btn" title="Delete">✕</button>'
        + '</div>'
    ].join('')
}
function removedOperateFormatter(value, row, index) {
    return ['<div class="ops">'
        + '<button type="button" class="btn btn-outline-danger btn-xs add-btn" title="Add">＋</button>'
        + '</div>'
    ].join('')
}

window.operateEvents = {
    'click .open-descr': function (e, value, row, index) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "description", message: {classId: row.classId} });
        })
    },
    'click .del-btn': function (e, value, row, index) {
        // console.log(_classData, row);
        _allData.removed.push(row);
        _allData.classes = _allData.classes.filter(d => d.classId != row.classId);
        _allData.classes.forEach((item, i) => {
            item.rank = i + 1;
        });
        chrome.storage.sync.set({ 'allData': _allData });
    },
    'click .add-btn': function (e, value, row, index) {
        _allData.classes.push(row);
        _allData.removed = _allData.removed.filter(d => d.classId != row.classId);
        _allData.classes.forEach((item, i) => {
            item.rank = i + 1;
        });
        chrome.storage.sync.set({ 'allData': _allData });
    }
}

chrome.storage.onChanged.addListener(function (changes, storageName) {
    var allData = changes.allData.newValue; 
    if (allData) {
        console.log('storage changed', allData);
        _allData = allData;
        updateActivityColorMap(allData.classes, allData.removed, allData.activityColorMap);
        updateTable(allData.classes, allData.removed, allData.activityColorMap);
    }
});
