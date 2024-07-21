import GameManager from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Camera extends cc.Component {

    @property(GameManager)
    GameMgr: GameManager = null;

    private coinLabel: cc.Label = null;
    private pointLabel: cc.Label = null;
    private timeLabel: cc.Label = null;
    private lifeLabel: cc.Label = null;

    onLoad() {
        this.coinLabel = this.node.getChildByName("coinNum").getComponent(cc.Label);
        this.pointLabel = this.node.getChildByName("totalPoint").getComponent(cc.Label);
        this.timeLabel = this.node.getChildByName("restTime").getComponent(cc.Label);
        this.lifeLabel = this.node.getChildByName("restLife").getComponent(cc.Label);
    }

    update(dt) {
        this.coinLabel.string = this.GameMgr.coinNum.toString();
        this.pointLabel.string = this.GameMgr.totalPoint.toString().padStart(7, '0');
        this.timeLabel.string = this.GameMgr.restTime.toString().padStart(3, '0');
        this.lifeLabel.string = "X" + this.GameMgr.restLife;
    }

    onBeginContact(contact, self, other) {
        
    }
} 
