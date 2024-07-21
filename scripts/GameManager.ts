import Player from "./player";
import CoinBrick from "./coinBrick";
import Goomba from "./goomba";
import Turtle from "./turtle";
import MushroomBrick from "./mushroomBrick";
import StagePage from "./stagePage";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    @property({type:cc.AudioClip})
    bgm1: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    bgm2: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    coinSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    jumpSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    mushroomSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    powerUpSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    powerDownSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    loseLifeSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    stompSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    kickSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    levelClearSound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    gameOver1Sound: cc.AudioClip = null;

    @property({type:cc.AudioClip})
    gameOver2Sound: cc.AudioClip = null;

    // @property(Player)
    // player: Player = null;

    @property(cc.Prefab)
    coinBrickPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    goombaPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    gameStartPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    turtlePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    mushroomBrickPrefab: cc.Prefab = null;

    @property()
    isStage1: boolean = true;

    @property(cc.Prefab)
    levelClearedPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    gameOverPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    finalPointPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    playerPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    pauseField: cc.Prefab = null;

    public player: Player;

    public coinNum: number = 0;
    public totalPoint: number = 0;
    public restTime: number = 300;
    private pastTime: number = 0;
    public restLife: number = 5;
    public isCleared: boolean = false;
    public beginTime: number = 300;

    private playerAnim: cc.Animation = null;
    private playerRebornPos: cc.Vec2 = null;
    private isPaused: boolean = false;
    private pauseArrowDir: number = -1;
    private bgmID: number;

    public existCoin: number[];
    public existMushroom: number[];
    public existGoomba: number[];
    public existTurtle: number[];

    onLoad() {
        var tmpGameStart = cc.instantiate(this.gameStartPrefab);
        cc.find("camera").addChild(tmpGameStart);
        cc.director.pause();

        var tmpPlayer = cc.instantiate(this.playerPrefab);
        tmpPlayer.getComponent(Player).camera = cc.find("camera");


        this.player = tmpPlayer.getComponent(Player);
        this.playerAnim = this.player.node.getComponent(cc.Animation);
        this.playerRebornPos = this.player.node.position;
        this.player.node.getComponent(Player).GameMgr = this;

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                const dbRef = firebase.database().ref(user.uid);
                dbRef.once("value", (snapshot) => {
                    const data = snapshot.val();
                    const stageData = this.isStage1 ? data.stage1 : data.stage2;
                    this.coinNum = stageData.coinNum;
                    this.totalPoint = stageData.totalPoint;
                    this.beginTime = stageData.restTime;
                    this.restLife = stageData.restLife;
                    this.player.node.x = stageData.positionX;
                    this.player.node.y = stageData.positionY;
                    this.player.isBig = stageData.isBig;
                    
                    this.existCoin = stageData.existCoin;
                    this.existMushroom = stageData.existMushroom;
                    this.existGoomba = stageData.existGoomba;
                    this.existTurtle = stageData.existTurtle;
                }).then(resolve => {
                    // tmpPlayer.parent = cc.director.getScene();
                    cc.find("mainPlayer").addChild(tmpPlayer);
                    this.coinBrickInstantiate();
                    this.goombaInstantiate();
                    this.turtleInstantiate();
                    this.mushroomBrickInstantiate();

                    setTimeout(function() {
                        cc.find("camera").getChildByName("gameStart").destroy();
                        cc.director.resume();
                    }.bind(this), 1000);
                })
            } else {
                cc.director.loadScene("StartPage");
            }
        });
        
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(dt) {
            this.pastTime += dt;
            this.restTime = this.beginTime - Math.floor(this.pastTime);
            if(this.restTime == 0) {
                this.playerReborn(true);
                this.reSetData();
            }
    }

    start() {
        this.playBGM();
    }

    onKeyDown(event) {
        if(event.keyCode == cc.macro.KEY.p) {
            if(!this.isPaused) {
                var tmpPause = cc.instantiate(this.pauseField);
                cc.find("camera").addChild(tmpPause);

                this.isPaused = !this.isPaused;
                cc.director.pause();
            }
        } else if((event.keyCode == cc.macro.KEY.down || event.keyCode == cc.macro.KEY.up) && this.isPaused) {
            var tmpArrow = cc.find("camera/pause/arrow");
            tmpArrow.y += this.pauseArrowDir * 33;
            this.pauseArrowDir *= -1;
        } else if(event.keyCode == cc.macro.KEY.enter && this.isPaused) {
            if(this.pauseArrowDir == -1) {
                cc.find("camera/pause").destroy();
                this.isPaused = !this.isPaused;
                cc.director.resume();
            } else {
                this.reWriteFirebaseDate(this.player.node.x, this.player.node.y, true);
                /*
                firebase.auth().onAuthStateChanged((user) => {
                    if (user) {
                        var stageData = {
                            totalPoint: this.totalPoint,
                            restTime: this.restTime,
                            positionX: this.player.node.x,
                            positionY: this.player.node.y,
                            coinNum: this.coinNum,
                            isBig: this.player.isBig,
                            restLife: this.restLife,
                        };
                        var curStageData = {
                            stage: this.isStage1 ? 1 : 2,
                            totalPoint: this.totalPoint,
                            coinNum: this.coinNum,
                            restLife: this.restLife,
                        };

                        const dbRef = firebase.database().ref(user.uid);
                        dbRef.once("value", (snapshot) => {
                            const data = snapshot.val();
                            if(this.isStage1) {
                                firebase.database().ref(user.uid).set({
                                    ...data,
                                    stage1: stageData,
                                    curStage: curStageData,
                                })
                            } else {
                                firebase.database().ref(user.uid).set({
                                    ...data,
                                    stage2: stageData,
                                    curStage: curStageData,
                                })
                            }
                        }).then(resolve => {
                            cc.director.loadScene("StagePage");
                            cc.director.resume();
                        });
                    }
                });
                */
            }
        }
    }
    playBGM() {
        if(this.isStage1) {
            this.bgmID = cc.audioEngine.playMusic(this.bgm1, true);
        } else {
            this.bgmID = cc.audioEngine.playMusic(this.bgm2, true);
        }
    }

    stopBGM() {
        cc.audioEngine.stopMusic();
    }

    playEffect() {
        cc.audioEngine.playEffect(this.coinSound, false);
    }

    playJumpEffect() {
        cc.audioEngine.playEffect(this.jumpSound, false);
    }

    playMushroomSound() {
        cc.audioEngine.playEffect(this.mushroomSound, false);
    }

    playPowerUpSound() {
        cc.audioEngine.playEffect(this.powerUpSound, false);
    }

    playPowerDownSound() {
        cc.audioEngine.playEffect(this.powerDownSound, false);
    }

    playStompSound() {
        cc.audioEngine.playEffect(this.stompSound, false);
    }

    playKickSound() {
        cc.audioEngine.playEffect(this.kickSound, false);
    }

    playLoseLifeSound() {
        cc.audioEngine.pauseAll();
        cc.audioEngine.playEffect(this.loseLifeSound, false);
    }

    playGameOverSound() {
        if(this.isStage1) {
            cc.audioEngine.pauseAll();
            cc.audioEngine.playEffect(this.gameOver1Sound, false);
        } else {
            cc.audioEngine.pauseAll();
            cc.audioEngine.playEffect(this.gameOver2Sound, false);
        }
    }

    playLevelClearSound() {
        cc.audioEngine.pauseAll();
        cc.audioEngine.playEffect(this.levelClearSound, false);
    }

    reWriteFirebaseDate(x: number, y: number, load: boolean) {
        const newStageData = {
            totalPoint: this.totalPoint,
            restTime: this.restTime,
            positionX: x,
            positionY: y,
            coinNum: this.coinNum,
            isBig: this.player.isBig,
            restLife: this.restLife,
            existCoin: this.existCoin,
            existMushroom: this.existMushroom,
            existGoomba: this.existGoomba,
            existTurtle: this.existTurtle,
        }
        const newStageData2 = {
            totalPoint: this.totalPoint,
            restTime: this.restTime,
            positionX: 150,
            positionY: 118,
            coinNum: this.coinNum,
            isBig: this.player.isBig,
            restLife: this.restLife,
            existCoin: [1,1,1,1,1],
            existMushroom: [1],
            existGoomba: [1,1,1,1,1,1,1,1,1,1],
            existTurtle: [1,1,1,1],
        }
        const newCurStage = {
            stage: this.isStage1 ? 1 : 2,
            totalPoint: this.totalPoint,
            coinNum: this.coinNum,
            restLife: this.restLife,
        }

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                firebase.database().ref("leaderboard/" + user.uid).once("value", (snapshot) => {
                    const data = snapshot.val();
                    firebase.database().ref("leaderboard/" + user.uid).set([
                        Math.max(data[0], this.totalPoint),
                        data[1],
                    ]);
                });
                
                const dbRef = firebase.database().ref(user.uid);
                dbRef.once("value", (snapshot) => {
                    const data = snapshot.val();
                    if(this.isStage1) {
                        firebase.database().ref(user.uid).set({
                            ...data,
                            stage1: newStageData,
                            stage2: newStageData2,
                            curStage: newCurStage,
                        })
                    } else {
                        firebase.database().ref(user.uid).set({
                            ...data,
                            stage2: newStageData,
                            curStage: newCurStage,
                        })
                    }
                }).then(resolve => {
                    if(load) {
                        cc.director.loadScene("StagePage");
                    }
                    cc.director.resume();
                })
            } else {
                cc.director.loadScene("StartPage");
            }
        });
    }
    
    playerReborn(play: boolean) {
        if(play) {
            if(this.player.isBig) {
                // this.playerAnim.play("bigPlayerDie");
                this.playPowerDownSound();
                this.player.isBig = false;
                this.player.turnSmall();
                this.playerAnim.play("bigPlayerDie");
                setTimeout(function () {
                    this.player.node.getComponent(Player).isDead = false;
                    this.player.node.getComponent(cc.RigidBody).gravityScale = 4;
                    this.player.node.opacity = 255;
                    this.player.node.group = "player";
                    this.player.node.scaleX *= -1;
                    this.player.node.scaleX *= -1;
                    this.playerAnim.stop();
                }.bind(this), 1000);
                
                return ;
            } else {
                this.playerAnim.play("playerDie");
            }
        }

        setTimeout(function () {
            this.player.node.position = this.playerRebornPos;
            this.player.node.getComponent(cc.RigidBody).gravityScale = 4;
            this.player.node.opacity = 255;
            this.playerAnim.stop("playerDie");
        }.bind(this), play ? 2500 : 0);

        setTimeout(function() {
            this.clearCoinBrick();
            this.clearGoomba();
            this.clearTurtle();
            this.clearTurtleShell();
            this.clearMushroomBrick();
            this.coinBrickInstantiate();
            this.goombaInstantiate();
            this.turtleInstantiate();
            this.mushroomBrickInstantiate();
            this.restTime = 300;
            this.restLife -= 1;

            if(this.restLife == 0) {
                this.reSetData();
                this.reWriteFirebaseDate(150, 118, false);
            }
        }.bind(this), play ? 2500 : 0);

        setTimeout(function() {
            this.player.node.group = "player";
            this.player.node.scaleX *= -1;
            cc.director.pause();

            var tmpGameStart = cc.instantiate(this.gameStartPrefab);
            if(play && this.restLife == 1) {
                tmpGameStart.getChildByName("New Label").getComponent(cc.Label).string = "OVER";
                this.player.node.destroy();
            } else if(!play && this.restLife == 5) {
                tmpGameStart.getChildByName("New Label").getComponent(cc.Label).string = "OVER";
                this.player.node.destroy();
            }
            
            cc.find("camera").addChild(tmpGameStart);
        }.bind(this), play ? 2000 : 0);
        
        setTimeout(function() {
            if((play && this.restLife == 5) || (!play && this.restLife == 5)) {
                cc.director.loadScene("StagePage").then(resolve => {
                    cc.find("camera").getChildByName("gameStart").destroy();
                });
            } else {
                cc.find("camera").getChildByName("gameStart").destroy();
            }
            

            cc.audioEngine.resumeAll();
            cc.director.resume();
            this.player.isDead = false;
        }.bind(this), play ? 4000 : this.restLife == 1 ? 3600 : 2000);
    }

    coinBrickInstantiate() {
        var positionArray: number[][] = this.isStage1 ?
                                         [[320, 80], [336, 80], [870, 138], [1087, 79], [1103, 79], [1715, 145], [1750, 191], [1907, 123]]
                                         :
                                         [[1474.827, 120.51], [1398.883, 205], [2381.938, 95.91], [2397.938, 95.91], [870, 120]];

        for(let i = 0; i < positionArray.length; i++) {
            let x = positionArray[i][0], y = positionArray[i][1];
            var tmpCB: cc.Node = cc.instantiate(this.coinBrickPrefab);
            tmpCB.setPosition(x, y);
            tmpCB.getComponent(CoinBrick).GameMgr = this;
            tmpCB.getComponent(CoinBrick).idx = i;

            if(!this.existCoin[i]) {
                tmpCB.getComponent(CoinBrick).coinObtained = true;
            }

            cc.find("coinBricks").addChild(tmpCB);
        }
    }

    mushroomBrickInstantiate() {
        var positionArray: number[][] = this.isStage1 ? [[352, 80]] : 
                                                        [[750, 120]];

        for(let i = 0; i < positionArray.length; i++) {
            let x = positionArray[i][0], y = positionArray[i][1];
            var tmpMB: cc.Node = cc.instantiate(this.mushroomBrickPrefab);
            tmpMB.setPosition(x, y);
            tmpMB.getComponent(MushroomBrick).GameMgr = this;
            tmpMB.getComponent(MushroomBrick).idx = i;

            if(!this.existMushroom[i]) {
                tmpMB.getComponent(MushroomBrick).mushroomObtained = true;
            }
            
            cc.find("mushroomBricks").addChild(tmpMB);
        }
    }
    goombaInstantiate() {
        var positionArray: number[][] = this.isStage1 ? [[1020, 100], [1396, 144]] : 
                                                        [[450, 75], [470, 75], [2437.938, 95], [2950, 95], [1651, 95], [700, 95], [3700, 75], [3650, 75], [4200, 75], [4300, 75]];
        for(let i = 0; i < positionArray.length; i++) {
            let x = positionArray[i][0], y = positionArray[i][1];
            var tmpGB: cc.Node = cc.instantiate(this.goombaPrefab);
            tmpGB.setPosition(x, y);
            tmpGB.getComponent(Goomba).GameMgr = this;
            tmpGB.getComponent(Goomba).idx = i;

            tmpGB.group = "goomba";

            if(this.existGoomba[i]) {
                cc.find("goombas").addChild(tmpGB);
            }
        }
    }

    turtleInstantiate() {
        var positionArray: number[][] = this.isStage1 ? [[664, 94], [1400, 114]] : 
                                                        [[2980, 95], [1681, 95], [910, 95], [3650, 75]];
        for(let i = 0; i < positionArray.length; i++) {
            let x = positionArray[i][0], y = positionArray[i][1];
            var tmpTT: cc.Node = cc.instantiate(this.turtlePrefab);
            tmpTT.setPosition(x, y);
            tmpTT.getComponent(Turtle).GameMgr = this;
            tmpTT.getComponent(Turtle).idx = i;

            tmpTT.group = "turtle";
            if(this.existTurtle[i])
                cc.find("turtles").addChild(tmpTT);
        }
    }

    clearCoinBrick() {
        cc.find("coinBricks").removeAllChildren();
    }

    clearMushroomBrick() {
        cc.find("mushroomBricks").removeAllChildren();
    }

    clearGoomba() {
        cc.find("goombas").removeAllChildren();
    }

    clearTurtle() {
        cc.find("turtles").removeAllChildren();
    }

    clearTurtleShell() {
        cc.find("shells").removeAllChildren();
    }

    reSetData() {
        this.coinNum = 0;
        this.totalPoint = 0;
        this.restTime = 300;
        this.beginTime = 300;
        this.pastTime = 0;
        this.restLife = 5;
        for(let i = 0; i < this.existCoin.length; i++)
            this.existCoin[i] = 1;
        for(let i = 0; i < this.existMushroom.length; i++)
            this.existMushroom[i] = 1;
        for(let i = 0; i < this.existGoomba.length; i++)
            this.existGoomba[i] = 1;
        for(let i = 0; i < this.existTurtle.length; i++)
            this.existTurtle[i] = 1;
    }

    clearLevel() {
        if(!this.isCleared) {
            cc.director.pause();
            this.playLevelClearSound();
            setTimeout(function() {
                var tmpLevelCleared = cc.instantiate(this.levelClearedPrefab);
                cc.find("camera").addChild(tmpLevelCleared);
            }.bind(this), 1000);
            
            setTimeout(function() {
                var tmpFinalPoint = cc.instantiate(this.finalPointPrefab);
                tmpFinalPoint.getChildByName("time").getComponent(cc.Label).string = this.restTime.toString();
                tmpFinalPoint.getChildByName("point").getComponent(cc.Label).string = (this.restTime * 50).toString();
                cc.find("camera").addChild(tmpFinalPoint);
                this.totalPoint += this.restTime * 50;
                firebase.auth().onAuthStateChanged((user) => {
                    var stage = {
                        totalPoint: 0,
                        restTime: 300,
                        positionX: 212,
                        positionY: 118,
                        coinNum: 0,
                        isBig: false,
                        restLife: 5,
                        existCoin: [1,1,1,1,1,1,1,1],
                        existMushroom: [1],
                        existGoomba: [1,1],
                        existTurtle: [1,1],
                    };
                    var stage22 = {
                        totalPoint: 0,
                        restTime: 300,
                        positionX: 212,
                        positionY: 118,
                        coinNum: 0,
                        isBig: false,
                        restLife: 5,
                        existCoin: [1,1,1,1,1],
                        existMushroom: [1],
                        existGoomba: [1,1,1,1,1,1,1,1,1,1],
                        existTurtle: [1,1,1,1],
                    };
                    var stage2 = {
                        totalPoint: this.totalPoint,
                        restTime: this.restTime,
                        positionX: 212,
                        positionY: 118,
                        coinNum: this.coinNum,
                        isBig: false,
                        restLife: this.restLife,
                        existCoin: [1,1,1,1,1],
                        existMushroom: [1],
                        existGoomba: [1,1,1,1,1,1,1,1,1,1],
                        existTurtle: [1,1,1,1],
                    };
                    var curStage = {
                        coinNum: 0,
                        restLife: 5,
                        stage: this.isStage1 ? 1 : 2,
                        totalPoint: 0
                    };
                    var curStage2 = {
                        coinNum: this.coinNum,
                        restLife: this.restLife,
                        stage: 2,
                        totalPoint: this.totalPoint,
                    };

                    firebase.database().ref("leaderboard/" + user.uid).once("value", (snapshot) => {
                        const data = snapshot.val();
                        firebase.database().ref("leaderboard/" + user.uid).set([
                            Math.max(data[0], this.totalPoint),
                            data[1],
                        ]);
                    });

                    const dbRef = firebase.database().ref(user.uid);
                    dbRef.once("value", (snapshot) => {
                        const data = snapshot.val();
                        if(this.isStage1) {
                            firebase.database().ref(user.uid).set({
                                ...data,
                                stage1: stage,
                                stage2: stage2,
                                curStage: curStage2,
                                stage1Flag: true,
                            })
                        } else {
                            firebase.database().ref(user.uid).set({
                                ...data,
                                stage1: stage,
                                stage2: stage22,
                                curStage: curStage,
                                stage1Flag: true,
                            })
                        }
                    }).then(resolve => {
                        setTimeout(function() {
                            cc.director.loadScene("StagePage");
                            cc.director.resume();
                        }.bind(this), 1500);
                    });
                })
            }.bind(this), 2000);
        }
    }
}
