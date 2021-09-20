/**
 * 本模块负责下载功能，主要是视频下载功能
 */
(function () {
    try {
        class Download {
            /**
             * 下载面板
             */
            table: HTMLElement;
            /**
             * 整理出的链接列表
             */
            links: {
                /**
                 * 下载数据类型
                 */
                type: string,
                /**
                 * 下载url，也可以是字符串形式的文本内容，将转为了objectURL以下载
                 */
                url: string,
                /**
                 * 下载项目上标，一般是画质
                 */
                quality: string,
                /**
                 * 下载项目下标，一般是大小
                 */
                size: string,
                /**
                 * 以objectURL方式下载时的文件名
                 */
                filename?: string,
                /**
                 * 以objectURL方式下载时的编码格式，一般为text/plain
                 */
                contentType?: string
            }[] = [];
            /**
             * url序号对应的质量信息  
             * 暂缺杜比视界/杜比全景声部分
             */
            quality: {
                30280: "高音质"
                30232: "中音质",
                30216: "低音质",
                30125: "HDR",
                30121: "4K",
                30120: "4K",
                30116: '1080P+',
                30112: '1080P+',
                30106: '1080P+',
                30102: '1080P+',
                30080: '1080P',
                30077: '1080P',
                30064: '720P',
                30066: '720P',
                30032: '480P',
                30033: '480P',
                30011: '360P',
                30016: '360P',
                208: "1080P",
                192: "720P",
                125: "HDR",
                120: "4K",
                116: "1080P60",
                112: "1080P+",
                80: "1080P",
                74: "720P60",
                64: "720P",
                48: "720P",
                32: "480P",
                16: "360P",
                15: "360P"
            };
            /**
             * 颜色表
             */
            color: {
                "Dolby": "background-color: #ffe42b;background-image: linear-gradient(to right, #ffe42b, #dfb200);",
                "HDR": "background-color: #ffe42b;background-image: linear-gradient(to right, #ffe42b, #dfb200);",
                "4K": "background-color: #c0f;background-image: linear-gradient(to right, #c0f, #90f);",
                "1080P60": "background-color: #c0f;background-image: linear-gradient(to right, #c0f, #90f);",
                "1080P+": "background-color: #f00;background-image: linear-gradient(to right, #f00, #c00);",
                "1080P": "background-color: #f00;background-image: linear-gradient(to right, #f00, #c00);",
                "720P60": "background-color: #f90;background-image: linear-gradient(to right, #f90, #d70);",
                "720P": "background-color: #f90;background-image: linear-gradient(to right, #f90, #d70);",
                "480P": "background-color: #00d;background-image: linear-gradient(to right, #00d, #00a);",
                "360P": "background-color: #0d0;",
                "mp4": "background-color: #e0e;",
                "avc": "background-color: #07e;",
                "hev": "background-color: #7ba;",
                "aac": "background-color: #07e;",
                "flv": "background-color: #0dd;"
            }
            constructor() {
                // 切P后清楚下载数据并移除下载面板
                API.switchVideo(() => { this.links = []; this.table && this.table.remove() });
            }
            /**
             * 整理playurl返回值并提取其中的媒体链接记录到links
             * @param playinfo ajax返回的JSON数据
             */
            decodePlayinfo(playinfo: any) {
                playinfo.data && this.decodePlayinfo(playinfo.data);
                playinfo.result && this.decodePlayinfo(playinfo.result);
                playinfo.durl && this.durl(playinfo.durl);
                playinfo.dash && this.dash(playinfo.dash);
            }
            /**
             * 根据url确定画质/音质信息  
             * 需要维护quality表
             * @param url 多媒体url
             * @returns 画质/音质信息
             */
            getQuality(url: string) {
                return this.quality[url.match(/[0-9]+\.(flv)|(mp4)|(m4s)/)[0].split(".")[0]] || "N/A";
            }
            /**
             * 整理dash部分
             * @param dash dash信息
             */
            dash(dash: any) {
                dash.video && this.dashVideo(dash.video, dash.duration);
                dash.audio && this.dashAudio(dash.audio, dash.duration);
            }
            /**
             * 整理dash视频部分
             * @param video dash视频信息
             * @param duration duration信息，配合bandwidth能计算出文件大小
             */
            dashVideo(video: any[], duration: number) {
                video.forEach(d => {
                    const url = d.baseUrl || d.base_url;
                    let type = "";
                    if (!url) return;
                    switch (d.codecs.includes("avc")) {
                        case true: type = "avc";
                            break;
                        case false: type = "hev";
                            break;
                    }
                    this.links.push({
                        type: type,
                        url: url,
                        quality: this.getQuality(d.url),
                        size: API.sizeFormat(d.bandwidth * duration / 8)
                    })
                })
            }
            /**
             * 整理dash音频部分
             * @param audio dash音频信息
             * @param duration duration信息，配合bandwidth能计算出文件大小
             */
            dashAudio(audio: any[], duration: number) {
                audio.forEach(d => {
                    const url = d.baseUrl || d.base_url;
                    url && this.links.push({
                        type: "aac",
                        url: url,
                        quality: this.getQuality(d.url),
                        size: API.sizeFormat(d.bandwidth * duration / 8)
                    })
                })
            }
            /**
             * 整理durl部分
             * @param durl durl信息
             */
            durl(durl: any[]) {
                durl.forEach(d => {
                    let type = "";
                    switch (d.url.includes("mp4?")) {
                        case true: type = "mp4";
                            break;
                        case false: type = "flv";
                            break;
                    }
                    this.links.push({
                        type: type,
                        url: d.url,
                        quality: this.getQuality(d.url),
                        size: API.sizeFormat(d.size)
                    })
                })
            }
            /**
             * 右键下载相应
             */
            async contentMenu() {
                if (API.aid && API.cid) {
                    if (!this.links[0]) {
                        const result = await Promise.all(config.downloadList.reduce((s: Promise<any>[], d) => {
                            s.push(this.getContent(d));
                            return s;
                        }, []));
                        result.forEach(d => d && this.decodePlayinfo(d));
                    }
                    this.showTable();
                }
            }
            /**
             * 封装请求链接  
             * 用于过滤Promise.all请求错误
             * @param d 请求类型
             * @returns 请求结果
             */
            async getContent(d: string) {
                let result: any;
                try {
                    switch (d) {
                        case "dash": result = API.pgc ?
                            await API.getJson("api.bilibili.com/pgc/player/web/playurl", { avid: API.aid, cid: API.cid, fnver: 0, fnval: 80 }, true) :
                            await API.getJson("api.bilibili.com/x/player/playurl", { avid: API.aid, cid: API.cid, fnver: 0, fnval: 80 }, true);
                            break;
                        case "flv": result = API.pgc ?
                            await API.getJson("api.bilibili.com/pgc/player/web/playurl", { avid: API.aid, cid: API.cid }, true) :
                            await API.getJson("api.bilibili.com/x/player/playurl", { avid: API.aid, cid: API.cid }, true);
                            break;
                        case "mp4": result = API.pgc ?
                            await API.getJson("app.bilibili.com/v2/playurlproj", { cid: API.cid }) :
                            await API.getJson("api.bilibili.com/pgc/player/api/playurlproj", { cid: API.cid });
                            break;
                    }
                } catch (e) { }
                return result;
            }
            /**
             * 呼出下载面板
             */
            showTable() {
                this.table && this.table.remove();
                this.table = API.addElement("div");
                const real = this.table.attachShadow({ mode: "closed" });
                const root = API.addElement("div", { class: "table" }, real);
                const cells: { [name: string]: HTMLElement } = {};
                API.element.clickRemove(this.table);
                API.addCss(API.getCss("download.css"), undefined, real);
                this.links.forEach(d => {
                    const cell = cells[d.type] || API.addElement("div", { class: "cell" }, root);
                    if (!cells[d.type]) {
                        cells[d.type] = cell;
                        const div = API.addElement("div", { class: "type" }, cell, d.type);
                        this.color[d.type] && div.setAttribute("style", this.color[d.type]);
                    }
                    const item = API.addElement("a", { class: "item", target: "_blank" }, cell);
                    const up = API.addElement("div", { class: "up" }, item, d.quality);
                    this.color[d.quality] && up.setAttribute("style", this.color[d.quality]);
                    API.addElement("div", { class: "down" }, item, d.size);
                    item.onclick = () => {
                        /^http:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(d.url) ?
                            this.postData(d.url) :
                            API.saveAs(d.url, d.filename || `download ${API.timeFormat(undefined, true)}.txt`, d.contentType || "text/plain");
                    }
                })
            }
            postData(url: string) { }
        }
        const download = new Download();
        API.downloadThis = () => download.contentMenu();
    } catch (e) { API.trace(e, "download.js", true) }
})();
declare namespace API {
    /**
     * 请求当前视频的下载数据
     */
    function downloadThis(): void;
}