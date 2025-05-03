precision mediump float;

varying	vec2 pos;

uniform sampler2D background;
uniform vec3 palette[200];

uniform float H0;
uniform float H1;

float r = 0.;
float g = 0.;
float b = 0.;

float m = 0.;
  



vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}


vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}




// cl color in RGB mode
vec3 mapColor(vec4 cl) {

    // h =h0 + (h1 - h0) * c / (2 * PI)

    vec3 col = cl.rgb;
    vec3 colhsv = rgb2hsv(col);
    vec3 mapedColor;

    mapedColor.x = H0 + (H1 - H0) * colhsv.x;
    mapedColor.yz = colhsv.yz;

    return mapedColor;
}



float dstnc(vec3 cl0, vec3 cl1){
    float res;
    res = abs(cl0.x - cl1.x);

    if (res>0.5){
        res = 1.0 - res;
    }

    return res;
}




vec4 nearestPaletteColor(vec3 cl){

    vec4 res = vec4(0.,0.,0.,1.);

    vec3 ncl;
    ncl.xyz = cl.xyz;

    int cancont = 1;
  
    float mindst = 100000.;
    float dst = 0.;
    for (int i = 0;i<200;i++){
        if (cancont==1){
            vec3 pcl = palette[i];
            if (pcl.x!=-1.){
                dst = dstnc(pcl,cl);
                if (dst<mindst){
                    mindst = dst;
                    ncl.x = pcl.x;
                }
            } else {
                cancont = 0;
            }
        }
    }

    vec3 nrbgcl = hsv2rgb(ncl);

    res.xyz = nrbgcl.xyz;
    return res;

}


void main(){

    vec2 newPos = pos;
    newPos.y = 1. - newPos.y;

    vec4 col = texture2D(background,newPos);
    
    

    vec3 clr = mapColor(col);

    col = nearestPaletteColor(clr);


    gl_FragColor = vec4(col.rgba);
}