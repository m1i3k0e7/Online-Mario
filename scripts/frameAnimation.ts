const {ccclass, property} = cc._decorator;

@ccclass
export default class FrameAnimation extends cc.Component {
    @property({type: [cc.SpriteFrame], tooltip: "frameSet"})
    spriteFrames: Array<cc.SpriteFrame> = [];

    @property({tooltip: "frame duration"})
    duration: Number = 0.1;

    @property({tooltip: "loop"})
    loop: boolean = false;

    @property({tooltip: "play onload"})
    playOnload: boolean = false;

    private endFunc: any = null;
    private sprite: cc.Sprite;
    private isPlaying: boolean = false;
    private playTime: Number = 0;

    onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite);
        if(!this.sprite) {
            this.sprite = this.node.addComponent(cc.Sprite);
        }

        if(this.playOnload) {
            if(this.loop) {
                this.playLoop();
            } else {
                this.playOnce(null);
            }
        }
    }

    public playLoop(): void {
        this.initFrame(true, null);
    }

    public playOnce(endf: any) {
        this.initFrame(false, endf);
    }

    private initFrame(loop: boolean, endf: any): void {
        if(this.spriteFrames.length <= 0) {
            return ;
        }
        this.isPlaying = true;
        this.playTime = 0;
        this.sprite.SpriteFrame = this.spriteFrames[0];
        this.loop = loop;
        this.endFunc = endf;
    }

    start() {

    }

    update(dt) {
        if(!this.isPlaying) {
            return ;
        }

        this.playTime += dt;
        let index: Number = Math.floor(this.playTime / this.duration);
        if(this.loop) {
            if(index >= this.spriteFrames.length) {
                index -= this.spriteFrames.length;
                this.playTime -= (this.duration * this.spriteFrames.length);
            }
            this.sprite.SpriteFrame = this.spriteFrames[index];
        } else {
            if(index >= this.spriteFrames.length) {
                this.isPlaying = false;
                if(this.endFunc) {
                    this.endFunc();
                }
            } else {
                this.sprite.SpriteFrame = this.spriteFrames[index];
            }
        }
    }
}
