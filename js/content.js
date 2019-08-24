chrome.runtime.onMessage.addListener(
    function (message) {
        Bitcointalk.init(message.key, message.value, 0);
    }
);
chrome.storage.local.get('bitcointalk', function (storage) {
    if (typeof Object.keys(storage) !== 'undefined' && Object.keys(storage).length > 0) {
        Object.keys(storage.bitcointalk).map(function (key) {
            Bitcointalk.init(key, storage.bitcointalk[key], 1);
        });
    }
    
});

const Bitcointalk = {
    init: function (key, value, event) {
        this.setStorage(key, value);
        this.externalLink();
        switch (key) {
            case  "signature":
                this.toggleSignature(value);
                break;
            case  "avatar":
                this.toggleAvatar(value);
                break;
            case  "theme":
                this.toggleTheme(value);
                break;
            case "merit":
                this.toggleMerit(value);
                break;
            case "zoom":
                this.zoomFontSize(value, event);
                break;
        }
    },
    setStorage: function (key, value) {
        chrome.storage.local.get('bitcointalk', function (storage) {
            let newStorage = {};
            if (typeof Object.keys(storage) !== 'undefined' && Object.keys(storage).length > 0) {
                newStorage = storage.bitcointalk;
                
            }
            newStorage[key] = value;
            
            chrome.storage.local.set({'bitcointalk': newStorage});
        });
    },
    getAnStorage: function (key, callback) {
        chrome.storage.local.get('bitcointalk', function (storage) {
            callback(storage.bitcointalk[key] !== undefined ? storage.bitcointalk[key] : null);
        });
    },
    externalLink: function () {
        let externalLink = document.getElementsByTagName("a");
        for (let i = 0; i < externalLink.length; i++) {
            if (!externalLink[i].href.includes("https://bitcointalk.org")) {
                externalLink[i].setAttribute('target', "_blank");
            }
        }
    },
    toggleTheme: function (value) {
        let styleOld = document.getElementsByClassName("bitcointalk-css-inject");
        if (styleOld.length > 0) {
            styleOld[0].remove();
        }
        
        if (value !== "on" && !isNaN(parseInt(value))) {
            let urlCss = chrome.runtime.getURL(`css/bitcointalk/${value}.css`);
            fetch(urlCss).then(response => response.text()).then(css => {
                let style = document.createElement("style");
                document.body.appendChild(style);
                style.className = "bitcointalk-css-inject";
                style.innerHTML = css;
            });
        }
    },
    toggleSignature: function (value) {
        let signature = document.getElementsByClassName("signature");
        for (let i = 0; i < signature.length; i++) {
            signature[i].style.display = (value === "on" ? "none" : "block");
        }
    },
    toggleAvatar: function (value) {
        let img = document.getElementsByTagName("img");
        for (let i = 0; i < img.length; i++) {
            if (img[i].src.includes('useravatars')) {
                img[i].style.display = (value === "on" ? "none" : "block");
            }
        }
    },
    zoomFontSize: function (value, event) {
        if (event === 0) {
            let newFontSize = !isNaN(parseInt(document.body.style.zoom)) ? parseInt(document.body.style.zoom) : 100;
            if (value === "plus") {
                newFontSize += 5;
            } else if (value === "minus") {
                newFontSize -= 5;
            } else {
                newFontSize = 100;
            }
            this.setStorage('zoom', newFontSize);
            document.body.style.zoom = newFontSize + "%";
        } else {
            this.getAnStorage('zoom', function (res) {
                document.body.style.zoom = (!isNaN(parseInt(res)) ? parseInt(res) : 100) + "%";
            });
        }
    },
    toggleMerit: function (value) {
        if(window.location.href.includes("https://bitcointalk.org/index.php?topic=") && value === "on") {
            let sesc = document.querySelectorAll("td.maintab_back a[href*='index.php?action=logout;'");
            if(sesc.length === 0) {
                return;
            }
            sesc = /;sesc=(.*)/.exec(sesc[0].getAttribute("href"))[1];
    
            let merit = document.querySelectorAll("td.td_headerandpost div[id^=ignmsgbttns] a[href*='index.php?action=merit;msg=']");
            if(merit.length === 0) {
                return;
            }
            
            for (let i = 0; i < merit.length; i++) {
                let msgId = /msg=([0-9]+)/.exec(merit[i].href)[1];
                merit[i].setAttribute('data-href', merit[i].getAttribute('href'));
                merit[i].setAttribute('href', "javascript:void(0)");
                
                merit[i].getElementsByTagName("span")[0].setAttribute("class", "openMerit");
                merit[i].getElementsByTagName("span")[0].setAttribute("id", "open" + msgId);
    
                merit[i].getElementsByTagName("span")[0].addEventListener("click", function (e) {
                    e.preventDefault();
                    nodeForm.querySelectorAll("div[class^=result]")[0].style.display = "none";
                    if(document.getElementById('merit' + msgId).style.display === "block") {
                        document.getElementById('merit' + msgId).style.display = "none";
                    } else {
                        document.getElementById('merit' + msgId).style.display = "block";
                    }
                });
                
                let nodeForm = document.createElement('div');
                nodeForm.setAttribute('id', 'merit' + msgId);
                nodeForm.innerHTML = [
                    '<form>',
                        '<div class="form">',
                            '<div>',
                                'Merit points: <input size="6" name="merits" step="1" value="1" type="number" autocomplete="off"/>',
                            '</div>',
                            '<div style="margin-top: 6px">',
                                '<input value="Send" type="submit">',
                                '<button type="button">Close</button>',
                            '</div>',
                        '</div>',
                        '<div class="result" style="display: none">',
                        '</div>',
                        '<div class="loading" style="display: none">',
                            '<span>Loading...</span>',
                        '</div>',
                    '</form>'
                ].join("");
                nodeForm.style.display = "none";
                nodeForm.style.marginTop = "5px";
                merit[i].parentNode.appendChild(nodeForm);
    
                nodeForm.getElementsByTagName('form')[0].addEventListener("submit", function (e) {
                    e.preventDefault();
                    nodeForm.querySelectorAll("div[class^=form]")[0].style.display = "none";
                    nodeForm.querySelectorAll("div[class^=result]")[0].style.display = "none";
                    nodeForm.querySelectorAll("div[class^=loading]")[0].style.display = "block";
                    
                    let xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if (this.readyState === 4 && this.status === 200) {
                            let msgResult  = "Error, please check again.";
                            let responseResult =  this.response.match(/<tr class="windowbg">(.*?)<\/tr>/s);
                            if(responseResult !== null && responseResult[1] !== undefined) {
                                msgResult = responseResult[1].replace(/<(.|\n|\s|\r)*?>/g, '').trim()
                            }
    
                            nodeForm.querySelectorAll("div[class^=form]")[0].style.display = "block";
                            nodeForm.querySelectorAll("div[class^=result]")[0].style.display = "block";
                            nodeForm.querySelectorAll("div[class^=loading]")[0].style.display = "none";
                           
                            if(this.response.includes("<title>An Error Has Occurred!</title>")) {
                                nodeForm.querySelectorAll("div[class^=result]")[0].innerHTML = "<span>" + msgResult + "</span>";
                            }else if(this.response.includes("#msg" + msgId)) {
                                nodeForm.querySelectorAll("div[class^=result]")[0].innerHTML = "<span>Merit added.</span>";
                            } else {
                                nodeForm.querySelectorAll("div[class^=result]")[0].innerHTML = "<span>Server response indeterminate.</span>";
                            }
                        }
                    };
                    xhttp.open("POST", "https://bitcointalk.org/index.php?action=merit", true);
                    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    xhttp.send("msgID="+msgId+"&sc="+sesc+"&merits=" + e.target.elements["merits"].value);
                });
                nodeForm.getElementsByTagName("button")[0].addEventListener("click", function () {
                    nodeForm.style.display = "none";
                    nodeForm.querySelectorAll("div[class^=result]")[0].style.display = "none";
                });
            }
        }
    },
};

