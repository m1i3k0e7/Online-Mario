const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {
    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    onLoad() {
        
    }

    start () {
        this.playBGM();
        
        let loginBtn = new cc.Component.EventHandler();
        loginBtn.target = this.node;
        loginBtn.component = "menu";
        loginBtn.handler = "login";
        cc.find("Canvas/Page/loginBtn").getComponent(cc.Button).clickEvents.push(loginBtn);

        let signupBtn = new cc.Component.EventHandler();
        signupBtn.target = this.node;
        signupBtn.component = "menu";
        signupBtn.handler = "signup";
        cc.find("Canvas/Page/signupBtn").getComponent(cc.Button).clickEvents.push(signupBtn);
    }

    playBGM() {
        cc.audioEngine.playMusic(this.bgm, true);
    }

    login() {
        cc.director.loadScene("LoginPage");
    }

    signup() {
        cc.director.loadScene("SignupPage");
    }
}
