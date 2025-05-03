let xSize = 0;
let ySize = 0;
let shdr;
let vW = 0;
let vH = 0;
let wrapper = {}
let vid = {}
let cnv0 = {};
let cnv;
let canRun = false;
let doCnv = false;
let lastIm = null;
let tm;
let choose = false;
let bkimg;

function initVideo(){
  wrapper = document.getElementById('wrapper');
  vid = document.getElementById('vid');
  cnv0 = document.getElementById('cnv0');
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function () {

      var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }

      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      })

    }
  }

}


function initEvent(faceing) {
  navigator.mediaDevices
    .getUserMedia({ video: {
      facingMode: {
        exact: faceing
      }
    } })
    .then(onMediaStream)
    .catch(onMediaError);
}


function onLoadVideo() {
  vid.setAttribute('width', this.videoWidth);
  vid.setAttribute('height', this.videoHeight);
  cnv0.setAttribute('width', this.videoWidth);
  cnv0.setAttribute('height', this.videoHeight);
  vid.play();
  doCnv = true;
}

function onMediaStream(stream) {
  if ('srcObject' in vid) {
    vid.srcObject = stream;
  } else {
    vid.src = window.URL.createObjectURL(stream);
  }

  wrapper.style.display = 'block';
  vid.addEventListener('loadedmetadata', onLoadVideo);
}

function onMediaError(err) {

  initEvent()
  let rf = "ERROR: " + err.message
}

let gPalette = [];
let hslPallete = []

function rgb2lab(r,g,b){
  let xyz = [];
  let lab = [];
  let rgb = [];

  rgb.push(r/255.0);
  rgb.push(g/255.0);
  rgb.push(b/255.0);


  let comp = 0.04045;
  let mult = 0.055;
  let mdv = 1.055;
  let exp = 2.4;
  let div = 12.92;

  for (i=0;i<3;i++){

    if (rgb[i]>comp){
      rgb[i] = Math.pow((rgb[i]+mult)/mdv, exp);
    } else{
      rgb[i] = rgb[i] / div;    
    }

    rgb[i] = rgb[i]*100;

  }

  xyz[0] = ((rgb[0] * 0.412453) + (rgb[1] * 0.357580) + (rgb[2] * 0.180423));  
  xyz[1] = ((rgb[0] * 0.212671) + (rgb[1] * 0.715160) + (rgb[2] * 0.072169));
  xyz[2] = ((rgb[0] * 0.019334) + (rgb[1] * 0.119193) + (rgb[2] * 0.950227));

  xyz[0] = xyz[0] / 95.047;
  xyz[1] = xyz[1] / 100.0;
  xyz[2] = xyz[2] / 108.883;

  if (xyz[0] > 0.008856)
    {
        xyz[0] = Math.pow(xyz[0], (1.0 / 3.0));
    }
    else
    {
        xyz[0] = (xyz[0] * 7.787) + (16.0 / 116.0);
    }

    if (xyz[1] > 0.008856)
    {
        xyz[1] = Math.pow(xyz[1], 1.0 / 3.0);
    }
    else
    {
        xyz[1] = (xyz[1] * 7.787) + (16.0 / 116.0);
    }

    if (xyz[2] > 0.008856)
    {
        xyz[2] = Math.pow(xyz[2], 1.0 / 3.0);
    }
    else
    {
        xyz[2] = (xyz[2] * 7.787) + (16.0 / 116.0);
    }

    lab[0] = (116.0 * xyz[1]) - 16.0;
    lab[1] = 500.0 * (xyz[0] - xyz[1]);
    lab[2] = 200.0 * (xyz[1] - xyz[2]);


    return lab
}

