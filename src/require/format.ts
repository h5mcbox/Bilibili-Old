/**
 * URL处理函数
 */
class Url {
    url = "";
    search = "";
    hash = "";
    constructor(url: string) {
        const search = url.match(/(?<=\?)[A-Za-z0-9&=%\+\-_\.~!\*'\(\);@$,\[\]]+/g);
        this.search = search ? "?" + search.join("&") : "";
        const hash = url.match(/(?<=\#)[A-Za-z0-9&=%\+\-_\.~!\*'\(\);@$,\[\]\/]+/g);
        this.hash = hash ? "#" + hash : "";
        this.url = url.replace(/\?[A-Za-z0-9&=%\+\-_\.~!\*'\(\);@$,\[\]]+/g, "")
            .replace(/\#[A-Za-z0-9&=%\+\-_\.~!\*'\(\);@$,\[\]\/]+/g, "");
    }
    /**
     * 提取url的查询参数为对象
     * @returns 参数对象
     */
    getSearch() {
        if (this.search) {
            return <Record<string, string | number>>this.search.substring(1).split("&").reduce((s, d) => {
                const arr = d.split("=");
                s[arr[0]] = arr[1];
                return s;
            }, {});
        }
        else return {}
    }
    /**
     * 修改/添加url参数
     * @param obj 参数对象
     */
    setSearch(obj: Record<string, string | number>) {
        let tar = this.getSearch();
        tar = Object.assign(tar, obj);
        const result = Object.entries(tar).reduce((s, d) => {
            d[1] !== null && d[1] !== undefined && s.push(`${d[0]}=${d[1]}`)
            return s;
        }, []).join("&");
        this.search = result ? "?" + result : "";
    }
    /**
     * 转化为url字符串
     * @returns url字符串
     */
    toJSON() {
        return (this.url || "") + this.search + this.hash;
    }
}
/**
 * 格式化工具集
 */
class Format {
    /**
     * 格式化时间
     * @param time 时间戳
     * @param type 是否包含年月日
     * @returns 时:分:秒 | 年-月-日 时:分:秒
     */
    static timeFormat(time: number = new Date().getTime(), type?: boolean) {
        let date = new Date(time),
            Y = date.getFullYear() + '-',
            M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-',
            D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ',
            h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':',
            m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':',
            s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        return type ? Y + M + D + h + m + s : h + m + s;
    }
    /**
     * 格式化字节
     * @param size 字节/B
     * @returns n B | K | M | G
     */
    static sizeFormat(size: number = 0) {
        let unit = ["B", "K", "M", "G"], i = unit.length - 1, dex = 1024 ** i, vor = 1000 ** i;
        while (dex > 1) {
            if (size >= vor) {
                size = Number((size / dex).toFixed(2));
                break;
            }
            dex = dex / 1024;
            vor = vor / 1000;
            i--;
        }
        return size ? size + unit[i] : "N/A";
    }
    /**
     * 格式化进位
     * @param num 实数
     * @returns n 万 | 亿
     */
    static unitFormat(num: number = 0) {
        num = 1 * num || 0;
        let unit = ["", "万", "亿"], i = unit.length - 1, dex = 10000 ** i;
        while (dex > 1) {
            if (num >= dex) {
                num = Number((num / dex).toFixed(1));
                break;
            }
            dex = dex / 10000;
            i--;
        }
        return num + unit[i];
    }
    /**
     * 冒泡排序
     * @param arr 待排序数组
     * @returns 排序结果
     */
    static bubbleSort(arr: number[]) {
        let temp: number;
        for (let i = 0; i < arr.length - 1; i++) {
            let bool = true;
            for (let j = 0; j < arr.length - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    bool = false;
                }
            }
            if (bool) break;
        }
        return arr;
    }
    /**
     * 随机截取指定大小子数组
     * @param arr 母数组
     * @param num 子数组大小
     * @returns 子数组
     */
    static randomArray(arr: any[], num: number) {
        let out = [];
        num = num || 1;
        num = num < arr.length ? num : arr.length;
        while (out.length < num) {
            var temp = (Math.random() * arr.length) >> 0;
            out.push(arr.splice(temp, 1)[0]);
        }
        return out;
    }
    /**
     * search参数对象拼合回URL
     * @param url URL主体，可含search参数和锚
     * @param obj search参数对象
     * @returns 拼合的URL
     */
    static objUrl(url: string = "", obj: Record<string, string | number> = {}) {
        const result = new Url(url);
        result.setSearch(obj);
        return result.toJSON();
    }
    /**
     * 提取URL search参数对象
     * @param url 原URL
     * @returns search参数对象
     */
    static urlObj(url: string = "") {
        return new Url(url).getSearch();
    }
    /**
     * 秒数 -> hh:mm:ss
     * @param second 秒数
     * @returns hh:mm:ss
     */
    static s2hms(second: number) {
        const s = second % 60;
        let m = parseInt(String(second / 60));
        const h = parseInt(String(m / 60));
        m = m % 60;
        return (h > 0 ? h + ":" : "") + (h > 0 || m > 0 ? (Array(2).join('0') + m).slice(-2) + ":" : "") + (Array(2).join('0') + s).slice(-2);
    }
    /**
     * 格式化时间间隔，返回过去了多长时间  
     * timeFormat的再封装
     * @param time 10/13位的时间戳
     * @returns 过去了多长时间，当时间间隔超过一天时，直接返回timeFormat带年月日的结果
     */
    static intervalFormat(time: number) {
        time >= 1e11 && (time = Math.floor(time / 1e3));
        const now = Math.floor((new Date).getTime() / 1e3);
        let t: any = new Date;
        if (t.setHours(0), t.setMinutes(0), t.setSeconds(0), (t = Math.floor(t.getTime() / 1e3)) < time && 0 <= now - time) {
            if (now - time <= 50) {
                var r = 10 * Math.floor((now - time) % 60 / 10);
                return (10 < time ? r : 10) + "秒前"
            }
            return now - time < 3600 ? Math.floor((now - time) / 60) + "分钟前" : Math.floor((now - time) / 3600) + "小时前"
        }
        return Format.timeFormat(time * 1e3, true);
    }
}