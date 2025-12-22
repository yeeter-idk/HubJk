let settings = {
  imageRes: 80,
  dither: [
    [0, 4, 1, 5],
    [8, 12, 9, 13],
    [2, 6, 3, 7],
    [10, 14, 11, 15]
  ],
  states: 8
};


fetch('appData.txt')
  .then(response => response.text())
  .then(data => setup(data));
  
function setup(rawAppData) {
  let apps = rawAppData.split("<@>");
  for(let data of apps){
    let parts = data.split("<|>");
    parts = parts.map(n => n.trim());
    
    let img = document.createElement("img");
    img.classList.add("imgDescriptor");
    //img.src = "placeholder.jpg";
    setupImgElem(img, "placeholder.jpg");
    setupImgElem(img, parts[1]);
    
    let title = document.createElement("h2");
    title.classList.add("appTitle");
    title.innerHTML = parts[2];
    
    let desc = document.createElement("p");
    desc.classList.add("appDescription");
    desc.innerHTML = parts[3];
    
    let a = document.createElement("button");
    //a.classList.add("linkButton");
    a.classList.add("btn-geo");
    a.onclick = function() {
      window.location.replace(parts[0]);
    }
    a.innerText = "Go to Site";
    
    //console.log();
    
    let container = document.createElement("div");
    container.classList.add("appContainer");
    
    container.appendChild(img);
    container.appendChild(title);
    container.appendChild(desc);
    container.appendChild(a);
    
    document.getElementById("apps").appendChild(container);
  }
}

function setupImgElem(elem, url) {
  let canvas = document.createElement("canvas");
  
  let image = new Image();
  image.src = url;
  
  image.onload = function() {
    let width = settings.imageRes;
    let height = Math.round(width * (image.height / image.width));
    
    canvas.width = width;
    canvas.height = height;
    
    let ctx = canvas.getContext("2d");
    
    ctx.drawImage(image, 0, 0, width, height);
    
    let imageData = ctx.getImageData(0, 0, width, height);
    let data = imageData.data;
    let pixels = width * height;
    let index = 0;
    
    for(; index < pixels; index++){
      let x = index % width;
      let y = Math.floor(index / width);
      
      let r = data[index * 4];
      let g = data[index * 4 + 1];
      let b = data[index * 4 + 2];
      
      let ditherDiff = (settings.dither[x % 4][y % 4] / 15) - 0.5; // 4 * 4 - 1
      ditherDiff *= 10;
      
      let stateSize = 255 / settings.states;
      data[index * 4] = Math.round((r + ditherDiff) / stateSize) * stateSize;
      data[index * 4 + 1] = Math.round((g + ditherDiff) / stateSize) * stateSize;
      data[index * 4 + 2] = Math.round((b + ditherDiff) / stateSize) * stateSize;    
      data[index * 4 + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    elem.src = canvas.toDataURL("image/png");
    
    console.log("done with: " + url);
  }
}