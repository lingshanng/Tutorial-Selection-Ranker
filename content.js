chrome.runtime.sendMessage({todo: "showPageAction"});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.action === "clickScrape") {
        const iframeDoc = document.querySelector("iframe").contentDocument;
        const rows = iframeDoc.querySelectorAll("table tbody .ps_grid-row");
        const data = [];
        rows.forEach(row => {
            const child = row.querySelectorAll(".ps_grid-cell");
            if(child.length === 5) {
                const classObj = {
                    "classId": child[0].innerText,
                    "activity": child[1].innerText,
                    "session": child[2].innerText,
                    "vacancy": child[3].innerText,
                    "rank": child[4].querySelector("select").value
                }
                data.push(classObj)
            }
        })
        // sort data by rank
        data.sort((a, b) => (a.rank > b.rank) ? 1 : -1)

        console.log(data)
        // const data = [elements].map(e => e.innerText)
        chrome.storage.sync.set({'classes': data})
    }
});
