export const $ = (id) => document.getElementById(id);

export const video = $("video");
export const overlay = $("overlay");
export const touchLayer = $("touchLayer");
export const controls = $("controls");
export const fileInput = $("fileInput");

export const ctx = overlay.getContext("2d");
