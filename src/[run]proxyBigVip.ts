interface modules {
    /**
     * 代理大会员
     */
    readonly "[run]proxyBigVip.js": string;
}
{
    const Backup = {};
    API.registerSetting({
        key: "proxyBigVip",
        sort: "player",
        label: "代理大会员",
        sub: "借助第三方服务器",
        type: "sort",
        list: [{
            type: "switch",
            key: "bigvip",
            value: true,
            sort: "player",
            label: "代理开关"
        }, {
            key: "proxyServerVision",
            sort: "player",
            label: "接口版本",
            type: "input",
            input: { type: "text" },
            value: "0.1.8"
        }, {
            key: "proxyBigVipFlesh",
            sort: "player",
            label: "刷新签名",
            type: "action",
            title: "刷新",
            disabled: 0,
            action: () => {
                sign().then(d => d ? toast.success("已刷新签名！") : toast.error("刷新失败！您是否已登录？"));
            }
        }]
    });
    async function sign() {
        if (!API.uid)
            return;
        const cookies: any = (await GM.cookie("list", {})).reduce((s, d) => {
            Reflect.set(s, d.name, encodeURIComponent(d.value));
            return s;
        }, {});
        const data = API.base64.encode(JSON.stringify({
            cookie: Object.entries(cookies).reduce((s, d) => {
                s.push(`${d[0]}=${d[1]}`);
                return s;
            }, []).join(";"),
            csrf: cookies.bili_jct,
            level: 6,
            mid: cookies.DedeUserID,
            ua: navigator.userAgent,
            vip: 0
        }));
        GM.setValue("bigvipSign", data);
        return data;
    }
    class HookTimeOut {
        hook: any;
        constructor() {
            this.hook = setTimeout;
            window.setTimeout = (...args: any[]) => {
                if (args[1] && args[1] == 1500 && args[0] && args[0].toString() == "function(){f.cz()}") {
                    toast.warning("禁用播放器强制初始化！", ...args);
                    return Number.MIN_VALUE;
                }
                return this.hook.call(window, ...args);
            };
        }
        relese() {
            window.setTimeout = this.hook;
        }
    }
    if (config.bigvip) {
        API.xhrhook("season/user/status?", undefined, obj => {
            const response = API.jsonCheck(obj.responseText);
            if (response && !response.result.pay && !(response.result.real_price > 0)) {
                response.result.pay = 1;
                obj.response = obj.responseText = JSON.stringify(response);
            }
        }, false);
        API.xhrhookasync("/playurl?", args => {
            const obj = Format.urlObj(args[1]);
            return API.vipCid && obj.cid && API.vipCid.includes(Number(obj.cid));
        }, async args => {
            const hookTimeout = new HookTimeOut();
            let response;
            const obj = Format.urlObj(args[1]);
            try {
                toast.info("尝试代理大会员~");
                response = Backup[obj.cid] || API.jsonCheck(await xhr.GM({
                    url: Format.objUrl("http://123.207.22.95/bz/ajax.php", {
                        act: "bvlink",
                        ...obj,
                        version: config.proxyServerVision,
                        sign: GM.getValue("bigvipSign") || await sign()
                    }),
                    responseType: "json"
                }));
                API.__playinfo__ = response;
                Backup[obj.cid] = response;
                toast.success(`解除大会员限制！aid=${API.aid}, cid=${API.cid}`);
            }
            catch (e) {
                toast.error("代理大会员失败！", e);
                response = { "code": -404, "message": e, "data": null };
            }
            hookTimeout.relese();
            return {
                response: JSON.stringify(response),
                responseText: JSON.stringify(response)
            }
        }, false);
    }
}
interface config {
    /**
     * 播放：是否代理大会员
     */
    bigvip: boolean;
    /**
     * 播放：接口版本
     */
    proxyServerVision: string;
}