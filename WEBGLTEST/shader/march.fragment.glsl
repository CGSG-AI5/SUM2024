#version 300 es
precision highp float;
out vec4 o_color;
uniform highp float time;

#define Max 10
#define Threshold 0.001
#define ColorTreshold 0.003921
#define MINIMUM_HIT_DISTANCE 0.001

#define Sphere 0
#define Cube 1
#define RoundCube 2
#define Torus 3
#define Cylinder 4
#define Cone 5
#define Plane 6


struct surface
{
  vec4 Ka;
  vec4 Kd;
  vec4 KsPh;
  vec4 KrRefractionCoef;
  vec4 KtDecay;
};

struct Shape_data
{
  mat4 Obj;
  mat4 Matr;
  vec4 TypeSurface;
};

struct DataRes
{
  float d;
  surface Surf;
  int mod;
};

uniform BaseData
{
    vec4 CamLoc;
    vec4 CamAt;
    vec4 CamRight;
    vec4 CamUp;
    vec4 CamDir;
    vec4 ProjDistFarTimeLocal;
    vec4 TimeGlobalDeltaGlobalDeltaLocal;
    vec4 Flag12FrameW;
    vec4 Flag34FrameH;
    vec4 AmbientColor;
    vec4 BackgroundColor;
    vec4 RefractionCoefDecayMaxRecLevel;
}; 

uniform Primitives
{
    vec4 SizePrimitives;
    Shape_data Shapes[Max];
}; 

uniform PrimitivesSurfaces
{
    vec4 SizePrimitivesSurfaces;
    surface Surfaces[Max];
}; 

float checkers( in vec3 p )
{
  ivec2 ip = ivec2(round(p + 0.5).xz);
  return float((ip.x ^ ip.y) & 1);
}



surface mix(surface a, surface b, float t)
{
    surface S;
    S.Ka = mix(a.Ka, b.Ka, t);
    S.Kd = mix(a.Kd, b.Kd, t);
    S.KsPh = mix(a.KsPh, b.KsPh, t);
    S.KrRefractionCoef = mix(a.KrRefractionCoef, b.KrRefractionCoef, t);
    S.KtDecay = mix(a.KtDecay, b.KtDecay, t); 
    return S;
}

vec3 Clamp( vec3 a )
{
    return vec3(min(max(a.x, 0.0), 1.0), min(max(a.y, 0.0), 1.0), min(max(a.z, 0.0), 1.0));
}


float distance_from_sphere(in vec3 p, in mat4 m, float r )
{
    vec3 q = (m * vec4(p, 1.0)).xyz;
    return length(q) - r;
}



float distance_from_box( in vec3 p, in mat4 m, in vec3 b )
{
  vec3 q = (m * vec4(p, 1.0)).xyz;
  return length(max(abs(q) - b, 0.0));
}

float distance_from_round_box( in vec3 p, in mat4 m, in vec3 b, float r )
{
  vec3 q = (m * vec4(p, 1.0)).xyz;
  return length(max(abs(q) - b, 0.0)) - r;
}

float distance_from_torus( vec3 p, in mat4 m, vec2 t )
{
  vec3 q = (m * vec4(p, 1.0)).xyz;
  vec2 a = vec2(length(q.xz) - t.x, q.y);
  return length(a) - t.y;
}

float distance_from_cone( vec3 p, in mat4 m, vec2 c )
{
  vec3 q = (m * vec4(p, 1.0)).xyz;
  float t = length(q.xy);
  return dot(c,vec2(t,q.z));
}

float plane( vec3 p, in mat4 m, vec4 n )
{
  vec3 q = (m * vec4(p, 1.0)).xyz;
  return dot(q, n.xyz) + n.w;
}

float distance_from_plane(in vec3 p, in vec4 n)
{
    return abs(dot(p, n.xyz) - n.w);
}

float distance_from_cylinder( vec3 p, vec3 c )
{
 return length(p.xz - c.xy) - c.z;
}


float opRep( vec3 p, vec3 c, in vec3 c1, float r )
{
  vec3 q = mod(p, c) - 0.5 * c;
  return 0.0;
}




