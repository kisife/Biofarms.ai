// WebGL Shader Backgrounds for Service Pages
const ShaderBackgrounds = {
  // Particle field - flowing green particles
  particleField: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      st.x *= u_resolution.x / u_resolution.y;
      vec3 color = vec3(0.106, 0.302, 0.243); // forest dark
      
      for(float i = 0.0; i < 40.0; i++) {
        float speed = 0.15 + i * 0.01;
        float x = fract(st.x + u_time * speed + i * 0.37);
        float y = fract(st.y + u_time * speed * 0.7 + i * 0.13);
        float dist = distance(st, vec2(x, y));
        float size = 0.003 + random(vec2(i)) * 0.005;
        float brightness = smoothstep(size, 0.0, dist) * 0.3;
        color += vec3(0.29, 0.87, 0.50) * brightness; // neon green
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  
  // Gradient mesh - organic flowing gradients
  gradientMesh: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    
    vec3 palette(float t) {
      vec3 a = vec3(0.106, 0.302, 0.243);
      vec3 b = vec3(0.165, 0.420, 0.322);
      vec3 c = vec3(0.5, 0.5, 0.5);
      vec3 d = vec3(0.29, 0.87, 0.50);
      return a + b * cos(6.28318 * (c * t + d));
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 uv0 = uv;
      vec3 finalColor = vec3(0.0);
      
      for(float i = 0.0; i < 3.0; i++) {
        uv = fract(uv * 1.5) - 0.5;
        float d = length(uv) * exp(-length(uv0));
        vec3 col = palette(length(uv0) + i * 0.4 + u_time * 0.1);
        d = sin(d * 8.0 + u_time) / 8.0;
        d = abs(d);
        d = pow(0.01 / d, 1.2);
        finalColor += col * d;
      }
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
  
  // Noise terrain - Perlin-like noise for forest/terrain feel
  noiseTerrain: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      float t = u_time * 0.15;
      float n = snoise(st * 3.0 + vec2(t, t * 0.5)) * 0.5 + 0.5;
      n += snoise(st * 6.0 - vec2(t * 0.3, t)) * 0.25;
      vec3 color1 = vec3(0.106, 0.302, 0.243);
      vec3 color2 = vec3(0.165, 0.420, 0.322);
      vec3 color3 = vec3(0.29, 0.87, 0.50);
      vec3 color = mix(color1, color2, n);
      color = mix(color, color3, smoothstep(0.6, 0.9, n) * 0.3);
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

function initShaderBackground(canvasId, shaderType) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  
  const vsSource = `
    attribute vec4 a_position;
    void main() { gl_Position = a_position; }
  `;
  const fsSource = ShaderBackgrounds[shaderType] || ShaderBackgrounds.particleField;
  
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }
  
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);
  
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);
  
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  
  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);
  
  let startTime = Date.now();
  function render() {
    const elapsed = (Date.now() - startTime) / 1000;
    gl.uniform1f(timeLocation, elapsed);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  render();
}

