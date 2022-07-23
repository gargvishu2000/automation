// every parameter is given in function is given by its parent function.v
const puppeteer=require("puppeteer");
//making cTab as global.
let {answer} =require("./codes");
let {email,password}=require("./secrets");
let cTab;

//do not push your credentials on Github.
//store it in the secrets.js file and put this file in the gitignore file.
let browserOpenPromise= puppeteer.launch({ //this statement to launch chromium browser this return promise.
    headless : false,
    defaultViewport: null,
    args: ["--start-maximized"]
   // executablePath : "//C:\Program Files\Google\Chrome\Application\chrome.exe"
});
//if browser opens then get array of all open tabs and return promise.
//here browser parameter is given by puppetter
browserOpenPromise.then(function(browser){
    console.log("browser is open");
    //browser.pages() An array of all open pages inside the Browser.
    let allTabPromise=browser.pages();
    return allTabPromise;
})
//when all tabs are opened and promis is returned then take first tab and enter url to visit in goto statement.
.then(function(allTabsArr){
    cTab=allTabsArr[0];
    console.log("new Tab opened");
    let visitingLoginPagePromise=cTab.goto("https://www.hackerrank.com/auth/login");//goto - URL to navigate page to.
    return visitingLoginPagePromise;
})
//when page is opened.
.then(function(){
    console.log("Hackerrank Login Page");
    //type - types the value in the given class(selector attribute). Ctab.type(where to type, what to type).
    let emailWillBeTypedPromise=cTab.type(".input[name='username']",email,{delay:100});
    return emailWillBeTypedPromise;
})
.then(function(){
    console.log("email is typed");
    let passwordWillBeTypedPromise=cTab.type(".input[name='password']",password);
    return passwordWillBeTypedPromise;
})
.then(function(){
    console.log("password is typed");
    //click method clicks on the class given and return the promises if it is done or not.
    let willBeLoggedInPromise=cTab.click(".ui-btn.ui-btn-large.ui-btn-primary.auth-button.ui-btn-styled");
    return willBeLoggedInPromise;
})
.then(function(){
    console.log("Logged In the hackerrank page");
    //if puppeteer won't wait for it then it shows error beacuse before loading the whole web page it is going to find the element 
    //which is not present and it shows error. so we have to wait for it.
    //waitAndClick will wait for the selctor to load or entire webpage to load, and then click on it.
    let algorithmTabWillBeOpened=waitAndClick("div[data-automation='algorithms']");
    return algorithmTabWillBeOpened;
})
.then(function(){
    console.log("algorithm page is opened");
    let allQuesPromise=cTab.waitForSelector('a[data-analytics="ChallengeListChallengeName"]');
    return allQuesPromise;
})
.then(function(){
    function getAllQuesLinks(){
        //document contains the HTML in the form it is parsed(tree form) in which it is resolved at machine level.
        let allElemArr=document.querySelectorAll('a[data-analytics="ChallengeListChallengeName"]');
        let linksArr=[];
        for(let i=0;i<allElemArr.length;i++){
            linksArr.push(allElemArr[i].getAttribute("href"));
            //console.log(i);
        }
        return linksArr;
    }
    //evaluate tells in which tab you have to resolve function beacuse in JS we can't have any function which can resolve function in tab of our choice.
    let linksArrPromise=cTab.evaluate(getAllQuesLinks);
    return linksArrPromise;
})
.then(function(linksArr){
//solve question here
/* console.log("Link of all the questions");
console.log(linksArr); */
   let questionsWillBeSolvedPromise= questionSolver(linksArr[0],0);
   for(let i=1;i<linksArr.length;i++){
    questionsWillBeSolvedPromise=questionsWillBeSolvedPromise.then(function(){
        return questionSolver(linksArr[i],i);
    })
   }
   return questionsWillBeSolvedPromise;
})
.then(function(){
    console.log("in the question");
})
.catch(function(err){
    console.log(err);
});
//this function two works waitForSelector and click function into one promise and resolve myPromise after the completion.
function waitAndClick(algoBtn){
    //making new Promise
    let myPromise=new Promise(function(resolve,reject){
        let waitForSelectorPromise=cTab.waitForSelector(algoBtn);
        waitForSelectorPromise
        .then(function(){
            let clickPromise=cTab.click(algoBtn);
            return clickPromise;
        })
        .then(function(){
            console.log("algoBtn is clicked");
            //resolve ater both the above promises are done.
            resolve();
        })
        .catch(function(err){
            console.log(err);
        })
    });
    return myPromise;
}

function questionSolver(url,idx){
    return new Promise(function(resolve,reject){
    let fullLink= `https://www.hackerrank.com${url}`;
    let goToQuesPagePromise=cTab.goto(fullLink);
    goToQuesPagePromise
    .then(function(){
        console.log("question opened");
        //tick the custom input box
        let waitForCheckBoxAndClickPromise=waitAndClick(".checkbox-input");
        return waitForCheckBoxAndClickPromise;
    })
    .then(function(){
        let waitForTextBoxPromise=cTab.waitForSelector(".custominput");
        return waitForTextBoxPromise;
    })
    .then(function(){
        let codeWillBeTypedPromise=cTab.type(".custominput",answer[idx],{delay:50});
        return codeWillBeTypedPromise;
    })
    .then(function(){
        //control key is pressed
        let controlPressedPromise=cTab.keyboard.down("Control");
        return controlPressedPromise;
    })
    .then(function(){
        //a is pressed
        let aPressedPromise=cTab.keyboard.press("a");
        return aPressedPromise;
    })
    .then(function(){
        //
        let xPressedPromise=cTab.keyboard.press("x");
        return xPressedPromise;
    })
    .then(function(){
        //select the editor
        let cursorOnEditorPromise=cTab.click(".monaco-editor.no-user-select.vs");
        return cursorOnEditorPromise;
    })
    .then(function(){
        //a is pressed
        let aPressedPromise=cTab.keyboard.press("a");
        return aPressedPromise;
    })
    .then(function(){
        //v is pressed
        let vPressedPromise=cTab.keyboard.press("v");
        return vPressedPromise;
    })
    .then(function(){
        let submitButtonClickPromise=cTab.click(".hr-monaco-submit");
        return submitButtonClickPromise;
    })
    .then(function(){
        let controlDownPromise=cTab.keyboard.up("Control");
        return controlDownPromise;
    })
    .then(function(){
        console.log("code submitted successfully");
        resolve();
    })
    .catch(function(err){
       reject(err);
    });
});

}

