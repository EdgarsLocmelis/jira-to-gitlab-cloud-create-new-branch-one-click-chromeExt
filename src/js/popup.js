const TOKEN_KEY = "gitlab_token_settings";
const GITLAB_URL = "gitlab_url_settings";

const PROJECT_KEY = "gitlab_project_settings";
const BRANCH_TYPE_KEY = "gitlab_branch_type_settings";
const SRC_BRANCH_TYPE_KEY = "gitlab_src_branch_type_settings";

let projects = [];
let branchType = [];
let srcBranchType = [];
let token = "";
let url = "";

setExistingBranches(null);

class Request {
    constructor(token, projectId) {
        this.token = token;
        this.projectId = projectId;
    }
    static new(props) {
        return new this(props.token, props.projectId);
    }

    getProjectById() {
        return fetch(encodeURI(`${url}/api/v4/projects/${this.projectId}`), {
            method: 'GET',
            headers: {
                'PRIVATE-TOKEN': this.token
            }
        });
    }

    searchBranch(search) {
        return fetch(encodeURI(`${url}/api/v4/projects/${this.projectId}/repository/branches?search=${search}`), {
            method: 'GET',
            headers: {
                'PRIVATE-TOKEN': this.token
            }
        });
    }

    createNewBranch(name, from) {
        return fetch(encodeURI(`${url}/api/v4/projects/${this.projectId}/repository/branches?branch=${name}&ref=${from}`), {
            method: 'POST',
            headers: {
                'PRIVATE-TOKEN': this.token
            }
        });
    }

}

function addInputListener(data) {
    var inputField = document.getElementById(data);
    inputField.addEventListener("input", function(event) {
        showExistingBranchCount(false);
    });
}

function populateProjectOptions() {
    let jsonArray = JSON.parse(projects);
    let projectOptions = []
    // Iterate through the array and do something with each object
    for (let i = 0; i < jsonArray.length; i++) {
        const obj = jsonArray[i];
        if (obj == null) {
            continue;
        }
        projectOptions.push({
            id: obj.projectId,
            name: obj.projectName
        }, );
    }

    const projectDropdown = document.getElementById("project");

    projectOptions.forEach((project) => {
        const option = document.createElement("option");
        option.value = project.id;
        option.textContent = project.name;
        projectDropdown.appendChild(option);
    });
}

function populateBranchOptions() {
    const projectDropdown = document.getElementById("branchType");

    branchType.forEach((branch) => {
        const option = document.createElement("option");
        option.value = branch;
        option.textContent = branch;
        projectDropdown.appendChild(option);
    });
}

function populateSrcBranchOptions() {
    const projectDropdown = document.getElementById("branchSource");

    srcBranchType.forEach((branch) => {
        const option = document.createElement("option");
        option.value = branch;
        option.textContent = branch;
        projectDropdown.appendChild(option);
    });
}

function showExistingBranchCount(dummy) {
    setExistingBranches(null);
    if (dummy) {
        branch = getBranchName().slice(0, -1);
    } else {
        branch = getBranchName();
    }

    try {
        new Request(token, getSelectedValue("project")).searchBranch(branch).then((response) => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 401) {
                setExistingBranchesError("Invalid GitLab access token!");
            } else {
                setExistingBranchesError('Error: ' + response.status);
            }
            throw new Error(response.status);
        }).then((data) => {
            setExistingBranches(data);
        }).catch((error) => {
            setExistingBranchesNoConn();
        });
    } catch (error) {}


}


function setExistingBranches(data) {
    const existingBranches = document.getElementById("existingBranches");
    if (data != null && data.length > 0) {
        existingBranches.innerHTML = `
    
    <li class="flex items-center">
    <svg class="h-5 w-5 text-blue-500" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1"  stroke-linecap="round"  stroke-linejoin="round">  <circle cx="12" cy="12" r="10" />  <line x1="12" y1="16" x2="12" y2="12" />  <line x1="12" y1="8" x2="12.01" y2="8" /></svg>
    
    <span class="pl-1 pr-2">Existing Branches:</span> ${data.length}
    </li>
    <ul class="list-disc pt-3 pl-2">`;
        for (let i = 0; i < data.length; i++) {
            const obj = data[i];
            if (obj == null) {
                continue;
            }
            existingBranches.innerHTML += '<li class="flex">';
            existingBranches.innerHTML += '• ';

            existingBranches.innerHTML += '<a class="text-blue-500 hover:text-gray-400" target="_blank" href="https://takora.confero.tech/ib-mobile/' + getSelectedtext("project") + '/-/tree/' + obj.name + '">' + obj.name + '</a>';
            existingBranches.innerHTML += '</li>';
            existingBranches.innerHTML += '</ul>';
            buttonState("true");
        }
    } else if (data != null) {
        existingBranches.innerHTML = `
        <li class="flex items-center">
            <svg class="h-5 w-5 text-blue-500" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1"  stroke-linecap="round"  stroke-linejoin="round">  <circle cx="12" cy="12" r="10" />  <line x1="12" y1="16" x2="12" y2="12" />  <line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <span class="pl-1 pr-2">Existing Branches:</span> 0
        </li>`;
        buttonState("true");
    } else {
        buttonState("loading");
        existingBranches.innerHTML = `
                        <li class="flex items-center">
                        <div class="text-center">
                        <div class="grid place-items-center text-blue-500 animate-spin">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </div>
                </div>
            <span class="pl-2">Loading...</span>
        </li>`
    }
}

