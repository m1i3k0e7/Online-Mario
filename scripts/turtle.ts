import GameManager from "./GameManager";
import Player from "./player";
import TurtleShell from "./turtleShell";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Turtle extends cc.Component {

    @property(GameManager)
    GameMgr: GameManager = null;

    @property(cc.Prefab)
    turtleShell: cc.Prefab = null;


    public isDead: boolean = false;
    private moveSpeed: number = 50;
    private moveDirection: number = -1;
    private animation: cc.Animation = null;
    public idx: number;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        this.animation = this.node.getComponent(cc.Animation);
    }

    start() {
        this.animation.play("turtleWalk");
    }

    update(dt) {
        if(!this.isDead) {
            this.node.x += this.moveSpeed * this.moveDirection * dt;
        }
    }

    goDie() {
        this.isDead = true;
        this.node.group = "deadBody";
        this.GameMgr.totalPoint += 200;
        this.GameMgr.existTurtle[this.idx] = 0;
        this.node.getComponent(cc.RigidBody).gravityScale = 0;
        this.node.scaleX *= -1;
        this.node.scaleX *= this.node.scaleX;
        this.animation.play("turtleDie");

        setTimeout(function() {
            var tmpTurtleShell = cc.instantiate(this.turtleShell);
            tmpTurtleShell.group = "shell";
            tmpTurtleShell.getComponent(TurtleShell).GameMgr = this.GameMgr;
            tmpTurtleShell.setPosition(this.node.position);
            cc.find("shells").addChild(tmpTurtleShell);
        }.bind(this), 500);
        
        setTimeout(function () {
            // this.node.destroy();
        }.bind(this), 7000);
    }
    
    onBeginContact(contact, self, other) {
        if(other.node.name == "Player") {
            var dead = other.node.getComponent(Player).isDead;
            if(other.node.y - other.node.height / 2 >= self.node.y + self.node.height / 2 && !dead && !this.isDead) {
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
            this.node.scaleX *= -1;
            this.moveDirection *= -1;
        }
    }
} 
