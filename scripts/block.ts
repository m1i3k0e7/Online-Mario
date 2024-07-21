const {ccclass, property} = cc._decorator;

@ccclass
export default class CoinBrick extends cc.Component {

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
    }

    update(dt) {

    }

    onBeginContact(contact, self, other) {
        
    }
} 
