const TOKEN_KEY = "gitlab_token_settings";
const GITLAB_URL = "gitlab_url_settings";

const PROJECT_KEY = "gitlab_project_settings";
const BRANCH_TYPE_KEY = "gitlab_branch_type_settings";
const SRC_BRANCH_TYPE_KEY = "gitlab_src_branch_type_settings";

let projects = [];
let branchType = [];
let srcBranchType = [];
let url = "-";
let token = "-";

function updateOptions() {
    const tokenData = document.getElementById("tokenData");
    const urlData = document.getElementById("urlData");
    const valueList = document.getElementById("valueList");
    const branchValueList = document.getElementById("branchValueList");
    const srcBranchValueList = document.getElementById("scrBranchValueList");
    tokenData.innerHTML = "-";
    urlData.innerHTML = "-";
    valueList.innerHTML = "-";
    branchValueList.innerHTML = "-";
    srcBranchValueList.innerHTML = "-";

    if (token && token !== "-") {
        const li1 = document.createElement("li");
        li1.textContent = '**********';
        tokenData.textContent = ""; // Clears the container securely
        tokenData.appendChild(li1);
    } else {
        const li1 = document.createElement("li");
        li1.textContent = '-';
        tokenData.textContent = ""; // Clears the container securely
        tokenData.appendChild(li1);
    }

    if (url != "-") {
        const li1 = document.createElement("li");
        urlData.innerHTML = "";
        li1.textContent = url;
        urlData.appendChild(li1);
    }

    if (srcBranchType.length) {
        srcBranchValueList.innerHTML = ""

        // Iterate through the array and do something with each object
        for (let i = 0; i < srcBranchType.length; i++) {
            const li = document.createElement('div');
            li.classList.add("bg-gray-100", "rounded-lg", "py-2", "px-3", "my-2", "flex", "justify-between", "items-center")
            const div = document.createElement('div');

            let p = document.createElement('p');
            p.classList.add("font-semibold", "text-l")
            p.textContent += "Source branch name: ";

            let span = document.createElement('span');
            span.classList.add("text-blue-500")
            span.textContent += srcBranchType[i];

            p.appendChild(span);

            div.appendChild(p);


            li.appendChild(div);

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("px-3", "py-1", "bg-red-500", "text-white", "hover:bg-red-600", "rounded")
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function() {
                var jsonfile = {};
                srcBranchType.splice(i, 1);
                jsonfile[SRC_BRANCH_TYPE_KEY] = srcBranchType;
                chrome.storage.sync.set(jsonfile, function() {
                    refresh();
                });

            });

            li.appendChild(deleteButton);

            srcBranchValueList.appendChild(li);
        }
    }

    if (branchType.length) {
        branchValueList.innerHTML = ""

        // Iterate through the array and do something with each object
        for (let i = 0; i < branchType.length; i++) {
            const li = document.createElement('div');
            li.classList.add("bg-gray-100", "rounded-lg", "py-2", "px-3", "my-2", "flex", "justify-between", "items-center")
            const div = document.createElement('div');

            let p = document.createElement('p');
            p.classList.add("font-semibold", "text-l")
            p.textContent += "Branch name: ";

            let span = document.createElement('span');
            span.classList.add("text-blue-500")
            span.textContent += branchType[i];

            p.appendChild(span);

            div.appendChild(p);


            li.appendChild(div);

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("px-3", "py-1", "bg-red-500", "text-white", "hover:bg-red-600", "rounded")
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function() {
                var jsonfile = {};
                const index = i;
                branchType.splice(index, 1);
                jsonfile[BRANCH_TYPE_KEY] = branchType;
                chrome.storage.sync.set(jsonfile, function() {
                    refresh();
                });

            });

            li.appendChild(deleteButton);

            branchValueList.appendChild(li);
        }
    }

    if (projects.length) {
        valueList.innerHTML = ""
        jsonArray = JSON.parse(projects);

        // Iterate through the array and do something with each object
        for (let i = 0; i < jsonArray.length; i++) {
            const obj = jsonArray[i];
            if (obj == null) {
                continue;
            }

            //console.log(obj.projectId, obj.projectName);
            const li = document.createElement('div');
            li.classList.add("bg-gray-100", "rounded-lg", "py-2", "px-3", "my-2", "flex", "justify-between", "items-center")
            const div = document.createElement('div');

            let p = document.createElement('p');
            p.classList.add("font-semibold", "text-l")
            p.textContent += "Project name: ";

            let span = document.createElement('span');
            span.classList.add("text-blue-500")
            span.textContent += obj.projectName;

            p.appendChild(span);

            div.appendChild(p);

            p = document.createElement('p');
            p.classList.add("font-semibold", "text-l")
            p.textContent += "ID: ";

            span = document.createElement('span');
            span.classList.add("text-blue-500")
            span.textContent += obj.projectId;
            p.appendChild(span);
            div.appendChild(p);

            li.appendChild(div);

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("px-3", "py-1", "bg-red-500", "text-white", "hover:bg-red-600", "rounded")
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function() {
                delete jsonArray[i];
                var jsonfile = {};
                if (jsonArray.length > 0) {
                    jsonfile[PROJECT_KEY] = JSON.stringify(jsonArray, (key, value) => {
                        if (key !== null) return value
                    });
                } else {
                    jsonfile[PROJECT_KEY] = "[]";
                }
                chrome.storage.sync.set(jsonfile, function() {
                    refresh();
                });

            });

            li.appendChild(deleteButton);

            valueList.appendChild(li);
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const projectId = document.getElementById("projectId");
    const branchName = document.getElementById("branchName");
    const srcBranchName = document.getElementById("srcBranchName");
    const projectName = document.getElementById("projectName");
    const tokenValue = document.getElementById("tokenValue");
    const urlValue = document.getElementById("urlValue");
    const addBranchButton = document.getElementById("addBranchButton");
    const addSrcBranchButton = document.getElementById("addScrBranchButton");
    const addValueButton = document.getElementById("addProjectButton");
    const addTokenButton = document.getElementById("addTokenButton");
    const addUrlButton = document.getElementById("addUrlButton");

    addBranchButton.addEventListener("click", function() {

        const newValue1 = branchName.value.trim();

        if (newValue1) {
            var settings = newValue1;
            var jsonfile = {};
            
            jsonfile[BRANCH_TYPE_KEY] = branchType.concat(settings);

            chrome.storage.sync.set(jsonfile, function() {
                //log('Saved', PROJECT_KEY, settings);
            });

            branchName.value = "";

            refresh();
        }
    });

    addSrcBranchButton.addEventListener("click", function() {

        const newValue1 = srcBranchName.value.trim();

        if (newValue1) {
            var settings = newValue1;
            var jsonfile = {};
            
            jsonfile[SRC_BRANCH_TYPE_KEY] = srcBranchType.concat(settings);

            chrome.storage.sync.set(jsonfile, function() {
                //log('Saved', PROJECT_KEY, settings);
            });

            srcBranchName.value = "";

            refresh();
        }
    });

    addValueButton.addEventListener("click", function() {

        const newValue1 = projectId.value.trim();
        const newValue2 = projectName.value.trim();

        if (newValue1 && newValue2) {
            var settings = JSON.stringify({
                'projectId': newValue1,
                'projectName': newValue2
            });
            var jsonfile = {};
            //console.log(projects);
            //console.log(typeof projects);
            if (projects.length > 0) {
                //console.log(projects+ "," + settings);
                jsonfile[PROJECT_KEY] = '[' + projects.slice(1, -1) + "," + settings + ']';
            } else {
                jsonfile[PROJECT_KEY] = '[' + settings + ']';
            }


            chrome.storage.sync.set(jsonfile, function() {
                //log('Saved', PROJECT_KEY, settings);
            });

            projectId.value = "";
            projectName.value = "";

            refresh();
        }
    });

    addTokenButton.addEventListener("click", function() {

        const newValue = tokenValue.value.trim();

        if (newValue) {

            var jsonfile = {};
            jsonfile[TOKEN_KEY] = newValue;
            chrome.storage.sync.set(jsonfile, function() {
                //log('Saved', PROJECT_KEY, settings);
            });

            tokenValue.value = "";

            refresh();
        }
    });

    addUrlButton.addEventListener("click", function() {

        const newValue = urlValue.value.trim();

        if (newValue) {

            var jsonfile = {};
            jsonfile[GITLAB_URL] = newValue;
            chrome.storage.sync.set(jsonfile, function() {
                //log('Saved', PROJECT_KEY, settings);
            });

            urlValue.value = "";

            refresh();
        }
    });
});

function refresh() {
    chrome.storage.sync.get(TOKEN_KEY, function(result) {
        if (result[TOKEN_KEY] != null) {
            token = "Set";
            updateOptions();
        }
    });

    chrome.storage.sync.get(PROJECT_KEY, function(result) {
        if (result[PROJECT_KEY] != null) {
            projects = result[PROJECT_KEY];
            updateOptions();
        }
    });

    chrome.storage.sync.get(GITLAB_URL, function(result) {
        if (result[GITLAB_URL] != null) {
            url = result[GITLAB_URL];
            updateOptions();
        }
    });

    chrome.storage.sync.get(BRANCH_TYPE_KEY, function(result) {
        if (result[BRANCH_TYPE_KEY] != null) {
            branchType = result[BRANCH_TYPE_KEY];
            updateOptions();
        }
    });

    chrome.storage.sync.get(SRC_BRANCH_TYPE_KEY, function(result) {
        if (result[SRC_BRANCH_TYPE_KEY] != null) {
            srcBranchType = result[SRC_BRANCH_TYPE_KEY];
            updateOptions();
        }
    });
}

refresh();