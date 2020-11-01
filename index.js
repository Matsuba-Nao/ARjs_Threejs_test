
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/110/three.js'
import * as THREEx from 'https://raw.githack.com/AR-js-org/AR.js/master/three.js/build/ar.js'
import { Player, stringToDataUrl } from 'https://unpkg.com/textalive-app-api/dist/index.js'

class ThreeManager {
    constructor (){
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;

        // renderer設定
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h);
        // cssで設定してもよいかも
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0px';
        renderer.domElement.style.left = '0px';
        document.body.appendChild(renderer.domElement);

        // scene設定
        const scene = new THREE.Scene();
        scene.visible = false;

        // camera設定
        const camera = new THREE.Camera();
        scene.add(camera);

        // ARjs設定
        const arToolkitSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam'
        });
        const arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: './data/camera_para.dat',
            detectionMode: 'mono'
        });
        const arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
            type: 'pattern',
            patternUrl: './data/pattern-miku.patt',
            changeMatrixMode: 'cameraTransformMatrix'
          });

        this._renderer = renderer;
        this._scene = scene;
        this._camera = camera;
        this._color = '#000';
        this._arToolKitSource = arToolkitSource.init(function onReady(){
            setTimeout(() => {
                onResize()
            }, 2000);
        })
        this._arToolkitContext = arToolkitContext.init(() => {
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        });

        //歌詞表示用ボックス生成
        this._can = document.createElement('canvas');
        this._ctx = this._can.getContext('2d');
        var tex = this._tex = new THREE.Texture(this._can);
        var mat = this._mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
        var box = this._box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), mat);
        scene.add(box);
        
        this._drawFrame();
    }

    // Threejsメソッド
    // 表示するboxの色変更
    changeColor (color)
    {
        var col = color.toString(16);
        for (var i = col.length; i < 6; i ++) col = "0" + col;
        this._color = "#" + col;
        
        this._drawFrame();
    }

    // 歌詞の更新
    setLyrics (lyrics)
    {
        this._lyrics = lyrics;
    }

    // 再生位置アップデート
    update (position)
    {
        this._position = position;
        if (! this._lyrics) return;

        // 外枠を残してキャンバスをクリア
        this._ctx.clearRect(8, 8, this._can.width - 16, this._can.height - 16);
        var tk = "";

        for (var i = 0, l = this._lyrics.length; i < l; i ++)
        {
            var lyric = this._lyrics[i];
            // 開始タイム < 再生位置 && 再生位置 < 終了タイム
            if (lyric.startTime <= position && position < lyric.endTime)
            {
                // 歌詞の描画
                var progress = this._easeOutBack(Math.min((position - lyric.startTime) / Math.min(lyric.endTime - lyric.startTime, 200), 1));
                tk = lyric.text + progress;
                if (this._tk != tk) this._drawText(lyric.text, progress);
                break;
            }
        }
        // テクスチャの更新
        if (this._tk != tk) this._tex.needsUpdate = true;
        this._tk = tk;

        // ボックスの回転
        this._box.rotation.set(position / 1234, position / 2345, position / 3456);

        this._renderer.render(this._scene, this._camera);
    }

    this._arToolkitContext.init(() => {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    })
    
    onResize() {
        this._arToolkitSource.onResizeElement();
        this._arToolkitSource.copyElementSizeTo(this._render.domElement);
        if (this._arToolKitSource.arController !== null) {
            this._arToolKitSource.copyElementSizeTo()
        }
    }



}