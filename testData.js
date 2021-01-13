const testData = [
    {
        "classId": "E02",
        "activity": "CS2100 Tutorial",
        "session": "Regular",
        "vacancy": "20",
        "rank": 1
    },
    {
        "classId": "T03",
        "activity": "CS2030s Rec",
        "session": "Regular",
        "vacancy": "14",
        "rank": 2
    },
    {
        "classId": "E04",
        "activity": "CS2100 Tutorial",
        "session": "Regular",
        "vacancy": "30",
        "rank": 3
    },
    {
        "classId": "G12",
        "activity": "GEQ1000 Tutorial",
        "session": "Regular",
        "vacancy": "22",
        "rank": 4
    },
    {
        "classId": "E02",
        "activity": "MA1101R Tutorial",
        "session": "Regular",
        "vacancy": "20",
        "rank": 1
    },
    {
        "classId": "T03",
        "activity": "CS2044s Rec",
        "session": "Regular",
        "vacancy": "14",
        "rank": 2
    },
    {
        "classId": "E04",
        "activity": "CS1101 Tutorial",
        "session": "Regular",
        "vacancy": "30",
        "rank": 3
    },
    {
        "classId": "G12",
        "activity": "MA1521 Tutorial",
        "session": "Regular",
        "vacancy": "22",
        "rank": 4
    },
    {
        "classId": "E02",
        "activity": "CS3100 Tutorial",
        "session": "Regular",
        "vacancy": "20",
        "rank": 1
    },
    {
        "classId": "T03",
        "activity": "ST1124 Rec",
        "session": "Regular",
        "vacancy": "14",
        "rank": 2
    },
    {
        "classId": "E04",
        "activity": "ST1322 Tutorial",
        "session": "Regular",
        "vacancy": "30",
        "rank": 3
    },
    {
        "classId": "G12",
        "activity": "GER1000 Tutorial",
        "session": "Regular",
        "vacancy": "22",
        "rank": 4
    },
    {
        "classId": "E02",
        "activity": "MA2001 Lab",
        "session": "Regular",
        "vacancy": "20",
        "rank": 1
    },
    {
        "classId": "T03",
        "activity": "CS2044s lab",
        "session": "Regular",
        "vacancy": "14",
        "rank": 2
    },
    {
        "classId": "E04",
        "activity": "CS1101S Lab",
        "session": "Regular",
        "vacancy": "30",
        "rank": 3
    },
    {
        "classId": "G12",
        "activity": "IS1103 Tutorial",
        "session": "Regular",
        "vacancy": "22",
        "rank": 4
    }
]


$('.sp-palette-row-4:first').children().each(function(i) {
    colorList.push($(this).attr('title'));
}); 
$('.sp-palette-row-1:first').children().each(function(i) {
    colorList.push($(this).attr('title'));
}); 
$('.sp-palette-row-2:first').children().each(function() {
    colorList.push($(this).attr('title'));
}); 
$('.sp-palette-row-3:first').children().each(function() {
    colorList.push($(this).attr('title'));
}); 