DataRes map_the_world(in vec3 p)
{
    float dist = 9999.0, d;
    DataRes R;
    surface Plane1;
    vec4 color;
    for(int i; i < int(SizePrimitives.x); i++)
    {
      //d = distance_from_sphere(p, Shapes[i].Matr, Shapes[i].Obj[0][0]);
      d = mix(d, distance_from_sphere(p, Shapes[i].Matr, Shapes[i].Obj[0][0]), float(Shapes[i].TypeSurface.x == 0.0));
      //d = mix(d, distance_from_box(p, Shapes[i].Matr, vec3(Shapes[i].Obj[0][0], Shapes[i].Obj[0][1], Shapes[i].Obj[0][2])), float(Shapes[i].TypeSurface.x == 1.0));
      //d = mix(d, distance_from_round_box(p, Shapes[i].Matr, vec3(Shapes[i].Obj[0][0], Shapes[i].Obj[0][1], Shapes[i].Obj[0][2]), Shapes[i].Obj[0][3]), float(Shapes[i].TypeSurface.x == 2.0));
      //d = mix(d, distance_from_torus(p, Shapes[i].Matr, vec2(Shapes[i].Obj[0][0], Shapes[i].Obj[0][1])), float(Shapes[i].TypeSurface.x == 3.0));
      R.Surf = mix(R.Surf, Surfaces[int(Shapes[i].TypeSurface.y)], float(d < dist));
      R.d = dist = min(d, dist);
    }

    Plane1.Ka = vec4(0.19225,0.19225,0.19225, 1);
    Plane1.Kd = vec4(0.50754,0.50754,0.50754, 1);
    Plane1.KsPh.xyz = vec3(0.508273,0.508273,0.508273);
    Plane1.KsPh.w = 51.2;
    Plane1.KrRefractionCoef = vec4(1.0, 1.0, 1.0,  3.0);
    Plane1.KtDecay = vec4(1.0, 1.0, 1.0,  0.5);
    d = distance_from_plane(p, vec4(0.0, 1.0, 0.0, -3.0));
    R.Surf = mix(R.Surf, Plane1, float(d < dist));
    R.mod = int(mix(0.0, 1.0, float(d < dist)));
    R.d = dist = min(d, dist);
    return R;
}

vec3 calculate_normal(in vec3 p)
{
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = map_the_world(p + small_step.xyy).d - map_the_world(p - small_step.xyy).d;
    float gradient_y = map_the_world(p + small_step.yxy).d - map_the_world(p - small_step.yxy).d;
    float gradient_z = map_the_world(p + small_step.yyx).d - map_the_world(p - small_step.yyx).d;

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

    return normalize(normal);
}

float shadow( in vec3 ro, in vec3 rd, float mint, float maxt, float k )
{
    float res = 1.0;
    float t = mint;
    for( int i = 0; i < 300 && t < maxt; i++ )
    {
        float h = map_the_world(ro + rd*t).d;
        if(h < 0.001)
          return 0.0;
        res = min( res, k * h / t);
        t += h;
    }
    return res;
}

vec3 Shade( in vec3 rd, float k, vec3 current_position, DataRes res, float weight )
{
  vec3 color = res.Surf.Ka.xyz;
  vec3 normal = calculate_normal(current_position);
  vec3 light_position = vec3(50.0, 100.0, 10.0);
  vec3 L = normalize(light_position - current_position);
  normal = faceforward(normal, rd, normal);

  float sh = shadow(current_position, L,  MINIMUM_HIT_DISTANCE * 10.0, length(light_position - current_position), k);
                       
  vec3 R = rd - normal * (2.0 * dot(rd, normal));
  float nl = dot(normal, L); 
  float rl = dot(R, L);
                        
  color += mix(vec3(0.0), res.Surf.Kd.xyz * vec3(1.0, 1.0, 1.0) * nl, float(nl > Threshold)) * sh * weight;

  if (rl > Threshold)
    color += res.Surf.KsPh.xyz * pow(rl, res.Surf.KsPh.w) * vec3(1.0, 1.0, 1.0) * sh * weight; 
                       
  return color * mix(1.0, checkers(current_position), float(res.mod));
}