// D3.js Chart Templates
const D3Charts = {
  // Time series line chart
  timeSeries(container, data, options = {}) {
    const { width = 800, height = 400, margin = { top: 20, right: 30, bottom: 40, left: 60 } } = options;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(container).append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) * 1.1]).range([innerHeight, 0]);
    
    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y')));
    g.append('g').call(d3.axisLeft(y));
    
    const line = d3.line().x(d => x(d.date)).y(d => y(d.value)).curve(d3.curveMonotoneX);
    
    const path = g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#1B4D3E').attr('stroke-width', 2).attr('d', line);
    
    const totalLength = path.node().getTotalLength();
    path.attr('stroke-dasharray', totalLength + ' ' + totalLength).attr('stroke-dashoffset', totalLength)
      .transition().duration(2000).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);
    
    g.append('text').attr('x', innerWidth / 2).attr('y', -5).attr('text-anchor', 'middle').style('font-size', '14px').style('font-weight', '600').style('fill', '#1B4D3E').text(options.title || '');
    
    return svg;
  },
  
  // Bar chart
  barChart(container, data, options = {}) {
    const { width = 800, height = 400, margin = { top: 20, right: 30, bottom: 40, left: 60 } } = options;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(container).append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, innerWidth]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) * 1.1]).range([innerHeight, 0]);
    
    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));
    g.append('g').call(d3.axisLeft(y));
    
    g.selectAll('.bar').data(data).enter().append('rect')
      .attr('class', 'bar').attr('x', d => x(d.label)).attr('width', x.bandwidth())
      .attr('y', innerHeight).attr('height', 0).attr('fill', '#1B4D3E').attr('rx', 4)
      .transition().duration(800).delay((d, i) => i * 100)
      .attr('y', d => y(d.value)).attr('height', d => innerHeight - y(d.value));
    
    g.append('text').attr('x', innerWidth / 2).attr('y', -5).attr('text-anchor', 'middle').style('font-size', '14px').style('font-weight', '600').style('fill', '#1B4D3E').text(options.title || '');
    
    return svg;
  },
  
  // Radar chart for multi-criteria assessment
  radarChart(container, data, options = {}) {
    const { width = 400, height = 400, margin = 60 } = options;
    const radius = Math.min(width, height) / 2 - margin;
    const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');
    const g = svg.append('g').attr('transform', `translate(${width/2},${height/2})`);
    
    const axes = data.axes;
    const angleSlice = (Math.PI * 2) / axes.length;
    
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 100]);
    
    // Draw grid circles
    for(let i = 1; i <= 5; i++) {
      g.append('circle').attr('r', radius * i / 5).attr('fill', 'none').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '4,4');
    }
    
    // Draw axes
    axes.forEach((axis, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', rScale(100) * Math.cos(angle)).attr('y2', rScale(100) * Math.sin(angle)).attr('stroke', '#e2e8f0');
      g.append('text').attr('x', (rScale(100) + 15) * Math.cos(angle)).attr('y', (rScale(100) + 15) * Math.sin(angle)).attr('text-anchor', 'middle').attr('dy', '0.35em').style('font-size', '11px').style('fill', '#64748B').text(axis);
    });
    
    // Draw data path
    const line = d3.lineRadial().angle((d, i) => i * angleSlice).radius(d => rScale(d)).curve(d3.curveLinearClosed);
    
    data.datasets.forEach((dataset, idx) => {
      const path = g.append('path').datum(dataset.values).attr('d', line).attr('fill', idx === 0 ? 'rgba(27,77,62,0.2)' : 'rgba(74,222,128,0.2)').attr('stroke', idx === 0 ? '#1B4D3E' : '#4ADE80').attr('stroke-width', 2);
    });
    
    return svg;
  }
};

// Three.js 3D Scene Templates
const ThreeScenes = {
  // Rotating globe with data points
  globe(containerId, dataPoints = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 3;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x1B4D3E,
      emissive: 0x0F2E25,
      specular: 0x4ADE80,
      shininess: 10,
      transparent: true,
      opacity: 0.9
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    
    const wireframe = new THREE.WireframeGeometry(geometry);
    const wireMaterial = new THREE.LineBasicMaterial({ color: 0x4ADE80, transparent: true, opacity: 0.15 });
    const wireMesh = new THREE.LineSegments(wireframe, wireMaterial);
    globe.add(wireMesh);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));
    
    // Add data points
    dataPoints.forEach(point => {
      const phi = (90 - point.lat) * Math.PI / 180;
      const theta = (point.lon + 180) * Math.PI / 180;
      const r = 1.02;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      
      const dotGeo = new THREE.SphereGeometry(0.02, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x4ADE80 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      globe.add(dot);
    });
    
    function animate() {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.002;
      renderer.render(scene, camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    return { scene, camera, renderer, globe };
  },
  
  // Point cloud forest canopy
  forestCanopy(containerId, particleCount = 5000) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0F2E25);
    
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = Math.random() * 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;
      
      colors[i3] = 0.165 + Math.random() * 0.1;
      colors[i3 + 1] = 0.420 + Math.random() * 0.3;
      colors[i3 + 2] = 0.322 + Math.random() * 0.1;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const pMaterial = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.8 });
    const pointCloud = new THREE.Points(particles, pMaterial);
    scene.add(pointCloud);
    
    scene.add(new THREE.AmbientLight(0x404040));
    const dirLight = new THREE.DirectionalLight(0x4ADE80, 0.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.005;
      pointCloud.rotation.y = time * 0.1;
      camera.position.y = 5 + Math.sin(time) * 0.5;
      renderer.render(scene, camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    return { scene, camera, renderer, pointCloud };
  }
};

// GSAP Animation Patterns
const GSAPPatterns = {
  revealScroll() {
    gsap.utils.toArray('.reveal').forEach(elem => {
      gsap.fromTo(elem, 
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });
  },
  
  staggerCards(selector) {
    gsap.fromTo(selector, 
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: selector, start: 'top 80%' }
      }
    );
  },
  
  counterAnimation(selector, targetValue) {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: targetValue, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: selector, start: 'top 80%' },
      onUpdate: () => { document.querySelector(selector).textContent = Math.round(obj.val); }
    });
  },
  
  heroEntrance() {
    const tl = gsap.timeline();
    tl.fromTo('.hero-tag', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo('h1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo('.hero-stats', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
  }
};

// Initialize common elements
function initNavigation() {
  const nav = document.querySelector('.bio-nav');
  if (!nav) return;
  
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 50 ? '0 2px 10px rgba(0,0,0,0.08)' : 'none';
  });
}

function initRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ShaderBackgrounds, D3Charts, ThreeScenes, GSAPPatterns, initShaderBackground, initNavigation, initRevealAnimations };
}

// ============================================
// COMPATIBILITY WRAPPERS for Tier 2 pages
// ============================================

// ShaderBackgrounds aliases used by Tier 2 pages
ShaderBackgrounds.init = function(canvasId, shaderType) {
  if (typeof shaderType === 'string') {
    initShaderBackground(canvasId, shaderType);
  } else if (typeof shaderType === 'function') {
    // Fallback: use the string mapping if a function was passed
    initShaderBackground(canvasId, 'gradientMesh');
  }
};
ShaderBackgrounds.forestShader = 'noiseTerrain';
ShaderBackgrounds.droneShader = 'particleField';
ShaderBackgrounds.gisShader = 'gradientMesh';

// GSAPPatterns extensions used by Tier 2 pages
GSAPPatterns.fadeUp = function(selector) {
  if (typeof gsap !== 'undefined') {
    gsap.utils.toArray(selector.split(', ')).forEach(elem => {
      gsap.fromTo(elem, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: elem, start: 'top 85%' } });
    });
  }
};
GSAPPatterns.stagger = function(parentSelector, childSelector) {
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(childSelector, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: parentSelector, start: 'top 80%' } });
  }
};
GSAPPatterns.counter = function(selector) {
  if (typeof gsap !== 'undefined') {
    document.querySelectorAll(selector).forEach(el => {
      const target = parseFloat(el.getAttribute('data-target')) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
      const obj = { val: 0 };
      gsap.to(obj, { val: target, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%' },
        onUpdate: () => { el.textContent = obj.val.toFixed(decimals) + suffix; }
      });
    });
  }
};

// D3Charts extensions for Tier 2 pages
// Override timeSeries to accept string ID
const _origTimeSeries = D3Charts.timeSeries;
D3Charts.timeSeries = function(container, data, options) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;
  // Convert year-based data to date-based if needed
  const parsedData = data.map(d => ({
    date: d.date instanceof Date ? d.date : new Date(d.year, 0, 1),
    value: d.value
  }));
  return _origTimeSeries.call(D3Charts, el, parsedData, options);
};

// Override barChart to accept string ID
const _origBarChart = D3Charts.barChart;
D3Charts.barChart = function(container, data, options) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;
  // Convert grouped data format if needed
  if (data[0] && typeof data[0] === 'object' && !data[0].hasOwnProperty('label')) {
    const keys = Object.keys(data[0]).filter(k => k !== 'category');
    const converted = [];
    data.forEach(d => {
      keys.forEach(k => converted.push({ label: d.category + ' - ' + k, value: d[k], group: k }));
    });
    return _origBarChart.call(D3Charts, el, converted, options);
  }
  return _origBarChart.call(D3Charts, el, data, options);
};

// Stacked bar chart for Tier 2 pages
D3Charts.stackedBar = function(container, data, options) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;
  const { width = 800, height = 400, margin = { top: 20, right: 30, bottom: 40, left: 60 } } = options;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  
  const keys = Object.keys(data[0]).filter(k => k !== 'region');
  const x = d3.scaleBand().domain(data.map(d => d.region)).range([0, innerWidth]).padding(0.3);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => keys.reduce((s, k) => s + d[k], 0)) * 1.1]).range([innerHeight, 0]);
  const color = d3.scaleOrdinal().domain(keys).range(['#1B4D3E', '#4ADE80', '#64748B']);
  
  g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));
  g.append('g').call(d3.axisLeft(y));
  
  const stacked = d3.stack().keys(keys)(data);
  g.selectAll('.serie').data(stacked).enter().append('g').attr('class', 'serie').attr('fill', d => color(d.key))
    .selectAll('rect').data(d => d).enter().append('rect')
    .attr('x', d => x(d.data.region)).attr('y', innerHeight).attr('height', 0).attr('width', x.bandwidth())
    .transition().duration(800).delay((d, i, j) => j * 100 + i * 50)
    .attr('y', d => y(d[1])).attr('height', d => y(d[0]) - y(d[1]));
  
  g.append('text').attr('x', innerWidth / 2).attr('y', -5).attr('text-anchor', 'middle').style('font-size', '14px').style('font-weight', '600').style('fill', '#1B4D3E').text(options.title || '');
  return svg;
};

// ThreeScenes extensions for Tier 2 pages
// Override globe to accept just ID
const _origGlobe = ThreeScenes.globe;
ThreeScenes.globe = function(containerId, dataPoints) {
  const el = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!el) return;
  const points = dataPoints || [
    { lat: 3.8, lon: 11.5 }, { lat: 4.0, lon: 9.0 }, { lat: 2.0, lon: 13.0 },
    { lat: 5.0, lon: 12.0 }, { lat: 3.0, lon: 10.0 }
  ];
  return _origGlobe.call(ThreeScenes, el.id || containerId, points);
};

