// engine/canvasWorker.js
self.onmessage = function(e) {

const { type, payload } = e.data;

if (type === "serialize") {

const json = JSON.stringify(payload);

self.postMessage({
type: "serialized",
data: json
});

}

};