vec3 Ref(in vec3 ro, in vec3 rd, float mint, float maxt, float k, vec3 weight)
{
    vec3 color = vec3(0);
    vec3 Origin = ro;
    vec3 Dir = rd;
    vec3 w = weight; 
    vec3 Kt0 = vec3(1.0);
    for (int j = 0; j < int(RefractionCoefDecayMaxRecLevel.z); j++)
    {
        float t = mint;
        float  total_distance_traveled = mint;
        DataRes res;
        for (int i = 0; i < 300; ++i)
        {
            vec3 current_position = Origin + total_distance_traveled * Dir;

            res = map_the_world(current_position);

            if (res.d < MINIMUM_HIT_DISTANCE) 
            {                           
                vec3 color1 = res.Surf.Ka.xyz * AmbientColor.xyz;
                vec3 normal = calculate_normal(current_position);
                vec3 light_position = vec3(50.0, 100.0, 10.0);
                vec3 L = normalize(light_position - current_position);
                normal = faceforward(normal, rd, normal);

                float sh = shadow(current_position, L,  MINIMUM_HIT_DISTANCE * 10.0, length(light_position - current_position), k);
                                    
                vec3 R = rd - normal * (2.0 * dot(rd, normal));
                float nl = dot(normal, L); 
                float rl = dot(R, L);
                                        
                color1 += mix(vec3(0.0), res.Surf.Kd.xyz * vec3(1.0, 1.0, 1.0) * nl, float(nl > Threshold)) * sh * w;

                if (rl > Threshold)
                    color1 += res.Surf.KsPh.xyz * pow(rl, res.Surf.KsPh.w) * vec3(1.0, 1.0, 1.0) * sh * w; 
                                    
                
                color1 *= mix(1.0, checkers(current_position), float(res.mod));

                color += color1 * Kt0;
                vec3 w1 = res.Surf.KrRefractionCoef.xyz * w;
                if (max(max(w1.x, w1.y), w1.z) < Threshold)
                   return color;
                Kt0 *= res.Surf.KsPh.xyz * w * vec3(exp(-w1.x * 0.1), exp(-w1.y * 0.1), exp(-w1.z * 0.1)) * sh;
                w = w1;
                Origin = current_position;
                Dir = R;
                break;
            }

            if (total_distance_traveled > maxt)
            {
                color += BackgroundColor.xyz * Kt0; 
                return color;
            }
            total_distance_traveled += res.d;
        }

    }
    return color;
}

vec4 ray_march(in vec3 ro, in vec3 rd)
{
    float total_distance_traveled = 0.0;
    const int NUMBER_OF_STEPS = 300;
    float Weight = 1.0;
    float Kt = 1.0;

    const float MAXIMUM_TRACE_DISTANCE = 1000.0;
    DataRes res;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        vec3 current_position = ro + total_distance_traveled * rd;

        res = map_the_world(current_position);

        if (res.d < MINIMUM_HIT_DISTANCE) 
        {   
            vec3 color = res.Surf.Ka.xyz * AmbientColor.xyz;
            vec3 normal = calculate_normal(current_position);
            vec3 light_position = vec3(50.0, 100.0, 10.0);
            vec3 L = normalize(light_position - current_position);
            normal = faceforward(normal, rd, normal);

            float sh = shadow(current_position, L,  MINIMUM_HIT_DISTANCE * 10.0, length(light_position - current_position), 8.0);
                        
            vec3 R = rd - normal * (2.0 * dot(rd, normal));
            float nl = dot(normal, L); 
            float rl = dot(R, L);
                        
            color += mix(vec3(0.0), res.Surf.Kd.xyz * vec3(1.0, 1.0, 1.0) * nl, float(nl > Threshold)) * sh;

            vec3 a = res.Surf.KsPh.xyz * pow(rl, res.Surf.KsPh.w) * vec3(1.0, 1.0, 1.0) * sh;
            //color += a * float(rl > Threshold);
            if (rl > Threshold)
              color += a;

            vec3 w = res.Surf.KrRefractionCoef.xyz;  
            if (max(max(w.x, w.y), w.z) > Threshold)
                color += res.Surf.KsPh.xyz * Ref(current_position, R, Threshold, MAXIMUM_TRACE_DISTANCE, 8.0, w) * vec3(exp(-w.x * RefractionCoefDecayMaxRecLevel.y), exp(-w.y * RefractionCoefDecayMaxRecLevel.y), exp(-w.z * RefractionCoefDecayMaxRecLevel.y)) * sh;             
            return vec4(color * mix(1.0, checkers(current_position), float(res.mod)), 1.0);
        }

        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
        {
            break;
        }
        total_distance_traveled += res.d;
    }
    return vec4(BackgroundColor.xyz, 0.0);
}

void main()
{
    float Wp, Hp;

    if (Flag12FrameW.w > Flag34FrameH.w)
       Hp = 1.0, Wp = Flag12FrameW.z / Flag34FrameH.z;
    else
       Wp = 1.0, Hp = Flag34FrameH.z / Flag12FrameW.z;
  

    vec3 A = CamDir.xyz * ProjDistFarTimeLocal.x;
    vec3 B = CamRight.xyz * ((gl_FragCoord.x + 0.5 - Flag12FrameW.z / 2.0) / Flag12FrameW.z) * Wp;
    vec3 C = CamUp.xyz * ((gl_FragCoord.y + 0.5 - Flag34FrameH.z / 2.0) / Flag34FrameH.z) * Hp;
    vec3 X = (A + B + C);

    vec3 ro = CamLoc.xyz + X;
    vec3 rd = normalize(X);

    vec3 shaded_color = ray_march(ro,   rd * cos(dot(rd, CamDir.xyz))).xyz;

    o_color = vec4(shaded_color, 1.0);
}