// Terrain scene for drone page
ThreeScenes.terrain = function(containerId) {
  const el = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!el) return;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0F2E25);
  const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000);
  camera.position.set(0, 15, 20);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.appendChild(renderer.domElement);
  
  const geometry = new THREE.PlaneGeometry(40, 40, 64, 64);
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 2] = Math.sin(positions[i] * 0.3) * Math.cos(positions[i + 1] * 0.3) * 3 + Math.random() * 0.5;
  }
  geometry.computeVertexNormals();
  const material = new THREE.MeshPhongMaterial({ color: 0x1B4D3E, emissive: 0x0F2E25, shininess: 10, flatShading: true });
  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2;
  scene.add(terrain);
  
  // Add canopy trees
  for (let i = 0; i < 200; i++) {
    const treeGeo = new THREE.CylinderGeometry(0.1, 0.3, 2 + Math.random() * 3, 6);
    const treeMat = new THREE.MeshPhongMaterial({ color: 0x4ADE80 });
    const tree = new THREE.Mesh(treeGeo, treeMat);
    tree.position.set((Math.random() - 0.5) * 30, 1, (Math.random() - 0.5) * 30);
    scene.add(tree);
  }
  
  scene.add(new THREE.AmbientLight(0x404040));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);
  
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;
    camera.position.x = Math.sin(time) * 20;
    camera.position.z = Math.cos(time) * 20;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', () => {
    camera.aspect = el.clientWidth / el.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(el.clientWidth, el.clientHeight);
  });
  return { scene, camera, renderer };
};

// Elevation model for GIS page
ThreeScenes.elevationModel = function(containerId) {
  const el = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!el) return;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0F2E25);
  const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000);
  camera.position.set(0, 25, 30);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.appendChild(renderer.domElement);
  
  const geometry = new THREE.PlaneGeometry(50, 50, 80, 80);
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1];
    positions[i + 2] = Math.sin(x * 0.2) * Math.cos(y * 0.2) * 5 + Math.sin(x * 0.5 + y * 0.3) * 2;
  }
  geometry.computeVertexNormals();
  const material = new THREE.MeshPhongMaterial({ color: 0x1B4D3E, emissive: 0x0F2E25, shininess: 15, flatShading: false, side: THREE.DoubleSide });
  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2;
  scene.add(terrain);
  
  // Priority zone markers
  for (let i = 0; i < 8; i++) {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x4ADE80, transparent: true, opacity: 0.7 })
    );
    marker.position.set((Math.random() - 0.5) * 30, 4 + Math.random() * 3, (Math.random() - 0.5) * 30);
    scene.add(marker);
  }
  
  scene.add(new THREE.AmbientLight(0x404040));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);
  
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.003;
    camera.position.x = Math.sin(time) * 30;
    camera.position.z = Math.cos(time) * 30;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', () => {
    camera.aspect = el.clientWidth / el.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(el.clientWidth, el.clientHeight);
  });
  return { scene, camera, renderer };
};

/* ===================================================================
   Unified scroll-reveal + hero entrance animation (biofarms.ai)
   Self-contained; animates section headers, cards, stats, timeline,
   methodology, citations on scroll with stagger, plus a hero entrance.
   =================================================================== */
(function () {
  function ready(fn){ document.readyState!=='loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    try {
      var blocks = '.section-header,.card,.stat-item,.stat-card,.viz-container,.method-block,.method-step,.timeline-item,.challenge-card,.citation-box';
      document.querySelectorAll(blocks).forEach(function (el) { el.classList.add('reveal'); });

      // Stagger children inside grid/list groups
      var groups = ['.card-grid', '.stats-grid', '.grid-2', '.grid-3', '.method-steps', '.timeline'];
      document.querySelectorAll(groups.join(',')).forEach(function (g) {
        Array.prototype.forEach.call(g.children, function (child, i) {
          if (child.classList) child.classList.add('reveal');
          child.style.transitionDelay = (i * 0.08) + 's';
        });
      });

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

      // Hero entrance (covers both .service-hero and .hero families)
      var heroEls = document.querySelectorAll(
        '.service-hero .hero-tag, .service-hero h1, .service-hero .hero-subtitle, .service-hero .hero-stats,' +
        '.hero .hero-tag, .hero h1, .hero .hero-subtitle, .hero .hero-cta'
      );
      heroEls.forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(22px)';
        el.style.transition = 'opacity .8s cubic-bezier(.4,0,.2,1) ' + (0.1 + i * 0.12) + 's, transform .8s cubic-bezier(.4,0,.2,1) ' + (0.1 + i * 0.12) + 's';
      });
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        heroEls.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
      }); });
    } catch (e) { /* fail-safe: never block page */ }
  });
})();