function setExistingBranchesNoConn() {
    const existingBranches = document.getElementById("existingBranches");

    existingBranches.innerHTML = `
        <li class="flex items-center">
            <svg class="h-5 w-5 text-red-500"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="pl-1">No connection, check configuration or setup.</span>
        </li>`

    buttonState("false");
}

function setExistingBranchesInfo(data) {
    const existingBranches = document.getElementById("existingBranches");

    existingBranches.innerHTML = `
    <li class="flex items-center">
        <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>

        <span class="pl-1">` + data + `</span>
    </li>`

    buttonState("false");
}

function setExistingBranchesError(data) {
    const existingBranches = document.getElementById("existingBranches");

    existingBranches.innerHTML = `
    <li class="flex items-center">
        <svg class="h-5 w-5 text-red-500"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="pl-1">` + data + `</span>
    </li>`

    buttonState("false");

    setTimeout(() => {
        setExistingBranches("");
        showExistingBranchCount(false);
    }, 2000);
}

function buttonState(state) {
    const loading = document.getElementById("loadingClass");
    const button = document.getElementById("dataClass");
    const buttonDisabled = document.getElementById("noDataClass");

    if (state == "false" && buttonDisabled != null) {
        buttonDisabled.classList.remove("hidden");
    } else if (state == "true") {
        buttonDisabled.classList.add("hidden");
    } else {
        buttonDisabled.classList.add("hidden");
    }

}

function getSelectedValue(element) {
    var selectElement = document.getElementById(element);
    return selectElement.value;
}

function getSelectedtext(element) {
    var selectElement = document.getElementById(element);
    return selectElement.options[selectElement.selectedIndex].text;
}

function getBranchName() {
    var inputField = document.getElementById("branchName");
    return inputField.value.trim();
}

function getSrcBranchName() {
    var inputField = document.getElementById("branchSource");
    return inputField.value.trim();
}

// -- Branch name functions
function addIssueIdToBranchNameField() {
    getCurrentTabUrl(function(url) {
        const existingBranches = document.getElementById("branchName")
        existingBranches.value = url.split('/').pop();;
    });
}

function getCurrentTabUrl(callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        var url = tabs[0].url;
        callback(url);
    });
}
// ---

document.getElementById("createBranch").addEventListener("click", () => {
    var branchName = getBranchName();
    var projectId = getSelectedValue("project");
    var branchType = getSelectedValue("branchType");

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.update(tabs[0].id, {
            selected: true
        })
    });

    try {
        new Request(token, getSelectedValue("project")).createNewBranch(branchType + '/' + getBranchName(), getSrcBranchName()).then((response) => {
            if (response.status === 200 || response.status === 201) {
                return response.json();
            } else if (response.status === 401) {
                setExistingBranchesError("Invalid GitLab access token!");
            } else if (response.status === 400) {
                setExistingBranchesError("Branch already exists!");
            } else {
                setExistingBranchesError('Error: ' + response.status);
            }
            throw new Error(response.status);
        }).then((data) => {
            setExistingBranchesInfo("Branch created!");
            setTimeout(() => {
                showExistingBranchCount(false);
            }, 2000);

        }).catch((error) => {});
    } catch (error) {

    }

});

chrome.storage.sync.get(TOKEN_KEY, function(result) {
    if (result[TOKEN_KEY] != null) {
        token = result[TOKEN_KEY];
    }
});

chrome.storage.sync.get(GITLAB_URL, function(result) {
    if (result[GITLAB_URL] != null) {
        url = result[GITLAB_URL];
    }
});

chrome.storage.sync.get(PROJECT_KEY, function(result) {
    if (result[PROJECT_KEY] != null) {
        projects = result[PROJECT_KEY];
        populateProjectOptions();
    }
});

chrome.storage.sync.get(BRANCH_TYPE_KEY, function(result) {
    if (result[BRANCH_TYPE_KEY] != null) {
        branchType = result[BRANCH_TYPE_KEY];
        populateBranchOptions();
    }
});

chrome.storage.sync.get(SRC_BRANCH_TYPE_KEY, function(result) {
    if (result[SRC_BRANCH_TYPE_KEY] != null) {
        srcBranchType = result[SRC_BRANCH_TYPE_KEY];
        populateSrcBranchOptions();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    addIssueIdToBranchNameField();
    setTimeout(function() {
        showExistingBranchCount(false);
        addInputListener("branchName");
        addInputListener("project");
    }, 50);
});