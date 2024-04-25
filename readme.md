# Jira & GitLab integration
The extension adds a new Gitlab integration pop-up menu dirrectly from JIRA tab. If you wish to open new or locate existing branches for your ticket, this extension is for you.

![Screenshot1](screenshots/Capture9.PNG)

## Description
This chrome extension makes it easier to create new branches on GitLab directly from Jira. Adds a new button to the issue overview page. After clicking this button a modal shows up. On this modal you can specifiy the desired name of the new branch and the rerfence branch or commit hash where it will be forked from. You can also always notice the  project name of your GitLab repo where this new branch will be created. Currently only one project/repo supported. 
For perfoming the create branch action the extension uses the GitLab APIs. See the [GitLab API docs](https://docs.gitlab.com/ee/api/)!
If the branch created successfully then a success notif should popup. If something went wrong you will see browser alerts.

### Add to your Chrome
<a target="_blank" href="https://chrome.google.com/webstore/detail/jira-gitlab-integration-n/ccoandmmhdbepejjfhlimekeeamdkgkj">![Try it now in CWS](https://raw.github.com/GoogleChrome/chrome-app-samples/master/tryitnowbutton.png "Click here to install this from the Chrome Web Store")</a>

### How to configure
To reveal the extension settings simply click on the extension icon in the extensions toolbar. On the popup you have to set the access token and the project id from GitLab.

![Screenshot4](screenshots/Capture7.png)

#### 1. Generate access token
In order to get access to the GitLab APIs you must create an access token first in your profile with allowing the api usage (only). Then you should copy the generated key.

![Screenshot4](screenshots/Capture11.png)

#### 2. Copy the project Id
The project id can be found on the project`s overview page on GitLab. 

![Screenshot5](screenshots/Capture10.PNG)

3. Save
Don't foget to click the ´Save´ button. After you have saved the values the extension is ready to use.

## Screenshots
### Create branch modal
![Screenshot7](screenshots/Capture2.PNG)

## In action

![Screenrecord9](screenshots/how-it-works.gif)
