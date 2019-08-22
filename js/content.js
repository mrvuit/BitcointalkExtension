chrome.runtime.onMessage.addListener(
    function (message) {
        Bitcointalk.init(message.key, message.value, 0);
    }
);
chrome.storage.local.get('bitcointalk', function (storage) {
    Object.keys(storage.bitcointalk).map(function (key) {
        Bitcointalk.init(key, storage.bitcointalk[key], 1);
    });
});

const Bitcointalk = {
    init: function (key, value, event) {
        this.setStorage(key, value);
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
            case "external-link":
                this.toggleExternalLink(value);
                break;
            case "zoom":
                this.zoomFontSize(value, event);
                break;
        }
    },
    setStorage: function (key, value) {
        chrome.storage.local.get('bitcointalk', function (storage) {
            let newStorage = storage.bitcointalk;
            newStorage[key] = value;
            chrome.storage.local.set({'bitcointalk': newStorage});
        });
    },
    getAnStorage: function (key, callback) {
        chrome.storage.local.get('bitcointalk', function (storage) {
            callback(storage.bitcointalk[key] !== undefined ? storage.bitcointalk[key] : null);
        });
    },
    toggleExternalLink: function (value) {
        let externalLink = document.getElementsByTagName("a");
        for (let i = 0; i < externalLink.length; i++) {
            if (!externalLink[i].href.includes("https://bitcointalk.org")) {
                externalLink[i].setAttribute('target', (value === "on" ? "_blank" : "_self"));
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
            Bitcointalk.getAnStorage('zoom', function (res) {
                document.body.style.zoom = (!isNaN(parseInt(res)) ? parseInt(res) : 100) + "%";
            });
        }
    }
};




