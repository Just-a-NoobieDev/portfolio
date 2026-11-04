import * as THREE from 'three'

// The scene itself spreads from the line's contact point. No colored outline.
export function createProcessWindow(renderer: THREE.WebGLRenderer) {
  const target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true })
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      image: { value: target.texture },
      resolution: { value: new THREE.Vector2(1, 1) },
      reveal: { value: 0 },
      frameTop: { value: 0 },
    },
    vertexShader: `varying vec2 vUv;
      void main() { vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
    fragmentShader: `
      uniform sampler2D image;
      uniform vec2 resolution;
      uniform float reveal;
      uniform float frameTop;
      varying vec2 vUv;
      float roundBox(vec2 p,vec2 center,vec2 halfSize,float r) {
        vec2 q=abs(p-center)-halfSize+r;
        return length(max(q,0.))+min(max(q.x,q.y),0.)-r;
      }
      float smoothUnion(float a,float b,float k) {
        float h=clamp(.5+.5*(b-a)/k,0.,1.);
        return mix(b,a,h)-k*h*(1.-h);
      }
      void main() {
        vec2 p=vec2(vUv.x,1.-vUv.y)*resolution-vec2(0.,frameTop);
        float mobile=step(resolution.x,760.);
        vec2 lo=mix(vec2(.47,.16),vec2(.06,.42),mobile)*resolution;
        vec2 hi=mix(vec2(.95,.88),vec2(.94,.92),mobile)*resolution;
        vec2 contact=vec2(mix(.51,.1,mobile),mix(.16,.42,mobile))*resolution;
        vec2 farthest=max(contact,resolution-contact);
        float farCorner=length(farthest)+6.;
        float radius=farCorner*pow(clamp(reveal,0.,1.),.88);
        float box=roundBox(p,(lo+hi)*.5,(hi-lo)*.5,24.);
        float spreading=length(p-contact)-radius;
        float viscosity=24.+sin(reveal*3.14159265)*44.;
        float edge=smoothUnion(box,spreading,viscosity);
        float alpha=(1.-smoothstep(-.75,.75,edge))*step(0.,p.y)*step(p.y,resolution.y);
        vec4 scene=texture2D(image,vUv);
        vec2 localUv=vec2(p.x/resolution.x,1.-p.y/resolution.y);
        float light=1.-smoothstep(0.,.85,distance(localUv,vec2(.65,.6)));
        vec3 paper=mix(vec3(.865,.884,.918),vec3(.751,.807,.98),light*.5);
        gl_FragColor=vec4(mix(paper,scene.rgb,scene.a),alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
  const geometry = new THREE.PlaneGeometry(2, 2)
  const scene = new THREE.Scene()
  scene.add(new THREE.Mesh(geometry, material))
  const camera = new THREE.Camera()
  return {
    resize(width: number, height: number) {
      target.setSize(
        Math.round(width * renderer.getPixelRatio()),
        Math.round(height * renderer.getPixelRatio()),
      )
      material.uniforms.resolution!.value.set(width, height)
    },
    render(
      content: THREE.Scene,
      view: THREE.Camera,
      progress: number,
      frameTop = 0,
    ) {
      material.uniforms.reveal!.value = progress
      material.uniforms.frameTop!.value = frameTop
      renderer.setRenderTarget(target)
      renderer.clear()
      renderer.render(content, view)
      renderer.setRenderTarget(null)
      renderer.render(scene, camera)
    },
    dispose() {
      target.dispose()
      material.dispose()
      geometry.dispose()
    },
  }
}
