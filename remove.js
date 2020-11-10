const img = document.getElementById('image');
const pre = document.getElementById('pre');
const pos = document.getElementById('pos');


function download() {
    var download = document.getElementById("download");
    var image = document.getElementById("canvas").toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    download.setAttribute("href", image);
    //download.setAttribute("download","archive.png");
    }


window.addEventListener('load', function() {
    document.querySelector('input[type="file"]').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            var img = document.querySelector('#image');  // $('img')[0]
            img.src = URL.createObjectURL(this.files[0]); // set src to blob url
            pre.src = URL.createObjectURL(this.files[0]);
            document.querySelector('#preview').classList.remove('inactive');
            document.querySelector('#loading').classList.remove('inactive');
            document.querySelector('#pos').classList.add('inactive');
            document.querySelector('#download').classList.add('inactive');
            img.onload = imageIsLoaded(img);

        }
    });
  });
  
  function imageIsLoaded(img) { 
    // alert(this.src);  // blob url
    // update width and height ...
    var w = img.width;
    var h = img.height;

    console.log("NEW IMAGE width", w);
    console.log("NEW IMAGE height: ", h);
    loadAndPredict();
  }

async function loadAndPredict() {
  const net = await bodyPix.load(/** optional arguments, see below **/);

  const segmentation = await net.segmentPerson(img);
  const maskBackground = true;
  const foregroundColor = {r: 255, g: 255, b: 255, a: 255};
  const backgroundColor = {r: 0, g: 0, b: 0, a: 255};
  const backgroundDarkeningMask = bodyPix.toMask(
    segmentation, foregroundColor, backgroundColor);

  console.log('mask: ',backgroundDarkeningMask)


  
  var canvas = document.getElementById('canvas');
  var context    = canvas.getContext('2d');
  var myImgElement = document.getElementById('image');
  var w = myImgElement.width, h=myImgElement.height;
  console.log(w,h)
  canvas.width = w;
  canvas.height = h;
  
  context.drawImage( myImgElement, 0, 0 );

  
  var imgData = context.getImageData(0,0,w,h);
  var data = imgData.data;

  console.log(canvas);
  console.log(context);
  console.log(imgData);
  
  context.putImageData(imgData, 0, 0);
  console.log('img: ', data)

  var red = new Array();    
  var green = new Array(); 
  var blue = new Array(); 
  var alpha = new Array();    
  
  console.log('red: ', red)

  for (i = 0; i < data.length; i += 4) 
  {                     
    red[i] = imgData.data[i];
    // if (red[i] == 0) red[i] = 255; 
    green[i] = imgData.data[i+1];
    // if (green[i] == 0) green[i] = 255;
    blue[i] = imgData.data[i+2]; // no change, blue == 0 for black and for yellow
    alpha[i] = imgData.data[i+3];
    if (backgroundDarkeningMask.data[i]==0) alpha[i] = 0; // Again, no change
  } 
  
  console.log('alpha: ', alpha)

  for (i = 0; i < data.length; i += 4)  
  {
    imgData.data[i] = red[i];
    imgData.data[i+1] = green[i];
    imgData.data[i+2] = blue[i]; 
    imgData.data[i+3] = alpha[i];   
  } 
  
  console.log('newImage: ',imgData);

  context.putImageData(imgData, 0, 0);
  document.querySelector('#loading').classList.add('inactive');
  document.querySelector('#pos').classList.remove('inactive');
  document.querySelector('#download').classList.remove('inactive');
  pos.src = canvas.toDataURL();


}

