const {ccclass, property} = cc._decorator;

@ccclass
export default class StagePage extends cc.Component {
    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    onLoad() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                const dbRef = firebase.database().ref(user.uid);
                dbRef.once("value", (snapshot) => {
                    const data = snapshot.val();
                    this.node.getChildByName("userTitle").getChildByName("userValue").getComponent(cc.Label).string = data.username.toUpperCase();
                    this.node.getChildByName("coinTitle").getChildByName("coinNum").getComponent(cc.Label).string = data.curStage.coinNum.toString();
                    this.node.getChildByName("lifeTitle").getChildByName("lifeNum").getComponent(cc.Label).string = data.curStage.restLife.toString();
                    this.node.getChildByName("scoreTitle").getChildByName("scoreVal").getComponent(cc.Label).string = data.curStage.totalPoint.toString().padStart(7, '0');
                    this.node.getChildByName("stage2Btn").getComponent(cc.Button).interactable = data.stage1Flag;
                }).then(resolve => {
                    let stage1Btn = new cc.Component.EventHandler();
                    stage1Btn.target = this.node;
                    stage1Btn.component = "stagePage";
                    stage1Btn.handler = "stage1Btn";
                    cc.find("Canvas/stage1Btn").getComponent(cc.Button).clickEvents.push(stage1Btn);

                    let stage2Btn = new cc.Component.EventHandler();
                    stage2Btn.target = this.node;
                    stage2Btn.component = "stagePage";
                    stage2Btn.handler = "stage2Btn";
                    cc.find("Canvas/stage2Btn").getComponent(cc.Button).clickEvents.push(stage2Btn);

                    let lbBtn = new cc.Component.EventHandler();
                    lbBtn.target = this.node;
                    lbBtn.component = "stagePage";
                    lbBtn.handler = "lbBtn";
                    cc.find("Canvas/lbBtn").getComponent(cc.Button).clickEvents.push(lbBtn);
                })
            } else {
                cc.director.loadScene("StartPage");
            }
        });
    }

    start () {
        cc.audioEngine.playMusic(this.bgm, true);
    }
    
    stage1Btn() {
        cc.director.loadScene("Stage1.2");
    }

    stage2Btn() {
        cc.director.loadScene("Stage2");
    }

    lbBtn() {
        cc.director.loadScene("LeaderBoardPage");
    }
}
