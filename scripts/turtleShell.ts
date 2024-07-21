import GameManager from "./GameManager";
import Player from "./player";
import Turtle from "./turtle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TurtleShell extends cc.Component {

    @property(GameManager)
    GameMgr: GameManager = null;

    private moveSpeed: number = 250;
    private direction: number = 1;
    public noHurtTime: number = 0;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
    }

    update(dt) {
        if(this.noHurtTime > 0) {
            this.noHurtTime -= dt;
        }

        if(this.node.y <= -15) {
            this.node.destroy();
        }
    }

    setNoHurtTime(time: number = 0.3) {
        this.noHurtTime = time;
    }

    canHurt() {
        return this.noHurtTime <= 0;
    }

    onBeginContact(contact, self, other) {
        if(other.node.name == "Player") {
            if(self.node.getComponent(cc.RigidBody).linearVelocity.x == 0) {
                this.setNoHurtTime();
                this.GameMgr.playKickSound();
                this.direction = self.node.x <= other.node.x ? -1 : 1;
                self.node.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(this.moveSpeed * this.direction, 0);
            } else if(!other.node.isDead && (other.node.y <= self.node.y || this.GameMgr.player.isBig)) {
                // this.setNoHurtTime(1);
                this.GameMgr.player.goDie();
                //other.node.getComponent(Player).isDead = true;
                // other.node.group = "deadBody";
                // other.node.scaleX *= -1;
                /*
                if(this.GameMgr.restLife > 1 && !this.GameMgr.player.isBig) {
                    this.GameMgr.playLoseLifeSound();
                } else if(!this.GameMgr.player.isBig){
                    this.GameMgr.playGameOverSound();
                }
                */
                this.GameMgr.playerReborn(true);
            }
        } else if(other.node.name == "ground") {
            
        } else if(other.node.name == "wood" || other.node.name == "airwall" || other.node.name == "tube") {
            this.direction *= -1;
            self.node.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(this.moveSpeed * this.direction, 0);
        } else if(other.node.name == "goomba" || other.node.name == "turtle") {
            if(self.node.getComponent(cc.RigidBody).linearVelocity.x == 0) {
                this.setNoHurtTime();
                this.GameMgr.playKickSound();
                if(other.node.x <= self.node.x) {
                    this.direction = 1;
                    self.node.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(this.moveSpeed, 0);
                } else {
                    this.direction = -1;
                    self.node.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(-this.moveSpeed, 0);
                }
            }
        }
    }
} 
