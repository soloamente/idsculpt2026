const pages = await (await fetch("http://127.0.0.1:9333/json")).json();
const page =
	pages.find(
		(entry) => entry.type === "page" && entry.url.includes("localhost:3002"),
	) ?? pages.find((entry) => entry.type === "page");

if (!page) {
	console.log("NO PAGE", JSON.stringify(pages, null, 2));
	process.exit(1);
}

console.log("PAGE", page.url, page.title);
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
	ws.addEventListener("open", resolve);
	ws.addEventListener("error", reject);
});

let id = 0;
function send(method, params = {}) {
	const msgId = ++id;
	return new Promise((resolve) => {
		const onMessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.id === msgId) {
				ws.removeEventListener("message", onMessage);
				resolve(data);
			}
		};
		ws.addEventListener("message", onMessage);
		ws.send(JSON.stringify({ id: msgId, method, params }));
	});
}

await send("Runtime.enable");
await send("Page.enable");
await new Promise((resolve) => setTimeout(resolve, 2000));

const result = await send("Runtime.evaluate", {
	expression: `(() => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("layoutsubtree", "");
    canvas.setAttribute("content", "drawable");
    const queueNames = Object.getOwnPropertyNames(GPUQueue.prototype).filter((name) =>
      /element|draw|copy/i.test(name),
    );
    return {
      contentAttr: canvas.content ?? null,
      draw2d: "drawElementImage" in CanvasRenderingContext2D.prototype,
      queueNames,
      href: location.href,
      canvases: document.querySelectorAll("canvas").length,
    };
  })()`,
	returnByValue: true,
});

console.log(JSON.stringify(result.result?.result?.value ?? result, null, 2));
ws.close();
