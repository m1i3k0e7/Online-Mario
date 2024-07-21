import GameManager from "./GameManager";
import Goomba from "./goomba";
import Turtle from "./turtle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property(GameManager)
    GameMgr: GameManager = null;

    @property(cc.Node)
    camera = null;

    @property(cc.SpriteFrame)
    smallFrame = null;

    @property(cc.SpriteFrame)
    bigFrame = null;

    private playerSpeed: Number = 0;

    private wDown: boolean = false;
    private aDown: boolean = false;
    private sDown: boolean = false;
    private dDown: boolean = false;

    public isDead: boolean = false;
    private onGround: boolean = false;
    private isWalking: boolean = false;

    private animation: cc.Animation = null;
    public isBig: boolean = false;



    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.animation = this.node.getComponent(cc.Animation);

        if(this.isBig) {
            this.turnBig();
        }
    }

    start() {

    }

    onKeyDown(event) {
        if(event.keyCode == cc.macro.KEY.w) {
            this.wDown = true;
        } else if(event.keyCode == cc.macro.KEY.a) {
            this.aDown = true;
            this.dDown = false;
        } else if(event.keyCode == cc.macro.KEY.s) {
            this.sDown = true;
        } else if(event.keyCode == cc.macro.KEY.d) {
            this.dDown = true;
            this.aDown = false;
        }
    }

    onKeyUp(event) {
        if(event.keyCode == cc.macro.KEY.w) {
            this.wDown = false;
        } else if(event.keyCode == cc.macro.KEY.a) {
            this.aDown = false;
        } else if(event.keyCode == cc.macro.KEY.s) {
            this.sDown = false;
        } else if(event.keyCode == cc.macro.KEY.d) {
            this.dDown = false;
        }
    }

    turnBig() {
        this.node.getComponent(cc.PhysicsBoxCollider).size.width = 19;
        this.node.getComponent(cc.PhysicsBoxCollider).size.height = 27;
        this.node.getComponent(cc.PhysicsBoxCollider).offset.x = 0;
        this.node.getComponent(cc.PhysicsBoxCollider).offset.y = 0;
        this.node.scaleX *= -1;
        this.node.scaleX *= -1;
    }

    turnSmall() {
        this.node.getComponent(cc.PhysicsBoxCollider).size.width = 11.5;
        this.node.getComponent(cc.PhysicsBoxCollider).size.height = 16;
        this.node.getComponent(cc.PhysicsBoxCollider).offset.x = 0;
        this.node.getComponent(cc.PhysicsBoxCollider).offset.y = 0;
        this.node.scaleX *= -1;
        this.node.scaleX *= -1;
    }

    private playerMovement(dt) {
        this.playerSpeed = 0;
        if(this.isDead) {
            return ;
        }

        if(this.aDown) {
            this.playerSpeed = -150;
            this.node.scaleX = -1;
        } else if(this.dDown) {
            this.playerSpeed = 150;
            this.node.scaleX = 1;
        }

        if(this.playerSpeed != 0) {
            this.node.x += this.playerSpeed * dt;
            if(!this.isWalking) {
                this.isWalking = true;
                if(!this.onGround) {
                    if(this.isBig) {
                        this.animation.play("bigPlayerJump");
                    } else {
                        this.animation.play("playerJump");
                    }
                } else {
                    if(this.isBig) {
                        this.animation.play("bigPlayerWalk");
                    } else {
                        this.animation.play("playerWalk");
                    }
                }
            }
        } else {
            this.isWalking = false;
            if(!this.onGround) {
                if(this.isBig) {
                    this.animation.play("bigPlayerJump");
                } else {
                    this.animation.play("playerJump");
                }
            } else {
                if(this.isBig) {
                    this.animation.play("bigPlayerIdle");
                } else {
                    this.animation.play("playerIdle");
                }
            }   
        }

        if(this.wDown && this.onGround) {
            this.GameMgr.playJumpEffect();
            this.jump();
        }
    }

    private jump() {
        this.onGround = false;
        if(this.isBig) {
            this.getComponent(cc.RigidBody).applyForceToCenter(new cc.Vec2(0, 15000));
        }
        else {
            this.getComponent(cc.RigidBody).applyForceToCenter(new cc.Vec2(0, 4600));
        }
    }

    update(dt) {
        if(this.node.y <= -15) {
            this.isBig = false;
            this.turnSmall();
            this.node.scaleX *= -1;
            this.node.scaleX *= -1;
            this.GameMgr.playerReborn(false);
            if(this.GameMgr.restLife > 1) {
                this.GameMgr.playLoseLifeSound();
            } else {
                this.GameMgr.playGameOverSound();
            }
        }
        this.playerMovement(dt);
        this.camera.x = Math.max(this.node.x, 430);
    }

    goDie() {
        this.node.group = "deadBody";
        this.node.scaleX *= -1;
        if(!this.isBig)
            this.isDead = true;
        if(!this.isBig) {
            if(this.GameMgr.restLife > 1) {
                this.GameMgr.playLoseLifeSound();
            } else {
                this.GameMgr.playGameOverSound();
            }
        }
        // this.node.getComponent(cc.RigidBody).gravityScale = 5;
    }

    onBeginContact(contact, self, other) {
        var contactY = contact.getWorldManifold().normal.y;
        if(other.node.name == "ground") {
            if(contactY == -1) {
                this.onGround = true;
            }
            /*
            if(self.node.x - 11.5 / 2 >= other.node.x - other.node.width / 2) {
                if(self.node.x + 11.5 / 2 <= other.node.x + other.node.width / 2) {
                    this.onGround = true;
                }
            }
            */
            if(this.isWalking) {
                if(this.isBig) {
                    this.animation.play("bigPlayerWalk");
                } else {
                    this.animation.play("playerWalk");
                }
            } else {
                if(this.isBig) {
                    this.animation.play("bigPlayerIdle");
                } else {
                    this.animation.play("playerIdle");
                }
            }
        } else if(other.node.name == "coinBrick" || other.node.name == "tube" || other.node.name == "wood" || other.node.name == "mushroomBrick") {
            if(/* contactY == -1 */ self.node.y - self.node.height / 2 >= other.node.y + other.node.height / 2) {
                this.onGround = true;
            }
            /*
            if(self.node.y - self.node.height / 2 >= other.node.y + other.node.height / 2) {
                if(self.node.x - 11.5/2 <= other.node.x + other.node.width / 2 && self.node.x + 11.5/2 >= other.node.x - other.node.width / 2) {
                    this.onGround = true;
                }
            }
            */
        } else if(other.node.name == "block") {
            if(self.node.y >= other.node.y + other.node.height / 2) {
                if(self.node.x - 11.5/2 >= other.node.x - other.node.width / 2 && self.node.x + 11.5/2 <= other.node.x + other.node.width / 2) {
                    // this.node.getComponent(cc.RigidBody).gravityScale = 0;
                    // this.node.getComponent(cc.RigidBody).linearVelocity = new cc.Vec2(0, 0);
                    this.onGround = true;
                } else {
                    contact.disabled = true;
                }
            } else {
                contact.disabled = true;
            }
        } else if(other.node.name == "goomba") {
            var dead = other.node.getComponent(Goomba).isDead;
            if(other.node.y + other.node.height / 2 > self.node.y - 3.6 + 14 / 2 && !dead && !this.isDead) {
                this.goDie();
                this.GameMgr.playerReborn(true);
            }
        } else if(other.node.name == "turtleShell") {
            
        } else if(other.node.name == "turtle") {
            var dead = other.node.getComponent(Turtle).isDead;
            if(other.node.y + other.node.height / 2 > self.node.y - 3.6 + 14 / 2 && !dead && !this.isDead) {
                this.goDie();
                this.GameMgr.playerReborn(true);
            }
        }
    }

    onEndContact(contact, self, other) {
        if(other.node.name == "block") {
            if(self.node.y >= other.node.y + other.node.height / 2) {
                this.node.getComponent(cc.RigidBody).gravityScale = 4;
            }
        } else if(other.node.name == "flag") {
            this.GameMgr.clearLevel();
        } else if(other.node.name == "coinBrick" || other.node.name == "tube" || other.node.name == "wood" || other.node.name == "mushroomBrick") {
            if(contact.getWorldManifold().normal.y == -1) {
                // this.onGround = false;
            }
        }
    }
} 