function rgb2hsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      let l = Math.max(r, g, b);
      let s = l - Math.min(r, g, b);
      let h = 0
        
         
      if (s!=0){
        if (l===r){ 
          h = (g-b)/s
        } else {
            if (l === g){
              h = 2 + (b -r)/s
            } else{
              h = 4 + ( r - g)/s
            }
        }

      } else {
        h = s
      }
      

      let h0 = 0
  
  
      if (60 * h < 0){
      h0 = 60 * h + 360
      } else {
       h0 = 60 * h
      }
      
      let mv = 0
      
      if (s!=0){
        
        if (l<=0.5){
          mv = s/(2*l-s)
          } else {
          
           mv =   s / (2 - (2 * l - s))
         }
        
      } else {
       mv = 0
      }
      
      
      
      let s0 = 100 * mv
      
      let l0 = (100 * (2 * l - s)) / 2
      
              
        return {h:h0,s:s0,l:l0}
           

  }

function hslpalette2shader(apalette){
  let res = [];
  apalette.forEach(function(it){
      res.push(it.h/360);
      res.push(it.s/100);
      res.push(it.l/100);
  })
  res.push(-1)
  res.push(-1)
  res.push(-1)
  return res;
}




function createHSLpallete(rgbplt){
  hslP = []
  rgbplt.forEach(function(cl){
    let r = cl.r
    let g = cl.g
    let b = cl.b
    hslP.push(rgb2hsl(r,g,b))
  })

  hslP.sort(function(a,b){
    return a.h > b.h
  })
  return hslP
}

function preload(){
  shdr = loadShader('SHvertex.vert','SHfragment.frag');
  
}

function setup() {
  numberOfColors = 20;
 
  initVideo()
  initEvent("environment")
  frameRate(15); // 25 max
  jQuery("#intro").css("display","block")
  jQuery("#wrapper").css("display","none")

  let htm = ""
  let cci = 8

  for (iii=1;iii<=cci;iii++){

      htm += "<div class='dvanimg imlup' c='" + iii +"'>"
      htm += "<img class='imgplt' alt='' title='' src='images/"+iii+".jpg' />"
      htm += "</div>"

  }

  jQuery("#dvimages").html(htm)

  jQuery(".dvanimg").click(function(){

    let im = jQuery(this).attr("c")

    lastIm = im;

    im += ".jpg"
    im = "images/" + im

    numberOfColors = parseInt(jQuery("#slnumber").val())


    gPalette = []

    colorjs.prominent(im, { amount: numberOfColors }).then(color => {
      let html = ''
      color.forEach(function(cl){
        let c = {r:cl[0],g:cl[1],b:cl[2]}
        gPalette.push(c);
        html += "<div class='sqr' style='background-color:rgba("+cl[0]+","+cl[1]+","+cl[2]+");'></diV>";
      })

      
      html += "<div class='btplt' id='btplt'><span class='btchoose'>CHOOSE</span></div>";

      jQuery("#dvpallete").html(html);

      jQuery("#btplt").click(function(){

        hslPallete = createHSLpallete(gPalette)

        choose = true;

      })


    })

  })

  jQuery("#slnumber").change(function(){

    if (lastIm != null){
      let ob;
      jQuery(".imlup").each(function(){

        let c = jQuery(this).attr("c")

        if (c==lastIm){
          ob = jQuery(this)
        }

      })

      ob.trigger('click');
    }

  })
}

function draw() {
  
  if (choose){
    

    jQuery("#intro").css("display","none")
    jQuery("#wrapper").css("display","block")

      if (doCnv){
        noStroke();    

        doCnv=false;
        cnv = createCanvas(vid.width, vid.height, WEBGL);
        shader(shdr);
        cnv.elt.id='cnv';



        pl2shd = hslpalette2shader(hslPallete);
        hmin = hslPallete[0].h;
        lng = hslPallete.length
        hmax = hslPallete[lng-1].h;

        hmax = hmax / 360;
        hmin = hmin / 360;

        shdr.setUniform("palette",pl2shd);
        shdr.setUniform("H0",hmin);
        shdr.setUniform("H1",hmax);
        canRun=true;
       
      }

    
    if (canRun){
      background(0);
      cnv0.getContext('2d').drawImage(vid, 0, 0, vid.width, vid.height);
      bkimg =  cnv0.getContext('2d').getImageData( 0, 0, vid.width, vid.height);
      //image(img,-width/2, -height/2);
      
      shdr.setUniform("background",bkimg);
      
      rect(0,0,vid.width, vid.height);

    }
      
}


  }

  


