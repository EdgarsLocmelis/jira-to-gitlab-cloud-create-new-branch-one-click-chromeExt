import Request from './request.js';

const KEY = "gitlab_settings";
let token;
let projectId;


chrome.storage.sync.get(KEY, function (result) {
    var settings = JSON.parse(result[KEY]);
    this.token = settings.token;
    this.projectId = settings.projectId;
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
        var storageChange = changes[key];
        if (key === KEY) {
            var settings = JSON.parse(storageChange.newValue);
            this.token = settings.token;
            this.projectId = settings.projectId;
        }
        console.log('Storage key "%s" in namespace "%s" changed. ' +
            'Old value was "%s", new value is "%s".',
            key,
            namespace,
            storageChange.oldValue,
            storageChange.newValue);
    }
});

const getHTMLAsync = async (path) => {
    const buttonDoc = await fetch(chrome.runtime.getURL(path))
        .then(function (response) {
            // When the page is loaded convert it to text
            return response.text()
        }).then(function (html) {
            // Initialize the DOM parser
            var parser = new DOMParser();

            // Parse the text
            var doc = parser.parseFromString(html, "text/html");

            // You can now even select part of that html as you would in the regular DOM 
            // Example:
            // var docArticle = doc.querySelector('article').innerHTML;

            //console.log(doc);
            return doc;
        })
        .catch(function (err) {
            console.log('Failed to fetch page: ', err);
        });
    return buttonDoc.body.innerHTML;
}

function getIssueTitle() {
    return $("[data-test-id=\"issue.views.issue-base.foundation.summary.heading\"]").text();
}

function getIssueId() {
    var url = location.href;
    var issueId = url.split('/').pop();
    return issueId;
}

function _x(STR_XPATH) {
    var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
    var xnodes = [];
    var xres;
    while (xres = xresult.iterateNext()) {
        xnodes.push(xres);
    }

    return xnodes;
}

function addButtonToIssueView() {
    var $controlRow = $(_x('/html/body/div[1]/div/div/div[1]/div[3]/div[1]/div/div/div/div/div[3]/div/div[1]/div[1]/div/div[1]/div/div/div[2]/div'));
    if (!$controlRow.length) {
        console.log('Control row not found!');
    }
    getHTMLAsync("/src/html/model/button.html").then(buttonHTML => {
        var $branchBtnContainer = $(buttonHTML);
        var $branchBtn = $branchBtnContainer.find("button");

        $branchBtnContainer.mouseover(async function (event) {
            $branchBtn.attr('class', 'css-r3no7s');
        });

        $branchBtnContainer.mouseleave(async function (event) {
            $branchBtn.attr('class', 'css-1hy2148');
        });

        $branchBtn.click(async function (event) {
            var issueId = getIssueId();
            var prefix = "task";
            var issueTitle = getIssueTitle().toLowerCase().replace(/ /g, "_");
            var branchName = prefix + "/" + issueId + "-" + issueTitle;
            showModal(branchName);
        });

        $controlRow.append($branchBtnContainer);
    })
}

function addDevelopmentSectionToSidebar() {
    var $footNote = $('div[data-test-id=\"issue.views.issue-base.context.context-items\"]');
    if (!$footNote.length) {
        console.log('Footnote row not found!');
    }
    getHTMLAsync("/src/html/model/development.html").then(devHTML => {
        var $developmentContainer = $(devHTML);
        $footNote.after($developmentContainer);
    })
}

const showModal = (branchName) => {
    const modal = document.createElement("dialog");
    modal.setAttribute(
        "style", `
    height:300px;
    width: 550px;
    border: none;
    top:150px;
    border-radius:20px;
    background-color:white;
    position: fixed; box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
    `
    );
    modal.innerHTML = `<iframe id="popup-content"; style="height:100%" width="550"></iframe>
    <div style="position:absolute; top:0px; top:3px; left:543px;">
    <button style="padding: 8px 12px; font-size: 16px; border: none; border-radius: 20px;">x</button>
    </div>`;
    document.body.appendChild(modal);
    const dialog = document.querySelector("dialog");
    dialog.showModal();
    const iframe = document.getElementById("popup-content");
    iframe.src = chrome.extension.getURL("/src/html/model/create_branch_modal.html?branch_name=" + branchName);
    iframe.frameBorder = 0;
    dialog.querySelector("button").addEventListener("click", () => {
        dialog.close();
    });
}

$(document).ready(function () {
    addButtonToIssueView();
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("Message listener:" + request)
        // listen for messages sent from iframe
        if (request.message === 'clicked_createNewBranch') {
            try {
                var name = request.data.branch;
                var from = request.data.branch_from;
                console.log("Clicked create new branch button on dialog with branch name: '" + name + "' and branch from '" + from + "'");
                Request.new({ token: this.token, projectId: this.projectId }).createNewBranch(name, from).then((response) => {
                    if (response.status === 201) {
                        var r = confirm(`New branch created on GitLab with name \'${name}\'! \n Press 'Ok' for open it on new tab!`);
                        if (r == true) {
                            chrome.tabs.create({ url: response.json().web_url });
                        } else {
                            // "You pressed Cancel!";
                        }
                    } else if (response.status === 401) {
                        alert("Cannot create new branch, GitLab private token is invalid! \nPlease check the Chrome extension settings!");
                    }
                });
            } catch (error) {
                console.log(`Error! ${error}`);
            } finally {
                const dialog = document.querySelector("dialog");
                dialog.close();
            }
        }
    });


export function main() {
    //console.log("main()");
    //console.log(
    //    "Is chrome.runtime available here?",
    //    typeof chrome.runtime.sendMessage == "function",
    //);
}

