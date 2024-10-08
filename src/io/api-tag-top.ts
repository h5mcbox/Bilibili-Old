import { objUrl } from "../utils/format/url";
import { IAidDatail, jsonCheck } from "./api";
import { URLS } from "./urls";

export async function apiTagTop(tid: number) {
    const response = await fetch(objUrl(URLS.TAG_TOP, { tid }));
    const json = await response.json();
    return <IAidDatail[]>jsonCheck(json).data;
}