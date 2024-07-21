import GameManager from "./GameManager";
import Mushroom from "./mushroom";
import Player from "./player";
import Turtle from "./turtle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MushroomBrick extends cc.Component {

    @property(GameManager)
    GameMgr: GameManager = null;

    @property(cc.Prefab)
    mushroom: cc.Prefab = null;

    private mushroomObtained: boolean = false;
    private animation: cc.Animation = null;
    public idx: number;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        this.animation = this.node.getComponent(cc.Animation);
    }

    start() {
        if(this.mushroomObtained) {
            this.animation.play("coinObtained");
        }
    }

    update(dt) {
        
    }

    playEffect() {

    }

    onBeginContact(contact, self, other) {
        if(other.node.name == "Player") {
            if(!this.mushroomObtained) {
                if(other.node.y + other.node.height / 2 <= self.node.y - self.node.height / 2) {
                    this.playEffect();
                    this.GameMgr.playMushroomSound();
                    this.mushroomObtained = true;
                    this.GameMgr.existMushroom[this.idx] = 0;
                    this.animation.play("coinObtained");
                    var tmpMushroom = cc.instantiate(this.mushroom);
                    tmpMushroom.position = new cc.Vec2(this.node.x, this.node.y + 1);
                    tmpMushroom.getComponent(Mushroom).GameMgr = this.GameMgr;
                    var action = cc.moveBy(1, 0, 15);
                    cc.find("mushrooms").addChild(tmpMushroom);
                    tmpMushroom.runAction(action);
                    tmpMushroom.getComponent(cc.PhysicsBoxCollider).friction = 0;
                    tmpMushroom.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(100, 0);
                    tmpMushroom.getComponent(cc.RigidBody).gravityScale = 1;
                }
            }
        }
    }
} 
