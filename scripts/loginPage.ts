const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginPage extends cc.Component {

    @property(cc.Prefab)
    failedFieldPrefab: cc.Prefab;

    private email: string = "";
    private password: string = "";

    start () {
        let loginBtn = new cc.Component.EventHandler();
        loginBtn.target = this.node;
        loginBtn.component = "loginPage";
        loginBtn.handler = "login";
        cc.find("Canvas/field/loginBtn").getComponent(cc.Button).clickEvents.push(loginBtn);

        let backBtn = new cc.Component.EventHandler();
        backBtn.target = this.node;
        backBtn.component = "loginPage";
        backBtn.handler = "back";
        cc.find("Canvas/field/backBtn").getComponent(cc.Button).clickEvents.push(backBtn);

        let emailBoxEvent = new cc.Component.EventHandler();
        emailBoxEvent.target = this.node;
        emailBoxEvent.component = "loginPage";
        emailBoxEvent.handler = "changeEmail";
        cc.find("Canvas/field/email").getComponent(cc.EditBox).textChanged.push(emailBoxEvent);

        let passwordBoxEvent = new cc.Component.EventHandler();
        passwordBoxEvent.target = this.node;
        passwordBoxEvent.component = "loginPage";
        passwordBoxEvent.handler = "changePassword";
        cc.find("Canvas/field/password").getComponent(cc.EditBox).textChanged.push(passwordBoxEvent);
    }

    login() {
        // console.log(this.email, this.password);
        firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .then((userCredential) => {
            // var user = userCredential.user;
            cc.director.loadScene("StagePage");
        })
        .catch((error) => {
            var tmpFailed = cc.instantiate(this.failedFieldPrefab);
            tmpFailed.getChildByName("info").getComponent(cc.Label).string = error.message;
            
            let closeFailed = new cc.Component.EventHandler();
            closeFailed.target = this.node;
            closeFailed.component = "loginPage";
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

    changePassword(text) {
        this.password = text;
    }
    
}
