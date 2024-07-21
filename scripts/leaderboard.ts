const {ccclass, property} = cc._decorator;

@ccclass
export default class LeaderBoardPage extends cc.Component {

    @property(cc.Prefab)
    scoreItem: cc.Prefab;

    private listContent: cc.Node;
    private scoreArray = [];

    onLoad() {
        this.listContent = cc.find("Canvas/layout/view/content");
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                firebase.database().ref("leaderboard/").once("value", (snapshot) => {
                    const data = snapshot.val();
                    for(let [key, val] of Object.entries(data)) {
                        this.scoreArray.push(val);
                    }
                }).then(resolve => {
                    this.scoreArray.sort((n1, n2) => {
                        if(n1[0] > n2[0]) {
                            return -1;
                        }
                        if(n1[0] < n2[0]) {
                            return 1;
                        }
                        return n1[1] > n2[1];
                    })

                    for(let scoreItem of this.scoreArray) {
                        let item = cc.instantiate(this.scoreItem);
                        item.getChildByName("name").getComponent(cc.Label).string = scoreItem[1].toUpperCase();
                        item.getChildByName("score").getComponent(cc.Label).string = scoreItem[0].toString().padStart(7, '0');
                        item.parent = this.listContent;
                    }
                });
            }
        });
    }

    start () {
        let closeBtn = new cc.Component.EventHandler();
        closeBtn.target = this.node;
        closeBtn.component = "LeaderBoardPage";
        closeBtn.handler = "close";
        cc.find("Canvas/closeBtn").on("click", this.close);
    }

    close() {
        cc.director.loadScene("StagePage");
    }
}
