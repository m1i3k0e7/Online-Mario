import GameManager from "./GameManager";
import Player from "./player";
import TurtleShell from "./turtleShell";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Goomba extends cc.Component {

    @property(GameManager)
    GameMgr: GameManager = null;

    public isDead: boolean = false;
    public idx: number;
    private moveSpeed: number = 80;
    private changeDuration: number = 0.07;
    private moveDirection: number = 1;
    private changeCnt: number = 0;
    private body: cc.Node = null;
    private animation: cc.Animation = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        this.body = this.node.getChildByName("body");
        this.animation = this.body.getComponent(cc.Animation);
    }

    start() {
        this.moveDirection = Math.round(Math.random()) * 2 - 1;
        this.moveSpeed = 80;// * this.moveDirection;
    }

    update(dt) {
        this.changeCnt += dt;
        if(this.changeCnt >= this.changeDuration) {
            this.changeCnt = 0;
            this.moveSpeed *= -1;
            this.node.scaleX *= -1;
        }
        if(!this.isDead) {
            this.node.x += this.moveSpeed * dt * this.node.scaleX * this.moveDirection;
    
        }
    }

    goDie() {
        this.isDead = true;
        this.node.group = "deadBody";
        this.node.getComponent(cc.RigidBody).gravityScale = 0;
        this.GameMgr.totalPoint += 100;
        this.GameMgr.existGoomba[this.idx] = 0;
        this.node.scaleX *= -1;
        this.node.scaleX *= this.node.scaleX;
        this.animation.play("goombaDie");
        setTimeout(function () {
            this.node.destroy();
        }.bind(this), 7000);
    }
    
    onBeginContact(contact, self, other) {
        if(other.node.name == "Player") {
            var dead = other.node.getComponent(Player).isDead;
            if(other.node.y - other.node.height / 2 >= self.node.y - 3.6 + 14 / 2 && !dead && !this.isDead) {
                // if(other.node.x >= self.node.x - self.node.width / 5 && other.node.x <= self.node.x + self.node.width / 5)
                this.GameMgr.playStompSound();
                this.goDie();
            }
        } else if(other.node.name == "block") {

        } else if(other.node.name == "ground") {
            
        } else if(other.node.name == "turtleShell") {
            if(other.node.getComponent(cc.RigidBody).linearVelocity.x != 0) {
                if(other.node.getComponent(TurtleShell).canHurt()) {
                    this.GameMgr.playKickSound();
                    this.goDie();
                }
            }
        } else {
            this.moveDirection *= -1;
        }
    }
} 
