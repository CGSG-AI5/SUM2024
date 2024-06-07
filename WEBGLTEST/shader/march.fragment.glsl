#version 300 es
precision highp float;
out vec4 o_color;
uniform highp float time;

#define  Max 10
#define Threshold 0.0000001
#define ColorTreshold 0.003921

struct surface
{
  vec4 Ka;
  vec4 Kd;
  vec4 KsPh;
};

struct Sphere_data
{
  vec4 PosR;
  surface Surf;
};

struct DataRes
{
  float d;
  surface Surf;
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
}; 

uniform Sphere
{
    vec4 Size;
    Sphere_data Shapes[Max];
}; 

surface mix(surface a, surface b, float t)
{
    surface S;
    S.Ka = mix(a.Ka, b.Ka, t);
    S.Kd = mix(a.Kd, b.Kd, t);
    S.KsPh = mix(a.KsPh, b.KsPh, t);
    return S;
}

vec3 Clamp( vec3 a )
{
    return vec3(min(max(a.x, 0.0), 1.0), min(max(a.y, 0.0), 1.0), min(max(a.z, 0.0), 1.0));
}


float distance_from_sphere(in vec3 p, in vec3 c, float r )
{
    return length(p - c) - r;
}

float distance_from_plane(in vec3 p, in vec4 n)
{
    return abs(dot(p, n.xyz) - n.w);
}

float distance_from_box( vec3 p, vec3 b )
{
 return length(max(abs(p - vec3(0, -4, 4)) - b, 0.0));
}

float distance_from_round_box( vec3 p, vec3 b, float r )
{
 return length(max(abs(p) - b, 0.0)) - r;
}



DataRes map_the_world(in vec3 p)
{
    float dist = 9999.0, d;
    DataRes R;
    surface Plane;
    vec4 color;
    for(int i; i < int(Size.x); i++)
    {
      d = distance_from_sphere(p, Shapes[i].PosR.xyz, Shapes[i].PosR.w);
      R.Surf = mix(R.Surf, Shapes[i].Surf, float(d < dist));
      R.d = dist = min(d, dist);
    }

    Plane.Ka = vec4(0.19225,0.19225,0.19225, 1);
    Plane.Kd = vec4(0.50754,0.50754,0.50754, 1);
    Plane.KsPh.xyz = vec3(0.508273,0.508273,0.508273);
    Plane.KsPh.w = 51.2;
    d = distance_from_plane(p, vec4(0.0, 1.0, 0.0, -10.0));
    R.Surf = mix(R.Surf, Plane, float(d < dist));
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

vec3 ray_march(in vec3 ro, in vec3 rd)
{
    float total_distance_traveled = 0.0;
    const int NUMBER_OF_STEPS = 200;
    const float MINIMUM_HIT_DISTANCE = 0.001;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0;
    DataRes res;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        vec3 current_position = ro + total_distance_traveled * rd;

        res = map_the_world(current_position);

        if (res.d < MINIMUM_HIT_DISTANCE) 
        {   
            vec3 color = res.Surf.Ka.xyz;
            vec3 normal = calculate_normal(current_position);
            vec3 light_position = vec3(10.0, 1000.0, 10.0);
            vec3 L = normalize(light_position - current_position);
            vec3 V = normalize(current_position - CamLoc.xyz);
            normal = faceforward(normal, V, normal);
            
            vec3 R = V - normal * (2.0 * dot(V, normal));
            float nl = dot(normal, L); 
            float rl = dot(R, L);

            color += mix(vec3(0), res.Surf.Kd.xyz * vec3(1, 1, 1) * nl + mix(vec3(0), res.Surf.KsPh.xyz * pow(rl, res.Surf.KsPh.w) * vec3(1, 1, 1) * nl,
             float(rl > Threshold)), float(nl > Threshold));
            
            return color;
        }

        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
        {
            break;
        }
        total_distance_traveled += res.d;
    }
    return vec3(0.28, 0.47, 0.8);
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

    vec3 shaded_color = ray_march(ro, rd);

    o_color = vec4(shaded_color, 1.0);
}
