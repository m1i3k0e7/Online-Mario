import GameManager from "./GameManager";
import Player from "./player";
import Turtle from "./turtle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Mushroom extends cc.Component {

    @property(GameManager)
    GameMgr: GameManager = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
    }

    update(dt) {
        
    }

    onBeginContact(contact, self, other) {
        console.log("hit");
        if(other.node.name == "Player") {
            this.GameMgr.playPowerUpSound();
            this.GameMgr.totalPoint += 300;
            other.node.getComponent(Player).isBig = true;
            other.node.getComponent(Player).turnBig();
            self.node.destroy();
        } else if(other.node.name == "ground") {
            
        }
    }
} 
