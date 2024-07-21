const {ccclass, property} = cc._decorator;

@ccclass
export default class SignupPage extends cc.Component {

    private email: string = "";
    private username: string = "";
    private password: string = "";

    @property(cc.Prefab)
    failFieldPrefab: cc.Prefab;

    start () {
        let enterBtn = new cc.Component.EventHandler();
        enterBtn.target = this.node;
        enterBtn.component = "signupPage";
        enterBtn.handler = "enter";
        cc.find("Canvas/field/enterBtn").getComponent(cc.Button).clickEvents.push(enterBtn);

        let backBtn = new cc.Component.EventHandler();
        backBtn.target = this.node;
        backBtn.component = "signupPage";
        backBtn.handler = "back";
        cc.find("Canvas/field/backBtn").getComponent(cc.Button).clickEvents.push(backBtn);

        let emailBoxEvent = new cc.Component.EventHandler();
        emailBoxEvent.target = this.node;
        emailBoxEvent.component = "signupPage";
        emailBoxEvent.handler = "changeEmail";
        cc.find("Canvas/field/email").getComponent(cc.EditBox).textChanged.push(emailBoxEvent);

        let usernameBoxEvent = new cc.Component.EventHandler();
        usernameBoxEvent.target = this.node;
        usernameBoxEvent.component = "signupPage";
        usernameBoxEvent.handler = "changeUsername";
        cc.find("Canvas/field/username").getComponent(cc.EditBox).textChanged.push(usernameBoxEvent);

        let passwordBoxEvent = new cc.Component.EventHandler();
        passwordBoxEvent.target = this.node;
        passwordBoxEvent.component = "signupPage";
        passwordBoxEvent.handler = "changePassword";
        cc.find("Canvas/field/password").getComponent(cc.EditBox).textChanged.push(passwordBoxEvent);
    }

    enter() {
        if(!this.username || !this.email || !this.username) {
            var tmpFailed = cc.instantiate(this.failFieldPrefab);
            tmpFailed.getChildByName("info").getComponent(cc.Label).string = "Empty field(s)";
            
            let closeFailed = new cc.Component.EventHandler();
            closeFailed.target = this.node;
            closeFailed.component = "signupPage";
            closeFailed.handler = "closeFail";
            tmpFailed.getChildByName("close").getComponent(cc.Button).clickEvents.push(closeFailed);

            cc.find("Canvas/field").addChild(tmpFailed);
            return ;
        } else if(this.password.length < 6) {
            var tmpFailed = cc.instantiate(this.failFieldPrefab);
            tmpFailed.getChildByName("info").getComponent(cc.Label).string = "Password cannot be shorter than 6 chars";
            
            let closeFailed = new cc.Component.EventHandler();
            closeFailed.target = this.node;
            closeFailed.component = "signupPage";
            closeFailed.handler = "closeFail";
            tmpFailed.getChildByName("close").getComponent(cc.Button).clickEvents.push(closeFailed);

            cc.find("Canvas/field").addChild(tmpFailed);
            return ;
        }

        firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
        .then((userCredential) => {
            var user = userCredential.user;
            var stage1 = {
                totalPoint: 0,
                restTime: 300,
                positionX: 212,
                positionY: 118,
                coinNum: 0,
                isBig: false,
                restLife: 5,
                existCoin: [1,1,1,1,1,1,1,1],
                existMushroom: [1],
                existGoomba: [1,1],
                existTurtle: [1,1],
            };
            var stage2 = {
                totalPoint: 0,
                restTime: 300,
                positionX: 150,
                positionY: 118,
                coinNum: 0,
                isBig: false,
                restLife: 5,
                existCoin: [1,1,1,1,1],
                existMushroom: [1],
                existGoomba: [1,1,1,1,1,1,1,1,1,1],
                existTurtle: [1,1,1,1],
            };
            var curStage = {
                stage: 1,
                totalPoint: 0,
                coinNum: 0,
                restLife: 5,
            }

            firebase.database().ref('leaderboard/' + user.uid).set([
                0,
                this.username,
            ]);
            
            firebase.database().ref(user.uid).set({
                username: this.username,
                email: this.email,
                stage1: stage1,
                stage1Flag: false,
                stage2: stage2,
                curStage: curStage,
            }).then(resolve => {
                firebase.auth().signOut().then(() => {
                    console.log("sign out");
                    cc.director.loadScene("StartPage");
                }).catch((error) => {
                    console.log(error.message);
                });
            });
        })
        .catch((error) => {
            // console.log(error.message);
            var tmpFailed = cc.instantiate(this.failFieldPrefab);
            tmpFailed.getChildByName("info").getComponent(cc.Label).string = error.message;
            
            let closeFailed = new cc.Component.EventHandler();
            closeFailed.target = this.node;
            closeFailed.component = "signupPage";
            closeFailed.handler = "closeFail";
            tmpFailed.getChildByName("close").getComponent(cc.Button).clickEvents.push(closeFailed);

            cc.find("Canvas/field").addChild(tmpFailed);
        });

        
    }

    closeFail() {
        cc.find("Canvas/field/failed").destroy();
    }

    back() {
        cc.director.loadScene("StartPage");
    }

    changeEmail(text) {
        this.email = text;
    }

    changeUsername(text) {
        this.username = text;
    }

    changePassword(text) {
        this.password = text;
    }
    
}
