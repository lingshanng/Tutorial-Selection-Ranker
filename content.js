chrome.runtime.sendMessage({ todo: "showPageAction" });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "clickScrape") {
        const iframeDoc = document.querySelector("iframe").contentDocument;
        const rows = iframeDoc.querySelectorAll("table tbody .ps_grid-row");
        console.log('clicked scrape', rows)
        const data = [];
        rows.forEach(row => {
            const grids = row.querySelectorAll(".ps_grid-cell");
            if (grids.length === 5) {
                const classObj = {
                    "classId": grids[0].innerText,
                    "activity": grids[1].innerText,
                    "session": grids[2].innerText,
                    "vacancy": grids[3].innerText,
                    "rank": parseInt(grids[4].querySelector("select").value)
                }
                data.push(classObj)
            }
        })
        // sort data by rank and fix wrong ranks
        data.sort((a, b) => (a.rank > b.rank) ? 1 : -1)
        data.forEach((d, i) => {
            d.rank = i + 1;
        })
        console.log(data)
        chrome.storage.sync.get(function (oldData) {
            console.log("old data", oldData)
            chrome.storage.sync.set({ 'allData': { 'classes': data, 'activityColorMap': oldData.allData.activityColorMap ?? {} } });
        })
    } else if (request.action === "shiftDialog") {
        console.log("shift dialog")
        const dialog = document.querySelector(".ps_modal_container");
        dialog.style.left = 0;
    } else if (request.action === "compare") {
        chrome.storage.sync.get(function (data) {
            console.log("compare ranking", data);
            const iframeDoc = document.querySelector("iframe").contentDocument;
            const rows = iframeDoc.querySelectorAll("table tbody .ps_grid-row");
            rows.forEach((row, i) => {
                const grids = row.querySelectorAll(".ps_grid-cell");
                const classId = grids[0].innerText;
                const rowData = data.allData.classes.find(d => d.classId === classId);
                const select = row.querySelector("select");
                const rankGrid = grids[4];
                var label = rankGrid.querySelector(".compareLabel");
                if (!label) {
                    label = document.createElement("p");
                    label.classList.add("compareLabel");
                    rankGrid.appendChild(label);
                    rankGrid.style.display = "flex";
                    rankGrid.style.flexDirection = "row-reverse";
                    label.style.margin = "5px";
                }
                if (rowData) {
                    label.innerText = rowData.rank
                    if (select.selectedIndex !== rowData.rank - 1) {
                        label.style.color = "red";
                    } else {
                        label.style.color = "blue";
                    }
                } else {
                    label.innerText = "-"
                }
            })
        })

    } else if (request.action === "applyRanking") {
        chrome.storage.sync.get(function (data) {
            console.log("apply ranking", data);
            const iframeDoc = document.querySelector("iframe").contentDocument;
            const rows = iframeDoc.querySelectorAll("table tbody .ps_grid-row");
            rows.forEach((row, i) => {
                const classId = row.querySelector(".ps_grid-cell").innerText;
                const rowData = data.allData.classes.find(d => d.classId === classId);
                const select = row.querySelector("select");
                select.selectedIndex = rowData.rank - 1;
            })
        })
    } else if (request.action === "applyColor") {
        chrome.storage.sync.get(function (data) {
            console.log("apply ranking", data);
            const iframeDoc = document.querySelector("iframe").contentDocument;
            const rows = iframeDoc.querySelectorAll("table tbody .ps_grid-row");
            rows.forEach((row, i) => {
                const activity = row.querySelectorAll(".ps_grid-cell")[1].innerText;
                var bgdColor = data.allData.activityColorMap[activity];
                if (bgdColor) {
                    row.style.backgroundColor = bgdColor;
                }
            })
        })
    } else if (request.action === "test") {
        console.log(testData);
        // change website to reflect test Data 

        // const iframeDoc = document.querySelector("iframe");
        // if(iframeDoc) {
        //     const rows = iframeDoc.contentDocument.querySelectorAll("table tbody .ps_grid-row");
        //     rows.forEach((row, i) => {
        //         const grids = row.querySelectorAll(".ps_grid-cell");
        //         grids[0].innerText = testData[i].classId;
        //         grids[1].innerText = testData[i].activity;
        //         grids[2].innerText = testData[i].session;
        //         grids[3].innerText = testData[i].vacancy;
        //     })
        // } else {
        // const rows = document.querySelectorAll("table tbody .ps_grid-row");
        // rows.forEach((row, i) => {
        //     const grids = row.querySelectorAll(".ps_grid-cell");
        //     const infoLink = row.querySelector(".ps-link").href;
        //     console.log(infoLink);
        //     grids[1].innerText = testData[i].classId;
        //     grids[2].innerText = testData[i].activity;
        //     grids[3].innerText = testData[i].session;
        //     grids[4].innerText = testData[i].vacancy;
        // })

        // load testData directly

        chrome.storage.sync.set({ 'allData': { 'classes': testData, 'removed': [], 'activityColorMap': {} } });
    } else if (request.action === "description") {
        var doc = document;
        var iframeDoc = document.querySelector("iframe");
        if(iframeDoc) {
            doc = iframeDoc.contentDocument;
        }

        const rows = doc.querySelectorAll("table tbody .ps_grid-row");
        for(i=0; i < rows.length; i++) {
            var row = rows[i];
            var x = 0;
            if(!iframeDoc) {
                x = 1;
            }
            var grids = row.querySelectorAll(".ps_grid-cell");
            if(grids[x].innerText === request.message.classId) {
                var descrLink = row.querySelector(".ps-link");
                descrLink.click();
                break;
            }
        }
    }
});

