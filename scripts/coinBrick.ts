import GameManager from "./GameManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CoinBrick extends cc.Component {
    @property(GameManager)
    GameMgr: GameManager = null;

    private coinObtained: boolean = false;
    private brickAnimation: cc.Animation = null;
    private coinAnimation: cc.Animation = null;
    private scoreAnimation: cc.Animation = null;
    private brick: cc.Node = null;
    private coin: cc.Node = null;
    public idx: number;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        this.brick = this.node.getChildByName("brick");
        this.coin = this.node.getChildByName("coin");
        this.brickAnimation = this.brick.getComponent(cc.Animation);
        this.coinAnimation = this.coin.getComponent(cc.Animation);
        this.scoreAnimation = this.node.getChildByName("score").getComponent(cc.Animation);
    }

    start() {
        if(this.coinObtained) {
            this.brickAnimation.play("coinObtained");
        }
    }

    update(dt) {
        
    }

    onBeginContact(contact, self, other) {
        if(other.node.name == "Player") {
            if(!this.coinObtained) {
                if(other.node.y + other.node.height / 2 <= self.node.y - self.node.height / 2) {
                    this.GameMgr.coinNum += 1;
                    this.GameMgr.totalPoint += 100;
                    this.playEffect();
                    this.coinObtained = true;
                    this.GameMgr.existCoin[this.idx] = 0;
                    this.brickAnimation.play("coinObtained");
                    this.coinAnimation.play("coinAnim");
                    this.scoreAnimation.play("scoreAnim");
                }
            }
        }
    }

    playEffect() {
        this.GameMgr.playEffect();
    }
} 
