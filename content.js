chrome.runtime.sendMessage({todo: "showPageAction"});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.action === "clickScrape") {
        const iframeDoc = document.querySelector("iframe").contentDocument;
        const rows = iframeDoc.querySelectorAll("table tbody .ps_grid-row");
        console.log('clicked scrape',rows)
        const data = [];
        rows.forEach(row => {
            const child = row.querySelectorAll(".ps_grid-cell");
            if(child.length === 5) {
                const classObj = {
                    "classId": child[0].innerText,
                    "activity": child[1].innerText,
                    "session": child[2].innerText,
                    "vacancy": child[3].innerText,
                    "rank": parseInt(child[4].querySelector("select").value)
                }
                data.push(classObj)
            }
        })
        // sort data by rank
        data.sort((a, b) => (a.rank > b.rank) ? 1 : -1)

        console.log(data)
        chrome.storage.sync.get(function(oldData){
            console.log("old data", oldData)
            chrome.storage.sync.set({'allData': {'classes': data, 'activityColorMap': oldData.allData.activityColorMap ?? {}}});
        })
    } else if (request.action === "shiftDialog") {
        console.log("shift dialog")
        const dialog = document.querySelector(".ps_modal_container");
        dialog.style.left = 0;
    } else if (request.action === "applyRanking") {
        chrome.storage.sync.get(function(data){
            console.log("apply ranking", data);
            const iframeDoc = document.querySelector("iframe").contentDocument;
            const rows = iframeDoc.querySelectorAll("table tbody .ps_grid-row");
            rows.forEach((row, i) => {
                const classId = row.querySelector(".ps_grid-cell").innerText;
                const rowData = data.allData.classes.find(d => d.classId === classId);
                const select = row.querySelector("select");
                select.selectedIndex = rowData.rank-1;
            })
        })
    }
});
